import { catalogMessage } from "@/lib/i18n";
import { ConfirmDialog, Dialog, showToast } from "@/components/ui";
import { Checkbox } from "@/components/ui/checkbox";
import { fetchAPI } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { getIcon } from "@/lib/icons";
import { useCallback, useEffect, useState } from "react";
import { ModuleData, Role, RolePermission } from "@/types";

export function RolesTab() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [roleDialog, setRoleDialog] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [deleteRoleId, setDeleteRoleId] = useState<number | null>(null);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDescription, setNewRoleDescription] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Modules state
  const [modulesByCategory, setModulesByCategory] = useState<Record<string, ModuleData[]>>({});
  const [flatModules, setFlatModules] = useState<ModuleData[]>([]);

  const loadRoles = useCallback(async () => {
    try {
      const response = await fetchAPI(`${API_ENDPOINTS.ENTERPRISE_CORE.IAM.USERS.ROLES}?action=roles`);
      if (response.data && Array.isArray(response.data)) {
        // Map backend fields to frontend Role interface
        const mappedRoles = response.data.map((r: any) => ({
          id: r.id,
          role_name_en: r.role_name_en || r.role_key,
          role_name_ar: r.role_name_ar || r.role_key,
          description: r.description,
          permissions: [] // Will be loaded on selection
        }));
        setRoles(mappedRoles);
      }
    } catch {
      console.error(catalogMessage("text_2f4a55a67cba"));
    }
  }, []);

  const loadModules = useCallback(async () => {
    try {
      const response = await fetchAPI(`${API_ENDPOINTS.ENTERPRISE_CORE.IAM.USERS.ROLES}?action=modules`);
      if (response.data) {
        // response.data is grouped by category: { "sales": [...], "inventory": [...] }
        setModulesByCategory(response.data as Record<string, ModuleData[]>);

        const flat: ModuleData[] = [];
        Object.values(response.data).forEach((categoryModules: any) => {
          flat.push(...categoryModules);
        });
        setFlatModules(flat);
      }
    } catch {
      console.error(catalogMessage("text_dc96f19b9ad6"));
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await Promise.all([loadRoles(), loadModules()]);
      setIsLoading(false);
    };
    init();
  }, [loadRoles, loadModules]);

  const selectRole = async (role: Role) => {
    setSelectedRole(role);
    try {
      const response = await fetchAPI(`${API_ENDPOINTS.ENTERPRISE_CORE.IAM.USERS.ROLES}?action=role_permissions&role_id=${role.id}`);
      if (response.data && Array.isArray(response.data)) {
        const mappedPermissions: RolePermission[] = response.data.map((p: any) => ({
          module: p.module_key,
          can_view: Boolean(Number(p.can_view)),
          can_create: Boolean(Number(p.can_create)),
          can_edit: Boolean(Number(p.can_edit)),
          can_delete: Boolean(Number(p.can_delete)),
        }));
        setSelectedRole({ ...role, permissions: mappedPermissions });
      }
    } catch {
      showToast(catalogMessage("text_f26313c4a1ea"), "error");
    }
  };

  const updateRolePermission = (moduleName: string, field: keyof RolePermission, value: boolean) => {
    if (!selectedRole) return;

    const currentPermissions = Array.isArray(selectedRole.permissions) ? selectedRole.permissions : [];
    const updatedPermissions = [...currentPermissions];
    const permIndex = updatedPermissions.findIndex((p) => p.module === moduleName);

    if (permIndex >= 0) {
      updatedPermissions[permIndex] = { ...updatedPermissions[permIndex], [field]: value };
    } else {
      updatedPermissions.push({
        module: moduleName,
        can_view: field === "can_view" ? value : false,
        can_create: field === "can_create" ? value : false,
        can_edit: field === "can_edit" ? value : false,
        can_delete: field === "can_delete" ? value : false,
      });
    }

    setSelectedRole({ ...selectedRole, permissions: updatedPermissions });
  };

  const saveRolePermissions = async () => {
    if (!selectedRole || !Array.isArray(selectedRole.permissions)) return;

    try {
      await fetchAPI(`${API_ENDPOINTS.ENTERPRISE_CORE.IAM.USERS.ROLES}?action=update_permissions`, {
        method: "POST",
        body: JSON.stringify({
          role_id: selectedRole.id,
          permissions: (selectedRole.permissions || []).map(p => {
            const moduleInfo = flatModules.find((m) => m.module_key === p.module);
            return {
              module_id: moduleInfo?.id,
              can_view: p.can_view ? 1 : 0,
              can_create: p.can_create ? 1 : 0,
              can_edit: p.can_edit ? 1 : 0,
              can_delete: p.can_delete ? 1 : 0
            };
          }).filter(p => p.module_id)
        }),
      });
      showToast(catalogMessage("text_a046b13e1447"), "success");
      loadRoles();
    } catch {
      showToast(catalogMessage("text_510af2350e99"), "error");
    }
  };

  const openCreateRoleDialog = () => {
    setNewRoleName("");
    setNewRoleDescription("");
    setRoleDialog(true);
  };

  const createRole = async () => {
    if (!newRoleName.trim()) {
      showToast(catalogMessage("text_c2ca8269b7a1"), "error");
      return;
    }

    try {
      await fetchAPI(API_ENDPOINTS.ENTERPRISE_CORE.IAM.USERS.ROLES, {
        method: "POST",
        body: JSON.stringify({ name: newRoleName, description: newRoleDescription }),
      });
      showToast(catalogMessage("text_dcf9efdf04a9"), "success");
      setRoleDialog(false);
      loadRoles();
    } catch {
      showToast(catalogMessage("text_17e521548a3d"), "error");
    }
  };

  const confirmDeleteRole = (roleId: number) => {
    setDeleteRoleId(roleId);
    setConfirmDialog(true);
  };

  const deleteRole = async () => {
    if (!deleteRoleId) return;

    try {
      await fetchAPI(API_ENDPOINTS.ENTERPRISE_CORE.IAM.USERS.ROLES_WITH_ID(deleteRoleId), { method: "DELETE" });
      showToast(catalogMessage("text_a0c01a231019"), "success");
      if (selectedRole?.id === deleteRoleId) {
        setSelectedRole(null);
      }
      loadRoles();
    } catch {
      showToast(catalogMessage("text_b321ee20d42f"), "error");
    }
  };

  const getPermissionValue = (moduleName: string, field: keyof RolePermission): boolean => {
    if (!selectedRole || !Array.isArray(selectedRole.permissions)) return false;
    const perm = selectedRole.permissions.find((p) => p.module === moduleName);
    return perm ? (perm[field] as boolean) : false;
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      dashboard: catalogMessage("text_336496c4f685"),
      sales: catalogMessage("text_7bf1b13416bc"),
      inventory: catalogMessage("text_a0e7c1b2423d"),
      purchases: catalogMessage("text_2a14f93caa32"),
      finance: catalogMessage("text_66fe73615494"),
      hr: catalogMessage("text_6c30b5a7d30b"),
      reports: catalogMessage("text_2157b1313ba3"),
      system: catalogMessage("text_df8d4a3bd114"),
      users: catalogMessage("text_b378cbffd5df")
    };
    return labels[category] || category;
  };

  return (
    <>
      <div className="roles-container">
        {/* Roles List */}
        <div className="roles-list-card">
          <div className="section-header" style={{ padding: "1.25rem", borderBottom: "1px solid var(--border-color)" }}>
            <h3>{catalogMessage("text_5130f6cf7138")}</h3>
            <button
              className="btn btn-primary btn-sm"
              onClick={openCreateRoleDialog}
            >
              {getIcon("plus")} {catalogMessage("text_9d45d2b81af0")}</button>
          </div>
          <div className="roles-list" id="rolesList">
            {isLoading ? (
              <div className="empty-state">
                <i className="fas fa-spinner fa-spin"></i>
                <p>{catalogMessage("text_6815ab379ae7")}</p>
              </div>
            ) : roles.length === 0 ? (
              <div className="empty-state">
                <p>{catalogMessage("text_e64436a59a4c")}</p>
              </div>
            ) : (
              roles.map((role) => (
                <div
                  key={role.id}
                  className={`role-item ${selectedRole?.id === role.id ? "active" : ""}`}
                  onClick={() => selectRole(role)}
                >
                  <div className="role-info">
                    <h4>
                      {role.role_name_en}
                      {/* Add system badge if needed, though interface doesn't strictly have is_system yet */}
                      {role.role_name_en === 'admin' && <span className="badge-system">{catalogMessage("text_c339ab0ce05e")}</span>}
                    </h4>
                    <p>{role.description || catalogMessage("text_00a8639676a3")}</p>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    {role.role_name_en !== "admin" && (
                      <button
                        className="icon-btn delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          confirmDeleteRole(role.id);
                        }}
                        title={catalogMessage("text_ea1097a04257")}
                      >
                        {/* SVG trash icon usually, assuming getIcon returns SVG or we use FA */}
                        <i className="fas fa-trash"></i>
                      </button>
                    )}
                    <i className="fas fa-chevron-left" style={{ opacity: 0.5 }}></i>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Permissions Grid */}
        <div className="permissions-card">
          {!selectedRole ? (
            <div className="empty-state" style={{ height: "100%", justifyContent: "center", alignItems: "center" }}>
              <i className="fas fa-shield-halved" style={{ fontSize: "4rem", marginBottom: "1.5rem", color: "var(--primary-light)", opacity: 0.3 }}></i>
              <h3>{catalogMessage("text_756905c965f6")}</h3>
              <p>{catalogMessage("text_40bc2355cf04")}</p>
            </div>
          ) : (
            <>
              <div className="section-header" style={{ padding: "1.25rem", borderBottom: "1px solid var(--border-color)" }}>
                <div className="title-with-icon">
                  <i className="fas fa-user-tag text-primary" style={{ fontSize: "1.5rem" }}></i>
                  <div>
                    <h3 style={{ margin: 0 }}>{selectedRole.role_name_en}</h3>
                    <p className="text-muted" style={{ margin: 0, fontSize: "0.85rem" }}>
                      {selectedRole.description || catalogMessage("text_00a8639676a3")}
                    </p>
                  </div>
                </div>
                <div className="header-actions">
                  <button className="btn btn-primary btn-sm" onClick={saveRolePermissions}>
                    <i className="fas fa-save"></i> {catalogMessage("text_9b70c9af5cbd")}</button>
                </div>
              </div>

              <div className="permissions-grid">
                {Object.entries(modulesByCategory).map(([category, modules]) => (
                  <div key={category} className="permission-group">
                    <div className="group-title">
                      {getCategoryLabel(category)}
                    </div>
                    {modules.map((module) => (
                      <div key={module.module_key} className="module-row">
                        <div className="module-name">{module.module_name_ar || module.module_name_ar}</div>
                        <div className="actions-grid">
                          <Checkbox
                            label={catalogMessage("text_3824e18ca83b")}
                            checked={getPermissionValue(module.module_key, "can_view")}
                            onChange={(e) => updateRolePermission(module.module_key, "can_view", e.target.checked)}
                          />
                          <Checkbox
                            label={catalogMessage("text_d52453ac627d")}
                            checked={getPermissionValue(module.module_key, "can_create")}
                            onChange={(e) => updateRolePermission(module.module_key, "can_create", e.target.checked)}
                          />
                          <Checkbox
                            label={catalogMessage("text_113d570d6555")}
                            checked={getPermissionValue(module.module_key, "can_edit")}
                            onChange={(e) => updateRolePermission(module.module_key, "can_edit", e.target.checked)}
                          />
                          <Checkbox
                            label={catalogMessage("text_59ca629220a6")}
                            checked={getPermissionValue(module.module_key, "can_delete")}
                            onChange={(e) => updateRolePermission(module.module_key, "can_delete", e.target.checked)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Create Role Dialog */}
      <Dialog
        isOpen={roleDialog}
        onClose={() => setRoleDialog(false)}
        title={catalogMessage("text_018134366c74")}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setRoleDialog(false)}>
              {catalogMessage("text_9a30dc2a96b8")}</button>
            <button className="btn btn-primary" onClick={createRole}>
              {catalogMessage("text_a820f3590d36")}</button>
          </>
        }
      >
        <div className="form-group">
          <label htmlFor="role_name">{catalogMessage("text_aeac08f55546")}</label>
          <input
            type="text"
            id="role_name"
            value={newRoleName}
            onChange={(e) => setNewRoleName(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="role_description">{catalogMessage("text_95023fc76e1b")}</label>
          <textarea
            id="role_description"
            value={newRoleDescription}
            onChange={(e) => setNewRoleDescription(e.target.value)}
            rows={2}
          />
        </div>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog}
        onClose={() => setConfirmDialog(false)}
        onConfirm={deleteRole}
        title={catalogMessage("text_5f9cb54dc136")}
        message={catalogMessage("text_8b195ef47c2d")}
        confirmText={catalogMessage("text_59ca629220a6")}
        confirmVariant="danger"
      />
    </>
  );
}
