---
name: fsd-architecture
description: >
  Feature-Sliced Design (FSD) architectural methodology for frontend applications.
  This skill should be used when: structuring frontend projects, organizing code by
  domain slices, enforcing layer boundaries, deciding where to place components/features,
  understanding FSD layers (app, pages, widgets, features, entities, shared), or
  following public API patterns with index.ts exports.
---

# Feature-Sliced Design Architecture

FSD architectural methodology for organizing frontend code by domain.

## Core Principle

Code organized by **scope** (layers) → **domain** (slices) → **purpose** (segments).

## Layers (Top to Bottom)

| Layer | Purpose | Has Slices |
|-------|---------|------------|
| `app` | Initialization, providers, global setup | No |
| `pages` | Full pages/routes | Yes |
| `widgets` | Large reusable UI blocks | Yes |
| `features` | User actions, interactions | Yes |
| `entities` | Business objects, domain models | Yes |
| `shared` | Utilities, UI kit, configs | No |

> **Critical**: A module can only import from layers **STRICTLY BELOW**.

See `references/layers-guide.md` for detailed layer placement decisions.

---

## Segments (Within Slices)

| Segment | Purpose |
|---------|---------|
| `ui/` | Components, styles |
| `model/` | State, types, schemas |
| `api/` | Data fetching, repositories |
| `lib/` | Utilities specific to slice |

---

## Public API Pattern

Every slice exports through `index.ts`:

```typescript
// src/entities/user/index.ts
export { UserCard } from './ui/user-card'
export { useUser } from './model/queries'
export type { User } from './model/types'
// Internal files NOT exported
```

---

## Directory Structure

```
src/
├── app/                    # No slices
│   ├── providers/
│   └── styles/
├── pages/                  # Route-based slices
│   └── home/
├── widgets/                # Composite UI slices
│   └── header/
├── features/               # User action slices
│   └── auth/
├── entities/               # Domain object slices
│   └── user/
│       ├── ui/
│       ├── model/
│       ├── api/
│       └── index.ts        # Public API
└── shared/                 # No slices
    ├── ui/
    ├── lib/
    └── config/
```

---

## References

- `references/layers-guide.md` — Detailed layer placement decisions

## Resources

- [Feature-Sliced Design](https://feature-sliced.design/)
