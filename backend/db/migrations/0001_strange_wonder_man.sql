-- Add full_name column with default value first
ALTER TABLE "users" ADD COLUMN "full_name" text DEFAULT 'Unknown User';

-- Update existing records to have a proper full name based on username
UPDATE "users" SET "full_name" = username WHERE "full_name" = 'Unknown User';

-- Make the column NOT NULL
ALTER TABLE "users" ALTER COLUMN "full_name" SET NOT NULL;

-- Remove the default value
ALTER TABLE "users" ALTER COLUMN "full_name" DROP DEFAULT;