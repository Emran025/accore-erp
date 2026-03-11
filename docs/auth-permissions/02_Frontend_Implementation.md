# Frontend Implementation: Permissions & UI Filtering

The frontend implementation focuses on performance and user experience by minimizing backend round-trips for permission checks while ensuring a responsive interface.

## 🧠 State Management (`useAuthStore.ts`)
The `useAuthStore` (built with Zustand) is the source of truth for the local application state.

### Key State Properties:
- `user`: The authenticated user object profile.
- `permissions`: An array of `Permission` objects, each defining access for a specific module.
- `isAuthenticated`: Boolean flag for quick login checks.
- `lastSyncedAt`: Timestamp of the last successful backend sync.

### Persistence:
The store uses `zustand/middleware/persist` to save state to `localStorage`. This allows the user to refresh the page without losing their session or permissions, enabling an instant UI render.

## 🛠️ Permission Utilities (`lib/auth.ts`)
A set of helper functions provide standard logic for checking access throughout the component tree.

### `canAccess(module, action)`
The primary function used in components to determine visibility or interactivity.
- **Actions**: `view`, `create`, `edit`, `delete`.
- **Wildcard Support**: If a user has a permission entry for `*`, they are granted access to all actions for all modules (typically for system admins).

### `getSidebarLinks(permissions)`
Used by the `SideNavigationBar` to filter the menu tree. 
- It iterates through all defined navigation groups.
- It omits any link where the user lacks the `view` permission for the associated module.
- This ensures that unauthorized "folders" and "pages" are hidden from the user entirely.

## 🧱 Component-Level Guards
Developers should use the `useAuthStore` to guard specific UI elements:

```tsx
const { canAccess } = useAuthStore();

// Guarding a "Create" button
{canAccess('sales', 'create') && (
  <Button onClick={handleCreate}>Add Invoice</Button>
)}

// Guarding a whole section
if (!canAccess('hr', 'view')) {
  return <AccessDenied />;
}
```

## 📂 Multi-Level Filtering
The filtering logic is applied at multiple levels in the directory-based navigation:
1. **Modules**: Top-level logical blocks (e.g., Sales, HR).
2. **Feature Groups**: Groupings within a module.
3. **Screens**: Individual pages/routes.

If a user lacks permission for a Screen, only that screen is hidden. If they lack permission for all screens within a Feature Group, the entire Group heading is removed from the navigation.
