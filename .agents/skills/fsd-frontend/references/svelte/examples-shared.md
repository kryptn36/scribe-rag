# Shared Layer Examples (Svelte)

No slices — segments at top level.

## `shared/ui` — Reusable UI Components

```svelte
<!-- src/shared/ui/button/button.svelte -->
<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements';

  interface Props extends HTMLButtonAttributes {
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
  }

  let { variant = 'primary', size = 'md', children, ...rest }: Props = $props();
</script>

<button class="btn btn-{variant} btn-{size}" {...rest}>
  {@render children?.()}
</button>
```

```typescript
// src/shared/ui/button/index.ts
export { default as Button } from './button.svelte';
```

## `shared/api` — API Client

```typescript
// src/shared/api/client.ts
import createClient from 'openapi-fetch';
import { backendBaseUrl } from '@/shared/config';
import type { paths } from './schema';

export const { GET, POST, PUT, DELETE } = createClient<paths>({
  baseUrl: backendBaseUrl,
});
```

```typescript
// src/shared/api/index.ts
export { GET, POST, PUT, DELETE } from './client';
```

## `shared/lib` — Utilities

```typescript
// src/shared/lib/cn.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

```typescript
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

```typescript
// src/shared/config/env.ts
export const backendBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
export const appName = import.meta.env.VITE_APP_NAME ?? 'My App';
export const isProduction = import.meta.env.PROD;
```

## Structure

```
src/shared/
├── ui/
│   ├── button/
│   │   ├── button.svelte
│   │   └── index.ts
│   └── input/
├── api/
│   ├── client.ts
│   └── index.ts
├── lib/
│   ├── cn.ts
│   └── format-date.ts
└── config/
    └── env.ts
```
