# SvelteKit + FSD Integration

SvelteKit's default `src/routes` conflicts with FSD's `app` layer.

## svelte.config.js

```typescript
import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: [vitePreprocess()],
  kit: {
    adapter: adapter(),
    files: {
      routes: 'src/app/routes',
      lib: 'src',
      appTemplate: 'src/app/index.html',
      assets: 'public'
    },
    alias: {
      '@/*': 'src/*'
    }
  }
};

export default config;
```

## Folder Structure

```
src/
├── app/
│   ├── routes/                    # SvelteKit file-based routing
│   │   ├── +layout.svelte
│   │   ├── +page.svelte
│   │   └── dashboard/
│   │       └── +page.svelte
│   ├── index.html
│   └── styles/
├── pages/
│   ├── home/
│   │   ├── ui/
│   │   │   └── home-page.svelte
│   │   └── index.ts
│   └── dashboard/
├── widgets/
├── features/
├── entities/
└── shared/
```

## Route File Pattern

```svelte
<!-- src/app/routes/+page.svelte -->
<script>
  import { HomePage } from '@/pages/home';
</script>

<HomePage />
```

## Page Public API

```typescript
// src/pages/home/index.ts
export { default as HomePage } from './ui/home-page.svelte';
```

## Key Points

1. Routes in `src/app/routes/`
2. Page components in `src/pages/`
3. Use `@/` alias for imports
4. Route files render page components
