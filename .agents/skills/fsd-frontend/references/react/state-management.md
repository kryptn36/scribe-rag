# State Management - React (Zustand)

## Basic Usage

```tsx
// src/features/cart/ui/add-to-cart-button.tsx
import { Button } from '@/shared/ui/button';
import { useCartStore } from '../model/store';

interface Props {
  productId: string;
  price: number;
}

export function AddToCartButton({ productId, price }: Props) {
  const addItem = useCartStore((s) => s.addItem);

  return (
    <Button onClick={() => addItem(productId, price)}>
      Add to Cart
    </Button>
  );
}
```

```tsx
// src/widgets/header/ui/cart-badge.tsx
import { useCartStore } from '@/features/cart';

export function CartBadge() {
  const itemCount = useCartStore((s) => s.getItemCount());

  if (itemCount === 0) return null;
  return <span className="cart-badge">{itemCount}</span>;
}
```

---

## Side Effects with useEffect

### Auth Redirect

```tsx
// src/features/auth/ui/auth-guard.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../model/store';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return <p>Redirecting to login...</p>;
  return <>{children}</>;
}
```

---

## Side Effects with Zustand Subscribe

```typescript
// src/features/cart/model/effects.ts
import { useCartStore } from './store';

export function initCartEffects() {
  return useCartStore.subscribe(
    (state) => state.items,
    (items, prevItems) => {
      if (items.length !== prevItems.length) {
        console.log('Cart updated:', items.length, 'items');
      }
    },
    { equalityFn: (a, b) => a.length === b.length }
  );
}
```

```tsx
// src/app/providers/effects-provider.tsx
import { useEffect } from 'react';
import { initCartEffects } from '@/features/cart/model/effects';

export function EffectsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const unsubscribe = initCartEffects();
    return unsubscribe;
  }, []);

  return <>{children}</>;
}
```

---

## Data Fetching with Loading/Error

```tsx
// src/entities/user/ui/user-profile.tsx
import { useEffect } from 'react';
import { useUserStore } from '../model/store';
import { fetchCurrentUser } from '../api/user-api';

export function UserProfile() {
  const user = useUserStore((s) => s.current);
  const loading = useUserStore((s) => s.loading);
  const error = useUserStore((s) => s.error);
  const setCurrentUser = useUserStore((s) => s.setCurrentUser);
  const setLoading = useUserStore((s) => s.setLoading);
  const setError = useUserStore((s) => s.setError);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const user = await fetchCurrentUser();
        if (!cancelled) setCurrentUser(user);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed');
      }
    }

    load();
    return () => { cancelled = true; };
  }, [setCurrentUser, setLoading, setError]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!user) return null;

  return (
    <div className="user-profile">
      <img src={user.avatarUrl ?? ''} alt={user.name} />
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
}
```

---

## Key Patterns

1. Select specific state slices to prevent re-renders
2. Use `useEffect` cleanup for cancelled requests
3. Use Zustand `subscribe` for cross-component effects
4. Combine with React Query for server state (see `tanstack-react.md`)
