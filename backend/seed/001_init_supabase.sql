-- Supabase initialization seed
-- Run this in Supabase SQL Editor.

begin;

-- ---------------------------------------------------------------------------
-- Profiles table (nickname/avatar metadata)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null default '',
  avatar_path text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_nickname_length check (char_length(nickname) <= 50)
);

-- Keep updated_at fresh on each update.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_set_updated_at on public.profiles;
create trigger trg_profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

alter table public.profiles enable row level security;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own
on public.profiles
for select
to authenticated
using (id = auth.uid());

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own
on public.profiles
for insert
to authenticated
with check (id = auth.uid());

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- Optional: allow users to delete their own profile row.
drop policy if exists profiles_delete_own on public.profiles;
create policy profiles_delete_own
on public.profiles
for delete
to authenticated
using (id = auth.uid());

-- ---------------------------------------------------------------------------
-- Cart table (persistent shopping cart)
-- ---------------------------------------------------------------------------
create table if not exists public.cart_items (
  user_id uuid not null references auth.users(id) on delete cascade,
  steam_id bigint not null,
  quantity integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cart_items_pk primary key (user_id, steam_id),
  constraint cart_items_quantity_positive check (quantity > 0)
);

create index if not exists cart_items_user_id_idx on public.cart_items(user_id);

drop trigger if exists trg_cart_items_set_updated_at on public.cart_items;
create trigger trg_cart_items_set_updated_at
before update on public.cart_items
for each row
execute function public.set_updated_at();

alter table public.cart_items enable row level security;

drop policy if exists cart_items_select_own on public.cart_items;
create policy cart_items_select_own
on public.cart_items
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists cart_items_insert_own on public.cart_items;
create policy cart_items_insert_own
on public.cart_items
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists cart_items_update_own on public.cart_items;
create policy cart_items_update_own
on public.cart_items
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists cart_items_delete_own on public.cart_items;
create policy cart_items_delete_own
on public.cart_items
for delete
to authenticated
using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Avatar storage bucket + storage policies
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  2097152,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Note: storage.objects RLS is managed by Supabase storage internals.
-- Do not run ALTER TABLE ... ENABLE ROW LEVEL SECURITY here, because
-- some SQL execution roles are not the owner of storage.objects.

-- Public read for avatar files in the avatars bucket.
drop policy if exists avatars_public_read on storage.objects;
create policy avatars_public_read
on storage.objects
for select
to public
using (bucket_id = 'avatars');

-- Authenticated users can upload only inside their own folder: <uid>/<filename>
drop policy if exists avatars_insert_own on storage.objects;
create policy avatars_insert_own
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Authenticated users can update/delete only their own avatar objects.
drop policy if exists avatars_update_own on storage.objects;
create policy avatars_update_own
on storage.objects
for update
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists avatars_delete_own on storage.objects;
create policy avatars_delete_own
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- ---------------------------------------------------------------------------
-- Orders table
-- ---------------------------------------------------------------------------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  total_price numeric(10, 2) not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  estimated_delivery_date timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint orders_total_price_positive check (total_price >= 0)
);

create index if not exists orders_user_id_idx on public.orders(user_id);
create index if not exists orders_created_at_idx on public.orders(created_at);

drop trigger if exists trg_orders_set_updated_at on public.orders;
create trigger trg_orders_set_updated_at
before update on public.orders
for each row
execute function public.set_updated_at();

alter table public.orders enable row level security;

drop policy if exists orders_select_own on public.orders;
create policy orders_select_own
on public.orders
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists orders_insert_own on public.orders;
create policy orders_insert_own
on public.orders
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists orders_update_own on public.orders;
create policy orders_update_own
on public.orders
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- Admin can update order status (this is a simplified policy - you may want to add role-based access control)
drop policy if exists orders_update_status on public.orders;
create policy orders_update_status
on public.orders
for update
to authenticated
using (true)
with check (true);

-- ---------------------------------------------------------------------------
-- Order Items table
-- ---------------------------------------------------------------------------
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  steam_id bigint not null,
  quantity integer not null default 1,
  price numeric(10, 2) not null,
  created_at timestamptz not null default now(),
  constraint order_items_quantity_positive check (quantity > 0),
  constraint order_items_price_non_negative check (price >= 0)
);

create index if not exists order_items_order_id_idx on public.order_items(order_id);
create index if not exists order_items_steam_id_idx on public.order_items(steam_id);

alter table public.order_items enable row level security;

drop policy if exists order_items_select_via_order on public.order_items;
create policy order_items_select_via_order
on public.order_items
for select
to authenticated
using (
  exists (
    select 1 from public.orders
    where orders.id = order_items.order_id
    and orders.user_id = auth.uid()
  )
);

drop policy if exists order_items_insert_via_order on public.order_items;
create policy order_items_insert_via_order
on public.order_items
for insert
to authenticated
with check (
  exists (
    select 1 from public.orders
    where orders.id = order_items.order_id
    and orders.user_id = auth.uid()
  )
);

commit;
