# Synchronization Strategy: Keeping State in Sync

To maintain security without sacrificing performance, the accore implements a proactive synchronization strategy that ensures the frontend's local permission cache always reflects the backend's current state.

## 🕒 Periodic Revalidation (The Hourly Sync)
The system prevents "stale" permissions (where a user's access is revoked but they still have a local cache) by enforcing a 1-hour expiration.

### Logic in `checkAuth`:
1. Every time the application root or a protected route is accessed, `store.checkAuth()` is called.
2. It calculates the time elapsed since `lastSyncedAt`.
3. If `elapsed > 60 minutes`, it bypasses the local cache and performs a full network request to `/api/auth/check`.
4. This refreshes the `user` profile and `permissions` map in the background.

## ⚡ Error-Driven Synchronization (401/403 Handling)
The `fetchAPI` utility acts as an interceptor for all network traffic and handles security failures reactively.

### 401 Unauthorized:
- **Meaning**: The session token has expired or is invalid.
- **Action**: The system attempts a `checkAuth(forceSync=true)`. If this fails, the user is immediately redirected to `/auth/login`.

### 403 Forbidden:
- **Meaning**: The user attempted an action they lack permission for.
- **Action**: This often indicates that permissions have been changed by an administrator while the user was logged in.
- **Logic**: `fetchAPI` triggers a background `checkAuth(forceSync=true)` to update the local permissions. This ensures that the UI immediately updates to hide the restricted element, preventing further attempts.

## 🔑 Session Token Lifecycle
The `sessionToken` follows a similar sync pattern:
1. It is stored in `localStorage` for cross-tab persistence.
2. It is included automatically in the `X-Session-Token` header for all `fetchAPI` calls.
3. Upon any security failure response from the backend, the token is cleared, and the auth flow is re-initiated.

## 🚀 Professional Outcomes
This strategy eliminates the need for:
- Requesting permissions on every page load (improves speed).
- Manual page refreshes to see new permissions (improves UX).
- "Broken" buttons that lead to 403 errors (improves reliability).
