# Missing Components Report — Tier 1 MVP

Based on a full audit of `/backend` and `/frontend` against the
requirements in `Goals/Tier1.md` (updated April 21, 2026 after `feature/supabase`).

---

## Backend — Partially Implemented

The backend now includes modular Supabase-based authentication and authorization,
plus existing Steam API routes. Database-backed product/order/cart layers are
still missing.

### Database
- [ ] No database connected (no driver or ORM in `package.json` — e.g. `pg`, `mongoose`, `better-sqlite3`)
- [ ] No schema / models for users, products, or orders
- [ ] No seed script to populate initial data

### Authentication & Security
- [x] `POST /api/auth/register` — create a new user account (via Supabase Auth)
- [x] `POST /api/auth/login` — return authenticated session data (Supabase access/refresh tokens)
- [x] `POST /api/auth/logout` — invalidate the session
- [x] Password handling is delegated to Supabase Auth (no plain-text password storage in app code)
- [x] Session/token auth flow implemented via Supabase Auth (no local JWT implementation required)
- [~] Auth middleware exists (`authenticateRequest`, `authorizeRoles`) and is used on auth-protected backend routes; cart/order/admin product routes still not built
- [x] Unique email behavior is handled by Supabase Auth

### Cart Routes (required for persistent cross-device cart)
- [ ] `GET  /api/cart` — fetch the logged-in user's cart
- [ ] `POST /api/cart` — add an item
- [ ] `PUT  /api/cart/:itemId` — update quantity
- [ ] `DELETE /api/cart/:itemId` — remove an item

### Order / Checkout
- [ ] `POST /api/orders` — create an order on checkout
- [ ] Order model / table in the database

### Admin Routes
- [ ] `GET    /api/admin/users` — list all users (admin only)
- [ ] `POST   /api/products` — add a product (admin only)
- [ ] `PUT    /api/products/:id` — edit a product (admin only)
- [ ] `DELETE /api/products/:id` — remove a product (admin only)
- [x] Admin authorization middleware (role check) exists (`authorizeRoles`) and is used by `/api/auth/admin/check`

---

## Frontend — Partially Implemented

### Missing Pages & Routes
- [x] **Single product detail page** — exists (`/game/:steamId`)
- [ ] **Category filter page** — `CategoryCard` links to `/category/:slug` but no route or page exists
- [ ] **404 / Not Found page** — no catch-all route; React Router silently shows nothing

### Auth is Now Integrated
- [x] `LoginPage` calls backend auth API
- [x] `RegisterPage` calls backend auth API
- [x] Auth context added (`AuthContext`) with session persistence and restore
- [x] `Header.jsx` uses real auth state and displays signed-in user email
- [x] "Sign out" action is wired to backend logout

### Cart is Local-Only
- [~] Cart still lives in `localStorage` (no backend sync yet), but is now identity-scoped:
	- guest cart: `cart:guest`
	- signed-in user cart: `cart:user:<userId>`
- [x] Protected-route guard added for `/checkout` (redirects unauthenticated users to `/register`)
- [ ] Cart count is still browser-local and not cross-device until backend cart APIs are implemented

### Checkout is a Stub
- [ ] `Checkout.jsx` renders `<p>Checkout Page</p>` — no form, no order summary, no confirmation
- [ ] No order creation call to the backend

### Search
- [ ] Search filters the already-loaded in-memory list — no backend search endpoint
- [ ] No "product not found" dedicated UI message (currently just a plain paragraph)

### Navigation & UX
- [x] Visible indication that user is logged in (email shown in header)
- [ ] No "navigate back to home" fallback on error states

---

## As an Administrator (Tier 1 requirement)
- [ ] Admin dashboard / admin-only views do not exist in the frontend
- [ ] No way to add, edit, or remove products through the UI
- [ ] No view of user accounts restricted to admins

---

## As an Engineer (Tier 1 requirement)
- [ ] Database not seeded — no realistic data to simulate many scenarios
- [ ] No input validation on register / login forms beyond browser `required`
- [ ] No server-side request validation (e.g. `express-validator` or `zod`)
- [ ] No meaningful error handling on the client for network failures (only loading/error states on Store and Home added in `feature/steamAPI`)

---

## Priority Order for Next Slices

| Priority | Slice | Key tasks |
|---|---|---|
| 1 | Database setup | Choose DB, install driver, define user + order models |
| 2 | Persistent cart (backend) | Build `/api/cart` routes and tie cart to authenticated user |
| 3 | Persistent cart sync (frontend) | Sync local cart with backend cart for logged-in users |
| 4 | Checkout | Order summary UI, `POST /api/orders`, confirmation page |
| 5 | Admin | Admin routes for users/products and frontend admin views |
| 6 | Category page | `/category/:slug` page filtering store by genre |
| 7 | 404 page | Catch-all route with "Go Home" link |
