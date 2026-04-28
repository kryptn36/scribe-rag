# TanStack Query + Firebase (React)

React Query with Firebase for data fetching, caching, mutations, and optimistic updates.

## Setup

```bash
npm install @tanstack/react-query firebase
```

```tsx
// src/app/providers/query-provider.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

---

## Basic Queries with Firestore

```typescript
// src/entities/product/api/product-api.ts
import { collection, doc, getDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/shared/firebase';
import type { Product } from '../model/types';

export async function fetchProduct(id: string): Promise<Product | null> {
  const snapshot = await getDoc(doc(db, 'products', id));
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as Product;
}

export async function fetchProducts(filters?: { category?: string; limit?: number }) {
  let q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));

  if (filters?.category) {
    q = query(q, where('category', '==', filters.category));
  }
  if (filters?.limit) {
    q = query(q, limit(filters.limit));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
}
```

```typescript
// src/entities/product/model/queries.ts
import { useQuery } from '@tanstack/react-query';
import { fetchProduct, fetchProducts } from '../api/product-api';

export function useProduct(id: string | null) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProduct(id!),
    enabled: !!id,
  });
}

export function useProducts(filters?: { category?: string }) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => fetchProducts(filters),
  });
}
```

---

## Mutations with Firestore

```typescript
// src/entities/product/model/mutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addDoc, updateDoc, deleteDoc, doc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/shared/firebase';
import type { Product } from './types';

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<Product, 'id' | 'createdAt'>) => {
      const docRef = await addDoc(collection(db, 'products'), {
        ...data,
        createdAt: serverTimestamp(),
      });
      return { id: docRef.id, ...data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await deleteDoc(doc(db, 'products', id));
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
```

---

## Optimistic Updates

```typescript
// src/features/todo/model/mutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/shared/firebase';
import type { Todo } from './types';

export function useToggleTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      await updateDoc(doc(db, 'todos', id), {
        completed,
        updatedAt: serverTimestamp(),
      });
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
  });
}
```

---

## Infinite Queries (Pagination)

```typescript
// src/entities/post/model/queries.ts
import { useInfiniteQuery } from '@tanstack/react-query';
import { collection, query, orderBy, limit, startAfter, getDocs } from 'firebase/firestore';
import { db } from '@/shared/firebase';
import type { Post } from './types';

const PAGE_SIZE = 20;

export function useInfinitePosts() {
  return useInfiniteQuery({
    queryKey: ['posts', 'infinite'],
    queryFn: async ({ pageParam }) => {
      let q = query(
        collection(db, 'posts'),
        orderBy('createdAt', 'desc'),
        limit(PAGE_SIZE)
      );

      if (pageParam) {
        q = query(q, startAfter(pageParam));
      }

      const snapshot = await getDocs(q);
      const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
      const lastDoc = snapshot.docs[snapshot.docs.length - 1];

      return { posts, lastDoc };
    },
    initialPageParam: null as any,
    getNextPageParam: (lastPage) =>
      lastPage.posts.length === PAGE_SIZE ? lastPage.lastDoc : undefined,
  });
}
```

---

## Key Patterns

| Pattern | When to Use |
|---------|-------------|
| `useQuery` | One-time fetches, cached data |
| `useMutation` | Create/update/delete operations |
| `useInfiniteQuery` | Paginated lists, infinite scroll |
| Optimistic updates | Instant UI feedback |
| Prefetching | Hover/focus preloading |

1. Use React Query for **cacheable fetches**, real-time hooks for **live data**
2. Invalidate related queries after mutations
3. Use optimistic updates for responsive UI
4. Prefetch on hover for faster navigation
