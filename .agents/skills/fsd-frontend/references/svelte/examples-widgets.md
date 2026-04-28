# Widget Layer Examples (Svelte)

Widgets = large, reusable UI blocks composing features/entities.

## Header Widget

```
src/widgets/header/
├── ui/
│   ├── header.svelte
│   ├── nav-menu.svelte
│   └── user-menu.svelte
├── lib/
│   └── menu-items.ts
└── index.ts
```

```svelte
<!-- src/widgets/header/ui/header.svelte -->
<script lang="ts">
  import { Button } from '@/shared/ui/button';
  import { UserAvatar, currentUser } from '@/entities/user';
  import { LogoutButton, isAuthenticated } from '@/features/auth';
  import NavMenu from './nav-menu.svelte';
  import UserMenu from './user-menu.svelte';
  import { menuItems } from '../lib/menu-items';

  let userMenuOpen = $state(false);
</script>

<header class="header">
  <div class="header-left">
    <a href="/" class="logo">MyApp</a>
    <NavMenu items={menuItems} />
  </div>

  <div class="header-right">
    {#if $isAuthenticated && $currentUser}
      <button onclick={() => userMenuOpen = !userMenuOpen}>
        <UserAvatar user={$currentUser} size="sm" />
      </button>
      {#if userMenuOpen}
        <UserMenu user={$currentUser} onclose={() => userMenuOpen = false} />
      {/if}
    {:else}
      <Button href="/login" variant="ghost">Log In</Button>
      <Button href="/signup">Sign Up</Button>
    {/if}
  </div>
</header>
```

```typescript
// src/widgets/header/index.ts
export { default as Header } from './ui/header.svelte';
```

## Sidebar Widget

```
src/widgets/sidebar/
├── ui/
│   ├── sidebar.svelte
│   └── sidebar-item.svelte
├── model/
│   └── sidebar-store.ts
├── lib/
│   └── sidebar-items.ts
└── index.ts
```

```svelte
<!-- src/widgets/sidebar/ui/sidebar.svelte -->
<script lang="ts">
  import { sidebarOpen } from '../model/sidebar-store';
  import { sidebarItems } from '../lib/sidebar-items';
  import SidebarItem from './sidebar-item.svelte';

  let { collapsed = false }: { collapsed?: boolean } = $props();
</script>

<aside class="sidebar" class:collapsed>
  <nav class="sidebar-nav">
    {#each sidebarItems as item}
      <SidebarItem {item} {collapsed} />
    {/each}
  </nav>
</aside>
```

```typescript
// src/widgets/sidebar/model/sidebar-store.ts
import { writable } from 'svelte/store';

export const sidebarOpen = writable(true);

export function toggleSidebar() {
  sidebarOpen.update((open) => !open);
}
```

```typescript
// src/widgets/sidebar/index.ts
export { default as Sidebar } from './ui/sidebar.svelte';
export { sidebarOpen, toggleSidebar } from './model/sidebar-store';
```

## Product List Widget

```svelte
<!-- src/widgets/product-list/ui/product-list.svelte -->
<script lang="ts">
  import { ProductCard, type Product } from '@/entities/product';
  import { AddToCartButton } from '@/features/add-to-cart';
  import { fetchProducts } from '../api/fetch-products';
  import { filters, setFilter } from '../model/filter-store';

  let products = $state<Product[]>([]);
  let loading = $state(true);
  let error = $state<string | null>(null);

  $effect(() => {
    loadProducts();
  });

  async function loadProducts() {
    loading = true;
    error = null;
    try {
      products = await fetchProducts($filters);
    } catch (e) {
      error = 'Failed to load products';
    } finally {
      loading = false;
    }
  }
</script>

<section class="product-list">
  <div class="filters">
    <select onchange={(e) => setFilter('category', e.currentTarget.value)}>
      <option value="">All Categories</option>
      <option value="electronics">Electronics</option>
    </select>
  </div>

  {#if loading}
    <div>Loading...</div>
  {:else if error}
    <div class="error">{error}</div>
  {:else}
    <div class="grid">
      {#each products as product}
        <ProductCard {product} />
        <AddToCartButton productId={product.id} />
      {/each}
    </div>
  {/if}
</section>
```

```typescript
// src/widgets/product-list/index.ts
export { default as ProductList } from './ui/product-list.svelte';
export { filters, setFilter } from './model/filter-store';
```

## Key Points

- Widgets COMPOSE features and entities
- Use Svelte stores for widget state
- $effect for reactive data fetching
- Export via public API
