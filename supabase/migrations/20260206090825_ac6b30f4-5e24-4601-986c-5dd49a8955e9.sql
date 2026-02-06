-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL DEFAULT '풋살러',
  avatar_url TEXT,
  years_of_experience INTEGER NOT NULL DEFAULT 0,
  is_pro_elite BOOLEAN NOT NULL DEFAULT false,
  preferred_position TEXT DEFAULT 'MF',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create teams table
CREATE TABLE public.teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  emblem TEXT NOT NULL DEFAULT '⚽',
  photo_url TEXT,
  region TEXT,
  level TEXT NOT NULL DEFAULT 'C' CHECK (level IN ('S', 'A', 'B', 'C')),
  training_time TEXT,
  description TEXT,
  admin_user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create team_members junction table
CREATE TABLE public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(team_id, user_id)
);

-- Create messages table for DM functionality
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Teams policies
CREATE POLICY "Teams are viewable by everyone" 
ON public.teams FOR SELECT USING (true);

CREATE POLICY "Team admins can update their teams" 
ON public.teams FOR UPDATE USING (auth.uid() = admin_user_id);

CREATE POLICY "Authenticated users can create teams" 
ON public.teams FOR INSERT WITH CHECK (auth.uid() = admin_user_id);

-- Team members policies
CREATE POLICY "Team members are viewable by everyone" 
ON public.team_members FOR SELECT USING (true);

CREATE POLICY "Team admins can manage members" 
ON public.team_members FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.teams 
    WHERE teams.id = team_members.team_id 
    AND teams.admin_user_id = auth.uid()
  )
);

CREATE POLICY "Users can join teams" 
ON public.team_members FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave teams" 
ON public.team_members FOR DELETE USING (auth.uid() = user_id);

-- Messages policies
CREATE POLICY "Users can view their own messages" 
ON public.messages FOR SELECT USING (
  auth.uid() = sender_id OR auth.uid() = receiver_id
);

CREATE POLICY "Users can send messages" 
ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can mark messages as read" 
ON public.messages FOR UPDATE USING (auth.uid() = receiver_id);

-- Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible" 
ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" 
ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own avatar" 
ON storage.objects FOR UPDATE USING (
  bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own avatar" 
ON storage.objects FOR DELETE USING (
  bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, nickname)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nickname', '풋살러'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for auto profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;