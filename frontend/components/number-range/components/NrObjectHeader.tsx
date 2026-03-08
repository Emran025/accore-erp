"use client";

import { useState } from "react";
import { getIcon } from "@/lib/icons";
import { Dialog, Button } from "@/components/ui";
import { TextInput } from "@/components/ui/TextInput";
import { NumberInput } from "@/components/ui/NumberInput";
import type { NrObjectFull } from "../types";

// ══════════════════════════════════════════════════════════════
//  NR Object Header — shared banner with KPIs, shown on all pages
// ══════════════════════════════════════════════════════════════

interface NrObjectHeaderProps {
    objectData: NrObjectFull;
    title?: string;
}

export function NrObjectHeader({ objectData, title }: NrObjectHeaderProps) {
    const { summary, number_length, prefix } = objectData;
    const maxBound = Number("9".repeat(number_length)).toLocaleString();

    // Calculate status breakdown from intervals
    const intervals = objectData.intervals || [];
    const critical = intervals.filter(iv => iv.status === "critical").length;
    const warning = intervals.filter(iv => iv.status === "warning").length;
    const healthy = intervals.filter(iv => iv.status === "healthy").length;

    const fullnessClass = summary.overall_fullness >= 95 ? "critical" : summary.overall_fullness >= 80 ? "warning" : "healthy";

    return (
        <div className="nroh-card">
            <div className="nroh-top">
                <div className="nroh-identity">
                    <div className="nroh-icon">{getIcon("hash")}</div>
                    <div className="nroh-titles">
                        <h2>{title || objectData.name}</h2>
                        <div className="nroh-badges">
                            {objectData.name_en && <span className="nroh-badge">{objectData.name_en}</span>}
                            <span className="nroh-badge">{getIcon("ruler")} طول: {number_length}</span>
                            {prefix && <span className="nroh-badge">{getIcon("tag")} بادئة: {prefix}</span>}
                            <span className="nroh-badge solid">الحد الأقصى: {maxBound}</span>
                        </div>
                    </div>
                </div>

                <div className="nroh-stats-grid">
                    <div className="nroh-stat">
                        <div className="nroh-stat-value">{summary.total_groups.toLocaleString()}</div>
                        <div className="nroh-stat-label">مجموعة</div>
                    </div>
                    <div className="nroh-stat">
                        <div className="nroh-stat-value">{summary.total_intervals.toLocaleString()}</div>
                        <div className="nroh-stat-label">نطاق</div>
                    </div>
                    <div className="nroh-stat">
                        <div className="nroh-stat-value">{summary.total_assignments.toLocaleString()}</div>
                        <div className="nroh-stat-label">ربط</div>
                    </div>
                    <div className="nroh-divider" />
                    <div className="nroh-stat cap">
                        <div className="nroh-stat-value blue">{summary.total_capacity.toLocaleString()}</div>
                        <div className="nroh-stat-label">إجمالي السعة</div>
                    </div>
                    <div className="nroh-stat cap">
                        <div className="nroh-stat-value purple">{summary.total_used.toLocaleString()}</div>
                        <div className="nroh-stat-label">المستخدم</div>
                    </div>
                    <div className="nroh-stat cap">
                        <div className="nroh-stat-value green">{summary.total_remaining.toLocaleString()}</div>
                        <div className="nroh-stat-label">المتبقي</div>
                    </div>
                </div>
            </div>

            <div className="nroh-progress-container">
                <div className="nroh-progress-head">
                    <span className="nroh-progress-title">الامتلاء الكلي للقدرة الاستيعابية ({summary.overall_fullness}%)</span>
                    <div className="nroh-status-counters">
                        <span className="nroh-counter healthy">{getIcon("check-circle")} {healthy} سليم</span>
                        <span className="nroh-counter warning">{getIcon("alert-triangle")} {warning} تحذير</span>
                        <span className="nroh-counter critical">{getIcon("alert-circle")} {critical} حرج</span>
                    </div>
                </div>
                <div className="nroh-progress-track">
                    <div
                        className={`nroh-progress-fill ${fullnessClass}`}
                        style={{ width: `${Math.min(summary.overall_fullness, 100)}%` }}
                    />
                </div>
            </div>
        </div>
    );
}

// ══════════════════════════════════════════════════════════════
//  NR Setup Prompt — shown when no NR Object exists yet
// ══════════════════════════════════════════════════════════════

interface NrSetupPromptProps {
    defaultConfig?: {
        name?: string;
        name_en?: string;
        number_length?: number;
        prefix?: string;
    };
    onCreateObject: (data: {
        name: string;
        name_en?: string;
        number_length: number;
        prefix?: string;
    }) => Promise<boolean>;
}

export function NrSetupPrompt({ defaultConfig, onCreateObject }: NrSetupPromptProps) {
    const [setupDialog, setSetupDialog] = useState(false);
    const [setupName, setSetupName] = useState(defaultConfig?.name || "");
    const [setupNameEn, setSetupNameEn] = useState(defaultConfig?.name_en || "");
    const [setupLength, setSetupLength] = useState(String(defaultConfig?.number_length || 8));
    const [setupPrefix, setSetupPrefix] = useState(defaultConfig?.prefix || "");

    const handleCreate = async () => {
        if (!setupName || !setupLength) return;
        const ok = await onCreateObject({
            name: setupName,
            name_en: setupNameEn || undefined,
            number_length: parseInt(setupLength),
            prefix: setupPrefix || undefined,
        });
        if (ok) setSetupDialog(false);
    };

    return (
        <>
            <div className="nr-setup-prompt">
                <div className="nr-setup-icon">{getIcon("hash")}</div>
                <h3>إعداد نظام الترقيم</h3>
                <p>لم يتم تكوين نظام ترقيم لهذا النوع بعد. قم بتحديد طول الترقيم والإعدادات الأولية للبدء.</p>
                <Button variant="primary" onClick={() => setSetupDialog(true)} icon="plus">
                    إعداد نظام الترقيم
                </Button>
            </div>

            <Dialog
                isOpen={setupDialog}
                onClose={() => setSetupDialog(false)}
                title="إعداد نظام الترقيم"
                maxWidth="520px"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setSetupDialog(false)}>إلغاء</Button>
                        <Button variant="primary" onClick={handleCreate}>إنشاء</Button>
                    </>
                }
            >
                <form onSubmit={(e) => { e.preventDefault(); handleCreate(); }}>
                    <div className="nr-info-banner">
                        <span className="nr-info-icon">{getIcon("info")}</span>
                        <span>طول الترقيم يحدد الحد الأقصى لنطاقات الأرقام المتاحة. مثال: طول 8 أرقام يسمح بنطاقات حتى 99,999,999</span>
                    </div>
                    <div className="form-row">
                        <TextInput label="الاسم بالعربية *" id="nr-setup-name" value={setupName} onChange={(e) => setSetupName(e.target.value)} required className="flex-1" />
                        <TextInput label="الاسم بالإنجليزية" id="nr-setup-name-en" value={setupNameEn} onChange={(e) => setSetupNameEn(e.target.value)} className="flex-1" />
                    </div>
                    <div className="form-row">
                        <NumberInput label="طول الترقيم *" id="nr-setup-length" value={setupLength} onChange={setSetupLength} min={1} max={20} className="flex-1" />
                        <TextInput label="البادئة (اختياري)" id="nr-setup-prefix" value={setupPrefix} onChange={(e) => setSetupPrefix(e.target.value)} className="flex-1" placeholder="EMP-" />
                    </div>
                </form>
            </Dialog>
        </>
    );
}

// ══════════════════════════════════════════════════════════════
//  NR Loading Spinner
// ══════════════════════════════════════════════════════════════

export function NrLoading() {
    return (
        <div className="nr-manager-loading">
            <div className="nr-spinner" />
            <p>جارِ تحميل إعدادات الترقيم...</p>
        </div>
    );
}
