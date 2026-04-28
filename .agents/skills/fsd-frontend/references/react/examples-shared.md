# Shared Layer Examples (React)

No slices — segments at top level.

## `shared/ui` — Reusable UI Components

```tsx
// src/shared/ui/button/button.tsx
import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/shared/lib/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn('btn', `btn-${variant}`, `btn-${size}`, className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
```

```tsx
// src/shared/ui/button/index.ts
export { Button } from './button';
```

## `shared/api` — API Client

```tsx
// src/shared/api/client.ts
import createClient from 'openapi-fetch';
import type { paths } from './schema';

export const api = createClient<paths>({
  baseUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
});

export const { GET, POST, PUT, DELETE } = api;
```

```tsx
// src/shared/api/query-client.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});
```

```tsx
// src/shared/api/index.ts
export { GET, POST, PUT, DELETE, api } from './client';
export { queryClient } from './query-client';
```

## `shared/lib` — Utilities

```tsx
// src/shared/lib/cn.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

```tsx
// src/shared/lib/format-date.ts
export function formatDate(date: Date | string, locale = 'en-US'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);
}
```

## `shared/config` — Configuration

```tsx
// src/shared/config/env.ts
export const config = {
  apiUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
  appName: import.meta.env.VITE_APP_NAME ?? 'My App',
  isProduction: import.meta.env.PROD,
} as const;
```

## Structure

```
src/shared/
├── ui/
│   ├── button/
│   │   ├── button.tsx
│   │   └── index.ts
│   └── input/
├── api/
│   ├── client.ts
│   ├── query-client.ts
│   └── index.ts
├── lib/
│   ├── cn.ts
│   └── format-date.ts
└── config/
    └── env.ts
```
