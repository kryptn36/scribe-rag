import { CalendarBlank, Clock, ArrowRight } from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';

import { Badge } from '@/shared/ui/components/badge';
import { Button } from '@/shared/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/components/card';

import type { Meeting } from '../model/types';

function formatDuration(seconds: number | null | undefined): string | null {
  if (seconds == null) return null;
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `~${mins} min`;
  const hrs = Math.floor(mins / 60);
  const remainMins = mins % 60;
  return remainMins > 0 ? `~${hrs}h ${remainMins}m` : `~${hrs}h`;
}

interface MeetingCardProps {
  meeting: Meeting;
  action?: React.ReactNode;
}

export function MeetingCard({ meeting, action }: MeetingCardProps) {
  const durationLabel = formatDuration(meeting.duration);

  return (
    <Card className="group bg-background/40 hover:border-primary/50 flex flex-col border-white/5 backdrop-blur-md transition-colors relative">
      <CardHeader className="flex-1 pb-3">
        <div className="mb-2 flex items-start justify-between">
          <Badge
            variant={meeting.status === 'processing' ? 'outline' : 'default'}
            className={
              meeting.status === 'processing'
                ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20 capitalize'
                : 'bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 capitalize'
            }
          >
            {meeting.status || 'Processed'}
          </Badge>
          <div className="flex items-center gap-2">
            <div className="text-muted-foreground flex items-center gap-1 text-xs">
              <CalendarBlank size={14} />
              {new Date(meeting.createdAt).toLocaleDateString()}
            </div>
            {durationLabel && (
              <div className="text-muted-foreground flex items-center gap-1 text-xs">
                <Clock size={14} />
                {durationLabel}
              </div>
            )}
            {/* The delete button z-index ensures it's clickable above the link area if any */}
            {action && (
              <div className="z-10" onClick={(e) => e.preventDefault()}>
                {action}
              </div>
            )}
          </div>
        </div>
        <CardTitle className="group-hover:text-primary line-clamp-2 text-lg leading-tight transition-colors">
          {meeting.title}
        </CardTitle>
        {meeting.summary && (
          <p className="text-muted-foreground mt-2 line-clamp-2 text-sm">{meeting.summary}</p>
        )}
      </CardHeader>
      {meeting.actionItems && (
        <CardContent className="pb-4">
          <Badge variant="outline" className="border-white/10 bg-white/5 text-xs">
            Has follow-ups
          </Badge>
        </CardContent>
      )}
      <div className="mt-auto p-4 pt-0">
        <Link href={`/dashboard/meetings/${meeting.id}`}>
          <Button variant="ghost" className="hover:text-primary w-full justify-between hover:bg-white/5">
            <span>View Details</span>
            <ArrowRight size={16} />
          </Button>
        </Link>
      </div>
    </Card>
  );
}
