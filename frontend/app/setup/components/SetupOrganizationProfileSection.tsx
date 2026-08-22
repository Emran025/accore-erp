"use client";

import { Button, SearchableSelect, SegmentedToggle } from "@/components/ui";
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

  return (
    <SetupSection
      id="setup-organization-profile"
      title={isArabic ? "ملف المنشأة والقالب التنظيمي" : "Business profile and organization template"}
      description={isArabic
        ? "أجب عن أسئلة عمل بسيطة أولًا. سيُنشئ النظام البنية التقنية المناسبة في الخلفية دون أن يطلب منك اختيار مصنع أو مجموعة مبيعات أو علاقات ERP يدويًا."
        : "Start with business choices. The system creates the right technical structure in the background without asking you to configure ERP relationships manually."}
    >
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

      <div className="settings-form-grid setup-form-grid">
        <SetupField id="setup-organization-size" label={isArabic ? "حجم المنشأة" : "Organization size"} required>
          <SegmentedToggle
            value={draft.organization_size}
            options={sizeLabels}
            onChange={(value) => onChange({ organization_size: value as OrganizationSize })}
          />
        </SetupField>
        <SetupField id="setup-company-name" label={isArabic ? "اسم المنشأة القانونية" : "Legal company name"} required>
          <input
            id="setup-company-name"
            className="setup-input"
            value={draft.company_name}
            onChange={(event) => onChange({ company_name: event.target.value })}
            disabled={isApplied}
            required
          />
        </SetupField>
        <SetupField id="setup-company-code" label={isArabic ? "رمز المنشأة" : "Company code"} required>
          <input
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
          <input
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

      {requiresInventory ? (
        <div className="setup-template-subsection">
          <div>
            <h4>{isArabic ? "الموقع التشغيلي الأول" : "First operating site"}</h4>
            <p>{isArabic
              ? "سمِّ المتجر أو الفرع كما يعرفه فريقك. سيُترجم إلى موقع تشغيل تقني في الخلفية، وليس إلى مصنع بالضرورة."
              : "Name the store or branch as your team knows it. It becomes a technical operating site in the background, not necessarily a factory."}</p>
          </div>
          <div className="settings-form-grid setup-form-grid">
            <SetupField id="setup-primary-site-name" label={isArabic ? "اسم المتجر / الفرع" : "Store / branch name"} required>
              <input
                id="setup-primary-site-name"
                className="setup-input"
                value={draft.primary_site_name ?? ""}
                onChange={(event) => onChange({ primary_site_name: event.target.value })}
                disabled={isApplied}
                required
              />
            </SetupField>
            <SetupField id="setup-primary-site-code" label={isArabic ? "رمز المتجر / الفرع" : "Store / branch code"} required>
              <input
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
        </div>
      ) : null}

      <div className="setup-template-preview" aria-live="polite">
        <strong>{isArabic ? "ما الذي سيُجهّز تلقائيًا؟" : "What will be prepared automatically?"}</strong>
        <p>{selectedTemplate
          ? selectedTemplate.generated_types.map((type) => type.replaceAll("_", " ")).join(" · ")
          : (isArabic ? "اختر قالبًا أولًا." : "Choose a template first.")}</p>
        <small>{isArabic
          ? "تُضاف القنوات وفِرق المبيعات والموارد البشرية والمشاريع لاحقًا من مسار التوسع؛ لا يلزم إنشاؤها الآن."
          : "Channels, sales teams, HR, and projects are added later through guided expansion, not during initial setup."}</small>
      </div>

      <div className="setup-actions">
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
