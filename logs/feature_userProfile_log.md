# Changelog — feature/userProfile
Date: 2026-05-03  
Branch: `feature/userProfile`

## TL;DR

- Built a complete **user profile management page** with avatar upload to Supabase Storage, nickname updates, email/password changes, and account deletion.
- Migrated **cart persistence** from localStorage to Supabase `public.cart_items` table for authenticated users, with localStorage fallback for guests.
- Implemented **Supabase RLS policies** on profiles and cart_items tables to enforce owner-only access.
- Fixed **5 critical integration bugs**: header merge issue, missing RLS user_id, bucket not found, payload size limits, and GameDetailPage add-to-cart persistence.
- Added **friendly error messages** for oversized avatar uploads and improved error handling across profile/cart flows.
- Refactored **GameDetailPage** to use async/await pattern, eliminating React lint warnings and improving code quality.

---

## 1) Backend: Profile Management Service

### Added

- `backend/src/services/profileService.js`
	- `updateUserViaAccessToken(accessToken, updates)` — Update user metadata via Supabase Auth REST API.
	- `uploadAvatar(userId, imageBase64, accessToken)` — Validate file size, decode base64, upload to Supabase Storage, and update user metadata.
	- `updateEmail(accessToken, newEmail)` — Update user email via Supabase Auth.
	- `updatePassword(accessToken, newPassword)` — Update user password via Supabase Auth.
	- `deleteAccount(userId, confirmationText, accessToken)` — Delete user account with exact confirmation text verification using admin client.
	- `ensureAvatarBucketExists()` — Auto-create avatars storage bucket if missing.
	- `isBucketNotFoundError(error)` — Detect and handle Supabase bucket-not-found errors gracefully.
	- Helper: `sanitizeUser(supabaseUser)` — Extract profile data with displayName and avatarUrl.

- `backend/src/routes/profile.js`
	- `GET /api/profile` — Retrieve current user profile.
	- `PATCH /api/profile/nickname` — Update user nickname (stored in Supabase metadata and profiles table).
	- `POST /api/profile/avatar` — Upload and store avatar image.
	- `PATCH /api/profile/email` — Update email address.
	- `PATCH /api/profile/password` — Update password.
	- `POST /api/profile/delete-account` — Delete account with confirmation.

### Updated

- `backend/src/services/authService.js`
	- Extended `sanitizeUser()` to include `displayName` and `avatarUrl` from user metadata.

- `backend/src/services/supabaseClient.js`
	- Added `createSupabaseAdminClient()` for privileged operations (account deletion, bucket management).

- `backend/src/app.js`
	- Mounted profile router at `/api/profile`.
	- Increased JSON payload limit to 5MB to accommodate base64 avatar uploads.
	- Added global error handler to map `entity.too.large` errors to friendly user message: *"Avatar file is too large. Please upload an image under 2MB."*

- `backend/package.json`
	- Already had `@supabase/supabase-js` dependency from feature/supabase.

---

## 2) Backend: Cart Persistence to Supabase

### Added

- `backend/src/services/cartService.js`
	- `getCart(userId, supabase)` — Fetch user cart items from Supabase and hydrate with Steam game details.
	- `addCartItem(userId, steamId, quantity, supabase)` — Add or increment item in cart; ensures `user_id` is included on INSERT.
	- `setCartItemQuantity(userId, steamId, quantity, supabase)` — Update item quantity or delete if quantity ≤ 0.
	- `removeCartItem(userId, steamId, supabase)` — Delete single cart item.
	- `clearCart(userId, supabase)` — Delete all cart items for user.
	- All operations scoped by authenticated `user_id` to enforce privacy.

- `backend/src/routes/cart.js`
	- `GET /api/cart` — Retrieve user's full cart with game details.
	- `POST /api/cart` — Add item to cart (body: `{ steamId, quantity }`).
	- `PATCH /api/cart/:steamId` — Update item quantity (body: `{ quantity }`).
	- `DELETE /api/cart/:steamId` — Remove single item.
	- `DELETE /api/cart` — Clear entire cart.
	- All routes authenticated via bearer token middleware.

### Updated

- `backend/src/app.js`
	- Mounted cart router at `/api/cart`.

---

## 3) Frontend: Profile Management Page

### Added

- `frontend/src/pages/Profile.jsx`
	- Full-featured profile management UI with sections for:
		- **Avatar Upload**: File input with preview, base64 conversion, image dimensions display, 2MB client-side validation.
		- **Nickname**: Text input with save button and edit mode.
		- **Email**: Text input with save button, auto-trimmed.
		- **Password**: Masked password input with save button and strength indicator.
		- **Account Deletion**: Dangerous action button with modal confirmation requiring exact text match ("delete my account").
	- Loading states, error messages, and success feedback for each action.
	- Avatar displays current user image or initials fallback.

- `frontend/src/styles/ProfilePage.css`
	- Professional profile page styling with sections, form groups, buttons, modals, and responsive design.
	- Avatar preview styling, form input styling, button states (loading, disabled, hover).
	- Modal overlay and confirmation dialog styling.

### Updated

- `frontend/src/routes/AppRoutes.jsx`
	- Added protected `/profile` route (requires authentication).

---

## 4) Frontend: Cart Persistence to Supabase

### Added

- `frontend/src/services/cartService.js`
	- `getCart(accessToken)` — Fetch cart from `/api/cart`.
	- `addToCart(accessToken, steamId, quantity)` — Add item via `POST /api/cart`.
	- `updateQuantity(accessToken, steamId, quantity)` — Update item quantity via `PATCH /api/cart/:steamId`.
	- `removeItem(accessToken, steamId)` — Remove item via `DELETE /api/cart/:steamId`.
	- `clearCart(accessToken)` — Clear all items via `DELETE /api/cart`.

### Updated

- `frontend/src/context/AuthContext.jsx`
	- Added profile management methods:
		- `updateNickname(newNickname)` — Call profile API.
		- `updateAvatar(imageFile)` — Convert file to base64, call profile API.
		- `updateEmail(newEmail)` — Call profile API.
		- `updatePassword(newPassword)` — Call profile API.
		- `deleteMyAccount(confirmationText)` — Call profile API with exact confirmation.
		- `refreshCurrentUser()` — Re-fetch current user data from session.
	- Integrated avatar URL and displayName from user metadata throughout auth flow.

- `frontend/src/services/authService.js`
	- Fixed `request()` helper to properly merge headers while preserving `Content-Type` in all requests.
	- Added profile API methods:
		- `updateNickname(token, nickname)`
		- `uploadAvatar(token, imageBase64)`
		- `updateEmail(token, email)`
		- `updatePassword(token, password)`
		- `deleteAccount(token, confirmationText)`

- `frontend/src/components/Header.jsx`
	- Displays user avatar (or initial letter fallback) linked to `/profile`.
	- Shows user's `displayName` from Supabase metadata or email fallback.
	- Cart count reads from Supabase for authenticated users, localStorage for guests.
	- Fixed self-referential hook dependency issue (changed from `[getCartCount]` to `[user]`).

- `frontend/src/components/GameCard.jsx`
	- Add-to-cart button routes to Supabase cart API for authenticated users.
	- Falls back to localStorage for guest users.
	- Dispatches `cart-updated` event for header refresh.

- `frontend/src/pages/Cart.jsx`
	- Loads cart from Supabase API for authenticated users, localStorage for guests.
	- Quantity updates and item removal call appropriate backend/storage layer.
	- Clear cart on checkout uses Supabase API for authenticated users.

- `frontend/src/pages/Checkout.jsx`
	- Calls `clearRemoteCart()` for authenticated users (Supabase API).
	- Falls back to `writeCart([])` for guest users.

- `frontend/src/pages/GameDetailPage.jsx`
	- Add-to-cart button routes to Supabase cart API for authenticated users.
	- Falls back to localStorage for guests.
	- **Refactored useEffect** to use async/await pattern instead of promise chains, eliminating React lint warning.

---

## 5) Database: Supabase Schema & Security

### Added

- `backend/seed/001_init_supabase.sql`
	- **profiles table**: Stores user profile metadata (displayName, avatarUrl, etc.).
		- Columns: `id` (uuid), `user_id` (uuid FK to auth.users), `display_name`, `avatar_url`, `created_at`, `updated_at`.
		- RLS: Authenticated users can SELECT/INSERT/UPDATE own row only.
		- Trigger: Auto-update `updated_at` on modification.
	- **cart_items table**: Stores authenticated user shopping carts.
		- Columns: `id` (uuid), `user_id` (uuid FK to auth.users), `steam_id` (int), `quantity` (int), `added_at`, `updated_at`.
		- RLS: Authenticated users can SELECT/INSERT/UPDATE/DELETE own rows only (must match `auth.uid()`).
		- Trigger: Auto-update `updated_at` on modification.
	- **avatars storage bucket**: Stores user avatar images in Supabase Storage.
		- File size limit: 2097152 bytes (2MB).
		- RLS: Public read, authenticated users can insert/update/delete files in their own folder (`uid/*`).

---

## 6) Bug Fixes & Improvements

### Bug #1: Header Merge Issue (400 Bad Request)
**Problem**: Nickname update returned 400 because `Content-Type` header was dropped when Authorization header was merged.
**Root Cause**: Request helper was overwriting headers instead of merging them.
**Fix**: Changed header merge order in `authService.js` to preserve `Content-Type`:
```javascript
const headers = {
  "Content-Type": "application/json",
  ...(options.headers ?? {}),
};
```
**Result**: Nickname updates now succeed; metadata propagates to auth context and header display.

---

### Bug #2: RLS Violation on Cart Insert (403 Forbidden)
**Problem**: Adding items to Supabase cart failed with "RLS violation" or "not authorized".
**Root Cause**: `cartService.js` was not including `user_id` in INSERT statement, so RLS policy rejected the mutation.
**Fix**: Added `user_id` to all INSERT/UPDATE/DELETE payloads:
```javascript
{ user_id: userId, steam_id: steamId, quantity, added_at: new Date().toISOString() }
```
**Result**: Cart items persist successfully for authenticated users; RLS policies now correctly validate owner-only access.

---

### Bug #3: Bucket Not Found (404)
**Problem**: First avatar upload failed with "bucket not found" because `avatars` storage bucket wasn't created.
**Root Cause**: Seed SQL wasn't executed, or bucket creation logic was missing.
**Fix**: Added `ensureAvatarBucketExists()` in `profileService.js` to auto-create bucket with admin client on first upload attempt.
**Result**: Avatar uploads work reliably; bucket is created on-demand if missing.

---

### Bug #4: Payload Too Large (413)
**Problem**: Oversized avatar (>5MB) showed generic Express error instead of user-friendly message.
**Root Cause**: No error handler to map body-parser payload-too-large errors.
**Fix**: Added global error handler in `app.js` to detect and map `entity.too.large`:
```javascript
if (err.type === "entity.too.large") {
  return res.status(413).json({
    message: "Avatar file is too large. Please upload an image under 2MB."
  });
}
```
**Result**: Users see helpful error message; frontend validation prevents most oversized uploads.

---

### Bug #5: GameDetailPage Add-to-Cart Not Persisting
**Problem**: Adding game from detail page to cart worked only in localStorage; didn't persist to Supabase for authenticated users.
**Root Cause**: GameDetailPage still used `addGameToCart` (localStorage) instead of Supabase cart API.
**Fix**: Updated `handleAddToCart()` to route authenticated users to Supabase cart API:
```javascript
if (user?.id && session?.access_token) {
  await addRemoteCartItem(session.access_token, game.id, 1);
} else {
  addGameToCart(user, game);
}
```
**Result**: Cart additions from detail page now persist to Supabase; authenticated users can add games from any page and see them in cart.

---

### Bug #6: React Lint Warning (setState in Effect)
**Problem**: GameDetailPage had lint warning about calling `setLoading` directly in promise chain within useEffect.
**Root Cause**: Promise chains calling state setters directly instead of through async callback.
**Fix**: Refactored to async/await pattern with dedicated async function inside effect:
```javascript
useEffect(() => {
  const fetchGame = async () => {
    setLoading(true);
    setError(null);
    try {
      const gameData = await fetchGameById(Number(steamId));
      setGame(gameData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  fetchGame();
}, [steamId]);
```
**Result**: Lint warning eliminated; code follows React best practices; maintainability improved.

---

## 7) Validation & Testing Performed

- ✅ Profile page renders correctly with all form sections.
- ✅ Avatar uploads successfully and displays in Header.
- ✅ Nickname updates propagate to auth context, Supabase metadata, and Header display.
- ✅ Email/password updates succeed via Supabase Auth REST.
- ✅ Account deletion requires exact confirmation text and succeeds.
- ✅ Cart items persist to Supabase for authenticated users across page reloads.
- ✅ Guest cart remains in localStorage without Supabase access.
- ✅ Add-to-cart from GameCard, GameDetailPage, and Cart page all use correct backend/storage layer.
- ✅ Cart count in Header updates dynamically when items added/removed.
- ✅ Checkout clears cart for both authenticated and guest users.
- ✅ Error messages are user-friendly and helpful.
- ✅ React build completes without lint errors.
- ✅ No unhandled promise rejections or console errors.

---

## 8) Current State

**Profile Management**:
- Complete profile page with avatar upload, nickname/email/password changes, account deletion.
- Avatar stored in Supabase Storage; metadata stored in auth + profiles table.
- User identity displayed dynamically in Header using displayName and avatar.

**Cart Persistence**:
- Authenticated users: cart persists to Supabase `public.cart_items` table via REST API.
- Guest users: cart remains in localStorage (`cart:guest`).
- Add-to-cart works consistently from GameCard, GameDetailPage, and Cart page.
- Cart count updates dynamically in Header.