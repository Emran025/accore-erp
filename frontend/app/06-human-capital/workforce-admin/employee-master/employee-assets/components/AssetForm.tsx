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
                asset_code: catalogText(i18n, "humanCapital.asset.ast", { value0: new Date().getFullYear(), value1: Math.floor(Math.random() * 10000) })
            }));
        }
    }, [asset, loadAllEmployees]);

    const handleSubmit = async () => {
        if (!form.employee_id || !form.asset_code || !form.asset_name || !form.allocation_date) {
            showToast(i18n.catalog["common.general.pleaseFillRequiredFields"], "error");
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
                await fetchAPI(catalogText(i18n, "common.general.message", { value0: API_ENDPOINTS.HUMAN_CAPITAL.EMPLOYEE_ASSETS.BASE, value1: asset.id }), {
                    method: 'PUT',
                    body: JSON.stringify(payload)
                });
                showToast(i18n.catalog["humanCapital.asset.lossUpdatedSuccessfully"], "success");
            } else {
                await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.EMPLOYEE_ASSETS.BASE, {
                    method: 'POST',
                    body: JSON.stringify(payload)
                });
                showToast(i18n.catalog["humanCapital.asset.assetCreatedSuccessfully"], "success");
            }
            router.push('/06-human-capital/workforce-admin/employee-master/employee-assets');
        } catch (error: any) {
            showToast(error.message || i18n.catalog["humanCapital.asset.failedSaveAsset"], "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="sales-card animate-fade">
            <PageSubHeader
                title={asset ? i18n.catalog["humanCapital.asset.editSource"] : i18n.catalog["common.general.addNewAsset"]}
                titleIcon="laptop"
                actions={
                    <Button variant="secondary" onClick={() => router.back()}>
                        {i18n.catalog["common.general.back.alternative2"]}</Button>
                }
            />
            <div className="space-y-4 p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                        <Label className="text-secondary mb-1">{i18n.catalog["common.general.employee"]}</Label>
                        <SearchableSelect
                            options={employees.map((e: Employee) => ({ value: e.id.toString(), label: e.full_name }))}
                            value={form.employee_id}
                            onChange={(val) => setForm({ ...form, employee_id: val?.toString() || "" })}
                            placeholder={i18n.catalog["common.general.selectEmployee"]}
                        />
                    </div>
                    <TextInput
                        label={i18n.catalog["humanCapital.asset.sourceCode"]}
                        value={form.asset_code}
                        onChange={(e) => setForm({ ...form, asset_code: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TextInput
                        label={i18n.catalog["common.general.assetName"]}
                        value={form.asset_name}
                        onChange={(e) => setForm({ ...form, asset_name: e.target.value })}
                    />
                    <Select
                        label={i18n.catalog["humanCapital.asset.assetType"]}
                        value={form.asset_type}
                        onChange={(e) => setForm({ ...form, asset_type: e.target.value })}
                        options={[
                            { value: 'laptop', label: i18n.catalog["common.general.laptop"] },
                            { value: 'phone', label: i18n.catalog["common.general.phone.alternative2"] },
                            { value: 'vehicle', label: i18n.catalog["common.general.vehicle"] },
                            { value: 'key', label: i18n.catalog["common.general.key"] },
                            { value: 'equipment', label: i18n.catalog["common.general.equipment"] },
                            { value: 'other', label: i18n.catalog["common.general.other"] }
                        ]}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TextInput
                        label={i18n.catalog["common.general.serialNumber"]}
                        value={form.serial_number}
                        onChange={(e) => setForm({ ...form, serial_number: e.target.value })}
                    />
                    <TextInput
                        label={i18n.catalog["humanCapital.asset.qrCode"]}
                        value={form.qr_code}
                        onChange={(e) => setForm({ ...form, qr_code: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TextInput
                        label={i18n.catalog["humanCapital.asset.assignmentDate"]}
                        type="date"
                        value={form.allocation_date}
                        onChange={(e) => setForm({ ...form, allocation_date: e.target.value })}
                    />
                    <TextInput
                        label={i18n.catalog["humanCapital.asset.redemptionDate"]}
                        type="date"
                        value={form.return_date}
                        onChange={(e) => setForm({ ...form, return_date: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select
                        label={i18n.catalog["humanCapital.asset.status"]}
                        value={form.status}
                        onChange={(e) => setForm({ ...form, status: e.target.value })}
                        options={[
                            { value: 'allocated', label: i18n.catalog["common.general.custom"] },
                            { value: 'returned', label: i18n.catalog["common.general.refunded"] },
                            { value: 'maintenance', label: i18n.catalog["common.general.maintenance"] },
                            { value: 'lost', label: i18n.catalog["common.general.missing"] },
                            { value: 'damaged', label: i18n.catalog["common.general.damaged"] }
                        ]}
                    />
                    <TextInput
                        label={i18n.catalog["humanCapital.asset.nextMaintenanceDate"]}
                        type="date"
                        value={form.next_maintenance_date}
                        onChange={(e) => setForm({ ...form, next_maintenance_date: e.target.value })}
                    />
                </div>

                <Textarea
                    label={i18n.catalog["common.general.notes.alternative2"]}
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    rows={3}
                />

                <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-border">
                    <Button variant="secondary" onClick={() => router.back()}>{i18n.catalog["common.general.cancel"]}</Button>
                    <Button variant="primary" onClick={handleSubmit} icon="save" disabled={isSubmitting}>
                        {isSubmitting ? i18n.catalog["common.general.saving"] : i18n.catalog["common.general.save"]}
                    </Button>
                </div>
            </div>
        </div>
    );
}
