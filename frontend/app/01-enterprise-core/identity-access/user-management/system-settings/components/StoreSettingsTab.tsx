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
      console.error(catalogMessage("text_79878ac752cf"));
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
      showToast(catalogMessage("text_a0ba28b2b84e"), "success");
    } catch {
      showToast(catalogMessage("text_fc7bf4aa6124"), "error");
    }
  };

  return (
    <div className="sales-card">
      <h3>{catalogMessage("text_e11ec54f7103")}</h3>
      <div className="settings-form-grid">
        <div className="form-group pb-0">
          <TextInput
            label={catalogMessage("text_a9ac0e475f40")}
            id="store_name"
            value={storeSettings.store_name}
            onChange={(e) => setStoreSettings({ ...storeSettings, store_name: e.target.value })}
          />
        </div>
        <div className="form-group pb-0">
          <TextInput
            label={catalogMessage("text_42095a7a6c15")}
            type="tel"
            id="store_phone"
            value={storeSettings.store_phone}
            onChange={(e) => setStoreSettings({ ...storeSettings, store_phone: e.target.value })}
          />
        </div>
        <div className="form-group pb-0">
          <TextInput
            label={catalogMessage("text_ddf0fca39a4f")}
            type="email"
            id="store_email"
            value={storeSettings.store_email}
            onChange={(e) => setStoreSettings({ ...storeSettings, store_email: e.target.value })}
          />
        </div>
        <div className="form-group pb-0">
          <TextInput
            label={catalogMessage("text_74b3eeb4b88d")}
            id="tax_number"
            value={storeSettings.tax_number}
            onChange={(e) => setStoreSettings({ ...storeSettings, tax_number: e.target.value })}
          />
        </div>
        <div className="form-group pb-0">
          <TextInput
            label={catalogMessage("text_5f7b0c338fde")}
            id="cr_number"
            value={storeSettings.cr_number}
            onChange={(e) => setStoreSettings({ ...storeSettings, cr_number: e.target.value })}
          />
        </div>
        <div className="form-group full-width pb-0">
          <Textarea
            label={catalogMessage("text_2d110e56d5f5")}
            id="store_address"
            value={storeSettings.store_address}
            onChange={(e) => setStoreSettings({ ...storeSettings, store_address: e.target.value })}
            rows={2}
          />
        </div>
      </div>
      <button className="btn btn-primary" onClick={saveStoreSettings}>
        {catalogMessage("text_9b70c9af5cbd")}</button>
    </div>
  );
}
