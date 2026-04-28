# Next.js App Router + FSD

Next.js App Router uses `app/` folder for routes, conflicting with FSD's `app` layer.

## Solution

Place Next.js `app/` at project root, import FSD pages from `src/pages`.

## Folder Structure

```
project-root/
├── app/                          # Next.js App Router (routing only)
│   ├── layout.tsx
│   ├── page.tsx                  # Re-exports from src/pages
│   ├── dashboard/
│   │   └── page.tsx
│   └── api/                      # API routes
├── pages/                        # Empty placeholder (required)
│   └── README.md                 # "Placeholder to prevent Next.js confusion"
├── src/
│   ├── app/                      # FSD app layer (providers, styles)
│   │   ├── providers/
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
└── middleware.ts                 # Must be at root
```

## Route File Pattern

Route files re-export FSD page components:

```tsx
// app/page.tsx
export { HomePage as default } from '@/pages/home';
export { metadata } from '@/pages/home';
```

```tsx
// app/dashboard/page.tsx
export { DashboardPage as default } from '@/pages/dashboard';
```

## FSD Page Component

```tsx
// src/pages/home/ui/home-page.tsx
import { Header } from '@/widgets/header';
import { ProductList } from '@/widgets/product-list';
import { LoginForm } from '@/features/auth';

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
export const metadata = { title: 'Home' };
```

## Providers Setup

```tsx
// src/app/providers/index.tsx
'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/shared/api';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

```tsx
// app/layout.tsx
import { Providers } from '@/app/providers';
import '@/app/styles/globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

## API Routes

Keep API routes in Next.js `app/api/`, or use FSD's shared layer for reusable API logic:

```tsx
// app/api/users/route.ts
import { db } from '@/shared/db';

export async function GET() {
  const users = await db.user.findMany();
  return Response.json(users);
}
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

1. Next.js `app/` at root for routing
2. FSD layers in `src/`
3. Empty `pages/` folder prevents router confusion
4. Route files are thin re-exports
5. Middleware/instrumentation at root
