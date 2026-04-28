'use client';

import Link from 'next/link';
import { useActionState } from 'react';

import { Input } from '@/shared/ui/components/input';
import { InteractiveHoverButton } from '@/shared/ui/components/interactive-hover-button';
import { Label } from '@/shared/ui/components/label';
import { MagicCard } from '@/shared/ui/components/magic-card';
import { TypingAnimation } from '@/shared/ui/components/typing-animation';

import { loginAction } from '../api/actions';

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, undefined as any);

  return (
    <MagicCard
      className="border-primary/20 bg-background/50 mx-auto w-full max-w-md shadow-lg backdrop-blur-sm"
      gradientColor="rgba(255, 255, 255, 0.05)"
    >
      <div className="space-y-1 p-6 pb-0 text-center">
        <h3 className="text-2xl font-bold tracking-tight">
          <TypingAnimation className="text-2xl font-bold tracking-tight">Login</TypingAnimation>
        </h3>
        <p className="text-muted-foreground text-sm">Enter your email and password to access your account</p>
      </div>
      <form action={formAction} className="p-6">
        <div className="space-y-4">
          {state?.error && (
            <div className="text-destructive bg-destructive/10 border-destructive/20 rounded-md border p-3 text-sm">{state.error}</div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="m@example.com"
              required
              className="bg-background/50 focus:bg-background transition-colors"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link href="#" className="text-muted-foreground hover:text-primary text-xs transition-colors">
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              required
              className="bg-background/50 focus:bg-background transition-colors"
            />
          </div>
        </div>
        <div className="mt-6 flex flex-col space-y-4">
          <InteractiveHoverButton className="h-10 w-full text-sm font-medium" type="submit" disabled={isPending}>
            {isPending ? 'Logging in...' : 'Login'}
          </InteractiveHoverButton>
          <div className="text-muted-foreground text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-primary font-medium transition-colors hover:underline">
              Sign up
            </Link>
          </div>
        </div>
      </form>
    </MagicCard>
  );
}
