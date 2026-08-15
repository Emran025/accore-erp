"use client";

import { useI18n } from "@/lib/i18n";
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
    const { t: i18n } = useI18n();
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
                            <span className="nroh-badge">{getIcon("ruler")} {i18n.catalog["numberRange.nrobjectheader.length"]}{number_length}</span>
                            {prefix && <span className="nroh-badge">{getIcon("tag")} {i18n.catalog["numberRange.nrobjectheader.prefix"]}{prefix}</span>}
                            <span className="nroh-badge solid">{i18n.catalog["numberRange.nrobjectheader.maximum"]}{maxBound}</span>
                        </div>
                    </div>
                </div>

                <div className="nroh-stats-grid">
                    <div className="nroh-stat">
                        <div className="nroh-stat-value">{summary.total_groups.toLocaleString()}</div>
                        <div className="nroh-stat-label">{i18n.catalog["numberRange.nrobjectheader.group"]}</div>
                    </div>
                    <div className="nroh-stat">
                        <div className="nroh-stat-value">{summary.total_intervals.toLocaleString()}</div>
                        <div className="nroh-stat-label">{i18n.catalog["numberRange.nrobjectheader.range"]}</div>
                    </div>
                    <div className="nroh-stat">
                        <div className="nroh-stat-value">{summary.total_assignments.toLocaleString()}</div>
                        <div className="nroh-stat-label">{i18n.catalog["common.general.link"]}</div>
                    </div>
                    <div className="nroh-divider" />
                    <div className="nroh-stat cap">
                        <div className="nroh-stat-value blue">{summary.total_capacity.toLocaleString()}</div>
                        <div className="nroh-stat-label">{i18n.catalog["numberRange.nrobjectheader.totalCapacity"]}</div>
                    </div>
                    <div className="nroh-stat cap">
                        <div className="nroh-stat-value purple">{summary.total_used.toLocaleString()}</div>
                        <div className="nroh-stat-label">{i18n.catalog["common.general.user"]}</div>
                    </div>
                    <div className="nroh-stat cap">
                        <div className="nroh-stat-value green">{summary.total_remaining.toLocaleString()}</div>
                        <div className="nroh-stat-label">{i18n.catalog["common.general.remaining.alternative2"]}</div>
                    </div>
                </div>
            </div>

            <div className="nroh-progress-container">
                <div className="nroh-progress-head">
                    <span className="nroh-progress-title">{i18n.catalog["numberRange.nrobjectheader.totalCapacityUtilization"]}{summary.overall_fullness}%)</span>
                    <div className="nroh-status-counters">
                        <span className="nroh-counter healthy">{getIcon("check-circle")} {healthy} {i18n.catalog["common.general.valid.alternative2"]}</span>
                        <span className="nroh-counter warning">{getIcon("alert-triangle")} {warning} {i18n.catalog["common.general.warning"]}</span>
                        <span className="nroh-counter critical">{getIcon("alert-circle")} {critical} {i18n.catalog["common.general.critical"]}</span>
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
    const { t: i18n } = useI18n();
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
                <h3>{i18n.catalog["common.general.numberingSystemSetup"]}</h3>
                <p>{i18n.catalog["common.general.noNumberingSystemHasBeenConfiguredThisType"]}</p>
                <Button variant="primary" onClick={() => setSetupDialog(true)} icon="plus">
                    {i18n.catalog["common.general.numberingSystemSetup"]}</Button>
            </div>

            <Dialog
                isOpen={setupDialog}
                onClose={() => setSetupDialog(false)}
                title={i18n.catalog["common.general.numberingSystemSetup"]}
                maxWidth="520px"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setSetupDialog(false)}>{i18n.catalog["common.general.cancel"]}</Button>
                        <Button variant="primary" onClick={handleCreate}>{i18n.catalog["common.general.create"]}</Button>
                    </>
                }
            >
                <form onSubmit={(e) => { e.preventDefault(); handleCreate(); }}>
                    <div className="nr-info-banner">
                        <span className="nr-info-icon">{getIcon("info")}</span>
                        <span>{i18n.catalog["common.general.numberLengthSetsMaximumNumericRangeExampleLength"]}</span>
                    </div>
                    <div className="form-row">
                        <TextInput label={i18n.catalog["common.general.nameArabic"]} id="nr-setup-name" value={setupName} onChange={(e) => setSetupName(e.target.value)} required className="flex-1" />
                        <TextInput label={i18n.catalog["common.general.nameEnglish"]} id="nr-setup-name-en" value={setupNameEn} onChange={(e) => setSetupNameEn(e.target.value)} className="flex-1" />
                    </div>
                    <div className="form-row">
                        <NumberInput label={i18n.catalog["common.general.numberingLength"]} id="nr-setup-length" value={setupLength} onChange={setSetupLength} min={1} max={20} className="flex-1" />
                        <TextInput label={i18n.catalog["common.general.prefixOptional"]} id="nr-setup-prefix" value={setupPrefix} onChange={(e) => setSetupPrefix(e.target.value)} className="flex-1" placeholder={i18n.catalog["common.general.emp"]} />
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
    const { t: i18n } = useI18n();
    return (
        <div className="nr-manager-loading">
            <div className="nr-spinner" />
            <p>{i18n.catalog["common.general.loadingNumberingSettings"]}</p>
        </div>
    );
}
