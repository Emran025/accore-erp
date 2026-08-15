import { catalogMessage } from "@/lib/i18n";
import { showToast } from "@/components/ui";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { fetchAPI } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { useState } from "react";

export function SecurityTab() {
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const changePassword = async () => {
    if (!passwordData.current_password || !passwordData.new_password) {
      showToast(catalogMessage("common.general.pleaseFillAllFields"), "error");
      return;
    }

    if (passwordData.new_password !== passwordData.confirm_password) {
      showToast(catalogMessage("enterpriseCore.security.newPasswordDoesNotMatch"), "error");
      return;
    }

    if (passwordData.new_password.length < 6) {
      showToast(catalogMessage("enterpriseCore.security.passwordMustBeLeast6Characters"), "error");
      return;
    }

    try {
      await fetchAPI(API_ENDPOINTS.ENTERPRISE_CORE.IAM.USERS.CHANGE_PASSWORD, {
        method: "POST",
        body: JSON.stringify({
          current_password: passwordData.current_password,
          new_password: passwordData.new_password,
        }),
      });
      showToast(catalogMessage("enterpriseCore.security.passwordChangedSuccessfully"), "success");
      setPasswordData({ current_password: "", new_password: "", confirm_password: "" });
    } catch {
      showToast(catalogMessage("enterpriseCore.security.errorChangingPassword"), "error");
    }
  };

  return (
    <div className="sales-card">
      <h3>{catalogMessage("common.general.changePassword")}</h3>
      <div className="settings-form-narrow">
        <div className="form-group pb-0">
          <PasswordInput
            label={catalogMessage("enterpriseCore.security.currentPassword")}
            id="current_password"
            value={passwordData.current_password}
            onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
          />
        </div>
        <div className="form-group pb-0">
          <PasswordInput
            label={catalogMessage("common.general.newPassword")}
            id="new_password"
            value={passwordData.new_password}
            onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
          />
        </div>
        <div className="form-group pb-0">
          <PasswordInput
            label={catalogMessage("common.general.confirmPassword")}
            id="confirm_password"
            value={passwordData.confirm_password}
            onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
          />
        </div>
        <button className="btn btn-primary" onClick={changePassword}>
          {catalogMessage("common.general.changePassword")}</button>
      </div>
    </div>
  );
}
