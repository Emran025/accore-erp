"use client";

import { MainLayout, PageSubHeader } from "@/components/layout";
import { NrLoading, NrObjectHeader, NrSetupPrompt, useNumberRange } from "@/components/number-range";
import { Button } from "@/components/ui";
import { NumberInput } from "@/components/ui/NumberInput";
import { TextInput } from "@/components/ui/TextInput";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/select";
import { getIcon } from "@/lib/icons";
import { useRouter } from "next/navigation";
import { useState } from "react";

const CUS_CONFIG = { name: "العملاء", name_en: "Customers", number_length: 8, prefix: "CUS-" };

export default function AddIntervalPage() {
    const router = useRouter();
    const { objectData, isLoading, createObject, saveInterval } = useNumberRange({ objectType: "ar_customers" });

    const [intCode, setIntCode] = useState("");
    const [intDesc, setIntDesc] = useState("");
    const [intFrom, setIntFrom] = useState("");
    const [intTo, setIntTo] = useState("");
    const [intExternal, setIntExternal] = useState("false");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const ok = await saveInterval({
            code: intCode,
            description: intDesc,
            from_number: parseInt(intFrom),
            to_number: parseInt(intTo),
            is_external: intExternal === "true",
        });
        if (ok) {
            router.push("/02-commercial/crm/customer-groups-nr/view-customer-nr");
        }
    };

    if (isLoading) return <MainLayout><NrLoading /></MainLayout>;

    if (!objectData) {
        return (
            <MainLayout>
                <NrSetupPrompt defaultConfig={CUS_CONFIG} onCreateObject={createObject} />
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <NrObjectHeader objectData={objectData} title="إعدادات ترقيم العملاء" />

            <div className="sales-card compact">
                <PageSubHeader
                    title="بيانات النطاق الجديد"
                    titleIcon="hash"
                />

                <form onSubmit={handleSubmit} style={{ maxWidth: "600px", marginTop: "1rem" }}>
                    <div id="nr-alert" style={{ marginBottom: "1rem" }} />

                    <div className="nr-info-banner" style={{ marginBottom: "1.25rem" }}>
                        <span className="nr-info-icon">{getIcon("info")}</span>
                        <span>النطاق يجب أن يكون ضمن الحدود المسموحة (1 إلى {Number("9".repeat(objectData.number_length)).toLocaleString()}) ولا يتداخل مع النطاقات الحالية</span>
                    </div>

                    <div className="form-row" style={{ marginBottom: "1.25rem" }}>
                        <TextInput label="الكود *" id="int-code" value={intCode} onChange={(e) => setIntCode(e.target.value)} required placeholder="مثال: INT-01" className="flex-1" />
                        <Select
                            label="تخصيص الخادم"
                            id="int-type"
                            value={intExternal}
                            onChange={(e) => setIntExternal(e.target.value)}
                            options={[
                                { value: "false", label: "داخلي (تلقائي)" },
                                { value: "true", label: "خارجي (يدوي)" },
                            ]}
                            className="flex-1"
                        />
                    </div>

                    <div className="form-row" style={{ marginBottom: "1.25rem" }}>
                        <NumberInput label="بداية النطاق (من) *" id="int-from" value={intFrom} onChange={setIntFrom} required min={1} className="flex-1" />
                        <NumberInput label="نهاية النطاق (إلى) *" id="int-to" value={intTo} onChange={setIntTo} required min={1} className="flex-1" />
                    </div>

                    <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                        <Textarea label="الوصف" id="int-desc" value={intDesc} onChange={(e) => setIntDesc(e.target.value)} rows={3} />
                    </div>

                    <div style={{ display: "flex", gap: "1rem" }}>
                        <Button variant="primary" type="submit" icon="check">
                            حفظ وإنشاء النطاق
                        </Button>
                        <Button variant="secondary" type="button" onClick={() => router.push("/02-commercial/crm/customer-groups-nr/view-customer-nr")}>
                            إلغاء
                        </Button>
                    </div>
                </form>
            </div>
        </MainLayout>
    );
}
