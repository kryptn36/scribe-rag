# TanStack Query + Firebase (Svelte 5)

Svelte Query v6 with Firebase for data fetching, caching, mutations, and optimistic updates.

> **Important**: Svelte Query v6 is fully runes-native. **No `$` prefix needed** - access properties directly.

## Setup

```bash
npm install @tanstack/svelte-query firebase
```

```javascript
// svelte.config.js - Enable runes globally
export default {
  compilerOptions: {
    runes: true,
  },
};
```

```svelte
<!-- src/app/routes/+layout.svelte -->
<script lang="ts">
  import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';

  let { children } = $props();

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        retry: 1,
      },
    },
  });
</script>

<QueryClientProvider client={queryClient}>
  {@render children?.()}
</QueryClientProvider>
```

---

## Basic Queries with Firestore

```typescript
// src/entities/product/api/product-api.ts
import { collection, doc, getDoc, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/shared/firebase';
import type { Product } from '../model/types';

export async function fetchProduct(id: string): Promise<Product | null> {
  const snapshot = await getDoc(doc(db, 'products', id));
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as Product;
}

export async function fetchProducts(filters?: { category?: string }) {
  let q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
  if (filters?.category) {
    q = query(q, where('category', '==', filters.category));
  }
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
}
```

```typescript
// src/entities/product/model/queries.ts
import { createQuery } from '@tanstack/svelte-query';
import { fetchProduct, fetchProducts } from '../api/product-api';

export function useProduct(id: string) {
  return createQuery(() => ({
    queryKey: ['product', id],
    queryFn: () => fetchProduct(id),
    enabled: !!id,
  }));
}

export function useProducts(filters?: { category?: string }) {
  return createQuery(() => ({
    queryKey: ['products', filters],
    queryFn: () => fetchProducts(filters),
  }));
}
```

```svelte
<!-- src/entities/product/ui/product-list.svelte -->
<script lang="ts">
  import { useProducts } from '../model/queries';
  import ProductCard from './product-card.svelte';

  interface Props {
    category?: string;
  }

  let { category }: Props = $props();

  const query = useProducts({ category });
</script>

<!-- NO $ prefix - direct property access -->
{#if query.isPending}
  <div>Loading...</div>
{:else if query.isError}
  <div>Error: {query.error.message}</div>
{:else}
  <div class="grid">
    {#each query.data ?? [] as product}
      <ProductCard {product} />
    {/each}
  </div>
{/if}
```

---

## Reactive Query Inputs with $state

```svelte
<!-- src/features/search/ui/product-search.svelte -->
<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';
  import { fetchProducts } from '@/entities/product';

  let category = $state('');  // Reactive with $state

  // Query automatically re-runs when category changes
  const query = createQuery(() => ({
    queryKey: ['products', category],
    queryFn: () => fetchProducts({ category: category || undefined }),
  }));
</script>

<select bind:value={category}>
  <option value="">All</option>
  <option value="electronics">Electronics</option>
  <option value="clothing">Clothing</option>
</select>

{#if query.isSuccess}
  {#each query.data as product}
    <p>{product.name}</p>
  {/each}
{/if}
```

---

## Mutations with Firestore

```typescript
// src/entities/product/model/mutations.ts
import { createMutation, useQueryClient } from '@tanstack/svelte-query';
import { addDoc, deleteDoc, doc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/shared/firebase';
import type { Product } from './types';

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationFn: async (data: Omit<Product, 'id'>) => {
      const docRef = await addDoc(collection(db, 'products'), {
        ...data,
        createdAt: serverTimestamp(),
      });
      return { id: docRef.id, ...data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  }));
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationFn: async (id: string) => {
      await deleteDoc(doc(db, 'products', id));
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  }));
}
```

```svelte
<!-- src/features/product/ui/create-product-form.svelte -->
<script lang="ts">
  import { Button, Input } from '@/shared/ui';
  import { useCreateProduct } from '@/entities/product';

  let title = $state('');
  const mutation = useCreateProduct();

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (title.trim()) {
      mutation.mutate({ title, category: 'general' });
    }
  }
</script>

<form onsubmit={handleSubmit}>
  <Input bind:value={title} placeholder="Product title" />
  {#if mutation.isError}
    <p class="error">{mutation.error.message}</p>
  {/if}
  <Button type="submit" disabled={mutation.isPending}>
    {mutation.isPending ? 'Creating...' : 'Create'}
  </Button>
</form>
```

---

## Optimistic Updates

```typescript
// src/features/todo/model/mutations.ts
import { createMutation, useQueryClient } from '@tanstack/svelte-query';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '@/shared/firebase';
import type { Todo } from './types';

export function useToggleTodo() {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      await updateDoc(doc(db, 'todos', id), { completed });
      return { id, completed };
    },
    onMutate: async ({ id, completed }) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] });
      const previousTodos = queryClient.getQueryData<Todo[]>(['todos']);

      queryClient.setQueryData<Todo[]>(['todos'], (old) =>
        old?.map((todo) => (todo.id === id ? { ...todo, completed } : todo))
      );

      return { previousTodos };
    },
    onError: (err, variables, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(['todos'], context.previousTodos);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  }));
}
```

---

## Infinite Queries (Pagination)

```typescript
// src/entities/post/model/queries.ts
import { createInfiniteQuery } from '@tanstack/svelte-query';
import { collection, query, orderBy, limit, startAfter, getDocs } from 'firebase/firestore';
import { db } from '@/shared/firebase';

const PAGE_SIZE = 20;

export function useInfinitePosts() {
  return createInfiniteQuery(() => ({
    queryKey: ['posts', 'infinite'],
    queryFn: async ({ pageParam }) => {
      let q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(PAGE_SIZE));
      if (pageParam) q = query(q, startAfter(pageParam));

      const snapshot = await getDocs(q);
      const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return { posts, lastDoc: snapshot.docs.at(-1) };
    },
    initialPageParam: null as any,
    getNextPageParam: (lastPage) =>
      lastPage.posts.length === PAGE_SIZE ? lastPage.lastDoc : undefined,
  }));
}
```

---

## Key Differences: Svelte Query v6 vs v5

| v5 (Store-based) | v6 (Runes-native) |
|------------------|-------------------|
| `$query.data` | `query.data` |
| `$mutation.mutate()` | `mutation.mutate()` |
| `writable()` for reactive inputs | `$state()` |
| `derived()` wrapper needed | Direct access in thunk |

## Key Patterns

1. **No `$` prefix** - access query/mutation properties directly
2. Use `$state()` for reactive query inputs
3. Wrap options in function: `createQuery(() => ({...}))`
4. Combine with real-time hooks when live updates needed
