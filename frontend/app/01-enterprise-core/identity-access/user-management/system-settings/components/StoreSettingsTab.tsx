import { catalogMessage } from "@/lib/i18n";
import { showToast } from "@/components/ui";
import { TextInput } from "@/components/ui/TextInput";
import { Textarea } from "@/components/ui/Textarea";
import { fetchAPI } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { StoreSettings } from "@/types";
import { useCallback, useEffect, useState } from "react";

/**
 * Store Settings Configuration Tab.
 * Manages core business information including store name, contact details,
 * tax registration number (VAT), and commercial registration (CR) number.
 * 
 * Settings are persisted via the Settings API and used across invoices,
 * reports, and ZATCA e-invoicing integration.
 * 
 * @returns The StoreSettingsTab component
 */
export function StoreSettingsTab() {
  const [storeSettings, setStoreSettings] = useState<StoreSettings>({
    store_name: "",
    store_address: "",
    store_phone: "",
    store_email: "",
    tax_number: "",
    cr_number: "",
  });

  const loadStoreSettings = useCallback(async () => {
    try {
      const response = await fetchAPI(API_ENDPOINTS.ENTERPRISE_CORE.SETTINGS.STORE);
      if (response.settings) {
        setStoreSettings(response.settings as StoreSettings);
      }
    } catch {
      console.error(catalogMessage("enterpriseCore.storesettings.errorLoadingStoreSettings"));
    }
  }, []);

  useEffect(() => {
    loadStoreSettings();
  }, [loadStoreSettings]);

  const saveStoreSettings = async () => {
    try {
      await fetchAPI(API_ENDPOINTS.ENTERPRISE_CORE.SETTINGS.STORE, {
        method: "PUT",
        body: JSON.stringify(storeSettings),
      });
      showToast(catalogMessage("enterpriseCore.storesettings.storeSettingsSaved"), "success");
    } catch {
      showToast(catalogMessage("common.general.errorSavingSettings"), "error");
    }
  };

  return (
    <div className="sales-card">
      <h3>{catalogMessage("common.general.storeInformation")}</h3>
      <div className="settings-form-grid">
        <div className="form-group pb-0">
          <TextInput
            label={catalogMessage("enterpriseCore.storesettings.storeName")}
            id="store_name"
            value={storeSettings.store_name}
            onChange={(e) => setStoreSettings({ ...storeSettings, store_name: e.target.value })}
          />
        </div>
        <div className="form-group pb-0">
          <TextInput
            label={catalogMessage("common.general.phoneNumber")}
            type="tel"
            id="store_phone"
            value={storeSettings.store_phone}
            onChange={(e) => setStoreSettings({ ...storeSettings, store_phone: e.target.value })}
          />
        </div>
        <div className="form-group pb-0">
          <TextInput
            label={catalogMessage("common.general.email")}
            type="email"
            id="store_email"
            value={storeSettings.store_email}
            onChange={(e) => setStoreSettings({ ...storeSettings, store_email: e.target.value })}
          />
        </div>
        <div className="form-group pb-0">
          <TextInput
            label={catalogMessage("common.general.taxNumber")}
            id="tax_number"
            value={storeSettings.tax_number}
            onChange={(e) => setStoreSettings({ ...storeSettings, tax_number: e.target.value })}
          />
        </div>
        <div className="form-group pb-0">
          <TextInput
            label={catalogMessage("enterpriseCore.storesettings.commercialRegistration")}
            id="cr_number"
            value={storeSettings.cr_number}
            onChange={(e) => setStoreSettings({ ...storeSettings, cr_number: e.target.value })}
          />
        </div>
        <div className="form-group full-width pb-0">
          <Textarea
            label={catalogMessage("common.general.title")}
            id="store_address"
            value={storeSettings.store_address}
            onChange={(e) => setStoreSettings({ ...storeSettings, store_address: e.target.value })}
            rows={2}
          />
        </div>
      </div>
      <button className="btn btn-primary" onClick={saveStoreSettings}>
        {catalogMessage("common.general.saveChanges.alternative2")}</button>
    </div>
  );
}
