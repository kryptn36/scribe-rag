'use client';

import { useCallback, useRef, useState } from 'react';
import type { Dispatch, KeyboardEvent, SetStateAction } from 'react';
import { toast } from 'sonner';

import type { Meeting } from '@/entities/meeting';
import { renameMeeting } from '@/features/process-meeting';

export function useMeetingTitleEditor(
  localMeeting: Meeting,
  setLocalMeeting: Dispatch<SetStateAction<Meeting>>
) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(localMeeting.title);
  const [isSavingTitle, setIsSavingTitle] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const startEditingTitle = useCallback(() => {
    setEditTitle(localMeeting.title);
    setIsEditingTitle(true);
    setTimeout(() => titleInputRef.current?.select(), 0);
  }, [localMeeting.title]);

  const cancelEditingTitle = useCallback(() => {
    setIsEditingTitle(false);
    setEditTitle(localMeeting.title);
  }, [localMeeting.title]);

  const saveTitle = useCallback(async () => {
    const trimmed = editTitle.trim();
    if (!trimmed || trimmed === localMeeting.title) {
      cancelEditingTitle();
      return;
    }

    setIsSavingTitle(true);
    try {
      await renameMeeting(localMeeting.id, trimmed);
      setLocalMeeting((prev) => ({ ...prev, title: trimmed }));
      toast.success('Title updated');
      setIsEditingTitle(false);
    } catch (err) {
      console.error('Failed to rename meeting:', err);
      toast.error('Failed to update title');
    } finally {
      setIsSavingTitle(false);
    }
  }, [editTitle, localMeeting.title, localMeeting.id, cancelEditingTitle, setLocalMeeting]);

  const handleTitleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        void saveTitle();
      } else if (event.key === 'Escape') {
        cancelEditingTitle();
      }
    },
    [saveTitle, cancelEditingTitle]
  );

  return {
    titleInputRef,
    isEditingTitle,
    editTitle,
    setEditTitle,
    isSavingTitle,
    startEditingTitle,
    cancelEditingTitle,
    saveTitle,
    handleTitleKeyDown,
  };
}
