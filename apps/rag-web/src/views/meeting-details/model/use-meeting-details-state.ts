'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import type { Meeting } from '@/entities/meeting';
import { getFollowUpsForMeeting, type FollowUpWithDeps } from '@/features/process-meeting';
import { createClient } from '@/shared/api/supabase/client';

export function useMeetingDetailsState(meeting: Meeting, followUps: FollowUpWithDeps[]) {
  const [localMeeting, setLocalMeeting] = useState(meeting);
  const [localFollowUps, setLocalFollowUps] = useState(followUps);
  const [isLoadingFollowUps, setIsLoadingFollowUps] = useState(false);
  const followUpIdsRef = useRef(new Set(followUps.map((item) => item.id)));
  const reloadFollowUpsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLocalMeeting(meeting);
  }, [meeting]);

  useEffect(() => {
    setLocalFollowUps(followUps);
    followUpIdsRef.current = new Set(followUps.map((item) => item.id));
  }, [followUps]);

  const reloadFollowUps = useCallback(
    (remainingAttempts = 0) => {
      if (reloadFollowUpsTimeoutRef.current) {
        clearTimeout(reloadFollowUpsTimeoutRef.current);
      }

      if (remainingAttempts > 0) {
        setIsLoadingFollowUps(true);
      }

      reloadFollowUpsTimeoutRef.current = setTimeout(
        () => {
          void (async () => {
            try {
              const updatedFollowUps = await getFollowUpsForMeeting(meeting.id);
              setLocalFollowUps(updatedFollowUps);
              followUpIdsRef.current = new Set(updatedFollowUps.map((item) => item.id));
              if (updatedFollowUps.length > 0 || remainingAttempts <= 0) {
                setIsLoadingFollowUps(false);
              } else {
                reloadFollowUps(remainingAttempts - 1);
              }
            } catch (err) {
              console.error('Failed to reload follow-ups:', err);
              setIsLoadingFollowUps(false);
            }
          })();
        },
        remainingAttempts > 0 ? 350 : 150
      );
    },
    [meeting.id]
  );

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`meeting_${meeting.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'meetings',
          filter: `id=eq.${meeting.id}`,
        },
        (payload) => {
          const raw = payload.new as Record<string, unknown>;
          const mapped: Partial<Meeting> = {
            ...(raw.id != null && { id: raw.id as string }),
            ...(raw.title != null && { title: raw.title as string }),
            ...(raw.transcript != null && { transcript: raw.transcript as string | null }),
            ...(raw.summary != null && { summary: raw.summary as string | null }),
            ...(raw.action_items != null && { actionItems: raw.action_items as string | null }),
            ...(raw.duration != null && { duration: raw.duration as number | null }),
            ...(raw.status != null && { status: raw.status as string }),
            ...(raw.created_at != null && { createdAt: new Date(raw.created_at as string) }),
            ...(raw.user_id != null && { userId: raw.user_id as string }),
          };

          setLocalMeeting((prev) => ({ ...prev, ...mapped }));

          if (raw.action_items != null || raw.status === 'completed') {
            reloadFollowUps(8);
          }

          if (raw.status === 'completed' && localMeeting.status !== 'completed') {
            toast.success('Processing complete', {
              description: 'Summary and action items have been generated.',
            });
          } else if (raw.status === 'failed' && localMeeting.status !== 'failed') {
            toast.error('Processing failed', {
              description: 'There was an error generating the summary and action items.',
            });
          }
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [meeting.id, localMeeting.status, reloadFollowUps]);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`meeting_${meeting.id}_follow_ups`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'follow_ups',
          filter: `meeting_id=eq.${meeting.id}`,
        },
        () => reloadFollowUps()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'follow_up_dependencies',
        },
        (payload) => {
          const ids = followUpIdsRef.current;
          const raw = (payload.eventType === 'DELETE' ? payload.old : payload.new) as Record<string, unknown>;
          const sourceId = raw.source_id as string | undefined;
          const targetId = raw.target_id as string | undefined;

          if ((sourceId && ids.has(sourceId)) || (targetId && ids.has(targetId))) {
            reloadFollowUps();
          }
        }
      )
      .subscribe();

    return () => {
      if (reloadFollowUpsTimeoutRef.current) {
        clearTimeout(reloadFollowUpsTimeoutRef.current);
      }
      void supabase.removeChannel(channel);
    };
  }, [meeting.id, reloadFollowUps]);

  return {
    localMeeting,
    localFollowUps,
    isLoadingFollowUps,
    setLocalMeeting,
  };
}
