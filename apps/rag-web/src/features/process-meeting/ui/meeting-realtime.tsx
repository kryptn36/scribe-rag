'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/shared/api/supabase/client';
import { toast } from 'sonner';

export function MeetingRealtime() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    
    const channel = supabase
      .channel('global_meetings_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'meetings',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            toast.success(`Meeting created: ${payload.new.title}`, {
              description: 'Processing has started in the background.',
              id: `meeting-created-${payload.new.id}`,
            });
            router.refresh();
          } else if (payload.eventType === 'UPDATE') {
            if (payload.new.status === 'completed') {
              toast.success(`Meeting processed: ${payload.new.title}`, {
                description: 'Summary and action items are now available.',
                id: `meeting-completed-${payload.new.id}`,
              });
            } else if (payload.new.status === 'failed') {
              toast.error(`Processing failed: ${payload.new.title}`, {
                description: 'There was an issue processing your meeting.',
                id: `meeting-failed-${payload.new.id}`,
              });
            }
            router.refresh();
          } else if (payload.eventType === 'DELETE') {
            router.refresh();
          }
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [router]);

  return null;
}
