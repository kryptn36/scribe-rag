'use client';

import { useState } from 'react';

import { PlusCircle } from '@phosphor-icons/react';

import { Button } from '@/shared/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/components/dialog';
import { Input } from '@/shared/ui/components/input';
import { Label } from '@/shared/ui/components/label';
import { Textarea } from '@/shared/ui/components/textarea';
import { processMeetingTranscript } from '../api/actions';
import type { Meeting } from '@/entities/meeting/model/types';

interface ProcessMeetingDialogProps {
  onMeetingCreated?: (meeting: Meeting) => void;
}

export function ProcessMeetingDialog({ onMeetingCreated }: ProcessMeetingDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !transcript) return;

    try {
      setIsProcessing(true);
      const meeting = await processMeetingTranscript(title, transcript);
      onMeetingCreated?.(meeting);
      setOpen(false);
      setTitle('');
      setTranscript('');
    } catch (err) {
      console.error('Failed to process meeting:', err);
      // Optional: show an error toast here
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex shrink-0 items-center gap-2">
          <PlusCircle size={20} weight="duotone" />
          <span>Add Transcript</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-hidden border-white/10 bg-background/95 backdrop-blur-md sm:max-w-150">
        <form onSubmit={handleSubmit} className="flex max-h-[calc(100dvh-4rem)] min-h-0 flex-col">
          <DialogHeader>
            <DialogTitle>Process New Meeting</DialogTitle>
            <DialogDescription>
              Paste your meeting transcript here. Our AI will index it into the RAG system, generate a summary, and extract action items.
            </DialogDescription>
          </DialogHeader>
          <div className="grid min-h-0 flex-1 gap-4 overflow-hidden py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Meeting Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Q3 Roadmap Review"
                className="bg-background/50 border-white/10"
                required
              />
            </div>
            <div className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-2">
              <Label htmlFor="transcript">Transcript Text</Label>
              <Textarea
                id="transcript"
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Paste the full transcript here..."
                className="h-full min-h-40 resize-none overflow-y-auto border-white/10 bg-background/50"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button type="submit" disabled={isProcessing || !title || !transcript}>
              {isProcessing ? 'Processing...' : 'Process Transcript'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
