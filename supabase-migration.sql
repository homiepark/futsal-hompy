-- =============================================
-- 우리의 풋살 - Supabase Migration SQL
-- 새 Supabase 프로젝트의 SQL Editor에서 실행하세요
-- =============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =============================================
-- TABLES
-- =============================================

-- profiles
create table public.profiles (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  nickname text not null default '',
  nickname_tag text,
  real_name text,
  avatar_url text,
  region text,
  district text,
  preferred_position text,
  preferred_positions text[],
  preferred_regions jsonb,
  years_of_experience integer not null default 0,
  months_of_experience integer not null default 0,
  is_pro_elite boolean not null default false,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- teams
create table public.teams (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  emblem text not null default '⚽',
  description text,
  introduction text,
  level text not null default 'amateur',
  region text,
  district text,
  gender text,
  home_ground_name text,
  home_ground_address text,
  training_time text,
  training_days text[],
  training_start_time text,
  training_end_time text,
  photo_url text,
  banner_url text,
  instagram_url text,
  youtube_url text,
  admin_user_id uuid,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- team_members
create table public.team_members (
  id uuid default uuid_generate_v4() primary key,
  team_id uuid references public.teams(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  role text not null default 'member',  -- owner, admin, manager, coach, member
  staff_career_years integer,           -- 감독/코치 경력 연수 (선택)
  staff_career_note text,               -- 경력 한줄 설명 (선택, 예: "전 K리그 OO FC 코치")
  joined_at timestamptz default now() not null,
  unique(team_id, user_id)
);

-- team_schedules
create table public.team_schedules (
  id uuid default uuid_generate_v4() primary key,
  team_id uuid references public.teams(id) on delete cascade not null,
  created_by uuid references auth.users(id) on delete set null,
  title text not null,
  date date not null,
  time_start text,
  time_end text,
  location text,
  event_type text not null default 'match',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- team_join_requests
create table public.team_join_requests (
  id uuid default uuid_generate_v4() primary key,
  team_id uuid references public.teams(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  message text,
  status text not null default 'pending',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- team_invitations
create table public.team_invitations (
  id uuid default uuid_generate_v4() primary key,
  team_id uuid references public.teams(id) on delete cascade not null,
  invited_by_user_id uuid references auth.users(id) on delete cascade not null,
  invited_user_id uuid references auth.users(id) on delete cascade not null,
  message text,
  status text not null default 'pending',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- team_notices
create table public.team_notices (
  id uuid default uuid_generate_v4() primary key,
  team_id uuid references public.teams(id) on delete cascade not null,
  content text not null,
  created_by uuid references auth.users(id) on delete cascade not null,
  is_active boolean not null default true,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- match_posts
create table public.match_posts (
  id uuid default uuid_generate_v4() primary key,
  team_id uuid references public.teams(id) on delete cascade not null,
  posted_by_user_id uuid references auth.users(id) on delete cascade not null,
  match_date date not null,
  match_time_start text not null,
  match_time_end text not null,
  location_name text not null,
  location_address text,
  location_type text not null default 'indoor',
  target_levels text[] not null default '{}',
  description text,
  status text not null default 'open',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- match_applications
create table public.match_applications (
  id uuid default uuid_generate_v4() primary key,
  match_post_id uuid references public.match_posts(id) on delete cascade not null,
  applicant_team_id uuid references public.teams(id) on delete cascade not null,
  applied_by_user_id uuid references auth.users(id) on delete cascade not null,
  message text,
  status text not null default 'pending',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- messages
create table public.messages (
  id uuid default uuid_generate_v4() primary key,
  sender_id uuid references auth.users(id) on delete cascade not null,
  receiver_id uuid references auth.users(id) on delete cascade not null,
  team_id uuid references public.teams(id) on delete set null,
  content text not null,
  is_read boolean not null default false,
  created_at timestamptz default now() not null
);

-- archive_posts
create table public.archive_posts (
  id uuid default uuid_generate_v4() primary key,
  team_id uuid references public.teams(id) on delete cascade not null,
  author_user_id uuid references auth.users(id) on delete cascade not null,
  content text not null,
  image_url text,
  image_urls text[],
  video_url text,
  folder_id uuid,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- archive_post_comments
create table public.archive_post_comments (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references public.archive_posts(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- archive_post_likes
create table public.archive_post_likes (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references public.archive_posts(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  unique(post_id, user_id)
);

-- player_guestbook_entries
create table public.player_guestbook_entries (
  id uuid default uuid_generate_v4() primary key,
  target_user_id uuid references auth.users(id) on delete cascade not null,
  author_user_id uuid references auth.users(id) on delete cascade not null,
  message text not null,
  created_at timestamptz default now() not null
);

-- player_guestbook_likes
create table public.player_guestbook_likes (
  id uuid default uuid_generate_v4() primary key,
  entry_id uuid references public.player_guestbook_entries(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  unique(entry_id, user_id)
);

-- =============================================
-- FUNCTIONS
-- =============================================

-- generate_nickname_tag
create or replace function public.generate_nickname_tag()
returns text
language plpgsql
as $$
declare
  tag text;
  exists_check boolean;
begin
  loop
    tag := '#' || lpad(floor(random() * 10000)::text, 4, '0');
    select exists(select 1 from public.profiles where nickname_tag = tag) into exists_check;
    exit when not exists_check;
  end loop;
  return tag;
end;
$$;

-- is_team_admin
create or replace function public.is_team_admin(_team_id uuid, _user_id uuid)
returns boolean
language sql
security definer
as $$
  select exists (
    select 1 from public.team_members
    where team_id = _team_id
    and user_id = _user_id
    and role in ('admin', 'owner')
  );
$$;

-- count_team_admins
create or replace function public.count_team_admins(_team_id uuid)
returns integer
language sql
security definer
as $$
  select count(*)::integer from public.team_members
  where team_id = _team_id
  and role in ('admin', 'owner');
$$;

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

alter table public.profiles enable row level security;
alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.team_join_requests enable row level security;
alter table public.team_invitations enable row level security;
alter table public.team_notices enable row level security;
alter table public.match_posts enable row level security;
alter table public.match_applications enable row level security;
alter table public.messages enable row level security;
alter table public.archive_posts enable row level security;
alter table public.archive_post_comments enable row level security;
alter table public.archive_post_likes enable row level security;
alter table public.player_guestbook_entries enable row level security;
alter table public.player_guestbook_likes enable row level security;

-- profiles policies
create policy "profiles_select_all" on public.profiles for select using (true);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = user_id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = user_id);
create policy "profiles_delete_own" on public.profiles for delete using (auth.uid() = user_id);

-- teams policies
create policy "teams_select_all" on public.teams for select using (true);
create policy "teams_insert_auth" on public.teams for insert with check (auth.uid() is not null);
create policy "teams_update_admin" on public.teams for update using (public.is_team_admin(id, auth.uid()));
create policy "teams_delete_admin" on public.teams for delete using (public.is_team_admin(id, auth.uid()));

-- team_members policies
create policy "team_members_select_all" on public.team_members for select using (true);
create policy "team_members_insert_admin" on public.team_members for insert with check (
  auth.uid() = user_id or public.is_team_admin(team_id, auth.uid())
);
create policy "team_members_update_admin" on public.team_members for update using (
  public.is_team_admin(team_id, auth.uid())
);
create policy "team_members_delete_admin" on public.team_members for delete using (
  auth.uid() = user_id or public.is_team_admin(team_id, auth.uid())
);

-- team_join_requests policies
create policy "team_join_requests_select" on public.team_join_requests for select using (
  auth.uid() = user_id or public.is_team_admin(team_id, auth.uid())
);
create policy "team_join_requests_insert" on public.team_join_requests for insert with check (auth.uid() = user_id);
create policy "team_join_requests_update" on public.team_join_requests for update using (
  auth.uid() = user_id or public.is_team_admin(team_id, auth.uid())
);
create policy "team_join_requests_delete" on public.team_join_requests for delete using (
  auth.uid() = user_id or public.is_team_admin(team_id, auth.uid())
);

-- team_invitations policies
create policy "team_invitations_select" on public.team_invitations for select using (
  auth.uid() = invited_user_id or auth.uid() = invited_by_user_id or public.is_team_admin(team_id, auth.uid())
);
create policy "team_invitations_insert" on public.team_invitations for insert with check (
  public.is_team_admin(team_id, auth.uid())
);
create policy "team_invitations_update" on public.team_invitations for update using (
  auth.uid() = invited_user_id or public.is_team_admin(team_id, auth.uid())
);
create policy "team_invitations_delete" on public.team_invitations for delete using (
  public.is_team_admin(team_id, auth.uid())
);

-- team_notices policies
create policy "team_notices_select" on public.team_notices for select using (true);
create policy "team_notices_insert" on public.team_notices for insert with check (
  public.is_team_admin(team_id, auth.uid())
);
create policy "team_notices_update" on public.team_notices for update using (
  public.is_team_admin(team_id, auth.uid())
);
create policy "team_notices_delete" on public.team_notices for delete using (
  public.is_team_admin(team_id, auth.uid())
);

-- match_posts policies
create policy "match_posts_select_all" on public.match_posts for select using (true);
create policy "match_posts_insert_admin" on public.match_posts for insert with check (
  public.is_team_admin(team_id, auth.uid())
);
create policy "match_posts_update_admin" on public.match_posts for update using (
  public.is_team_admin(team_id, auth.uid())
);
create policy "match_posts_delete_admin" on public.match_posts for delete using (
  public.is_team_admin(team_id, auth.uid())
);

-- match_applications policies
create policy "match_applications_select" on public.match_applications for select using (
  auth.uid() = applied_by_user_id or
  exists (select 1 from public.match_posts mp where mp.id = match_post_id and public.is_team_admin(mp.team_id, auth.uid()))
);
create policy "match_applications_insert" on public.match_applications for insert with check (
  public.is_team_admin(applicant_team_id, auth.uid())
);
create policy "match_applications_update" on public.match_applications for update using (
  auth.uid() = applied_by_user_id or
  exists (select 1 from public.match_posts mp where mp.id = match_post_id and public.is_team_admin(mp.team_id, auth.uid()))
);
create policy "match_applications_delete" on public.match_applications for delete using (
  auth.uid() = applied_by_user_id
);

-- messages policies
create policy "messages_select" on public.messages for select using (
  auth.uid() = sender_id or auth.uid() = receiver_id
);
create policy "messages_insert" on public.messages for insert with check (auth.uid() = sender_id);
create policy "messages_update" on public.messages for update using (auth.uid() = receiver_id);
create policy "messages_delete" on public.messages for delete using (
  auth.uid() = sender_id or auth.uid() = receiver_id
);

-- archive_posts policies
create policy "archive_posts_select" on public.archive_posts for select using (
  exists (select 1 from public.team_members where team_id = archive_posts.team_id and user_id = auth.uid())
);
create policy "archive_posts_insert" on public.archive_posts for insert with check (
  exists (select 1 from public.team_members where team_id = archive_posts.team_id and user_id = auth.uid())
);
create policy "archive_posts_update" on public.archive_posts for update using (
  auth.uid() = author_user_id or public.is_team_admin(team_id, auth.uid())
);
create policy "archive_posts_delete" on public.archive_posts for delete using (
  auth.uid() = author_user_id or public.is_team_admin(team_id, auth.uid())
);

-- archive_post_comments policies
create policy "archive_post_comments_select" on public.archive_post_comments for select using (true);
create policy "archive_post_comments_insert" on public.archive_post_comments for insert with check (auth.uid() = user_id);
create policy "archive_post_comments_update" on public.archive_post_comments for update using (auth.uid() = user_id);
create policy "archive_post_comments_delete" on public.archive_post_comments for delete using (auth.uid() = user_id);

-- archive_post_likes policies
create policy "archive_post_likes_select" on public.archive_post_likes for select using (true);
create policy "archive_post_likes_insert" on public.archive_post_likes for insert with check (auth.uid() = user_id);
create policy "archive_post_likes_delete" on public.archive_post_likes for delete using (auth.uid() = user_id);

-- player_guestbook_entries policies
create policy "guestbook_entries_select" on public.player_guestbook_entries for select using (true);
create policy "guestbook_entries_insert" on public.player_guestbook_entries for insert with check (auth.uid() = author_user_id);
create policy "guestbook_entries_delete" on public.player_guestbook_entries for delete using (
  auth.uid() = author_user_id or auth.uid() = target_user_id
);

-- player_guestbook_likes policies
create policy "guestbook_likes_select" on public.player_guestbook_likes for select using (true);
create policy "guestbook_likes_insert" on public.player_guestbook_likes for insert with check (auth.uid() = user_id);
create policy "guestbook_likes_delete" on public.player_guestbook_likes for delete using (auth.uid() = user_id);

-- =============================================
-- STORAGE BUCKETS
-- =============================================

insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);
insert into storage.buckets (id, name, public) values ('team-banners', 'team-banners', true);
insert into storage.buckets (id, name, public) values ('archive-images', 'archive-images', true);

-- Storage policies
create policy "avatars_select" on storage.objects for select using (bucket_id = 'avatars');
create policy "avatars_insert" on storage.objects for insert with check (bucket_id = 'avatars' and auth.uid() is not null);
create policy "avatars_update" on storage.objects for update using (bucket_id = 'avatars' and auth.uid() is not null);
create policy "avatars_delete" on storage.objects for delete using (bucket_id = 'avatars' and auth.uid() is not null);

create policy "team_banners_select" on storage.objects for select using (bucket_id = 'team-banners');
create policy "team_banners_insert" on storage.objects for insert with check (bucket_id = 'team-banners' and auth.uid() is not null);
create policy "team_banners_update" on storage.objects for update using (bucket_id = 'team-banners' and auth.uid() is not null);
create policy "team_banners_delete" on storage.objects for delete using (bucket_id = 'team-banners' and auth.uid() is not null);

create policy "archive_images_select" on storage.objects for select using (bucket_id = 'archive-images');
create policy "archive_images_insert" on storage.objects for insert with check (bucket_id = 'archive-images' and auth.uid() is not null);
create policy "archive_images_update" on storage.objects for update using (bucket_id = 'archive-images' and auth.uid() is not null);
create policy "archive_images_delete" on storage.objects for delete using (bucket_id = 'archive-images' and auth.uid() is not null);
