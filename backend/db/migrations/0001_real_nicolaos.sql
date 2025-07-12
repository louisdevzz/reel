CREATE TABLE "tip_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tipper_id" uuid NOT NULL,
	"receiver_id" uuid NOT NULL,
	"amount" integer NOT NULL,
	"message" text,
	"tx_hash" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"tip_type" text DEFAULT 'general' NOT NULL,
	"stream_session_id" uuid,
	"video_id" uuid,
	"short_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tip_history_tx_hash_unique" UNIQUE("tx_hash")
);
--> statement-breakpoint
ALTER TABLE "tip_history" ADD CONSTRAINT "tip_history_tipper_id_users_id_fk" FOREIGN KEY ("tipper_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tip_history" ADD CONSTRAINT "tip_history_receiver_id_users_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tip_history" ADD CONSTRAINT "tip_history_stream_session_id_stream_sessions_id_fk" FOREIGN KEY ("stream_session_id") REFERENCES "public"."stream_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tip_history" ADD CONSTRAINT "tip_history_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tip_history" ADD CONSTRAINT "tip_history_short_id_shorts_id_fk" FOREIGN KEY ("short_id") REFERENCES "public"."shorts"("id") ON DELETE no action ON UPDATE no action;