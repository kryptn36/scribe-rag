# Zustand Store Setup

Zustand store creation utilities with Immer and persistence.

## Installation

```bash
npm install zustand immer
```

---

## Basic Immer Store

```typescript
// src/shared/store/create-immer-store.ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { subscribeWithSelector } from 'zustand/middleware';

export function createImmerStore<T>(
  initializer: (
    set: (fn: (state: T) => void) => void,
    get: () => T
  ) => T
) {
  return create<T>()(
    subscribeWithSelector(
      immer(initializer)
    )
  );
}
```

---

## Persisted Immer Store

```typescript
// src/shared/store/create-persisted-immer-store.ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist, createJSONStorage } from 'zustand/middleware';
import { subscribeWithSelector } from 'zustand/middleware';

interface PersistOptions {
  name: string;
  storage?: 'local' | 'session';
  partialize?: (state: any) => any;
}

export function createPersistedImmerStore<T>(
  initializer: (
    set: (fn: (state: T) => void) => void,
    get: () => T
  ) => T,
  options: PersistOptions
) {
  return create<T>()(
    subscribeWithSelector(
      persist(
        immer(initializer),
        {
          name: options.name,
          storage: createJSONStorage(() =>
            options.storage === 'session' ? sessionStorage : localStorage
          ),
          partialize: options.partialize,
        }
      )
    )
  );
}
```

---

## Usage Examples

### Cart Store

```typescript
// src/features/cart/model/store.ts
import { createPersistedImmerStore } from '@/shared/store';

interface CartItem {
  productId: string;
  quantity: number;
  price: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (productId: string, price: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
  getItemCount: () => number;
  getTotal: () => number;
}

export const useCartStore = createPersistedImmerStore<CartStore>(
  (set, get) => ({
    items: [],

    addItem: (productId, price) =>
      set((state) => {
        const existing = state.items.find((i) => i.productId === productId);
        if (existing) {
          existing.quantity += 1;
        } else {
          state.items.push({ productId, quantity: 1, price });
        }
      }),

    removeItem: (productId) =>
      set((state) => {
        state.items = state.items.filter((i) => i.productId !== productId);
      }),

    updateQuantity: (productId, quantity) =>
      set((state) => {
        const item = state.items.find((i) => i.productId === productId);
        if (item) {
          item.quantity = Math.max(0, quantity);
        }
      }),

    clear: () => set((state) => { state.items = []; }),

    getItemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

    getTotal: () => get().items.reduce((sum, i) => sum + i.quantity * i.price, 0),
  }),
  { name: 'cart-store' }
);
```

### Auth Store

```typescript
// src/features/auth/model/store.ts
import { createImmerStore } from '@/shared/store';

interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = createImmerStore<AuthStore>((set, get) => ({
  user: null,
  token: null,
  loading: true,

  setUser: (user) => set((state) => { state.user = user; }),
  setToken: (token) => set((state) => { state.token = token; }),
  setLoading: (loading) => set((state) => { state.loading = loading; }),

  logout: () =>
    set((state) => {
      state.user = null;
      state.token = null;
    }),

  isAuthenticated: () => !!get().user,
}));
```

### Entity Store Pattern

```typescript
// src/entities/user/model/store.ts
import { createImmerStore } from '@/shared/store';
import type { User } from './types';

interface UserStore {
  current: User | null;
  byId: Record<string, User>;
  loading: boolean;
  error: string | null;
  setCurrentUser: (user: User | null) => void;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useUserStore = createImmerStore<UserStore>((set) => ({
  current: null,
  byId: {},
  loading: false,
  error: null,

  setCurrentUser: (user) => set((state) => { state.current = user; }),

  setUser: (user) =>
    set((state) => {
      state.byId[user.id] = user;
    }),

  setLoading: (loading) =>
    set((state) => {
      state.loading = loading;
      if (loading) state.error = null;
    }),

  setError: (error) =>
    set((state) => {
      state.error = error;
      state.loading = false;
    }),
}));
```

---

## Public API

```typescript
// src/shared/store/index.ts
export { createImmerStore } from './create-immer-store';
export { createPersistedImmerStore } from './create-persisted-immer-store';
```

---

## Key Patterns

| Utility | Use Case |
|---------|----------|
| `createImmerStore` | Standard store with Immer mutations |
| `createPersistedImmerStore` | Store with localStorage/sessionStorage |
| `subscribeWithSelector` | Selective subscriptions for effects |

1. Use Immer for immutable updates with mutable syntax
2. Persist cart, preferences, drafts — not auth tokens
3. Use `partialize` to exclude sensitive or derived state
4. Combine with `subscribeWithSelector` for side effects
