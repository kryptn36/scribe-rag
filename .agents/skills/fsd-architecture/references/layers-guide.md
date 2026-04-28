# Layer Decision Guide

## `entities` — Business Objects

**Use when:** Core business concept exists independently.

**Characteristics:**
- Real-world objects (user, product, order, comment)
- Data types, basic display UI, CRUD operations
- NO user actions — just displays data
- Used by features, widgets, pages

**Examples:**
- `entities/user` — avatar, card, types
- `entities/product` — card, types, API
- `entities/order` — summary, status badge

**NOT entities:**
- ❌ Login form (feature — it's an action)
- ❌ Shopping cart (feature — modifies state)

---

## `features` — User Actions

**Use when:** Functionality provides business value through user interaction.

**Characteristics:**
- Valuable user action or interaction
- Business logic for specific action
- Uses entities, adds behavior
- Focused on *what user can do*

**Examples:**
- `features/auth` — login, logout, signup
- `features/add-to-cart` — cart button with logic
- `features/like-post` — like/unlike functionality
- `features/search` — search with autocomplete

**NOT features:**
- ❌ Product card (entity — no action)
- ❌ App header (widget — structural)

---

## `widgets` — Compositional UI Blocks

**Use when:** Large, self-contained UI section composing features/entities, reused across pages.

**Characteristics:**
- Reusable across multiple pages
- Self-contained, works independently
- Combines features and entities
- Own data fetching, loading states, error boundaries

**Examples:**
- `widgets/header` — nav, user menu, search
- `widgets/sidebar` — navigation menu
- `widgets/product-list` — grid with filtering

**NOT widgets:**
- ❌ Button (shared/ui — too small)
- ❌ Login form (feature — action)
- ❌ Page-specific content (put in page slice)

---

## `pages` — Full Views

**Use when:** Complete screen/route.

**Characteristics:**
- Corresponds to app route
- Composes widgets, features, entities
- Page-level data fetching
- Minimal logic — mostly composition

**Examples:**
- `pages/home` — landing page
- `pages/dashboard` — user dashboard
- `pages/product-detail` — single product

---

## Decision Flowchart

```
Generic/reusable, NO business logic?
  └─ YES → shared

Business object (user, product, order)?
  └─ YES → entities

User ACTION (login, add-to-cart, like)?
  └─ YES → features

LARGE UI block reused across pages?
  └─ YES → widgets

Full page/route?
  └─ YES → pages
```
