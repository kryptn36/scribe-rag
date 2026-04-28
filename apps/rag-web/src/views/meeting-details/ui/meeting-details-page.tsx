'use client';

import { useChat } from '@ai-sdk/react';
import { useAISDKRuntime } from '@assistant-ui/react-ai-sdk';
import { DefaultChatTransport } from 'ai';
import { useRouter } from 'next/navigation';
import React from 'react';

import type { Meeting } from '@/entities/meeting';
import type { FollowUpWithDeps } from '@/features/process-meeting';

import { useMeetingDetailsState } from '../model/use-meeting-details-state';
import { useMeetingTitleEditor } from '../model/use-meeting-title-editor';
import { MeetingDetailsHeader } from './meeting-details-header';
import { MeetingInsightsTabs } from './meeting-insights-tabs';
import { TranscriptPanel } from './transcript-panel';

interface MeetingDetailsPageProps {
  meeting: Meeting;
  followUps: FollowUpWithDeps[];
}

export function MeetingDetailsPage({ meeting, followUps }: MeetingDetailsPageProps) {
  const router = useRouter();
  const { localMeeting, localFollowUps, isLoadingFollowUps, setLocalMeeting } = useMeetingDetailsState(
    meeting,
    followUps
  );
  const titleEditor = useMeetingTitleEditor(localMeeting, setLocalMeeting);

  const chat = useChat({
    id: localMeeting.id,
    transport: new DefaultChatTransport({
      api: '/api/chat',
      body: { meetingId: localMeeting.id },
    }),
  });
  const runtime = useAISDKRuntime(chat);

  return (
    <div className="relative z-10 flex h-full flex-col">
      <MeetingDetailsHeader
        meeting={localMeeting}
        isEditingTitle={titleEditor.isEditingTitle}
        editTitle={titleEditor.editTitle}
        isSavingTitle={titleEditor.isSavingTitle}
        titleInputRef={titleEditor.titleInputRef}
        onEditTitleChange={titleEditor.setEditTitle}
        onStartEditingTitle={titleEditor.startEditingTitle}
        onCancelEditingTitle={titleEditor.cancelEditingTitle}
        onSaveTitle={() => void titleEditor.saveTitle()}
        onTitleKeyDown={titleEditor.handleTitleKeyDown}
        onDelete={() => {
          router.push('/dashboard/meetings');
        }}
      />

      <div className="grid flex-1 overflow-hidden lg:grid-cols-2">
        <TranscriptPanel meeting={localMeeting} />
        <MeetingInsightsTabs
          meeting={localMeeting}
          followUps={localFollowUps}
          isLoadingFollowUps={isLoadingFollowUps}
          runtime={runtime}
        />
      </div>
    </div>
  );
}
