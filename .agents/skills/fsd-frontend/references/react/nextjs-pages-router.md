# Next.js Pages Router + FSD

Pages Router uses `pages/` folder for routes, conflicting with FSD's `pages` layer.

## Solution

Place Next.js `pages/` at project root, import FSD pages from `src/pages`.

## Folder Structure

```
project-root/
├── pages/                        # Next.js Pages Router (routing only)
│   ├── _app.tsx                  # Re-exports from src/app
│   ├── _document.tsx
│   ├── index.tsx                 # Re-exports from src/pages
│   ├── dashboard.tsx
│   └── api/
│       └── users.ts
├── src/
│   ├── app/                      # FSD app layer
│   │   ├── providers/
│   │   ├── custom-app.tsx
│   │   └── styles/
│   ├── pages/                    # FSD pages layer
│   │   ├── home/
│   │   │   ├── ui/
│   │   │   │   └── home-page.tsx
│   │   │   └── index.ts
│   │   └── dashboard/
│   ├── widgets/
│   ├── features/
│   ├── entities/
│   └── shared/
└── next.config.js
```

## Route File Pattern

Route files re-export FSD page components:

```tsx
// pages/index.tsx
export { HomePage as default } from '@/pages/home';
```

```tsx
// pages/dashboard.tsx
export { DashboardPage as default } from '@/pages/dashboard';
```

## Custom _app.tsx

```tsx
// src/app/custom-app.tsx
import type { AppProps } from 'next/app';
import { Providers } from './providers';
import './styles/globals.css';

export function App({ Component, pageProps }: AppProps) {
  return (
    <Providers>
      <Component {...pageProps} />
    </Providers>
  );
}
```

```tsx
// pages/_app.tsx
export { App as default } from '@/app/custom-app';
```

## FSD Page Component

```tsx
// src/pages/home/ui/home-page.tsx
import { Header } from '@/widgets/header';
import { ProductList } from '@/widgets/product-list';

export function HomePage() {
  return (
    <div className="home-page">
      <Header />
      <main>
        <h1>Welcome</h1>
        <ProductList />
      </main>
    </div>
  );
}
```

```tsx
// src/pages/home/index.ts
export { HomePage } from './ui/home-page';
```

## getServerSideProps / getStaticProps

Keep data fetching in Next.js route files, call FSD API functions:

```tsx
// pages/dashboard.tsx
import { fetchDashboardData } from '@/pages/dashboard';

export { DashboardPage as default } from '@/pages/dashboard';

export async function getServerSideProps() {
  const data = await fetchDashboardData();
  return { props: { data } };
}
```

```tsx
// src/pages/dashboard/api/fetch-dashboard-data.ts
import { db } from '@/shared/db';

export async function fetchDashboardData() {
  return db.dashboard.getData();
}
```

```tsx
// src/pages/dashboard/index.ts
export { DashboardPage } from './ui/dashboard-page';
export { fetchDashboardData } from './api/fetch-dashboard-data';
```

## tsconfig.json Paths

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## Key Points

1. Next.js `pages/` at root for routing
2. FSD layers in `src/`
3. Route files are thin re-exports
4. Data fetching exports from FSD page slices
5. Custom _app re-exports from src/app
