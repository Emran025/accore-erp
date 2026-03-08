"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MainLayout, PageSubHeader } from "@/components/layout";
import { Button } from "@/components/ui";
import { TextInput } from "@/components/ui/TextInput";
import { Textarea } from "@/components/ui/Textarea";
import { getIcon } from "@/lib/icons";
import { useNumberRange, NrObjectHeader, NrSetupPrompt, NrLoading } from "@/components/number-range";

// Default config for HR Customers numbering
const CUS_CONFIG = {
    name: "العملاء",
    name_en: "Customers",
    number_length: 8,
    prefix: "CUS-",
};

export default function AddCustomersGroupPage() {
    const router = useRouter();
    const { objectData, isLoading, createObject, saveGroup } = useNumberRange({ objectType: "ar_customers" });

    const [groupCode, setGroupCode] = useState("");
    const [groupName, setGroupName] = useState("");
    const [groupNameEn, setGroupNameEn] = useState("");
    const [groupDesc, setGroupDesc] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const ok = await saveGroup({
            code: groupCode,
            name: groupName,
            name_en: groupNameEn,
            description: groupDesc,
        });
        if (ok) {
            router.push("/ar_customers/groups-number-range-interval/ar_customers/view-ar_customers-groups");
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
                    title="بيانات التجميع الجديد"
                    titleIcon="layers"
                />

                <form onSubmit={handleSubmit} style={{ maxWidth: "600px", marginTop: "1rem" }}>
                    <div id="nr-alert" style={{ marginBottom: "1rem" }} />

                    <div className="form-group" style={{ marginBottom: "1.25rem" }}>
                        <TextInput label="الكود *" id="grp-code" value={groupCode} onChange={(e) => setGroupCode(e.target.value)} required placeholder="مثال: GRP-01" />
                    </div>

                    <div className="form-row" style={{ marginBottom: "1.25rem" }}>
                        <TextInput label="الاسم بالعربية *" id="grp-name" value={groupName} onChange={(e) => setGroupName(e.target.value)} required />
                        <TextInput label="الاسم بالإنجليزية" id="grp-name-en" value={groupNameEn} onChange={(e) => setGroupNameEn(e.target.value)} />
                    </div>

                    <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                        <Textarea label="الوصف" id="grp-desc" value={groupDesc} onChange={(e) => setGroupDesc(e.target.value)} rows={3} />
                    </div>

                    <div style={{ display: "flex", gap: "1rem" }}>
                        <Button variant="primary" type="submit" icon="check">
                            حفظ وإنشاء التجميع
                        </Button>
                        <Button variant="secondary" type="button" onClick={() => router.push("/ar_customers/groups-number-range-interval/ar_customers/view-ar_customers-groups")}>
                            إلغاء
                        </Button>
                    </div>
                </form>
            </div>
        </MainLayout>
    );
}
