import React from 'react';

import type { Meeting } from '@/entities/meeting';
import { Badge } from '@/shared/ui/components/badge';
import { ScrollArea } from '@/shared/ui/components/scroll-area';

import { EmptyState } from './empty-state';

export function TranscriptPanel({ meeting }: { meeting: Meeting }) {
  return (
    <div className="flex min-h-0 flex-col border-r border-white/5">
      <div className="bg-background/30 flex min-h-0 flex-1 flex-col overflow-hidden backdrop-blur-sm">
        <div className="flex items-center justify-between border-b border-white/5 p-4 font-medium">
          <span>Transcript</span>
          <Badge variant="outline" className="text-xs">
            Auto-scrolling
          </Badge>
        </div>
        <ScrollArea className="min-h-0 flex-1">
          <div className="space-y-6 p-4 pb-20">
            {meeting.transcript ? (
              <div className="text-foreground text-sm leading-relaxed whitespace-pre-wrap">{meeting.transcript}</div>
            ) : (
              <EmptyState message="No transcript available for this meeting." />
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
