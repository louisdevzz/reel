CREATE TABLE "stream_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"key" text NOT NULL,
	"name" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_used" timestamp,
	CONSTRAINT "stream_keys_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "stream_keys_key_unique" UNIQUE("key")
);
--> statement-breakpoint
ALTER TABLE "stream_keys" ADD CONSTRAINT "stream_keys_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;