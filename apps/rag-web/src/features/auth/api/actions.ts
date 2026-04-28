'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { createClient } from '@/shared/api/supabase/server';

import { loginSchema, registerSchema } from '../model/types';

export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const validation = loginSchema.safeParse({ email, password });

  if (!validation.success) {
    return { error: 'Invalid email or password format.' };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: validation.data.email,
    password: validation.data.password,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function registerAction(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const name = formData.get('name') as string | null;

  const data = { email, password, ...(name ? { name } : {}) };

  const validation = registerSchema.safeParse(data);

  if (!validation.success) {
    return { error: 'Invalid registration data. Password must be at least 6 characters.' };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email: validation.data.email,
    password: validation.data.password,
    options: {
      data: {
        full_name: validation.data.name,
      },
      // Optionally require email verification
      // emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/');
}
