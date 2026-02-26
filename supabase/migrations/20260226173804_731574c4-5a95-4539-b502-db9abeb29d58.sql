
-- Add preferred_positions array column for multi-select positions
ALTER TABLE public.profiles ADD COLUMN preferred_positions TEXT[] DEFAULT '{}'::text[];

-- Add months_of_experience for detailed career tracking
ALTER TABLE public.profiles ADD COLUMN months_of_experience INTEGER NOT NULL DEFAULT 0;

-- Migrate existing data: copy preferred_position to preferred_positions array
UPDATE public.profiles 
SET preferred_positions = ARRAY[preferred_position]
WHERE preferred_position IS NOT NULL AND preferred_position != '';
