# Page Layer Examples (React)

Pages = full views composing widgets, features, entities.

## Structure

```
src/pages/home/
├── ui/
│   └── home-page.tsx
└── index.ts
```

## Home Page

```tsx
// src/pages/home/ui/home-page.tsx
import { Header } from '@/widgets/header';
import { ProductList } from '@/widgets/product-list';
import { UserCard, useCurrentUser } from '@/entities/user';
import { LoginForm, useAuthStore } from '@/features/auth';

export function HomePage() {
  const { data: user } = useCurrentUser();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());

  return (
    <div className="home-page">
      <Header />

      <main className="content">
        <section className="hero">
          <h1>Welcome to Our Store</h1>
          <p>Discover amazing products at great prices</p>
        </section>

        {isAuthenticated && user ? (
          <section className="user-section">
            <h2>Welcome back, {user.name}!</h2>
            <UserCard user={user} />
          </section>
        ) : (
          <section className="cta-section">
            <h2>Get Started Today</h2>
            <LoginForm />
          </section>
        )}

        <section className="products-section">
          <h2>Featured Products</h2>
          <ProductList />
        </section>
      </main>
    </div>
  );
}
```

## Public API

```tsx
// src/pages/home/index.ts
export { HomePage } from './ui/home-page';
```

## Dashboard Page

```tsx
// src/pages/dashboard/ui/dashboard-page.tsx
import { Header } from '@/widgets/header';
import { Sidebar } from '@/widgets/sidebar';
import { useCurrentUser } from '@/entities/user';

export function DashboardPage() {
  const { data: user } = useCurrentUser();

  return (
    <div className="dashboard-layout">
      <Header />
      <div className="dashboard-body">
        <Sidebar />
        <main className="dashboard-content">
          <h1>Dashboard</h1>
          {user && <p>Welcome, {user.name}</p>}
        </main>
      </div>
    </div>
  );
}
```

```tsx
// src/pages/dashboard/index.ts
export { DashboardPage } from './ui/dashboard-page';
```

## Next.js App Router Integration

Route files re-export page components:

```tsx
// app/page.tsx
export { HomePage as default } from '@/pages/home';
```

```tsx
// app/dashboard/page.tsx
export { DashboardPage as default } from '@/pages/dashboard';
```

## Next.js Pages Router Integration

```tsx
// pages/index.tsx
export { HomePage as default } from '@/pages/home';
```

```tsx
// pages/dashboard.tsx
export { DashboardPage as default } from '@/pages/dashboard';
```

## React Router Integration

```tsx
// src/app/router.tsx
import { Routes, Route } from 'react-router-dom';
import { HomePage } from '@/pages/home';
import { DashboardPage } from '@/pages/dashboard';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
    </Routes>
  );
}
```

## Key Points

- Pages are COMPOSITION — minimal logic
- Import widgets, features, entities, shared
- Route files are thin wrappers
- Each page exports via public API
