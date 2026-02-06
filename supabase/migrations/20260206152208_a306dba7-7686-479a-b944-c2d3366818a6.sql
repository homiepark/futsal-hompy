-- Add region and district columns to profiles table for smart filtering
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS region text,
ADD COLUMN IF NOT EXISTS district text;

-- Add comments for clarity
COMMENT ON COLUMN public.profiles.region IS 'User preferred activity region (city/province)';
COMMENT ON COLUMN public.profiles.district IS 'User preferred activity district';