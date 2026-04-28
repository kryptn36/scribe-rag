import { redirect } from 'next/navigation';
import { eq, desc, and, ilike } from 'drizzle-orm';
import React from 'react';

import { MeetingsListPage } from '@/views/meetings-list';
import { createClient } from '@/shared/api/supabase/server';
import { db } from '@/shared/api/db';
import { meetings } from '@/shared/api/db/schema';

export default async function MeetingsRoute({ searchParams }: { searchParams: Promise<{ q?: string, status?: string }> }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const params = await searchParams;
  const searchFilter = params.q ? ilike(meetings.title, `%${params.q}%`) : undefined;
  const statusFilter = params.status && params.status !== 'all' ? eq(meetings.status, params.status) : undefined;

  const userMeetings = await db
    .select()
    .from(meetings)
    .where(
      and(
        eq(meetings.userId, user.id),
        searchFilter,
        statusFilter
      )
    )
    .orderBy(desc(meetings.createdAt));

  return <MeetingsListPage meetings={userMeetings} />;
}
