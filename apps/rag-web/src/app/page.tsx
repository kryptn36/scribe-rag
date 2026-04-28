import { redirect } from 'next/navigation';
import React from 'react';

import { HomePage } from '@/views/home';
import { createClient } from '@/shared/api/supabase/server';

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard');
  }

  return <HomePage />;
}
