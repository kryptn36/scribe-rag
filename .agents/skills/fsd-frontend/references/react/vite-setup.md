# React + Vite + FSD

Standard React with Vite has no routing conflicts — straightforward FSD setup.

## Folder Structure

```
src/
├── app/
│   ├── index.tsx                  # App entry, providers
│   ├── router.tsx                 # React Router setup
│   └── styles/
│       └── globals.css
├── pages/
│   ├── home/
│   │   ├── ui/
│   │   │   └── home-page.tsx
│   │   └── index.ts
│   └── dashboard/
├── widgets/
├── features/
├── entities/
└── shared/
```

## App Entry

```tsx
// src/app/index.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/shared/api';
import { AppRouter } from './router';
import './styles/globals.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);
```

## Router Setup

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

## Page Component

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

## vite.config.ts

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

## tsconfig.json

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

1. All FSD layers in `src/`
2. Router in `src/app/router.tsx`
3. Providers in app entry
4. No folder conflicts with Vite
