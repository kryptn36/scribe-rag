import React from 'react';

import type { Meeting } from '@/entities/meeting';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/components/card';

interface DashboardStatsProps {
  meetings: Meeting[];
}

export function DashboardStats({ meetings }: DashboardStatsProps) {
  const totalSeconds = meetings.reduce((sum, meeting) => sum + (meeting.duration ?? 0), 0);
  const hoursProcessed = (totalSeconds / 3600).toFixed(1);

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-background/40 border-white/5 backdrop-blur-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-muted-foreground text-sm font-medium">Total Transcripts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{meetings.length}</div>
          <p className="text-primary mt-1 text-xs">Total meetings indexed</p>
        </CardContent>
      </Card>

      <Card className="bg-background/40 border-white/5 backdrop-blur-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-muted-foreground text-sm font-medium">Hours Processed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{hoursProcessed}</div>
          <p className="text-primary mt-1 text-xs">From transcript timestamps</p>
        </CardContent>
      </Card>

      <Card className="bg-background/40 border-white/5 backdrop-blur-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-muted-foreground text-sm font-medium">Queries Answered</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">0</div>
          <p className="text-primary mt-1 text-xs">RAG queries to date</p>
        </CardContent>
      </Card>

      <Card className="bg-background/40 border-white/5 backdrop-blur-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-muted-foreground text-sm font-medium">Storage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">Active</div>
          <p className="text-muted-foreground mt-1 text-xs">PostgreSQL Vector</p>
        </CardContent>
      </Card>
    </div>
  );
}
