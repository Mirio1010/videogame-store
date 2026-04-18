# Missing Components Report — Tier 1 MVP

Based on a full audit of `/backend` and `/frontend` against the
requirements in `Goals/Tier1.md` (as of April 18, 2026).

---

## Backend — Almost Entirely Missing

The backend is a bare Express shell. It has no database, no authentication,
and no business logic beyond the Steam API proxy added in `feature/steamAPI`.

### Database
- [ ] No database connected (no driver or ORM in `package.json` — e.g. `pg`, `mongoose`, `better-sqlite3`)
- [ ] No schema / models for users, products, or orders
- [ ] No seed script to populate initial data

### Authentication & Security
- [ ] `POST /api/auth/register` — create a new user account
- [ ] `POST /api/auth/login` — return a session token / JWT
- [ ] `POST /api/auth/logout` — invalidate the session
- [ ] Password hashing (`bcrypt` not installed — passwords must never be stored in plain text)
- [ ] JWT or session management (`jsonwebtoken` / `express-session` not installed)
- [ ] Auth middleware to protect private routes (cart, checkout, admin)
- [ ] Unique-email enforcement at the database level

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
- [ ] Admin authorization middleware (role check)

---

## Frontend — Partially Implemented

### Missing Pages & Routes
- [ ] **Single product detail page** — exists now (`/game/:steamId`) ✅ added in `feature/steamAPI`
- [ ] **Category filter page** — `CategoryCard` links to `/category/:slug` but no route or page exists
- [ ] **404 / Not Found page** — no catch-all route; React Router silently shows nothing

### Auth is Simulated, Not Real
- [ ] `LoginPage` uses `setTimeout` with no API call — accepts any non-empty input
- [ ] `RegisterPage` uses `setTimeout` with no API call — no validation against the backend
- [ ] No auth context (React Context / Zustand / Redux) to share login state across the app
- [ ] `Header.jsx` has `user` hardcoded to `null` — logged-in username is never displayed
- [ ] No "sign out" action wired up anywhere

### Cart is Local-Only
- [ ] Cart currently lives entirely in `localStorage` — not synced to the backend for logged-in users
- [ ] No protected-route guard preventing unauthenticated users from reaching `/checkout`
- [ ] Cart count in the header reflects `localStorage` only; will be wrong across devices

### Checkout is a Stub
- [ ] `Checkout.jsx` renders `<p>Checkout Page</p>` — no form, no order summary, no confirmation
- [ ] No order creation call to the backend

### Search
- [ ] Search filters the already-loaded in-memory list — no backend search endpoint
- [ ] No "product not found" dedicated UI message (currently just a plain paragraph)

### Navigation & UX
- [ ] No visible indication that the user is logged in (name/username in the header)
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
| 2 | Auth (backend) | Register / login routes, bcrypt, JWT middleware |
| 3 | Auth (frontend) | Wire forms to API, auth context, show username in header, logout |
| 4 | Persistent cart (backend) | Cart routes, tie cart to user session |
| 5 | Persistent cart (frontend) | Sync `localStorage` cart with backend on login |
| 6 | Checkout | Order summary UI, `POST /api/orders`, confirmation page |
| 7 | Protected routes | Route guard for `/checkout` and `/cart` (logged-in only) |
| 8 | Admin | Admin middleware + routes; product CRUD UI |
| 9 | Category page | `/category/:slug` page filtering store by genre |
| 10 | 404 page | Catch-all route with "Go Home" link |
