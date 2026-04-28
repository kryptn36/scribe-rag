# State Management - Svelte 5 + Firebase

Svelte 5 runes with Firebase real-time listeners and authentication.

## Firebase Auth State

```typescript
// src/features/auth/model/auth-state.svelte.ts
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/shared/firebase';

// Reactive auth state using runes
let currentUser = $state<User | null>(null);
let loading = $state(true);
let initialized = $state(false);

// Initialize auth listener once
if (!initialized) {
  initialized = true;
  onAuthStateChanged(auth, (user) => {
    currentUser = user;
    loading = false;
  });
}

export function getAuthState() {
  return {
    get user() { return currentUser; },
    get loading() { return loading; },
    get isAuthenticated() { return !!currentUser; },
  };
}
```

```svelte
<!-- src/features/auth/ui/auth-guard.svelte -->
<script lang="ts">
  import { getAuthState } from '../model/auth-state.svelte';
  import { goto } from '$app/navigation';

  let { children } = $props();

  const auth = getAuthState();

  $effect(() => {
    if (!auth.loading && !auth.isAuthenticated) {
      goto('/login');
    }
  });
</script>

{#if auth.loading}
  <div>Loading...</div>
{:else if auth.isAuthenticated}
  {@render children?.()}
{:else}
  <p>Redirecting to login...</p>
{/if}
```

---

## Firestore Real-time with Runes

```typescript
// src/shared/firebase/firestore-runes.svelte.ts
import { onSnapshot, type Query, type DocumentReference } from 'firebase/firestore';

// Subscribe to a Firestore document with reactive state
export function useFirestoreDoc<T>(docRef: DocumentReference) {
  let data = $state<T | null>(null);
  let loading = $state(true);
  let error = $state<Error | null>(null);

  $effect(() => {
    loading = true;
    error = null;

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          data = { id: snapshot.id, ...snapshot.data() } as T;
        } else {
          data = null;
        }
        loading = false;
      },
      (err) => {
        error = err;
        loading = false;
      }
    );

    return unsubscribe;
  });

  return {
    get data() { return data; },
    get loading() { return loading; },
    get error() { return error; },
  };
}

// Subscribe to a Firestore query with reactive state
export function useFirestoreQuery<T>(query: Query) {
  let data = $state<T[]>([]);
  let loading = $state(true);
  let error = $state<Error | null>(null);

  $effect(() => {
    loading = true;
    error = null;

    const unsubscribe = onSnapshot(
      query,
      (snapshot) => {
        data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as T));
        loading = false;
      },
      (err) => {
        error = err;
        loading = false;
      }
    );

    return unsubscribe;
  });

  return {
    get data() { return data; },
    get loading() { return loading; },
    get error() { return error; },
  };
}
```

---

## Entity with Real-time Data

```typescript
// src/entities/user/model/user-store.svelte.ts
import { doc, collection, query, where } from 'firebase/firestore';
import { db } from '@/shared/firebase';
import { useFirestoreDoc, useFirestoreQuery } from '@/shared/firebase/firestore-runes.svelte';
import type { User } from './types';

export function useUser(userId: string) {
  const docRef = doc(db, 'users', userId);
  return useFirestoreDoc<User>(docRef);
}

export function useActiveUsers() {
  const q = query(
    collection(db, 'users'),
    where('status', '==', 'active')
  );
  return useFirestoreQuery<User>(q);
}
```

```svelte
<!-- src/entities/user/ui/user-card.svelte -->
<script lang="ts">
  import { useUser } from '../model/user-store.svelte';

  interface Props {
    userId: string;
  }

  let { userId }: Props = $props();

  const userState = useUser(userId);
</script>

{#if userState.loading}
  <div class="skeleton">Loading...</div>
{:else if userState.error}
  <div class="error">Error: {userState.error.message}</div>
{:else if userState.data}
  <div class="user-card">
    <img src={userState.data.avatarUrl ?? ''} alt={userState.data.name} />
    <h3>{userState.data.name}</h3>
    <p>{userState.data.email}</p>
  </div>
{/if}
```

---

## Feature: Chat with Real-time Messages

```typescript
// src/features/chat/model/chat-store.svelte.ts
import { collection, query, orderBy, limit, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/shared/firebase';
import { useFirestoreQuery } from '@/shared/firebase/firestore-runes.svelte';

interface Message {
  id: string;
  text: string;
  userId: string;
  userName: string;
  createdAt: Date;
}

export function useChatMessages(roomId: string, messageLimit = 50) {
  const q = query(
    collection(db, 'rooms', roomId, 'messages'),
    orderBy('createdAt', 'desc'),
    limit(messageLimit)
  );
  return useFirestoreQuery<Message>(q);
}

export async function sendMessage(roomId: string, text: string) {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');

  await addDoc(collection(db, 'rooms', roomId, 'messages'), {
    text,
    userId: user.uid,
    userName: user.displayName || 'Anonymous',
    createdAt: serverTimestamp(),
  });
}
```

```svelte
<!-- src/features/chat/ui/chat-room.svelte -->
<script lang="ts">
  import { useChatMessages, sendMessage } from '../model/chat-store.svelte';
  import { Button, Input } from '@/shared/ui';

  interface Props {
    roomId: string;
  }

  let { roomId }: Props = $props();

  const messages = useChatMessages(roomId);
  let newMessage = $state('');
  let sending = $state(false);

  async function handleSend(e: SubmitEvent) {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    sending = true;
    try {
      await sendMessage(roomId, newMessage);
      newMessage = '';
    } finally {
      sending = false;
    }
  }
</script>

<div class="chat-room">
  <div class="messages">
    {#if messages.loading}
      <p>Loading messages...</p>
    {:else}
      {#each messages.data as message}
        <div class="message">
          <strong>{message.userName}</strong>
          <p>{message.text}</p>
        </div>
      {/each}
    {/if}
  </div>

  <form onsubmit={handleSend}>
    <Input bind:value={newMessage} placeholder="Type a message..." />
    <Button type="submit" disabled={sending}>Send</Button>
  </form>
</div>
```

---

## Key Patterns

| Pattern | Usage |
|---------|-------|
| `useFirestoreDoc` | Single document subscription |
| `useFirestoreQuery` | Collection query subscription |
| `getAuthState()` | Global auth state with runes |
| `$effect` cleanup | Unsubscribe on component destroy |

1. Use `.svelte.ts` files for reactive state modules
2. Return unsubscribe functions from `$effect`
3. Firestore listeners auto-cleanup on component destroy
4. Combine Zustand for local state, Firestore for sync
