'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import type { Meeting } from '@/entities/meeting';
import { createClient } from '@/shared/api/supabase/client';

import { useDebounce } from './use-debounce';

function mapRealtimeMeeting(raw: Record<string, unknown>): Meeting {
  return {
    id: raw.id as string,
    title: raw.title as string,
    transcript: (raw.transcript as string | null) ?? null,
    summary: (raw.summary as string | null) ?? null,
    actionItems: (raw.action_items as string | null) ?? null,
    duration: (raw.duration as number | null) ?? null,
    status: raw.status as string,
    createdAt: new Date(raw.created_at as string),
    userId: raw.user_id as string,
  };
}

export function useMeetingsList(initialMeetings: Meeting[]) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [meetings, setMeetings] = useState(initialMeetings);
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [status, setStatus] = useState(searchParams.get('status') || 'all');
  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    setMeetings(initialMeetings);
  }, [initialMeetings]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    let changed = false;

    if (debouncedSearch && params.get('q') !== debouncedSearch) {
      params.set('q', debouncedSearch);
      changed = true;
    } else if (!debouncedSearch && params.has('q')) {
      params.delete('q');
      changed = true;
    }

    if (status && status !== 'all' && params.get('status') !== status) {
      params.set('status', status);
      changed = true;
    } else if (status === 'all' && params.has('status')) {
      params.delete('status');
      changed = true;
    }

    if (changed) {
      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : pathname);
    }
  }, [debouncedSearch, status, pathname, router, searchParams]);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel('meetings_list_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'meetings',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const meeting = mapRealtimeMeeting(payload.new as Record<string, unknown>);
            setMeetings((prev) => (prev.some((item) => item.id === meeting.id) ? prev : [meeting, ...prev]));
          } else if (payload.eventType === 'UPDATE') {
            const meeting = mapRealtimeMeeting(payload.new as Record<string, unknown>);
            setMeetings((prev) => prev.map((item) => (item.id === meeting.id ? { ...item, ...meeting } : item)));
          } else if (payload.eventType === 'DELETE') {
            setMeetings((prev) => prev.filter((meeting) => meeting.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  return {
    meetings,
    search,
    setSearch,
    status,
    setStatus,
  };
}
