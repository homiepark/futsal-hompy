-- Drop the existing check constraint
ALTER TABLE public.teams DROP CONSTRAINT IF EXISTS teams_level_check;

-- Migrate existing level values from S/A/B/C to 1/2/3/4
UPDATE public.teams SET level = '4' WHERE level = 'S';
UPDATE public.teams SET level = '3' WHERE level = 'A';
UPDATE public.teams SET level = '2' WHERE level = 'B';
UPDATE public.teams SET level = '1' WHERE level = 'C';

-- Add new check constraint for 1/2/3/4
ALTER TABLE public.teams ADD CONSTRAINT teams_level_check CHECK (level IN ('1', '2', '3', '4'));

-- Update default value
ALTER TABLE public.teams ALTER COLUMN level SET DEFAULT '1';

-- Migrate target_levels in match_posts
UPDATE public.match_posts SET target_levels = array_replace(target_levels, 'S', '4');
UPDATE public.match_posts SET target_levels = array_replace(target_levels, 'A', '3');
UPDATE public.match_posts SET target_levels = array_replace(target_levels, 'B', '2');
UPDATE public.match_posts SET target_levels = array_replace(target_levels, 'C', '1');