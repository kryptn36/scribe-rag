'use client';

import { AssistantRuntimeProvider } from '@assistant-ui/react';
import type { AssistantRuntime } from '@assistant-ui/react';
import { ChatTeardropText, FileText, ListChecks } from '@phosphor-icons/react';
import React from 'react';

import type { Meeting } from '@/entities/meeting';
import type { FollowUpWithDeps } from '@/features/process-meeting';
import { FollowUpGraph } from '@/widgets/follow-up-graph';
import { ScrollArea } from '@/shared/ui/components/scroll-area';
import { Separator } from '@/shared/ui/components/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/components/tabs';
import { Thread } from '@/shared/ui/components/thread';

import { EmptyState } from './empty-state';

interface MeetingInsightsTabsProps {
  meeting: Meeting;
  followUps: FollowUpWithDeps[];
  isLoadingFollowUps: boolean;
  runtime: AssistantRuntime;
}

export function MeetingInsightsTabs({ meeting, followUps, isLoadingFollowUps, runtime }: MeetingInsightsTabsProps) {
  return (
    <div className="bg-background/50 flex min-h-0 flex-col backdrop-blur-md">
      <Tabs defaultValue="chat" className="flex min-h-0 flex-1 flex-col">
        <div className="shrink-0 border-b border-white/5 p-4">
          <TabsList className="grid w-full grid-cols-3 bg-black/40">
            <TabsTrigger value="chat" className="flex items-center gap-2 text-xs sm:text-sm">
              <ChatTeardropText size={16} /> <span className="hidden sm:inline">RAG Query</span>
            </TabsTrigger>
            <TabsTrigger value="summary" className="flex items-center gap-2 text-xs sm:text-sm">
              <FileText size={16} /> <span className="hidden sm:inline">Summary</span>
            </TabsTrigger>
            <TabsTrigger value="action-items" className="flex items-center gap-2 text-xs sm:text-sm">
              <ListChecks size={16} /> <span className="hidden sm:inline">Follow-ups</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="chat" className="m-0 flex h-full min-h-0 flex-1 flex-col data-[state=inactive]:hidden">
          <div className="relative flex-1 overflow-hidden">
            <AssistantRuntimeProvider runtime={runtime}>
              <Thread />
            </AssistantRuntimeProvider>
          </div>
        </TabsContent>

        <TabsContent value="summary" className="m-0 min-h-0 flex-1 overflow-auto p-6 data-[state=inactive]:hidden">
          <div className="space-y-6">
            <div>
              <h3 className="text-primary mb-2 text-lg font-semibold">Executive Summary</h3>
              {meeting.status === 'processing' ? (
                <div className="text-muted-foreground flex flex-col items-center justify-center gap-4 py-12 text-center">
                  <div className="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
                  <p>Generating summary...</p>
                </div>
              ) : meeting.summary ? (
                <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">{meeting.summary}</p>
              ) : (
                <EmptyState message="No summary has been generated yet. Process a transcript to generate one." />
              )}
            </div>
            <Separator className="bg-white/10" />
          </div>
        </TabsContent>

        <TabsContent value="action-items" className="m-0 min-h-0 flex-1 overflow-hidden data-[state=inactive]:hidden">
          {followUps.length > 0 ? (
            <FollowUpGraph meetingId={meeting.id} initialItems={followUps} />
          ) : meeting.status === 'processing' || isLoadingFollowUps ? (
            <div className="text-muted-foreground flex flex-col items-center justify-center gap-4 py-12 text-center">
              <div className="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
              <p>Extracting follow-ups...</p>
            </div>
          ) : meeting.actionItems ? (
            <ScrollArea className="h-full">
              <div className="p-6">
                <h3 className="text-primary mb-4 text-lg font-semibold">Extracted Follow-ups</h3>
                <div className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">
                  {meeting.actionItems}
                </div>
              </div>
            </ScrollArea>
          ) : (
            <div className="p-6">
              <EmptyState message="No follow-ups have been extracted yet. Process a transcript to generate action items." />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
