import { redirect } from 'next/navigation';
import { eq, desc } from 'drizzle-orm';
import React from 'react';

import { DashboardPage } from '@/views/dashboard';
import { createClient } from '@/shared/api/supabase/server';
import { db } from '@/shared/api/db';
import { meetings } from '@/shared/api/db/schema';

export default async function DashboardRoute() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const userMeetings = await db
    .select()
    .from(meetings)
    .where(eq(meetings.userId, user.id))
    .orderBy(desc(meetings.createdAt));

  return <DashboardPage meetings={userMeetings} />;
}
