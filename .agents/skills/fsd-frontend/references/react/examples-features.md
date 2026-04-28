# Feature Layer Examples (React)

Features = user actions providing business value.

## Structure

```
src/features/auth/
├── ui/
│   ├── login-form.tsx
│   ├── signup-form.tsx
│   └── logout-button.tsx
├── model/
│   ├── hooks.ts
│   ├── store.ts
│   └── types.ts
├── api/
│   └── auth-api.ts
├── lib/
│   └── validate-credentials.ts
└── index.ts
```

## UI Segment

```tsx
// src/features/auth/ui/login-form.tsx
import { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { useLogin } from '../model/hooks';
import { validateEmail, validatePassword } from '../lib/validate-credentials';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { mutate: login, isPending } = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateEmail(email)) {
      setError('Invalid email address');
      return;
    }

    if (!validatePassword(password)) {
      setError('Password must be at least 8 characters');
      return;
    }

    login(
      { email, password },
      { onError: () => setError('Invalid credentials') }
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <Input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      {error && <p className="error">{error}</p>}
      <Button type="submit" disabled={isPending}>
        {isPending ? 'Logging in...' : 'Log In'}
      </Button>
    </form>
  );
}
```

## Model Segment

```tsx
// src/features/auth/model/hooks.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { login, logout } from '../api/auth-api';
import { useAuthStore } from './store';

export function useLogin() {
  const queryClient = useQueryClient();
  const setToken = useAuthStore((s) => s.setToken);

  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setToken(data.token);
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const clearToken = useAuthStore((s) => s.clearToken);

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      clearToken();
      queryClient.clear();
    },
  });
}
```

```tsx
// src/features/auth/model/store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthStore {
  token: string | null;
  setToken: (token: string) => void;
  clearToken: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      token: null,
      setToken: (token) => set({ token }),
      clearToken: () => set({ token: null }),
      isAuthenticated: () => get().token !== null,
    }),
    { name: 'auth-store' }
  )
);
```

## API Segment

```tsx
// src/features/auth/api/auth-api.ts
import { POST } from '@/shared/api';
import type { LoginCredentials, AuthResponse } from '../model/types';

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const { data, error } = await POST('/auth/login', { body: credentials });
  if (error) throw new Error('Login failed');
  return data;
}

export async function logout(): Promise<void> {
  await POST('/auth/logout', {});
}
```

## Lib Segment

```tsx
// src/features/auth/lib/validate-credentials.ts
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): boolean {
  return password.length >= 8;
}
```

## Public API

```tsx
// src/features/auth/index.ts
export { LoginForm } from './ui/login-form';
export { LogoutButton } from './ui/logout-button';
export { useLogin, useLogout } from './model/hooks';
export { useAuthStore } from './model/store';
```

## Key Points

- Features contain USER ACTIONS with business logic
- Use React Query mutations for actions
- Zustand for auth state persistence
- Validation in lib segment
