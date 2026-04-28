# State Management - React + Firebase

React hooks with Firebase real-time listeners and authentication.

## Firebase Auth Hook

```typescript
// src/features/auth/model/use-auth.ts
import { useState, useEffect } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/shared/firebase';

interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return {
    user,
    loading,
    isAuthenticated: !!user,
  };
}
```

```tsx
// src/features/auth/ui/auth-guard.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../model/use-auth';

interface Props {
  children: React.ReactNode;
}

export function AuthGuard({ children }: Props) {
  const navigate = useNavigate();
  const { loading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [loading, isAuthenticated, navigate]);

  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <p>Redirecting to login...</p>;

  return <>{children}</>;
}
```

---

## Firestore Real-time Hooks

```typescript
// src/shared/firebase/use-firestore.ts
import { useState, useEffect } from 'react';
import { onSnapshot, type Query, type DocumentReference } from 'firebase/firestore';

// Subscribe to a Firestore document
export function useFirestoreDoc<T>(docRef: DocumentReference | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!docRef) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setData({ id: snapshot.id, ...snapshot.data() } as T);
        } else {
          setData(null);
        }
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [docRef?.path]);

  return { data, loading, error };
}

// Subscribe to a Firestore query
export function useFirestoreQuery<T>(query: Query | null) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!query) {
      setData([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = onSnapshot(
      query,
      (snapshot) => {
        const docs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as T));
        setData(docs);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [query]);

  return { data, loading, error };
}
```

---

## Entity with Real-time Data

```typescript
// src/entities/user/model/hooks.ts
import { useMemo } from 'react';
import { doc, collection, query, where } from 'firebase/firestore';
import { db } from '@/shared/firebase';
import { useFirestoreDoc, useFirestoreQuery } from '@/shared/firebase/use-firestore';
import type { User } from './types';

export function useUser(userId: string | null) {
  const docRef = useMemo(
    () => userId ? doc(db, 'users', userId) : null,
    [userId]
  );
  return useFirestoreDoc<User>(docRef);
}

export function useActiveUsers() {
  const q = useMemo(
    () => query(collection(db, 'users'), where('status', '==', 'active')),
    []
  );
  return useFirestoreQuery<User>(q);
}
```

---

## Feature: Chat with Real-time Messages

```typescript
// src/features/chat/model/hooks.ts
import { useMemo, useCallback } from 'react';
import { collection, query, orderBy, limit, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/shared/firebase';
import { useFirestoreQuery } from '@/shared/firebase/use-firestore';

interface Message {
  id: string;
  text: string;
  userId: string;
  userName: string;
  createdAt: Date;
}

export function useChatMessages(roomId: string, messageLimit = 50) {
  const q = useMemo(
    () => query(
      collection(db, 'rooms', roomId, 'messages'),
      orderBy('createdAt', 'desc'),
      limit(messageLimit)
    ),
    [roomId, messageLimit]
  );
  return useFirestoreQuery<Message>(q);
}

export function useSendMessage(roomId: string) {
  return useCallback(async (text: string) => {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');

    await addDoc(collection(db, 'rooms', roomId, 'messages'), {
      text,
      userId: user.uid,
      userName: user.displayName || 'Anonymous',
      createdAt: serverTimestamp(),
    });
  }, [roomId]);
}
```

---

## Zustand + Firebase Sync

```typescript
// src/features/cart/model/store.ts
import { useEffect } from 'react';
import { createPersistedImmerStore } from '@/shared/store';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '@/shared/firebase';

interface CartItem { productId: string; quantity: number; price: number; }

interface CartStore {
  items: CartItem[];
  synced: boolean;
  addItem: (productId: string, price: number) => void;
}

export const useCartStore = createPersistedImmerStore<CartStore>(
  (set) => ({
    items: [],
    synced: false,

    addItem: (productId, price) =>
      set((state) => {
        const existing = state.items.find((i) => i.productId === productId);
        if (existing) {
          existing.quantity += 1;
        } else {
          state.items.push({ productId, quantity: 1, price });
        }
      }),
  }),
  { name: 'cart-store' }
);

// Hook to sync cart with Firestore
export function useCartSync() {
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const cartRef = doc(db, 'carts', user.uid);

    // Listen for remote changes
    const unsubscribe = onSnapshot(cartRef, (snapshot) => {
      if (snapshot.exists()) {
        useCartStore.setState({
          items: snapshot.data().items,
          synced: true,
        });
      }
    });

    // Sync local changes to Firestore
    const unsyncLocal = useCartStore.subscribe(
      (state) => state.items,
      (items) => {
        if (useCartStore.getState().synced) {
          setDoc(cartRef, { items }, { merge: true });
        }
      }
    );

    return () => {
      unsubscribe();
      unsyncLocal();
    };
  }, []);
}
```

---

## Key Patterns

> **TanStack Query**: For React Query + Firebase patterns, see `tanstack-firebase.md`.

| Hook | Usage |
|------|-------|
| `useFirestoreDoc` | Single document subscription |
| `useFirestoreQuery` | Collection query subscription |
| `useAuth` | Auth state with loading |
| `useMemo` | Memoize Firestore refs/queries |

1. Memoize Firestore references to prevent re-subscriptions
2. Use `useEffect` cleanup for unsubscribe
3. Combine Zustand for UI state, Firestore for persistence
4. React Query for one-time fetches, hooks for real-time
