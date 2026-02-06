-- Add home ground columns to teams table
ALTER TABLE public.teams 
ADD COLUMN home_ground_name text,
ADD COLUMN home_ground_address text;