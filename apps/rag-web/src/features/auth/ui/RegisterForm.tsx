'use client';

import Link from 'next/link';
import { useActionState } from 'react';

import { Input } from '@/shared/ui/components/input';
import { InteractiveHoverButton } from '@/shared/ui/components/interactive-hover-button';
import { Label } from '@/shared/ui/components/label';
import { MagicCard } from '@/shared/ui/components/magic-card';
import { TypingAnimation } from '@/shared/ui/components/typing-animation';

import { registerAction } from '../api/actions';

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(registerAction, undefined as any);

  return (
    <MagicCard
      className="border-primary/20 bg-background/50 mx-auto w-full max-w-md shadow-lg backdrop-blur-sm"
      gradientColor="rgba(255, 255, 255, 0.05)"
    >
      <div className="space-y-1 p-6 pb-0 text-center">
        <h3 className="text-2xl font-bold tracking-tight">
          <TypingAnimation className="text-2xl font-bold tracking-tight">Create an account</TypingAnimation>
        </h3>
        <p className="text-muted-foreground text-sm">Enter your details to create your account</p>
      </div>
      <form action={formAction} className="p-6">
        <div className="space-y-4">
          {state?.error && (
            <div className="text-destructive bg-destructive/10 border-destructive/20 rounded-md border p-3 text-sm">{state.error}</div>
          )}
          <div className="space-y-2">
            <Label htmlFor="name">Full Name (Optional)</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="John Doe"
              className="bg-background/50 focus:bg-background transition-colors"
            />
          </div>
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
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              className="bg-background/50 focus:bg-background transition-colors"
            />
          </div>
        </div>
        <div className="mt-6 flex flex-col space-y-4">
          <InteractiveHoverButton className="h-10 w-full text-sm font-medium" type="submit" disabled={isPending}>
            {isPending ? 'Creating account...' : 'Create account'}
          </InteractiveHoverButton>
          <div className="text-muted-foreground text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-primary font-medium transition-colors hover:underline">
              Log in
            </Link>
          </div>
        </div>
      </form>
    </MagicCard>
  );
}
