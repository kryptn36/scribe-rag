import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2).optional(),
});

export type LoginDto = z.infer<typeof loginSchema>;
export type RegisterDto = z.infer<typeof registerSchema>;

export interface AuthState {
  status: 'idle' | 'loading' | 'success' | 'error';
  error?: string;
}
