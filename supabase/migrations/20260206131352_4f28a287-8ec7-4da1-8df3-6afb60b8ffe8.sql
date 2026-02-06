-- Add nickname_tag and real_name columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN nickname_tag text DEFAULT NULL,
ADD COLUMN real_name text DEFAULT NULL;

-- Create a function to generate unique nickname tag
CREATE OR REPLACE FUNCTION public.generate_nickname_tag()
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  new_tag text;
BEGIN
  -- Generate a random 4-digit tag
  new_tag := lpad(floor(random() * 10000)::text, 4, '0');
  RETURN new_tag;
END;
$$;