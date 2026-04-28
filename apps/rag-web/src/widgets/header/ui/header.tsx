import { Brain, SignOut } from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';

import { logoutAction } from '@/features/auth/api/actions';
import { createClient } from '@/shared/api/supabase/server';
import { Button } from '@/shared/ui/components/button';

export async function Header() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data?.user;

  return (
    <header className="bg-background/50 relative z-10 flex items-center justify-between border-b border-white/5 px-6 py-4 backdrop-blur-md lg:px-8">
      <div className="flex items-center gap-2">
        <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <Brain size={32} weight="duotone" className="text-primary" />
          <span className="text-xl font-bold tracking-tight">Scribe</span>
        </Link>
      </div>

      {!user && (
        <nav className="hidden gap-6 md:flex">
          <Link href="/#features" className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">
            Features
          </Link>
          <Link href="/#how-it-works" className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">
            How it Works
          </Link>
          <Link href="/#pricing" className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">
            Pricing
          </Link>
        </nav>
      )}

      {user && (
        <nav className="hidden gap-6 md:flex">
          <Link href="/dashboard" className="text-foreground text-sm font-medium transition-colors">
            Dashboard
          </Link>
          <Link href="/dashboard/meetings" className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">
            Meetings
          </Link>
        </nav>
      )}

      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground hidden text-sm sm:inline-flex">{user.email}</span>
            <form action={logoutAction}>
              <Button variant="ghost" size="icon" type="submit" title="Log out">
                <SignOut size={20} />
              </Button>
            </form>
          </div>
        ) : (
          <>
            <Link href="/login">
              <Button variant="ghost" className="hidden sm:inline-flex">
                Log in
              </Button>
            </Link>
            <Link href="/register">
              <Button className="group relative overflow-hidden">
                <span className="relative z-10">Get Started</span>
                <div className="absolute inset-0 bg-white/20 transition-colors group-hover:bg-white/30" />
              </Button>
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
