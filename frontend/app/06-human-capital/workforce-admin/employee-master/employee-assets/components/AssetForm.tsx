"use client";

import { useI18n, catalogText } from "@/lib/i18n";
import { Employee, EmployeeAsset } from "@/types";
import { PageSubHeader } from "@/components/layout";
import { Button, Label, SearchableSelect, showToast } from "@/components/ui";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/Textarea";
import { TextInput } from "@/components/ui/TextInput";
import { fetchAPI } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { useEmployeeStore } from "@/stores/useEmployeeStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface AssetFormProps {
    asset?: EmployeeAsset;
}

export function AssetForm({ asset }: AssetFormProps) {
    const { t: i18n } = useI18n();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { allEmployees: employees, loadAllEmployees } = useEmployeeStore();

    const [form, setForm] = useState({
        employee_id: "",
        asset_code: "",
        asset_name: "",
        asset_type: "laptop",
        serial_number: "",
        qr_code: "",
        allocation_date: new Date().toISOString().split('T')[0],
        return_date: "",
        status: "allocated",
        next_maintenance_date: "",
        notes: ""
    });

    useEffect(() => {
        loadAllEmployees();
        if (asset) {
            setForm({
                employee_id: asset.employee_id.toString(),
                asset_code: asset.asset_code,
                asset_name: asset.asset_name,
                asset_type: asset.asset_type,
                serial_number: asset.serial_number || "",
                qr_code: asset.qr_code || "",
                allocation_date: asset.allocation_date,
                return_date: asset.return_date || "",
                status: asset.status,
                next_maintenance_date: asset.next_maintenance_date || "",
                notes: asset.notes || ""
            });
        } else {
            // Generate a default asset code
            setForm(prev => ({
                ...prev,
                asset_code: catalogText(i18n, "text_a0030f646de9", { value0: new Date().getFullYear(), value1: Math.floor(Math.random() * 10000) })
            }));
        }
    }, [asset, loadAllEmployees]);

    const handleSubmit = async () => {
        if (!form.employee_id || !form.asset_code || !form.asset_name || !form.allocation_date) {
            showToast(i18n.catalog["text_08af4c986257"], "error");
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                ...form,
                employee_id: Number(form.employee_id),
                serial_number: form.serial_number || null,
                qr_code: form.qr_code || null,
                return_date: form.return_date || null,
                next_maintenance_date: form.next_maintenance_date || null,
            };

            if (asset) {
                await fetchAPI(catalogText(i18n, "text_0907f4dfb304", { value0: API_ENDPOINTS.HUMAN_CAPITAL.EMPLOYEE_ASSETS.BASE, value1: asset.id }), {
                    method: 'PUT',
                    body: JSON.stringify(payload)
                });
                showToast(i18n.catalog["text_2d8f82297dc6"], "success");
            } else {
                await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.EMPLOYEE_ASSETS.BASE, {
                    method: 'POST',
                    body: JSON.stringify(payload)
                });
                showToast(i18n.catalog["text_cbf35ec9bde1"], "success");
            }
            router.push('/06-human-capital/workforce-admin/employee-master/employee-assets');
        } catch (error: any) {
            showToast(error.message || i18n.catalog["text_eedea505eb2b"], "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="sales-card animate-fade">
            <PageSubHeader
                title={asset ? i18n.catalog["text_a659477bae08"] : i18n.catalog["text_7e430444cd59"]}
                titleIcon="laptop"
                actions={
                    <Button variant="secondary" onClick={() => router.back()}>
                        {i18n.catalog["text_0dfcbc2d5f2a"]}</Button>
                }
            />
            <div className="space-y-4 p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                        <Label className="text-secondary mb-1">{i18n.catalog["text_972803dc7d86"]}</Label>
                        <SearchableSelect
                            options={employees.map((e: Employee) => ({ value: e.id.toString(), label: e.full_name }))}
                            value={form.employee_id}
                            onChange={(val) => setForm({ ...form, employee_id: val?.toString() || "" })}
                            placeholder={i18n.catalog["text_dee783929dea"]}
                        />
                    </div>
                    <TextInput
                        label={i18n.catalog["text_ff25014f125e"]}
                        value={form.asset_code}
                        onChange={(e) => setForm({ ...form, asset_code: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TextInput
                        label={i18n.catalog["text_1f7f12d037c9"]}
                        value={form.asset_name}
                        onChange={(e) => setForm({ ...form, asset_name: e.target.value })}
                    />
                    <Select
                        label={i18n.catalog["text_5996fef2064b"]}
                        value={form.asset_type}
                        onChange={(e) => setForm({ ...form, asset_type: e.target.value })}
                        options={[
                            { value: 'laptop', label: i18n.catalog["text_fe1966fd0299"] },
                            { value: 'phone', label: i18n.catalog["text_c2e72da6dba5"] },
                            { value: 'vehicle', label: i18n.catalog["text_1a83da3f0239"] },
                            { value: 'key', label: i18n.catalog["text_8a9d0e6c56ec"] },
                            { value: 'equipment', label: i18n.catalog["text_441296311989"] },
                            { value: 'other', label: i18n.catalog["text_17a9f38e22b6"] }
                        ]}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TextInput
                        label={i18n.catalog["text_5789f0fed61c"]}
                        value={form.serial_number}
                        onChange={(e) => setForm({ ...form, serial_number: e.target.value })}
                    />
                    <TextInput
                        label={i18n.catalog["text_6cb924e56b65"]}
                        value={form.qr_code}
                        onChange={(e) => setForm({ ...form, qr_code: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TextInput
                        label={i18n.catalog["text_3357bc98239a"]}
                        type="date"
                        value={form.allocation_date}
                        onChange={(e) => setForm({ ...form, allocation_date: e.target.value })}
                    />
                    <TextInput
                        label={i18n.catalog["text_de108b8c052e"]}
                        type="date"
                        value={form.return_date}
                        onChange={(e) => setForm({ ...form, return_date: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select
                        label={i18n.catalog["text_9a7e78d89b23"]}
                        value={form.status}
                        onChange={(e) => setForm({ ...form, status: e.target.value })}
                        options={[
                            { value: 'allocated', label: i18n.catalog["text_17c28aaaa777"] },
                            { value: 'returned', label: i18n.catalog["text_75fbb16d08be"] },
                            { value: 'maintenance', label: i18n.catalog["text_9c499d210797"] },
                            { value: 'lost', label: i18n.catalog["text_b4e5ae7ca0e7"] },
                            { value: 'damaged', label: i18n.catalog["text_c4c3267f2898"] }
                        ]}
                    />
                    <TextInput
                        label={i18n.catalog["text_be268bda526f"]}
                        type="date"
                        value={form.next_maintenance_date}
                        onChange={(e) => setForm({ ...form, next_maintenance_date: e.target.value })}
                    />
                </div>

                <Textarea
                    label={i18n.catalog["text_d446d2dc6b81"]}
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    rows={3}
                />

                <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-border">
                    <Button variant="secondary" onClick={() => router.back()}>{i18n.catalog["text_9a30dc2a96b8"]}</Button>
                    <Button variant="primary" onClick={handleSubmit} icon="save" disabled={isSubmitting}>
                        {isSubmitting ? i18n.catalog["text_8688b0ff5f34"] : i18n.catalog["text_ddfcaf9d0144"]}
                    </Button>
                </div>
            </div>
        </div>
    );
}
