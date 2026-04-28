"use server";

import { revalidatePath } from "next/cache";
import { eq, and, asc, inArray, or } from "drizzle-orm";

import { db } from "@/shared/api/db";
import { followUps, followUpDependencies, meetings } from "@/shared/api/db/schema";
import { createClient } from "@/shared/api/supabase/server";

// ─── Types ───────────────────────────────────────────────────────────────────

export type FollowUpWithDeps = typeof followUps.$inferSelect & {
  dependsOn: string[];   // IDs this follow-up depends on (predecessors)
  dependedBy: string[];  // IDs that depend on this follow-up (successors)
};

// ─── Queries ─────────────────────────────────────────────────────────────────

export async function getFollowUpsForMeeting(meetingId: string): Promise<FollowUpWithDeps[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const rows = await db
    .select({ followUp: followUps })
    .from(followUps)
    .innerJoin(meetings, eq(meetings.id, followUps.meetingId))
    .where(and(eq(followUps.meetingId, meetingId), eq(meetings.userId, user.id)))
    .orderBy(asc(followUps.position));

  const items = rows.map((row) => row.followUp);

  if (items.length === 0) return [];

  const itemIds = items.map((i) => i.id);

  // Fetch all dependency edges for these follow-ups
  const deps = await db
    .select()
    .from(followUpDependencies)
    .where(
      or(
        inArray(followUpDependencies.sourceId, itemIds),
        inArray(followUpDependencies.targetId, itemIds)
      )
    );

  // Build lookup maps
  const dependsOnMap = new Map<string, string[]>();
  const dependedByMap = new Map<string, string[]>();

  for (const dep of deps) {
    if (itemIds.includes(dep.sourceId) && itemIds.includes(dep.targetId)) {
      const existing = dependsOnMap.get(dep.sourceId) ?? [];
      existing.push(dep.targetId);
      dependsOnMap.set(dep.sourceId, existing);

      const existingBy = dependedByMap.get(dep.targetId) ?? [];
      existingBy.push(dep.sourceId);
      dependedByMap.set(dep.targetId, existingBy);
    }
  }

  return items.map((item) => ({
    ...item,
    dependsOn: dependsOnMap.get(item.id) ?? [],
    dependedBy: dependedByMap.get(item.id) ?? [],
  }));
}

// ─── Mutations ───────────────────────────────────────────────────────────────

export async function updateFollowUpStatus(
  followUpId: string,
  status: "pending" | "in_progress" | "completed"
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  await db
    .update(followUps)
    .set({ status })
    .where(eq(followUps.id, followUpId));

  revalidatePath("/dashboard", "layout");
}

export async function updateFollowUpPriority(
  followUpId: string,
  priority: "low" | "medium" | "high"
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  await db
    .update(followUps)
    .set({ priority })
    .where(eq(followUps.id, followUpId));

  revalidatePath("/dashboard", "layout");
}

export async function reorderFollowUps(
  meetingId: string,
  orderedIds: string[]
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Update positions in a transaction
  await db.transaction(async (tx) => {
    for (let i = 0; i < orderedIds.length; i++) {
      await tx
        .update(followUps)
        .set({ position: i })
        .where(
          and(eq(followUps.id, orderedIds[i]), eq(followUps.meetingId, meetingId))
        );
    }
  });

  revalidatePath("/dashboard", "layout");
}

export async function addFollowUpDependency(sourceId: string, targetId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  if (sourceId === targetId) throw new Error("A follow-up cannot depend on itself");

  // Check for circular dependency: would adding source->target create a cycle?
  // Walk from target following its dependencies to see if we reach source
  const visited = new Set<string>();
  const queue = [targetId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current === sourceId) {
      throw new Error("Adding this dependency would create a circular reference");
    }
    if (visited.has(current)) continue;
    visited.add(current);

    // Find what `current` depends on
    const currentDeps = await db
      .select({ targetId: followUpDependencies.targetId })
      .from(followUpDependencies)
      .where(eq(followUpDependencies.sourceId, current));

    for (const dep of currentDeps) {
      queue.push(dep.targetId);
    }
  }

  await db.insert(followUpDependencies).values({ sourceId, targetId });

  revalidatePath("/dashboard", "layout");
}

export async function removeFollowUpDependency(sourceId: string, targetId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  await db
    .delete(followUpDependencies)
    .where(
      and(
        eq(followUpDependencies.sourceId, sourceId),
        eq(followUpDependencies.targetId, targetId)
      )
    );

  revalidatePath("/dashboard", "layout");
}
