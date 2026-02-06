-- Add preferred_regions column to store up to 3 activity regions as array
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS preferred_regions jsonb DEFAULT '[]'::jsonb;

-- Add comment for clarity
COMMENT ON COLUMN public.profiles.preferred_regions IS 'Array of up to 3 preferred activity regions, each with {region, district}';