-- Add unique constraints to prevent duplicate likes and bookmarks
ALTER TABLE "short_likes" ADD CONSTRAINT "short_likes_user_short_unique" UNIQUE ("user_id", "short_id");
ALTER TABLE "video_likes" ADD CONSTRAINT "video_likes_user_video_unique" UNIQUE ("user_id", "video_id");
ALTER TABLE "short_bookmarks" ADD CONSTRAINT "short_bookmarks_user_short_unique" UNIQUE ("user_id", "short_id"); 