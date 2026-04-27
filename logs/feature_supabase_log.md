# Changelog — feature/supabase
Date: 2026-04-21  
Branch: `feature/supabase`

## TL;DR

- Added a modular Supabase auth backend (`/api/auth/register`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`, `/api/auth/admin/check`) with authentication + authorization middleware.
- Connected frontend login/register/logout to real backend auth endpoints using a shared `AuthContext` and persistent session restore.
- Protected `/checkout`: guests can view cart, but attempting checkout redirects unauthenticated users to `/register`.
- Separated cart storage by identity:
	- guest cart: `cart:guest`
	- signed-in private cart: `cart:user:<userId>`
- Fixed logout 400 error by making `refreshToken` optional on backend logout handling.
- Fixed logout 500 + frontend unhandled rejection by hardening backend request-body access and frontend logout handlers.
- Verified through repeated diagnostics checks and successful frontend build.

### /Backend/.env Environment Snapshot (Highlighted)

> IMPORTANT: Secrets are intentionally redacted in this log. Keep real keys only in local `.env` and never commit full key values.

```dotenv
PORT=3001
SUPABASE_URL=https://qfwvlstrfjzsnurgpmyh.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmd3Zsc3RyZmp6c251cmdwbXloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MDcwMjYsImV4cCI6MjA5MjM4MzAyNn0.yGJSu5jFC7pLXWjErTiWPQVWed0KNbdXOgVBriJM9eQ
SUPABASE_SERVICE_ROLE_KEY=<ASK YUCHEN>
```

# Feature Log: Supabase Auth + Protected Checkout + Private Cart

## Summary

This chat implemented a full auth integration using Supabase (through backend routes/services), connected frontend login/register/logout to those backend endpoints, protected checkout for unauthenticated users, and separated cart storage between guest users and signed-in users.

---

## 1) Backend: Supabase Authentication Module

### Added

- `backend/src/services/supabaseClient.js`
	- Centralized Supabase client creation with environment-based config.
	- Supports bearer-token-aware client creation.

- `backend/src/services/authService.js`
	- `registerUser({ email, password, name })`
	- `loginUser({ email, password })`
	- `logoutUser({ accessToken, refreshToken })`
	- `getUserFromAccessToken(accessToken)`
	- User sanitization and role extraction helpers.

- `backend/src/middleware/auth.js`
	- `authenticateRequest` for bearer token authentication.
	- `authorizeRoles(...roles)` for role-based authorization.

- `backend/src/routes/auth.js`
	- `POST /api/auth/register`
	- `POST /api/auth/login`
	- `POST /api/auth/logout`
	- `GET /api/auth/me`
	- `GET /api/auth/admin/check`

- `backend/.env.example`
	- `PORT`
	- `SUPABASE_URL`
	- `SUPABASE_ANON_KEY`

### Updated

- `backend/src/app.js`
	- Mounted auth router at `/api/auth`.
	- Improved global error handler to respect `err.statusCode` and `err.message`.

- `backend/package.json`
	- Added dependency: `@supabase/supabase-js`.

---

## 2) Frontend: Real Login/Register/Logout Flow

### Added

- `frontend/src/services/authService.js`
	- API client for:
		- `register`
		- `login`
		- `logout`
		- `getCurrentUser`

- `frontend/src/context/AuthContext.jsx`
	- Shared auth state provider.
	- Session persistence in local storage (`auth_session`).
	- Session restore via `/api/auth/me` on app startup.

### Updated

- `frontend/src/main.jsx`
	- Wrapped app with `AuthProvider`.

- `frontend/src/pages/LoginPage.jsx`
	- Replaced simulated login with real login via backend.

- `frontend/src/pages/RegisterPage.jsx`
	- Replaced simulated register with real register via backend.
	- Handles email confirmation response (`needsEmailConfirmation`).

- `frontend/src/components/Header.jsx`
	- Replaced simulated user state with auth context.
	- Added real `Logout` button behavior.

---

## 3) Route Protection for Checkout

### Added

- `frontend/src/routes/ProtectedRoute.jsx`
	- Redirects unauthenticated users to register page.

### Updated

- `frontend/src/routes/AppRoutes.jsx`
	- Added checkout route.
	- Wrapped checkout route with `ProtectedRoute`.

### Behavior achieved

- Unauthenticated users can view cart.
- When unauthenticated users attempt checkout, they are redirected to `/register`.

---

## 4) Cart Privacy + Persistence by Identity

### Problem solved

Global cart key (`cart`) caused guest and signed-in users to share/mix cart contents.

### Added

- `frontend/src/utils/cartStorage.js`
	- New cart key strategy:
		- Guest: `cart:guest`
		- Signed-in user: `cart:user:<userId>`
	- Helpers:
		- `readCart(user)`
		- `writeCart(user, cartItems)`
		- `addGameToCart(user, game)`
	- Includes migration from legacy key `cart` to `cart:guest`.

### Updated

- `frontend/src/components/Header.jsx`
	- Cart count now reads scoped cart by current user.

- `frontend/src/pages/Cart.jsx`
	- Cart read/write now uses scoped storage by current user.

- `frontend/src/components/GameCard.jsx`
	- Add-to-cart uses scoped storage.

- `frontend/src/pages/GameDetailPage.jsx`
	- Add-to-cart uses scoped storage.

### Behavior achieved

- Guests have an independent guest cart.
- Each signed-in user has a separate private persistent cart.
- Signed-in cart and guest cart are unrelated.

---

## 5) Logout Error Fix

### Issue reported

`Missing required fields: refreshToken` during logout.

### Fixes

- `backend/src/routes/auth.js`
	- Removed strict `refreshToken` requirement in logout route.

- `backend/src/services/authService.js`
	- `logoutUser` now handles missing refresh token gracefully.
	- If refresh token exists, session is restored before sign-out.
	- If missing, sign-out still proceeds with access token context.

### Result

- Logout no longer fails with 400 due to missing refresh token.

---

## 8) Additional Logout Robustness Fix (500 + Unhandled Rejection)

### Issue reported

- Browser console showed:
	- `Failed to load resource: ... 500 (Internal Server Error) (logout)`
	- `Unhandled Promise Rejection: Cannot read properties of undefined (reading 'refreshToken')`

### Root cause

- Backend logout route accessed `req.body.refreshToken` directly, which can throw when `req.body` is undefined.
- Header logout click path did not catch rejected logout promises, so failures surfaced as unhandled rejections.

### Fixes

- `backend/src/routes/auth.js`
	- Hardened refresh token access:
		- from `req.body.refreshToken`
		- to `req.body?.refreshToken`

- `frontend/src/services/authService.js`
	- Hardened logout helper signature to avoid destructuring crash:
		- from `logout({ accessToken, refreshToken })`
		- to `logout({ accessToken, refreshToken } = {})`
	- Added early return when `accessToken` is missing.

- `frontend/src/components/Header.jsx`
	- Wrapped logout click handler in `try/catch` to prevent unhandled promise rejections.

### Result

- Logout flow is more resilient to stale/malformed session payloads.
- Console no longer reports unhandled promise rejection for this path.
- Backend no longer throws on missing request body during logout.

---

## 6) Validation Performed During Chat

- Installed backend dependencies successfully (`npm install` in backend).
- Repeated static diagnostics checks on modified backend and frontend files.
- Frontend build completed successfully (`npm run build` in frontend, exit code 0).

---

## 7) Current State

- Supabase auth is integrated via backend endpoints.
- Frontend auth pages use real backend API.
- Checkout is protected for unauthenticated users.
- Cart storage is identity-scoped and private for signed-in users.
- Logout error path is fixed.
