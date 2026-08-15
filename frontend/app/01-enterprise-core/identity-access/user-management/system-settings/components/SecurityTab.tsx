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
      showToast(catalogMessage("text_ee5bf2016153"), "error");
      return;
    }

    if (passwordData.new_password !== passwordData.confirm_password) {
      showToast(catalogMessage("text_7b9a263c5b94"), "error");
      return;
    }

    if (passwordData.new_password.length < 6) {
      showToast(catalogMessage("text_ae978b4b01fd"), "error");
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
      showToast(catalogMessage("text_650866f7dbd3"), "success");
      setPasswordData({ current_password: "", new_password: "", confirm_password: "" });
    } catch {
      showToast(catalogMessage("text_b6e296a55e3f"), "error");
    }
  };

  return (
    <div className="sales-card">
      <h3>{catalogMessage("text_473bcc4e9b46")}</h3>
      <div className="settings-form-narrow">
        <div className="form-group pb-0">
          <PasswordInput
            label={catalogMessage("text_e4f0784fe844")}
            id="current_password"
            value={passwordData.current_password}
            onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
          />
        </div>
        <div className="form-group pb-0">
          <PasswordInput
            label={catalogMessage("text_202b9814ea8b")}
            id="new_password"
            value={passwordData.new_password}
            onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
          />
        </div>
        <div className="form-group pb-0">
          <PasswordInput
            label={catalogMessage("text_57e87f00ead1")}
            id="confirm_password"
            value={passwordData.confirm_password}
            onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
          />
        </div>
        <button className="btn btn-primary" onClick={changePassword}>
          {catalogMessage("text_473bcc4e9b46")}</button>
      </div>
    </div>
  );
}
