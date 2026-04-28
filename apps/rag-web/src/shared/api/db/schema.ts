import { sql } from "drizzle-orm";
import {
  foreignKey,
  integer,
  pgPolicy,
  pgTable,
  text,
  uuid,
  timestamp,
  vector,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { authenticatedRole, authUsers } from "drizzle-orm/supabase";

export const meetings = pgTable(
  "meetings",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    title: text("title").notNull(),
    transcript: text("transcript"),
    summary: text("summary"),
    actionItems: text("action_items"),
    duration: integer("duration"),
    status: text("status").default("processing").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    userId: uuid("user_id").notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [authUsers.id],
      name: "meetings_user_id_fk",
    }).onDelete("cascade"),
    pgPolicy("Users can manage their own meetings", {
      for: "all",
      to: authenticatedRole,
      using: sql`auth.uid() = ${table.userId}`,
    }),
  ],
);

export const meetingChunks = pgTable(
  "meeting_chunks",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    meetingId: uuid("meeting_id").notNull(),
    content: text("content").notNull(),
    embedding: vector("embedding", { dimensions: 1536 }),
  },
  (table) => [
    foreignKey({
      columns: [table.meetingId],
      foreignColumns: [meetings.id],
      name: "meeting_chunks_meeting_id_fk",
    }).onDelete("cascade"),
    index("embeddingIndex").using("hnsw", table.embedding.op("vector_cosine_ops")),
    pgPolicy("Users can access their meeting chunks", {
      for: "all",
      to: authenticatedRole,
      using: sql`exists (select 1 from ${meetings} where id = ${table.meetingId} and user_id = auth.uid())`,
    }),
  ],
);

export const followUps = pgTable(
  "follow_ups",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    meetingId: uuid("meeting_id").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    position: integer("position").default(0).notNull(),
    status: text("status").default("pending").notNull(), // pending | in_progress | completed
    priority: text("priority").default("medium").notNull(), // low | medium | high
    assignee: text("assignee"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.meetingId],
      foreignColumns: [meetings.id],
      name: "follow_ups_meeting_id_fk",
    }).onDelete("cascade"),
    pgPolicy("Users can manage their meeting follow-ups", {
      for: "all",
      to: authenticatedRole,
      using: sql`exists (select 1 from ${meetings} where id = ${table.meetingId} and user_id = auth.uid())`,
    }),
  ],
);

export const followUpDependencies = pgTable(
  "follow_up_dependencies",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    sourceId: uuid("source_id").notNull(), // this follow-up depends on...
    targetId: uuid("target_id").notNull(), // ...this follow-up (must be done first)
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.sourceId],
      foreignColumns: [followUps.id],
      name: "follow_up_deps_source_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.targetId],
      foreignColumns: [followUps.id],
      name: "follow_up_deps_target_fk",
    }).onDelete("cascade"),
    uniqueIndex("follow_up_deps_unique").on(table.sourceId, table.targetId),
    pgPolicy("Users can manage follow-up dependencies", {
      for: "all",
      to: authenticatedRole,
      using: sql`exists (
        select 1 from ${followUps} fu
        join ${meetings} m on m.id = fu.meeting_id
        where fu.id = ${table.sourceId} and m.user_id = auth.uid()
      )`,
    }),
  ],
);
