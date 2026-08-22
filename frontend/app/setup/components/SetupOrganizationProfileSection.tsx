"use client";

import { Button, Input, SearchableSelect, SegmentedToggle } from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import { SetupField } from "./SetupField";
import { SetupSection } from "./SetupSection";
import type { OrganizationProfile, OrganizationSize, OrganizationTemplate, SelectOption } from "../types";

type ProfileDraft = Omit<OrganizationProfile, "industry" | "inventory_enabled" | "applied_at" | "created_nodes">;

interface SetupOrganizationProfileSectionProps {
  templates: OrganizationTemplate[];
  selectedTemplateKey: string;
  draft: ProfileDraft;
  currencyOptions: SelectOption[];
  calendarOptions: SelectOption[];
  isSaving: boolean;
  isApplied: boolean;
  canApply: boolean;
  onTemplateChange: (templateKey: string) => void;
  onChange: (changes: Partial<ProfileDraft>) => void;
  onSave: () => void;
  onApply: () => void;
}

const sizeOptions: { value: OrganizationSize; ar: string; en: string }[] = [
  { value: "micro", ar: "متناهية الصغر", en: "Micro" },
  { value: "small", ar: "صغيرة", en: "Small" },
  { value: "medium", ar: "متوسطة", en: "Medium" },
  { value: "enterprise", ar: "كبيرة / مؤسسية", en: "Enterprise" },
];

const generatedStructureLabels: Record<string, { ar: string; en: string }> = {
  CLIENT: { ar: "العميل المؤسسي", en: "Enterprise client" },
  COMP_CODE: { ar: "المنشأة القانونية", en: "Legal company" },
  CONTROLLING_AREA: { ar: "النطاق الرقابي", en: "Controlling scope" },
  COST_CENTER: { ar: "مركز التكلفة", en: "Cost center" },
  PROFIT_CENTER: { ar: "مركز الربح", en: "Profit center" },
  PLANT: { ar: "المتجر أو الفرع", en: "Store or site" },
  STORAGE_LOC: { ar: "مخزون الموقع", en: "Site inventory" },
  PURCH_ORG: { ar: "مشتريات المنشأة", en: "Company purchasing" },
  SALES_ORG: { ar: "مبيعات المنشأة", en: "Company sales" },
};

function normalizeCode(value: string): string {
  return value.toUpperCase().replace(/\s+/g, "-");
}

export function SetupOrganizationProfileSection({
  templates,
  selectedTemplateKey,
  draft,
  currencyOptions,
  calendarOptions,
  isSaving,
  isApplied,
  canApply,
  onTemplateChange,
  onChange,
  onSave,
  onApply,
}: SetupOrganizationProfileSectionProps) {
  const { locale } = useI18n();
  const isArabic = locale === "ar-SA";
  const selectedTemplate = templates.find((template) => template.key === selectedTemplateKey) ?? null;
  const requiresInventory = selectedTemplate?.requires_inventory === true;
  const templateLabel = (template: OrganizationTemplate) => isArabic ? template.label_ar : template.label_en;
  const sizeLabels = sizeOptions.map((option) => ({ value: option.value, label: isArabic ? option.ar : option.en }));
  const generatedLabels = selectedTemplate?.generated_types.map((type) =>
    generatedStructureLabels[type]?.[isArabic ? "ar" : "en"] ?? type,
  ) ?? [];

  return (
    <SetupSection
      id="setup-organization-profile"
      title={isArabic ? "ابدأ بنموذج عملك" : "Start with your business model"}
      description={isArabic
        ? "اختر النموذج الأقرب إلى عملك ثم أدخل معلومات المنشأة الأساسية. سيُنشئ النظام الهيكل التقني المناسب في الخلفية، دون أن يطلب منك التعامل مع مصطلحات ERP المتخصصة."
        : "Choose the model closest to your business, then provide the essential company details. The system creates the appropriate technical structure in the background."}
    >
      <section className="setup-profile-block" aria-labelledby="setup-template-choice-heading">
        <div className="setup-profile-heading">
          <span className="setup-profile-step">1</span>
          <div>
            <h3 id="setup-template-choice-heading">{isArabic ? "اختر طريقة عمل المنشأة" : "Choose how the business operates"}</h3>
            <p>{isArabic ? "يمكنك إضافة الفروع والقنوات وفرق المبيعات لاحقًا، ولا تحتاج إلى تعريفها عند البداية." : "Branches, channels, and sales teams can be added later; they are not required at the start."}</p>
          </div>
        </div>
        <div className="setup-template-grid" aria-label={isArabic ? "القوالب التنظيمية" : "Organization templates"}>
          {templates.map((template) => {
            const active = template.key === selectedTemplateKey;
            return (
              <button
                key={template.key}
                type="button"
                className={`setup-template-card ${active ? "is-selected" : ""}`}
                aria-pressed={active}
                onClick={() => onTemplateChange(template.key)}
                disabled={isApplied}
              >
                <strong>{templateLabel(template)}</strong>
                <span>{isArabic ? template.description_ar : template.label_en}</span>
                <small>{template.requires_inventory
                  ? (isArabic ? "يتضمن موقعًا ومخزونًا" : "Includes a site and inventory")
                  : (isArabic ? "لا يفرض مخزونًا" : "Does not require inventory")}</small>
              </button>
            );
          })}
        </div>
      </section>

      <section className="setup-profile-block" aria-labelledby="setup-company-details-heading">
        <div className="setup-profile-heading">
          <span className="setup-profile-step">2</span>
          <div>
            <h3 id="setup-company-details-heading">{isArabic ? "أدخل بيانات المنشأة" : "Enter company details"}</h3>
            <p>{isArabic ? "الحقول ذات الرمز * مطلوبة لتأسيس الهيكل الأول. يتكيف اتجاه الكتابة مع لغة النص الذي تدخله." : "Fields marked with * are needed to establish the first structure. Text direction follows the language you type."}</p>
          </div>
        </div>
        <div className="settings-form-grid setup-form-grid">
          <SetupField id="setup-organization-size" label={isArabic ? "حجم المنشأة" : "Organization size"} required>
            <SegmentedToggle
              value={draft.organization_size}
              options={sizeLabels}
              onChange={(value) => onChange({ organization_size: value as OrganizationSize })}
            />
          </SetupField>
          <SetupField id="setup-company-name" label={isArabic ? "اسم المنشأة القانونية" : "Legal company name"} required>
            <Input
              id="setup-company-name"
              className="setup-input"
              value={draft.company_name}
              onChange={(event) => onChange({ company_name: event.target.value })}
              disabled={isApplied}
              required
            />
          </SetupField>
          <SetupField id="setup-company-code" label={isArabic ? "رمز المنشأة" : "Company code"} required>
            <Input
              id="setup-company-code"
              className="setup-input"
              dir="ltr"
              value={draft.company_code}
              onChange={(event) => onChange({ company_code: normalizeCode(event.target.value) })}
              disabled={isApplied}
              required
            />
          </SetupField>
          <SetupField id="setup-country-code" label={isArabic ? "الدولة / المنطقة" : "Country / region"} required>
            <Input
              id="setup-country-code"
              className="setup-input"
              dir="ltr"
              maxLength={2}
              value={draft.country_code}
              onChange={(event) => onChange({ country_code: event.target.value.toUpperCase() })}
              disabled={isApplied}
              required
            />
          </SetupField>
          <SetupField id="setup-profile-currency" label={isArabic ? "عملة التشغيل" : "Operating currency"} required>
            <SearchableSelect
              id="setup-profile-currency"
              className="setup-select"
              value={draft.currency_id || null}
              options={currencyOptions}
              onChange={(value) => onChange({ currency_id: typeof value === "number" ? value : Number(value) || 0 })}
              disabled={isApplied}
            />
          </SetupField>
        </div>
      </section>

      {requiresInventory ? (
        <section className="setup-template-subsection" aria-labelledby="setup-site-details-heading">
          <div className="setup-profile-heading">
            <span className="setup-profile-step">3</span>
            <div>
              <h3 id="setup-site-details-heading">{isArabic ? "عرّف الموقع التشغيلي الأول" : "Define the first operating site"}</h3>
              <p>{isArabic
                ? "سمِّ المتجر أو الفرع كما يعرفه فريقك. سيُترجم إلى موقع تشغيل تقني في الخلفية، وليس إلى مصنع بالضرورة."
                : "Name the store or branch as your team knows it. It becomes a technical operating site in the background, not necessarily a factory."}</p>
            </div>
          </div>
          <div className="settings-form-grid setup-form-grid">
            <SetupField id="setup-primary-site-name" label={isArabic ? "اسم المتجر / الفرع" : "Store / branch name"} required>
              <Input
                id="setup-primary-site-name"
                className="setup-input"
                value={draft.primary_site_name ?? ""}
                onChange={(event) => onChange({ primary_site_name: event.target.value })}
                disabled={isApplied}
                required
              />
            </SetupField>
            <SetupField id="setup-primary-site-code" label={isArabic ? "رمز المتجر / الفرع" : "Store / branch code"} required>
              <Input
                id="setup-primary-site-code"
                className="setup-input"
                dir="ltr"
                value={draft.primary_site_code ?? ""}
                onChange={(event) => onChange({ primary_site_code: normalizeCode(event.target.value) })}
                disabled={isApplied}
                required
              />
            </SetupField>
            <SetupField id="setup-profile-calendar" label={isArabic ? "تقويم تشغيل المتجر" : "Site operating calendar"} required>
              <SearchableSelect
                id="setup-profile-calendar"
                className="setup-select"
                value={draft.factory_calendar_id ?? null}
                options={calendarOptions}
                onChange={(value) => onChange({ factory_calendar_id: typeof value === "number" ? value : Number(value) || null })}
                disabled={isApplied}
              />
            </SetupField>
          </div>
        </section>
      ) : null}

      <aside className="setup-template-preview" aria-live="polite">
        <strong>{isArabic ? "ما الذي سيُجهّز تلقائيًا؟" : "What will be prepared automatically?"}</strong>
        {generatedLabels.length > 0 ? (
          <div className="setup-template-summary-list">
            {generatedLabels.map((label) => <span key={label}>{label}</span>)}
          </div>
        ) : <p>{isArabic ? "اختر قالبًا أولًا." : "Choose a template first."}</p>}
        <small>{isArabic
          ? "تُضاف القنوات وفرق المبيعات والموارد البشرية والمشاريع لاحقًا من مسار التوسع؛ لا يلزم إنشاؤها الآن."
          : "Channels, sales teams, HR, and projects are added later through guided expansion, not during initial setup."}</small>
      </aside>

      <div className="setup-actions setup-actions-primary">
        <Button type="button" onClick={onSave} isLoading={isSaving} disabled={isApplied}>
          {isArabic ? "حفظ ملف المنشأة" : "Save business profile"}
        </Button>
        <Button type="button" variant="secondary" onClick={onApply} isLoading={isSaving} disabled={!canApply || isApplied}>
          {isApplied
            ? (isArabic ? "تم تطبيق القالب" : "Template applied")
            : (isArabic ? "تجهيز الهيكل الأساسي بأمان" : "Prepare the base structure safely")}
        </Button>
      </div>
    </SetupSection>
  );
}
