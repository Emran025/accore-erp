# Backend Security: The Second Firewall

The backend provides the authoritative enforcement layer for all system operations. No data can be retrieved or modified without passing through the Role-Based Access Control (RBAC) service.

## 🗄️ Module Definition (`ModuleSeeder.php`)
The ground truth for the system's structure is defined in the `ModuleSeeder`.
- **Module Keys**: Unique identifiers used by both frontend and backend (e.g., `general_ledger`, `vat_zatca`).
- **Classification**: Modules are categorized (system, finance, hr, etc.) to help organize the UI.
- **Active Status**: Modules can be toggled via the `is_active` flag to disable features system-wide.

## 🛡️ Permission Service (`PermissionService.php`)
This service encapsulates the logic for loading and verifying permissions.

### Loading Permissions:
When a user logs in, `loadPermissions($roleId)` is called:
1. It joins `role_permissions` with the `modules` table.
2. It constructs a map where each key is a `module_key` and values are boolean flags for `view`, `create`, `edit`, and `delete`.
3. **Admin Elevation**: If the user's role key is `admin`, a wildcard `*` entry is added with all permissions enabled.

### Verification (`can` method):
The service checks the session-stored permissions:
- First, it checks for the `*` wildcard.
- Second, it checks the specific `module_key`.
- If neither grants access to the requested action, it returns `false`.

## 🧱 Authorization Middleware (`CheckPermission.php`)
The ultimate security layer is the `CheckPermission` middleware, which acts as a "firewall" for API endpoints.

### Usage in Routes:
```php
Route::middleware(['auth:api', 'permission:sales,create'])->post('/invoices', [InvoiceController::class, 'store']);
```

### Logic:
1. It receives the required module and action as parameters.
2. It calls `PermissionService::can($module, $action)`.
3. If denied, it immediately returns a **403 Forbidden** JSON response.

## 📂 Data Integrity
The backend ensures that `ModuleSeeder` and `PermissionService` are the only places where authorization logic is defined, preventing "security through obscurity" and ensuring that even if a user bypasses the frontend UI, their API requests will be rejected.
