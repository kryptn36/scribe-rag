import { eq, and } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import React from 'react';

import { db } from '@/shared/api/db';
import { meetings } from '@/shared/api/db/schema';
import { createClient } from '@/shared/api/supabase/server';
import { getFollowUpsForMeeting } from '@/features/process-meeting';
import { MeetingDetailsPage } from '@/views/meeting-details';

export default async function MeetingRoute({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { id } = await params;

  const [meeting] = await db
    .select()
    .from(meetings)
    .where(and(eq(meetings.id, id), eq(meetings.userId, user.id)));

  if (!meeting) {
    redirect('/dashboard');
  }

  const followUps = await getFollowUpsForMeeting(meeting.id);

  return (
    <main className="relative z-10 h-full flex-1 overflow-hidden">
      <MeetingDetailsPage meeting={meeting} followUps={followUps} />
    </main>
  );
}
