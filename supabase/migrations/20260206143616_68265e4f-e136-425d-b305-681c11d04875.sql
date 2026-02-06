-- Add structured columns for better filtering
ALTER TABLE public.teams 
ADD COLUMN IF NOT EXISTS district text,
ADD COLUMN IF NOT EXISTS training_days text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS training_start_time text,
ADD COLUMN IF NOT EXISTS training_end_time text;

-- Add index for filtering
CREATE INDEX IF NOT EXISTS idx_teams_region ON public.teams(region);
CREATE INDEX IF NOT EXISTS idx_teams_district ON public.teams(district);
CREATE INDEX IF NOT EXISTS idx_teams_level ON public.teams(level);
CREATE INDEX IF NOT EXISTS idx_teams_training_days ON public.teams USING GIN(training_days);