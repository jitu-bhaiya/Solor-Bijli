-- Run in Supabase SQL editor. Enable Phone provider + an SMS provider (e.g. Twilio) in Authentication settings first.
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  phone text,
  name text not null default 'User',
  role text not null default 'user' check (role in ('user','admin')),
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;
-- Users can read only their own profile. No update policy: users cannot change their own role.
create policy "read own profile" on public.profiles for select using (auth.uid() = id);
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, phone, name) values (new.id, new.phone, coalesce(new.raw_user_meta_data->>'name', 'User'));
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
-- Make someone an admin (run manually, use the number in E.164 format):
-- update public.profiles set role = 'admin' where phone = '919999999999';

-- ===== Data tables (per-user, protected by row-level security) =====
alter table public.profiles add column if not exists status text not null default 'active' check (status in ('active','suspended'));

create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create table if not exists public.user_data (
  user_id uuid primary key references auth.users on delete cascade,
  settings jsonb, appliances jsonb, updated_at timestamptz default now()
);
create table if not exists public.readings (
  user_id uuid not null references auth.users on delete cascade,
  date date not null, kwh numeric not null check (kwh >= 0 and kwh <= 1000),
  primary key (user_id, date)
);
alter table public.user_data enable row level security;
alter table public.readings enable row level security;
create policy "own user_data" on public.user_data for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own readings" on public.readings for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "admin read profiles" on public.profiles for select using (public.is_admin());
create policy "admin update status" on public.profiles for update using (public.is_admin());

create or replace function public.admin_user_usage() returns table (user_id uuid, kwh numeric) language sql security definer set search_path = public as $$
  select r.user_id, sum(r.kwh) from public.readings r
  where public.is_admin() and r.date >= current_date - 30 group by r.user_id;
$$;
