# Entity Layer Examples (Svelte)

Entities = business objects with data and display.

## Structure

```
src/entities/user/
├── ui/
│   ├── user-card.svelte
│   └── user-avatar.svelte
├── model/
│   ├── types.ts
│   └── store.ts
├── api/
│   └── user-api.ts
├── lib/
│   └── format-user-name.ts
└── index.ts
```

## UI Segment

```svelte
<!-- src/entities/user/ui/user-card.svelte -->
<script lang="ts">
  import type { User } from '../model/types';
  import { formatUserName } from '../lib/format-user-name';

  interface Props {
    user: User;
  }

  let { user }: Props = $props();
</script>

<div class="user-card">
  <img src={user.avatarUrl} alt={user.name} />
  <span>{formatUserName(user)}</span>
</div>
```

## Model Segment

```typescript
// src/entities/user/model/types.ts
export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  createdAt: Date;
}
```

```typescript
// src/entities/user/model/store.ts
import { writable } from 'svelte/store';
import type { User } from './types';

export const currentUser = writable<User | null>(null);

export function setCurrentUser(user: User | null) {
  currentUser.set(user);
}
```

## API Segment

```typescript
// src/entities/user/api/user-api.ts
import { GET } from '@/shared/api';
import type { User } from '../model/types';

export async function fetchUser(userId: string): Promise<User> {
  const { data, error } = await GET('/users/{id}', {
    params: { path: { id: userId } },
  });
  if (error) throw new Error('Failed to fetch user');
  return data;
}

export async function fetchCurrentUser(): Promise<User> {
  const { data, error } = await GET('/users/me');
  if (error) throw new Error('Failed to fetch current user');
  return data;
}
```

## Lib Segment

```typescript
// src/entities/user/lib/format-user-name.ts
import type { User } from '../model/types';

export function formatUserName(user: User): string {
  return user.name || user.email.split('@')[0];
}
```

## Public API

```typescript
// src/entities/user/index.ts
export { default as UserCard } from './ui/user-card.svelte';
export { default as UserAvatar } from './ui/user-avatar.svelte';
export { currentUser, setCurrentUser } from './model/store';
export { fetchUser, fetchCurrentUser } from './api/user-api';
export type { User } from './model/types';
```

## Key Points

- Entities have NO user actions — just data display
- Use Svelte stores for reactive state
- Export via public API
- Internal imports use relative paths
