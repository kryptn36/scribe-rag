import React from 'react';

import { MeetingCard, type Meeting } from '@/entities/meeting';
import { DeleteMeetingButton } from '@/features/process-meeting';

interface MeetingsGridProps {
  meetings: Meeting[];
}

export function MeetingsGrid({ meetings }: MeetingsGridProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {meetings.map((meeting) => (
          <MeetingCard
            key={meeting.id}
            meeting={meeting}
            action={<DeleteMeetingButton meetingId={meeting.id} />}
          />
        ))}
      </div>
      {meetings.length === 0 && (
        <div className="text-muted-foreground flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 p-12 text-center">
          <p>No meetings found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}
