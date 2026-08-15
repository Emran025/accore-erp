import { catalogMessage } from "@/lib/i18n";
import { Dialog, showToast } from "@/components/ui";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/Textarea";
import { fetchAPI } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { getIcon } from "@/lib/icons";
import type { InvoiceData } from "@/lib/invoice-utils";
import { generateInvoiceHTML } from "@/lib/invoice-utils";
import { getSetting } from "@/lib/settings";
import { InvoiceSettings, StoreSettings } from "@/types";
import { useCallback, useEffect, useRef, useState } from "react";

export function InvoiceSettingsTab() {
  const [invoiceSettings, setInvoiceSettings] = useState<InvoiceSettings>({
    show_logo: true,
    show_qr: true,
    zatca_enabled: false,
    footer_text: "",
    terms_text: "",
  });

  // Need store settings for preview
  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null);

  const [previewDialog, setPreviewDialog] = useState(false);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const previewIframeRef = useRef<HTMLIFrameElement>(null);

  const loadInvoiceSettings = useCallback(async () => {
    try {
      const response = await fetchAPI(API_ENDPOINTS.ENTERPRISE_CORE.SETTINGS.INVOICE);
      if (response.settings) {
        setInvoiceSettings(response.settings as InvoiceSettings);
      }
    } catch {
      console.error(catalogMessage("text_6a1aebcf84cb"));
    }
  }, []);

  const loadStoreSettings = useCallback(async () => {
    try {
      const response = await fetchAPI(API_ENDPOINTS.ENTERPRISE_CORE.SETTINGS.STORE);
      if (response.settings) {
        setStoreSettings(response.settings as StoreSettings);
      }
    } catch {
      console.error(catalogMessage("text_e0bc163df330"));
    }
  }, []);

  useEffect(() => {
    loadInvoiceSettings();
    loadStoreSettings();
  }, [loadInvoiceSettings, loadStoreSettings]);

  const saveInvoiceSettings = async () => {
    try {
      await fetchAPI(API_ENDPOINTS.ENTERPRISE_CORE.SETTINGS.INVOICE, {
        method: "PUT",
        body: JSON.stringify(invoiceSettings),
      });
      showToast(catalogMessage("text_2870ff2cbee7"), "success");
    } catch {
      showToast(catalogMessage("text_fc7bf4aa6124"), "error");
    }
  };

  const previewInvoice = async () => {
    setIsGeneratingPreview(true);
    try {
      if (!storeSettings) {
        await loadStoreSettings(); // Ensure we have them
        if (!storeSettings) {
          showToast(catalogMessage("text_cb18d4baba17"), "error");
          return;
        }
      }

      // Get latest invoice for preview
      const invoicesResponse = await fetchAPI(`${API_ENDPOINTS.COMMERCIAL.SALES.INVOICES}?page=1&limit=1`);
      const invoices = invoicesResponse.invoices as InvoiceData[] | undefined;
      if (!invoicesResponse.success || !invoices || invoices.length === 0) {
        showToast(catalogMessage("text_df218d19d49c"), "error");
        return;
      }

      const sampleInvoice = invoices[0];
      const detailResponse = await fetchAPI(`${API_ENDPOINTS.COMMERCIAL.SALES.INVOICE_DETAILS}?id=${sampleInvoice.id}`);
      if (!detailResponse.success && !detailResponse.invoice) {
        showToast(catalogMessage("text_c260a701b5b7"), "error");
        return;
      }

      const invoice = detailResponse.invoice as InvoiceData;

      // Combine current form settings with store settings
      const settings: import("@/lib/invoice-utils").InvoiceSettings = {
        store_name: storeSettings!.store_name, // safe bang due to check above (though closure might have stale state, usually fine here or use ref/direct fetch result)
        store_address: storeSettings!.store_address,
        store_phone: storeSettings!.store_phone,
        tax_number: storeSettings!.tax_number,
        invoice_size: (invoiceSettings.show_qr ? "thermal" : "a4") as "thermal" | "a4",
        footer_message: invoiceSettings.footer_text,
        currency_symbol: getSetting("currency_symbol", catalogMessage("text_62814ade7518")),
        show_logo: invoiceSettings.show_logo,
        show_qr: invoiceSettings.show_qr,
      };

      // Generate preview HTML
      const content = await generateInvoiceHTML(invoice, settings);

      // Render in iframe
      if (previewIframeRef.current) {
        const doc = previewIframeRef.current.contentDocument || previewIframeRef.current.contentWindow?.document;
        if (doc) {
          doc.open();
          doc.write(content);
          doc.close();
        }
      }

      setPreviewDialog(true);
    } catch (error) {
      console.error(catalogMessage("text_7943d3df6962"), error);
      showToast(catalogMessage("text_d82c5b97e7f9"), "error");
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  return (
    <>
      <div className="sales-card">
        <h3>{catalogMessage("text_e217fe66e326")}</h3>
        <div className="settings-form-grid">
          <div className="form-group">
            <Checkbox
              id="show_logo"
              label={catalogMessage("text_46f631eac62e")}
              checked={invoiceSettings.show_logo}
              onChange={(e) => setInvoiceSettings({ ...invoiceSettings, show_logo: e.target.checked })}
            />
          </div>
          <div className="form-group">
            <Checkbox
              id="show_qr"
              label={catalogMessage("text_988e3c12cddd")}
              checked={invoiceSettings.show_qr}
              onChange={(e) => setInvoiceSettings({ ...invoiceSettings, show_qr: e.target.checked })}
            />
          </div>

          <div style={{ marginTop: "2rem", paddingTop: "1rem", borderTop: "1px dashed var(--border-color)" }}>
            <h4 style={{ marginBottom: "1rem", color: "var(--text-primary)" }}>{catalogMessage("text_8a0b1f3c26b5")}</h4>
            <div className="form-group">
              <div className="checkbox-group" style={{
                borderRight: "4px solid #10b981",
                transform: "none",
                background: invoiceSettings.zatca_enabled ? "var(--bg-secondary)" : "transparent",
                padding: "1rem",
                borderRadius: "8px",
                transition: "all 0.3s ease",
                display: "flex", // Checkbox component is inline-flex, wrap it 
                alignItems: "flex-start",
                gap: "10px"
              }}>
                <Checkbox
                  id="zatca_enabled"
                  checked={invoiceSettings.zatca_enabled}
                  onChange={(e) => setInvoiceSettings({ ...invoiceSettings, zatca_enabled: e.target.checked })}
                  style={{ marginTop: "4px" }}
                />
                <div>
                  <label htmlFor="zatca_enabled" style={{ fontWeight: 600, display: "block", cursor: "pointer" }}>{catalogMessage("text_4241d4bf5648")}</label>
                  <p style={{ marginTop: "0.25rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                    {catalogMessage("text_0a0739dfd25c")}<br />
                    <span style={{ fontSize: "0.8rem", opacity: 0.8 }}>{catalogMessage("text_ef249c970127")}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="form-group full-width">
            <Textarea
              label={catalogMessage("text_679cb585cd6b")}
              id="footer_text"
              value={invoiceSettings.footer_text}
              onChange={(e) => setInvoiceSettings({ ...invoiceSettings, footer_text: e.target.value })}
              rows={2}
            />
          </div>
          <div className="form-group full-width">
            <Textarea
              label={catalogMessage("text_370b1e9cba0a")}
              id="terms_text"
              value={invoiceSettings.terms_text}
              onChange={(e) => setInvoiceSettings({ ...invoiceSettings, terms_text: e.target.value })}
              rows={3}
            />
          </div>
        </div>
        <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
          <button className="btn btn-secondary" onClick={previewInvoice} disabled={isGeneratingPreview}>
            {isGeneratingPreview ? catalogMessage("text_ceac78d7f5d3") : catalogMessage("text_b30abc9f9eae")}
          </button>
          <button className="btn btn-primary" onClick={saveInvoiceSettings}>
            {catalogMessage("text_9b70c9af5cbd")}</button>
        </div>
      </div>

      {/* Invoice Preview Dialog */}
      <Dialog
        isOpen={previewDialog}
        onClose={() => setPreviewDialog(false)}
        title={catalogMessage("text_b30abc9f9eae")}
        maxWidth="900px"
        footer={
          <>
            <button
              className="btn btn-secondary"
              onClick={() => {
                if (previewIframeRef.current?.contentWindow) {
                  previewIframeRef.current.contentWindow.focus();
                  previewIframeRef.current.contentWindow.print();
                }
              }}
            >
              {getIcon("print")} {catalogMessage("text_2e00e00acffe")}</button>
            <button className="btn btn-primary" onClick={() => setPreviewDialog(false)}>
              {catalogMessage("text_ca90c297b099")}</button>
          </>
        }
      >
        <div style={{ position: "relative", background: "#e2e8f0", padding: "1rem", borderRadius: "8px", height: "70vh", overflow: "auto" }}>
          <iframe
            ref={previewIframeRef}
            style={{
              width: "100%",
              height: "100%",
              border: "none",
              background: "white",
              borderRadius: "4px",
            }}
            title={catalogMessage("text_178147261084")}
          />
        </div>
      </Dialog>
    </>
  );
}
