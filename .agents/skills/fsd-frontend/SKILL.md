---
name: fsd-frontend
description: >
  Frontend framework patterns with Feature-Sliced Design for React/Next.js and Svelte/SvelteKit.
  This skill should be used when: setting up React or Svelte projects with FSD structure,
  implementing state management with Zustand or Svelte 5 runes, integrating TanStack Query
  for data fetching, building FSD-compliant components across layers, or following
  framework-specific patterns for pages, widgets, features, and entities.
---

# FSD Frontend Patterns

React/Next.js and Svelte/SvelteKit with Feature-Sliced Design.

## Framework Support

| Framework | State Management | Data Fetching |
|-----------|-----------------|---------------|
| React/Next.js | Zustand | React Query |
| Svelte/SvelteKit | Svelte 5 runes | Svelte Query v6 |

---

## React / Next.js

### Framework Setup
- `references/react/vite-setup.md` — React + Vite + FSD
- `references/react/nextjs-app-router.md` — Next.js App Router integration
- `references/react/nextjs-pages-router.md` — Next.js Pages Router integration

### State Management
- `references/react/state-management.md` — Zustand patterns, side effects
- `references/react/tanstack-query.md` — React Query: queries, mutations, optimistic updates

### Code Examples
- `references/react/examples-shared.md`
- `references/react/examples-entities.md`
- `references/react/examples-features.md`
- `references/react/examples-widgets.md`
- `references/react/examples-pages.md`

---

## Svelte / SvelteKit

### Framework Setup
- `references/svelte/sveltekit-setup.md` — SvelteKit + FSD integration

### State Management
- `references/svelte/state-management.md` — Svelte 5 runes, Zustand adapter
- `references/svelte/tanstack-query.md` — Svelte Query v6 (runes-native, no `$` prefix)

### Code Examples
- `references/svelte/examples-shared.md`
- `references/svelte/examples-entities.md`
- `references/svelte/examples-features.md`
- `references/svelte/examples-widgets.md`
- `references/svelte/examples-pages.md`

---

## Shared Utilities

- `references/shared/zustand-setup.md` — Zustand + Immer, persistence patterns

---

## Resources

- [Feature-Sliced Design](https://feature-sliced.design/)
- [TanStack Query](https://tanstack.com/query)
