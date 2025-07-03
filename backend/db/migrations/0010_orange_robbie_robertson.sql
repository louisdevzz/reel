CREATE TABLE "stream_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stream_key_id" uuid NOT NULL,
	"title" text,
	"description" text,
	"status" text DEFAULT 'idle' NOT NULL,
	"started_at" timestamp,
	"ended_at" timestamp,
	"viewer_count" integer DEFAULT 0 NOT NULL,
	"max_viewer_count" integer DEFAULT 0 NOT NULL,
	"total_donation" integer DEFAULT 0 NOT NULL,
	"total_donation_count" integer DEFAULT 0 NOT NULL,
	"duration" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "stream_keys" ADD COLUMN "is_live" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "stream_sessions" ADD CONSTRAINT "stream_sessions_stream_key_id_stream_keys_id_fk" FOREIGN KEY ("stream_key_id") REFERENCES "public"."stream_keys"("id") ON DELETE no action ON UPDATE no action;