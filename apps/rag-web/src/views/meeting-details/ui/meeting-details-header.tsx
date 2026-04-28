'use client';

import { ArrowLeft, Check, Clock, DownloadSimple, PencilSimple, ShareNetwork, X } from '@phosphor-icons/react';
import type { KeyboardEvent, RefObject } from 'react';
import Link from 'next/link';
import React from 'react';

import type { Meeting } from '@/entities/meeting';
import { DeleteMeetingButton } from '@/features/process-meeting';
import { Badge } from '@/shared/ui/components/badge';
import { Button } from '@/shared/ui/components/button';

import { formatDuration } from '../lib/format-duration';

interface MeetingDetailsHeaderProps {
  meeting: Meeting;
  isEditingTitle: boolean;
  editTitle: string;
  isSavingTitle: boolean;
  titleInputRef: RefObject<HTMLInputElement | null>;
  onEditTitleChange: (value: string) => void;
  onStartEditingTitle: () => void;
  onCancelEditingTitle: () => void;
  onSaveTitle: () => void;
  onTitleKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  onDelete: () => void;
}

export function MeetingDetailsHeader({
  meeting,
  isEditingTitle,
  editTitle,
  isSavingTitle,
  titleInputRef,
  onEditTitleChange,
  onStartEditingTitle,
  onCancelEditingTitle,
  onSaveTitle,
  onTitleKeyDown,
  onDelete,
}: MeetingDetailsHeaderProps) {
  const duration = formatDuration(meeting.duration);

  return (
    <header className="bg-background/80 flex shrink-0 items-center justify-between border-b border-white/5 p-4 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground h-8 w-8">
            <ArrowLeft size={18} />
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-2">
            {isEditingTitle ? (
              <div className="flex items-center gap-1.5">
                <input
                  ref={titleInputRef}
                  type="text"
                  value={editTitle}
                  onChange={(event) => onEditTitleChange(event.target.value)}
                  onKeyDown={onTitleKeyDown}
                  onBlur={() => {
                    setTimeout(() => {
                      if (isEditingTitle) onCancelEditingTitle();
                    }, 150);
                  }}
                  disabled={isSavingTitle}
                  className="text-foreground focus:border-primary/50 w-75 max-w-[60vw] rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-xl font-bold tracking-tight outline-none transition-colors"
                  autoFocus
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
                  onClick={onSaveTitle}
                  disabled={isSavingTitle}
                >
                  <Check size={16} weight="bold" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground h-7 w-7 hover:bg-white/5"
                  onClick={onCancelEditingTitle}
                  disabled={isSavingTitle}
                >
                  <X size={16} />
                </Button>
              </div>
            ) : (
              <h1
                className="text-foreground group/title flex cursor-pointer items-center gap-2 text-xl font-bold tracking-tight"
                onDoubleClick={onStartEditingTitle}
                title="Double-click to edit title"
              >
                {meeting.title}
                <button
                  onClick={onStartEditingTitle}
                  className="text-muted-foreground/0 hover:text-primary! flex h-6 w-6 items-center justify-center rounded transition-colors group-hover/title:text-muted-foreground"
                  aria-label="Edit title"
                >
                  <PencilSimple size={14} />
                </button>
              </h1>
            )}
            <Badge
              variant={meeting.status === 'processing' ? 'outline' : 'default'}
              className={
                meeting.status === 'processing'
                  ? 'border-amber-500/30 bg-amber-500/10 text-amber-500'
                  : 'bg-primary/20 text-primary border-primary/30'
              }
            >
              {meeting.status === 'processing' ? 'Processing...' : 'Processed'}
            </Badge>
          </div>
          <p className="text-muted-foreground flex items-center gap-3 text-xs">
            <span>
              {new Date(meeting.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
            {duration && (
              <span className="flex items-center gap-1">
                <Clock size={14} />
                {duration}
              </span>
            )}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <DeleteMeetingButton
          meetingId={meeting.id}
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8 sm:mr-2"
          onDelete={onDelete}
        />
        <Button variant="outline" size="sm" className="hidden items-center gap-2 sm:flex">
          <ShareNetwork size={16} /> Share
        </Button>
        <Button variant="outline" size="sm" className="hidden items-center gap-2 sm:flex">
          <DownloadSimple size={16} /> Export
        </Button>
      </div>
    </header>
  );
}
