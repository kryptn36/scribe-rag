CREATE TABLE "follow_up_dependencies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_id" uuid NOT NULL,
	"target_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "follow_up_dependencies" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "follow_ups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"meeting_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"position" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"priority" text DEFAULT 'medium' NOT NULL,
	"assignee" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "follow_ups" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "meeting_chunks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"meeting_id" uuid NOT NULL,
	"content" text NOT NULL,
	"embedding" vector(1536)
);
--> statement-breakpoint
ALTER TABLE "meeting_chunks" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "meetings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"transcript" text,
	"summary" text,
	"action_items" text,
	"duration" integer,
	"status" text DEFAULT 'processing' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "meetings" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "follow_up_dependencies" ADD CONSTRAINT "follow_up_deps_source_fk" FOREIGN KEY ("source_id") REFERENCES "public"."follow_ups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follow_up_dependencies" ADD CONSTRAINT "follow_up_deps_target_fk" FOREIGN KEY ("target_id") REFERENCES "public"."follow_ups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follow_ups" ADD CONSTRAINT "follow_ups_meeting_id_fk" FOREIGN KEY ("meeting_id") REFERENCES "public"."meetings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meeting_chunks" ADD CONSTRAINT "meeting_chunks_meeting_id_fk" FOREIGN KEY ("meeting_id") REFERENCES "public"."meetings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "follow_up_deps_unique" ON "follow_up_dependencies" USING btree ("source_id","target_id");--> statement-breakpoint
CREATE INDEX "embeddingIndex" ON "meeting_chunks" USING hnsw ("embedding" vector_cosine_ops);--> statement-breakpoint
CREATE POLICY "Users can manage follow-up dependencies" ON "follow_up_dependencies" AS PERMISSIVE FOR ALL TO "authenticated" USING (exists (
        select 1 from "follow_ups" fu
        join "meetings" m on m.id = fu.meeting_id
        where fu.id = "follow_up_dependencies"."source_id" and m.user_id = auth.uid()
      ));--> statement-breakpoint
CREATE POLICY "Users can manage their meeting follow-ups" ON "follow_ups" AS PERMISSIVE FOR ALL TO "authenticated" USING (exists (select 1 from "meetings" where id = "follow_ups"."meeting_id" and user_id = auth.uid()));--> statement-breakpoint
CREATE POLICY "Users can access their meeting chunks" ON "meeting_chunks" AS PERMISSIVE FOR ALL TO "authenticated" USING (exists (select 1 from "meetings" where id = "meeting_chunks"."meeting_id" and user_id = auth.uid()));--> statement-breakpoint
CREATE POLICY "Users can manage their own meetings" ON "meetings" AS PERMISSIVE FOR ALL TO "authenticated" USING (auth.uid() = "meetings"."user_id");