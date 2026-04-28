'use client';

import React from 'react';

import type { Meeting } from '@/entities/meeting';

import { useMeetingsList } from '../model/use-meetings-list';
import { MeetingsFilterBar } from './meetings-filter-bar';
import { MeetingsGrid } from './meetings-grid';

export function MeetingsListPage({ meetings: initialMeetings }: { meetings: Meeting[] }) {
  const { meetings, search, setSearch, status, setStatus } = useMeetingsList(initialMeetings);

  return (
    <main className="bg-background/50 relative z-10 flex-1 overflow-auto p-6 backdrop-blur-sm lg:p-12">
      <div className="mx-auto max-w-6xl space-y-8">
        <div>
          <h1 className="text-foreground text-3xl font-bold tracking-tight">All Meetings</h1>
          <p className="text-muted-foreground mt-1">Browse and filter all your processed meeting transcripts.</p>
        </div>

        <MeetingsFilterBar search={search} status={status} onSearchChange={setSearch} onStatusChange={setStatus} />
        <MeetingsGrid meetings={meetings} />
      </div>
    </main>
  );
}
