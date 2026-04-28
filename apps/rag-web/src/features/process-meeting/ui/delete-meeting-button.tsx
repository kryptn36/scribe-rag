'use client';

import { useState } from 'react';
import { Trash } from '@phosphor-icons/react/dist/ssr';
import { toast } from 'sonner';

import { Button } from '@/shared/ui/components/button';
import { deleteMeeting } from '../api/actions';

interface DeleteMeetingButtonProps {
  meetingId: string;
  onDelete?: () => void;
  className?: string;
}

export function DeleteMeetingButton({ meetingId, onDelete, className }: DeleteMeetingButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    setIsDeleting(true);
    try {
      await deleteMeeting(meetingId);
      toast.success('Meeting deleted successfully');
      onDelete?.();
    } catch (error) {
      console.error('Failed to delete meeting:', error);
      toast.error('Failed to delete meeting');
      setIsDeleting(false); // Reset state if failed so they can try again. If success, it gets unmounted anyway.
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className={className || "h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"}
      onClick={handleDelete}
      disabled={isDeleting}
      title="Delete meeting"
    >
      <Trash size={16} />
    </Button>
  );
}
