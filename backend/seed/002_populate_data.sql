-- Seed Script: Populate Test Data for Development & Testing
-- This script creates realistic test data for users, profiles, orders, and order items.
-- WARNING: Only run this on development/staging environments. Not for production!

-- ============================================================================
-- 1. CREATE ORDERS TABLE (if not already created)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_price decimal(10, 2) NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  estimated_delivery_date timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Auto-update timestamp
CREATE OR REPLACE TRIGGER orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- RLS for orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert own orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update own orders"
  ON public.orders FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 2. CREATE ORDER_ITEMS TABLE (if not already created)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  steam_id integer NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  price decimal(10, 2) NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- RLS for order_items (users can view order items for their own orders)
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view items in their orders"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can insert items in their orders"
  ON public.order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- ============================================================================
-- 3. INSERT TEST PROFILES
-- ============================================================================
-- Note: These profiles reference UUIDs that should correspond to Supabase Auth users.
-- If these user_ids don't exist in auth.users, you'll get a FK constraint error.
-- In that case, create test users first via the API or use the Node.js seed script.

-- For this seed, we'll create profile records assuming users exist or will be created.
-- Replace these UUIDs with actual user_ids from your Supabase Auth after creating test users.

INSERT INTO public.profiles (id, nickname, avatar_url, created_at, updated_at)
VALUES
  (
    '00000000-0000-0000-0000-000000000001'::uuid,
    'Alice Smith',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000002'::uuid,
    'Bob Johnson',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000003'::uuid,
    'Carol Williams',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Carol',
    now(),
    now()
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 4. INSERT TEST ORDERS
-- ============================================================================
-- Orders for test users (linking to the UUIDs above)

INSERT INTO public.orders (user_id, total_price, status, estimated_delivery_date, created_at, updated_at)
VALUES
  -- Alice's orders
  (
    '00000000-0000-0000-0000-000000000001'::uuid,
    59.97,
    'delivered',
    now() - interval '5 days',
    now() - interval '30 days',
    now() - interval '25 days'
  ),
  (
    '00000000-0000-0000-0000-000000000001'::uuid,
    29.99,
    'shipped',
    now() + interval '2 days',
    now() - interval '7 days',
    now() - interval '6 days'
  ),
  -- Bob's orders
  (
    '00000000-0000-0000-0000-000000000002'::uuid,
    89.96,
    'delivered',
    now() - interval '10 days',
    now() - interval '45 days',
    now() - interval '40 days'
  ),
  -- Carol's order
  (
    '00000000-0000-0000-0000-000000000003'::uuid,
    19.99,
    'pending',
    now() + interval '5 days',
    now() - interval '1 days',
    now() - interval '1 days'
  )
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 5. INSERT TEST ORDER ITEMS
-- ============================================================================
-- Items in the orders above (using popular Steam game IDs)

-- Alice's first order (2 items)
INSERT INTO public.order_items (order_id, steam_id, quantity, price)
SELECT id, 570, 1, 19.99 FROM public.orders WHERE user_id = '00000000-0000-0000-0000-000000000001'::uuid AND status = 'delivered' AND total_price = 59.97 LIMIT 1;

INSERT INTO public.order_items (order_id, steam_id, quantity, price)
SELECT id, 275850, 2, 19.99 FROM public.orders WHERE user_id = '00000000-0000-0000-0000-000000000001'::uuid AND status = 'delivered' AND total_price = 59.97 LIMIT 1;

-- Alice's second order (1 item)
INSERT INTO public.order_items (order_id, steam_id, quantity, price)
SELECT id, 730, 1, 29.99 FROM public.orders WHERE user_id = '00000000-0000-0000-0000-000000000001'::uuid AND status = 'shipped' LIMIT 1;

-- Bob's order (2 items)
INSERT INTO public.order_items (order_id, steam_id, quantity, price)
SELECT id, 1238840, 1, 39.99 FROM public.orders WHERE user_id = '00000000-0000-0000-0000-000000000002'::uuid AND status = 'delivered' LIMIT 1;

INSERT INTO public.order_items (order_id, steam_id, quantity, price)
SELECT id, 1172470, 2, 24.98 FROM public.orders WHERE user_id = '00000000-0000-0000-0000-000000000002'::uuid AND status = 'delivered' LIMIT 1;

-- Carol's order (1 item)
INSERT INTO public.order_items (order_id, steam_id, quantity, price)
SELECT id, 252950, 1, 19.99 FROM public.orders WHERE user_id = '00000000-0000-0000-0000-000000000003'::uuid AND status = 'pending' LIMIT 1;

-- ============================================================================
-- 6. VERIFICATION QUERIES
-- ============================================================================
-- Uncomment to verify data was inserted:

-- SELECT COUNT(*) as profile_count FROM public.profiles;
-- SELECT COUNT(*) as order_count FROM public.orders;
-- SELECT COUNT(*) as order_item_count FROM public.order_items;
-- SELECT * FROM public.orders JOIN public.profiles ON orders.user_id = profiles.user_id;
