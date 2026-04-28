import React from 'react';

import { MeetingCard, type Meeting } from '@/entities/meeting';
import { DeleteMeetingButton, ProcessMeetingDialog } from '@/features/process-meeting';

interface RecentMeetingsProps {
  meetings: Meeting[];
  onMeetingCreated: (meeting: Meeting) => void;
}

export function RecentMeetings({ meetings, onMeetingCreated }: RecentMeetingsProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-foreground text-xl font-semibold tracking-tight">Recent Meetings</h2>

      {meetings.length === 0 ? (
        <div className="text-muted-foreground flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 p-12 text-center">
          <p className="mb-4">No meetings processed yet.</p>
          <ProcessMeetingDialog onMeetingCreated={onMeetingCreated} />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {meetings.map((meeting) => (
            <MeetingCard
              key={meeting.id}
              meeting={meeting}
              action={<DeleteMeetingButton meetingId={meeting.id} />}
            />
          ))}
        </div>
      )}
    </div>
  );
}
