
-- Add image_urls array column for multiple images
ALTER TABLE public.archive_posts ADD COLUMN image_urls TEXT[] DEFAULT '{}'::text[];
