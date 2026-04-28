# Feature Layer Examples (Svelte)

Features = user actions providing business value.

## Structure

```
src/features/auth/
├── ui/
│   ├── login-form.svelte
│   ├── signup-form.svelte
│   └── logout-button.svelte
├── model/
│   ├── auth-store.ts
│   └── types.ts
├── api/
│   └── auth-api.ts
├── lib/
│   └── validate-credentials.ts
└── index.ts
```

## UI Segment

```svelte
<!-- src/features/auth/ui/login-form.svelte -->
<script lang="ts">
  import { Button } from '@/shared/ui/button';
  import { Input } from '@/shared/ui/input';
  import { login } from '../api/auth-api';
  import { validateEmail, validatePassword } from '../lib/validate-credentials';

  let email = $state('');
  let password = $state('');
  let error = $state<string | null>(null);
  let loading = $state(false);

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    error = null;

    if (!validateEmail(email)) {
      error = 'Invalid email address';
      return;
    }

    if (!validatePassword(password)) {
      error = 'Password must be at least 8 characters';
      return;
    }

    loading = true;
    try {
      await login({ email, password });
    } catch (err) {
      error = 'Invalid credentials';
    } finally {
      loading = false;
    }
  }
</script>

<form onsubmit={handleSubmit}>
  <Input type="email" bind:value={email} placeholder="Email" />
  <Input type="password" bind:value={password} placeholder="Password" />
  {#if error}<p class="error">{error}</p>{/if}
  <Button type="submit" disabled={loading}>
    {loading ? 'Logging in...' : 'Log In'}
  </Button>
</form>
```

## Model Segment

```typescript
// src/features/auth/model/auth-store.ts
import { writable, derived } from 'svelte/store';

export const authToken = writable<string | null>(null);
export const isAuthenticated = derived(authToken, ($token) => $token !== null);

export function setAuthToken(token: string | null) {
  authToken.set(token);
  if (token) {
    localStorage.setItem('auth_token', token);
  } else {
    localStorage.removeItem('auth_token');
  }
}

export function loadAuthToken() {
  const token = localStorage.getItem('auth_token');
  if (token) authToken.set(token);
}
```

## API Segment

```typescript
// src/features/auth/api/auth-api.ts
import { POST } from '@/shared/api';
import { setAuthToken } from '../model/auth-store';
import { setCurrentUser } from '@/entities/user';
import type { LoginCredentials } from '../model/types';

export async function login(credentials: LoginCredentials): Promise<void> {
  const { data, error } = await POST('/auth/login', { body: credentials });
  if (error) throw new Error('Login failed');

  setAuthToken(data.token);
  setCurrentUser(data.user);
}

export async function logout(): Promise<void> {
  await POST('/auth/logout', {});
  setAuthToken(null);
  setCurrentUser(null);
}
```

## Lib Segment

```typescript
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

```typescript
// src/features/auth/index.ts
export { default as LoginForm } from './ui/login-form.svelte';
export { default as LogoutButton } from './ui/logout-button.svelte';
export { isAuthenticated, loadAuthToken } from './model/auth-store';
export { login, logout } from './api/auth-api';
```

## Key Points

- Features contain USER ACTIONS with business logic
- Use Svelte 5 runes ($state, $derived)
- Svelte stores for persistent state
- Validation in lib segment
