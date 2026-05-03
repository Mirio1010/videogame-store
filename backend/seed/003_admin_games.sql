-- Admin-managed game catalog
-- Run this in Supabase SQL Editor before using the admin catalog API.

begin;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.admin_games (
  steam_id bigint primary key,
  price numeric(10, 2) not null default 0,
  original_price numeric(10, 2) not null default 0,
  discount integer not null default 0,
  featured boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint admin_games_price_non_negative check (price >= 0),
  constraint admin_games_original_price_non_negative check (original_price >= 0),
  constraint admin_games_discount_range check (discount between 0 and 100)
);

create index if not exists admin_games_active_idx on public.admin_games(active);
create index if not exists admin_games_featured_idx on public.admin_games(featured);

drop trigger if exists trg_admin_games_set_updated_at on public.admin_games;
create trigger trg_admin_games_set_updated_at
before update on public.admin_games
for each row
execute function public.set_updated_at();

alter table public.admin_games enable row level security;

drop policy if exists admin_games_public_read_active on public.admin_games;
create policy admin_games_public_read_active
on public.admin_games
for select
to anon, authenticated
using (active = true);

-- The backend writes with SUPABASE_SERVICE_ROLE_KEY, which bypasses RLS.
-- Keep browser/client writes disabled so catalog edits must go through
-- the backend's admin role checks.

insert into public.admin_games (
  steam_id,
  price,
  original_price,
  discount,
  featured,
  active,
  created_at,
  updated_at
)
values
  (
    1808500,
    0.01,
    0.01,
    0,
    true,
    true,
    '2026-05-03T21:10:45.896Z',
    '2026-05-03T21:10:45.896Z'
  ),
  (
    2050650,
    60.00,
    60.00,
    50,
    true,
    true,
    '2026-05-03T21:19:31.378Z',
    '2026-05-03T21:19:31.378Z'
  )
on conflict (steam_id) do update
set
  price = excluded.price,
  original_price = excluded.original_price,
  discount = excluded.discount,
  featured = excluded.featured,
  active = excluded.active,
  updated_at = excluded.updated_at;

commit;
