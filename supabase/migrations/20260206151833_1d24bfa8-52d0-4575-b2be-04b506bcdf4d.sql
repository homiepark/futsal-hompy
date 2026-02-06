-- Add gender column to teams table for filtering
ALTER TABLE public.teams 
ADD COLUMN IF NOT EXISTS gender text DEFAULT 'mixed';

-- Add comment for clarity
COMMENT ON COLUMN public.teams.gender IS 'Team gender: male, female, or mixed';