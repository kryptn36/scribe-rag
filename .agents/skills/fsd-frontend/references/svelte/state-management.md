# State Management - Svelte 5 (Runes)

Svelte 5 uses runes (`$state`, `$derived`, `$effect`) instead of stores.

## Zustand to Runes Adapter

```typescript
// src/shared/store/svelte-adapter.svelte.ts
import { fromStore } from 'svelte/store';
import type { StoreApi } from 'zustand';

export function useZustandRunes<T>(store: StoreApi<T>) {
  const svelteStore = {
    subscribe: (fn: (value: T) => void) => {
      fn(store.getState());
      return store.subscribe(fn);
    },
    set: (value: T) => store.setState(value),
  };

  return fromStore(svelteStore);
}
```

---

## Basic Usage

```svelte
<!-- src/features/cart/ui/cart-badge.svelte -->
<script lang="ts">
  import { useCartStore } from '../model/store';
  import { useZustandRunes } from '@/shared/store';

  const cart = useZustandRunes(useCartStore);
  const itemCount = $derived(cart.current.getItemCount());
</script>

{#if itemCount > 0}
  <span class="cart-badge">{itemCount}</span>
{/if}
```

---

## Side Effects with $effect

```svelte
<!-- src/features/auth/ui/auth-guard.svelte -->
<script lang="ts">
  import { useAuthStore } from '../model/store';
  import { useZustandRunes } from '@/shared/store';
  import { goto } from '$app/navigation';

  let { children } = $props();

  const auth = useZustandRunes(useAuthStore);
  const isAuthenticated = $derived(auth.current.isAuthenticated());

  $effect(() => {
    if (!isAuthenticated) {
      goto('/login');
    }
  });
</script>

{#if isAuthenticated}
  {@render children?.()}
{:else}
  <p>Redirecting to login...</p>
{/if}
```

---

## Pure Runes (No Zustand)

For Svelte-only apps, use `$state` in `.svelte.ts` files:

```typescript
// src/features/cart/model/store.svelte.ts
interface CartItem {
  productId: string;
  quantity: number;
  price: number;
}

export const cartState = $state<{ items: CartItem[] }>({ items: [] });

export function addItem(productId: string, price: number) {
  const existing = cartState.items.find((i) => i.productId === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    cartState.items.push({ productId, quantity: 1, price });
  }
}

export function getItemCount() {
  return cartState.items.reduce((sum, i) => sum + i.quantity, 0);
}
```

---

## Key Patterns

| Rune | Purpose |
|------|---------|
| `$state` | Reactive state |
| `$derived` | Computed values |
| `$effect` | Side effects with cleanup |
| `$props` | Component props |

1. Use `fromStore` to bridge Zustand to runes
2. Access store via `.current` property
3. Use `$derived` for computed values
4. Return cleanup function from `$effect`
5. Pure runes in `.svelte.ts` files for Svelte-only apps

> **TanStack Query**: For Svelte Query patterns, see `tanstack-svelte.md`
