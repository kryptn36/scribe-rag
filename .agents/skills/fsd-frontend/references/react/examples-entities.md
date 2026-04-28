# Entity Layer Examples (React)

Entities = business objects with data and display.

## Structure

```
src/entities/user/
├── ui/
│   ├── user-card.tsx
│   └── user-avatar.tsx
├── model/
│   ├── types.ts
│   ├── hooks.ts
│   └── store.ts (if using Zustand)
├── api/
│   └── user-api.ts
├── lib/
│   └── format-user-name.ts
└── index.ts
```

## UI Segment

```tsx
// src/entities/user/ui/user-card.tsx
import type { User } from '../model/types';
import { formatUserName } from '../lib/format-user-name';
import { UserAvatar } from './user-avatar';

interface UserCardProps {
  user: User;
}

export function UserCard({ user }: UserCardProps) {
  return (
    <div className="user-card">
      <UserAvatar user={user} />
      <span>{formatUserName(user)}</span>
    </div>
  );
}
```

## Model Segment

```tsx
// src/entities/user/model/types.ts
export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  createdAt: string;
}
```

```tsx
// src/entities/user/model/hooks.ts
import { useQuery } from '@tanstack/react-query';
import { fetchUser, fetchCurrentUser } from '../api/user-api';

export function useUser(userId: string) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
    enabled: !!userId,
  });
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: fetchCurrentUser,
  });
}
```

## API Segment

```tsx
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

```tsx
// src/entities/user/lib/format-user-name.ts
import type { User } from '../model/types';

export function formatUserName(user: User): string {
  return user.name || user.email.split('@')[0];
}
```

## Public API

```tsx
// src/entities/user/index.ts
export { UserCard } from './ui/user-card';
export { UserAvatar } from './ui/user-avatar';
export { useUser, useCurrentUser } from './model/hooks';
export type { User } from './model/types';
```

## Key Points

- Entities have NO user actions — just data display
- Export only what other slices need via public API
- Use React Query hooks for data fetching
- Internal imports use relative paths
- External imports use `@/` alias
