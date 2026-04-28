"use client";

import { useEffect, useState } from "react";

import type { Meeting } from "@/entities/meeting";
import { createClient } from "@/shared/api/supabase/client";

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

export function useDashboardMeetings(initialMeetings: Meeting[]) {
  const [meetings, setMeetings] = useState(initialMeetings);

  useEffect(() => {
    setMeetings(initialMeetings);
  }, [initialMeetings]);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("dashboard_meetings_realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "meetings",
        },
        (payload) => {
          console.log(payload);
          if (payload.eventType === "INSERT") {
            const meeting = mapRealtimeMeeting(payload.new as Record<string, unknown>);
            setMeetings((prev) =>
              prev.some((item) => item.id === meeting.id) ? prev : [meeting, ...prev],
            );
          } else if (payload.eventType === "UPDATE") {
            const meeting = mapRealtimeMeeting(payload.new as Record<string, unknown>);
            setMeetings((prev) =>
              prev.map((item) => (item.id === meeting.id ? { ...item, ...meeting } : item)),
            );
          } else if (payload.eventType === "DELETE") {
            setMeetings((prev) => prev.filter((item) => item.id !== payload.old.id));
          }
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  const addMeeting = (meeting: Meeting) => {
    setMeetings((prev) =>
      prev.some((item) => item.id === meeting.id) ? prev : [meeting, ...prev],
    );
  };

  return { meetings, addMeeting };
}
