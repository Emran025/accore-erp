# Authentication & Permissions System: Overview

## 🔐 Mission Statement
The accore ERP utilizes a multi-layered security architecture designed to provide a seamless user experience while maintaining rigorous server-side enforcement. The system ensures that users only see and interact with modules they are authorized to access, while protecting every API endpoint with a background "firewall" layer.

## 🏗️ Core Strategy
The system operates on an "Authoritative Backend, Intelligent Frontend" model:

1.  **Centralized Definition**: All modules and base permissions are defined in the backend (`ModuleSeeder.php`).
2.  **State Synchronization**: Upon login, the user's specific permissions are retrieved and stored securely on the client.
3.  **UI Pruning**: The frontend uses the stored permissions to filter the navigation sidebar, preventing unauthorized pages or folders from even appearing in the interface.
4.  **Second Firewall**: Regardless of frontend visibility, every backend request is validated against the user's current session permissions.
5.  **Reactive Recovery**: If permissions change or a session becomes invalid, the system automatically triggers a background synchronization or redirects the user to re-authenticate.

## 🔄 Lifecycle of a Session

### 1. Initialization (Login)
- User provides credentials via the Login page.
- Backend validates credentials and generates a session token.
- Backend returns User Profile + Comprehensive Permission Map.
- Frontend stores this in `localStorage` and the `useAuthStore` (Zustand).

### 2. Operation (Active Session)
- **Navigation**: The sidebar dynamically filters links based on `can_view` permissions.
- **Action Guards**: Buttons (Create, Edit, Delete) are conditionally rendered based on specific permission flags.
- **Request Injection**: Every API call via `fetchAPI` includes the session token in the `X-Session-Token` header.

### 3. Maintenance (Synchronization)
- **Stale Check**: Every hour, the frontend re-validates the session with the backend to catch any permission updates.
- **Error Trigger**: Any 401 (Unauthorized) or 403 (Forbidden) response from the API immediately triggers a "Force Sync" to refresh local state.

## 📋 Key Technical Files
- **Frontend**:
    - `frontend/stores/useAuthStore.ts`: Central state management.
    - `frontend/lib/auth.ts`: Permission utility functions.
    - `frontend/lib/api.ts`: Request interceptor and 401 handling.
- **Backend**:
    - `backend/app/Services/PermissionService.php`: RBAC logic.
    - `backend/app/Http/Middleware/CheckPermission.php`: Security middleware.
    - `backend/database/seeders/ModuleSeeder.php`: Master module manifest.
