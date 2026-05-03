# Database Seeding Guide

This folder contains scripts to populate your Supabase database with realistic test data.

## Files

- **`001_init_supabase.sql`** — Schema initialization (tables, RLS policies, storage bucket)
- **`002_populate_data.sql`** — SQL-only seed for test data (if users already exist)
- **`seed.js`** — Node.js script to create test users and populate all data

---

## Quick Start (Recommended)

### Option A: Use Node.js Script (Simplest)

This creates test users via Supabase Auth, then populates profiles, orders, and items.

```bash
cd backend
node seed/seed.js
```

**What it does:**
1. Creates 3 test users (alice@example.com, bob@example.com, carol@example.com)
2. Creates profiles for each user
3. Creates realistic orders with items
4. Prints test credentials to use for login

**Output:**
```
✅ Created user: alice@example.com (ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
✅ Created user: bob@example.com (ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
✅ Created user: carol@example.com (ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
✅ Seed complete!

📊 Summary:
  • Users created: 3
  • Test accounts:
    - alice@example.com / TestPassword123!
    - bob@example.com / TestPassword123!
    - carol@example.com / TestPassword123!
```

---

### Option B: Manual SQL in Supabase Console

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project → **SQL Editor**
3. Click **+ New Query**
4. Copy contents of `001_init_supabase.sql` (schema)
5. Run the query
6. Create test users manually via **Authentication** → **Add User**
7. Copy their user IDs
8. Edit `002_populate_data.sql` and replace the hardcoded UUIDs with real user IDs
9. Run `002_populate_data.sql`

---

## Test Data Structure

### Users
- **alice@example.com** — 2 orders (delivered, shipped)
- **bob@example.com** — 1 order (delivered)
- **carol@example.com** — 1 pending order

### Orders
- Total: 4 orders with realistic statuses (pending, shipped, delivered)
- Dates: Spread across last 45 days for realistic testing
- Total spent: $199.91

### Items per Order
- Alice's first order: Dota 2 ($19.99) + No Man's Sky × 2 ($39.98) = $59.97
- Alice's second order: CS:GO ($29.99) = $29.99
- Bob's order: Deep Rock Galactic ($39.99) + Raft × 2 ($49.98) = $89.97
- Carol's order: Rocket League ($19.99) = $19.99

---

## Environment Setup

Before running `seed.js`, ensure your `.env` file has:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
PORT=3001
```

Get these from [Supabase Dashboard](https://app.supabase.com):
- **Settings** → **API**
- Copy `Project URL` and keys

---

## Testing with Test Data

### 1. Log In
Use one of the test accounts:
- Email: `alice@example.com`
- Password: `TestPassword123!`

### 2. Test Features
- ✅ View profile (avatar, display name)
- ✅ Browse products in Store
- ✅ Add items to cart
- ✅ View cart (persists to Supabase)
- ✅ Proceed to checkout (protected route)
- ✅ Update profile settings

### 3. Test as Guest
- Browse products without logging in
- Add to cart (saved in localStorage)
- Cart is independent from logged-in carts

---

## Cleanup

### Delete Test Users

If you need to remove test data for production deployment:

**Option A: Via Supabase Console**
1. Go to **Authentication** → **Users**
2. Select test user → **Delete user**

**Option B: Via SQL**
```sql
DELETE FROM public.cart_items WHERE user_id IN (
  SELECT id FROM auth.users WHERE email IN (
    'alice@example.com', 'bob@example.com', 'carol@example.com'
  )
);

DELETE FROM public.profiles WHERE user_id IN (
  SELECT id FROM auth.users WHERE email IN (
    'alice@example.com', 'bob@example.com', 'carol@example.com'
  )
);

DELETE FROM auth.users WHERE email IN (
  'alice@example.com', 'bob@example.com', 'carol@example.com'
);
```

---

## Troubleshooting

### Error: "Missing Supabase environment variables"
- Check `.env` file exists in `backend/` directory
- Verify `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` are set

### Error: "User already exists"
- Test users were already created
- Script will skip duplicates and use existing user IDs
- Safe to run multiple times

### Error: "FK constraint violation"
- User IDs in `002_populate_data.sql` don't exist in `auth.users`
- Use `seed.js` instead (it creates users first)
- Or manually update UUIDs in SQL file

### Orders not appearing after seed.js runs
- Check Supabase **Database** → **Tables** → `orders` and `order_items`
- Verify RLS policies allow viewing (should show if logged in as seeded user)

---

## Advanced: Custom Seed Data

Edit `seed.js` to customize test data:

```javascript
const testUsers = [
  { email: "your@email.com", password: "Password123!", displayName: "Your Name" },
  // Add more users...
];

const steamGames = [
  { id: 123456, name: "Game Name", price: 29.99 },
  // Add more games...
];
```

Then run: `node seed/seed.js`
