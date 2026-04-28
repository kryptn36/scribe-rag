// Client components
export { LoginForm } from './ui/LoginForm';
export { RegisterForm } from './ui/RegisterForm';

// Types & schemas (safe to re-export)
export { loginSchema, registerSchema } from './model/types';
export type { LoginDto, RegisterDto, AuthState } from './model/types';

// NOTE: Server actions (loginAction, registerAction, logoutAction) must be
// imported directly from '@/features/auth/api/actions' to preserve the
// 'use server' boundary. Re-exporting them here strips the directive.
