'use client';

import React from 'react';

import type { Meeting } from '@/entities/meeting';
import { ProcessMeetingDialog } from '@/features/process-meeting';

import { useDashboardMeetings } from '../model/use-dashboard-meetings';
import { DashboardStats } from './dashboard-stats';
import { RecentMeetings } from './recent-meetings';

interface DashboardPageProps {
  meetings: Meeting[];
}

export function DashboardPage({ meetings: initialMeetings }: DashboardPageProps) {
  const { meetings, addMeeting } = useDashboardMeetings(initialMeetings);

  return (
    <main className="bg-background/50 relative z-10 flex-1 overflow-auto p-6 backdrop-blur-sm lg:p-12">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-foreground text-3xl font-bold tracking-tight">Welcome back</h1>
            <p className="text-muted-foreground mt-1">Here is the latest activity on your meeting transcriptions.</p>
          </div>
          <ProcessMeetingDialog onMeetingCreated={addMeeting} />
        </div>

        <DashboardStats meetings={meetings} />
        <RecentMeetings meetings={meetings} onMeetingCreated={addMeeting} />
      </div>
    </main>
  );
}
