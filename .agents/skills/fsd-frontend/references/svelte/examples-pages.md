# Page Layer Examples (Svelte)

Pages = full views composing widgets, features, entities.

## Structure

```
src/pages/home/
├── ui/
│   └── home-page.svelte
└── index.ts
```

## Home Page

```svelte
<!-- src/pages/home/ui/home-page.svelte -->
<script lang="ts">
  import { Header } from '@/widgets/header';
  import { ProductList } from '@/widgets/product-list';
  import { UserCard, currentUser } from '@/entities/user';
  import { LoginForm, isAuthenticated } from '@/features/auth';
  import { Button } from '@/shared/ui/button';
</script>

<div class="home-page">
  <Header />

  <main class="content">
    <section class="hero">
      <h1>Welcome to Our Store</h1>
      <p>Discover amazing products at great prices</p>
    </section>

    {#if $isAuthenticated && $currentUser}
      <section class="user-section">
        <h2>Welcome back, {$currentUser.name}!</h2>
        <UserCard user={$currentUser} />
      </section>
    {:else}
      <section class="cta-section">
        <h2>Get Started Today</h2>
        <LoginForm />
      </section>
    {/if}

    <section class="products-section">
      <h2>Featured Products</h2>
      <ProductList />
    </section>
  </main>
</div>
```

## Public API

```typescript
// src/pages/home/index.ts
export { default as HomePage } from './ui/home-page.svelte';
```

## Dashboard Page

```svelte
<!-- src/pages/dashboard/ui/dashboard-page.svelte -->
<script lang="ts">
  import { Header } from '@/widgets/header';
  import { Sidebar } from '@/widgets/sidebar';
  import { currentUser } from '@/entities/user';
</script>

<div class="dashboard-layout">
  <Header />
  <div class="dashboard-body">
    <Sidebar />
    <main class="dashboard-content">
      <h1>Dashboard</h1>
      {#if $currentUser}
        <p>Welcome, {$currentUser.name}</p>
      {/if}
    </main>
  </div>
</div>
```

```typescript
// src/pages/dashboard/index.ts
export { default as DashboardPage } from './ui/dashboard-page.svelte';
```

## SvelteKit Route Integration

Route files render page components:

```svelte
<!-- src/app/routes/+page.svelte -->
<script>
  import { HomePage } from '@/pages/home';
</script>

<HomePage />
```

```svelte
<!-- src/app/routes/dashboard/+page.svelte -->
<script>
  import { DashboardPage } from '@/pages/dashboard';
</script>

<DashboardPage />
```

## Server Load Functions

For data fetching, use SvelteKit load functions:

```typescript
// src/app/routes/dashboard/+page.server.ts
import { fetchDashboardData } from '@/pages/dashboard';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  const data = await fetchDashboardData();
  return { data };
};
```

```svelte
<!-- src/app/routes/dashboard/+page.svelte -->
<script>
  import { DashboardPage } from '@/pages/dashboard';

  let { data } = $props();
</script>

<DashboardPage {data} />
```

## Key Points

- Pages are COMPOSITION — minimal logic
- Import widgets, features, entities, shared
- Route files render page components
- Use +page.server.ts for data fetching
- Each page exports via public API
