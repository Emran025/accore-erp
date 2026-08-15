"use client";

import { useI18n, catalogText } from "@/lib/i18n";
import { Employee, ExpatRecord } from "@/types";
import { PageSubHeader } from "@/components/layout";
import { Button, Label, SearchableSelect, showToast } from "@/components/ui";
import { TextInput } from "@/components/ui/TextInput";
import { Textarea } from "@/components/ui/Textarea";
import { fetchAPI } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { useEmployeeStore } from "@/stores/useEmployeeStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ExpatFormProps {
    record?: ExpatRecord;
}

export function ExpatForm({ record }: ExpatFormProps) {
    const { t: i18n } = useI18n();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { allEmployees: employees, loadAllEmployees } = useEmployeeStore();

    // Get valid property type from the record or default
    const [form, setForm] = useState({
        employee_id: "",
        host_country: "",
        home_country: "",
        department_id: "",

        // Documents
        passport_number: "",
        passport_expiry: "",
        visa_number: "",
        visa_expiry: "",
        work_permit_number: "",
        work_permit_expiry: "",
        residency_number: "",
        residency_expiry: "",

        // Allowances
        cost_of_living_adjustment: "",
        housing_allowance: "",
        relocation_package: "",
        tax_equalization: false,
        repatriation_date: "",
        notes: ""
    });

    useEffect(() => {
        loadAllEmployees();
        if (record) {
            setForm({
                employee_id: record.employee_id.toString(),
                host_country: record.host_country || "",
                home_country: record.home_country || "",
                department_id: "", // If available

                passport_number: record.passport_number || "",
                passport_expiry: record.passport_expiry || "",
                visa_number: record.visa_number || "",
                visa_expiry: record.visa_expiry || "",
                work_permit_number: record.work_permit_number || "",
                work_permit_expiry: record.work_permit_expiry || "",
                residency_number: record.residency_number || "",
                residency_expiry: record.residency_expiry || "",

                cost_of_living_adjustment: record.cost_of_living_adjustment?.toString() || "",
                housing_allowance: record.housing_allowance?.toString() || "",
                relocation_package: record.relocation_package?.toString() || "",
                tax_equalization: record.tax_equalization || false,
                repatriation_date: record.repatriation_date || "",
                notes: record.notes || ""
            });
        }
    }, [record, loadAllEmployees]);

    const handleSubmit = async () => {
        if (!form.employee_id || !form.host_country) {
            showToast(i18n.catalog["text_f45b610d7116"], "error");
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                ...form,
                employee_id: Number(form.employee_id),
                cost_of_living_adjustment: form.cost_of_living_adjustment ? Number(form.cost_of_living_adjustment) : 0,
                housing_allowance: form.housing_allowance ? Number(form.housing_allowance) : 0,
                relocation_package: form.relocation_package ? Number(form.relocation_package) : 0,
                passport_expiry: form.passport_expiry || null,
                visa_expiry: form.visa_expiry || null,
                work_permit_expiry: form.work_permit_expiry || null,
                residency_expiry: form.residency_expiry || null,
                repatriation_date: form.repatriation_date || null
            };

            if (record) {
                await fetchAPI(catalogText(i18n, "text_0907f4dfb304", { value0: API_ENDPOINTS.HUMAN_CAPITAL.EXPAT_MANAGEMENT.BASE, value1: record.id }), {
                    method: 'PUT',
                    body: JSON.stringify(payload)
                });
                showToast(i18n.catalog["text_eb17a78099a3"], "success");
            } else {
                await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.EXPAT_MANAGEMENT.BASE, {
                    method: 'POST',
                    body: JSON.stringify(payload)
                });
                showToast(i18n.catalog["text_a2667844c9e4"], "success");
            }
            router.push('/06-human-capital/workforce-admin/employee-master/expat-management');
        } catch (error: any) {
            showToast(error.message || i18n.catalog["text_76875fecd3ab"], "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="sales-card animate-fade">
            <PageSubHeader
                title={record ? i18n.catalog["text_1e02d763cfcb"] : i18n.catalog["text_94b579b3c7a7"]}
                titleIcon="globe"
                actions={
                    <Button variant="secondary" onClick={() => router.back()}>
                        {i18n.catalog["text_0dfcbc2d5f2a"]}</Button>
                }
            />
            <div className="space-y-6 p-4">
                {/* Employee Info */}
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
                    <div className="grid grid-cols-2 gap-4">
                        <TextInput
                            label={i18n.catalog["text_7260ce3227c3"]}
                            value={form.host_country}
                            onChange={(e) => setForm({ ...form, host_country: e.target.value })}
                        />
                        <TextInput
                            label={i18n.catalog["text_2a1a97ddb304"]}
                            value={form.home_country}
                            onChange={(e) => setForm({ ...form, home_country: e.target.value })}
                        />
                    </div>
                </div>

                <div className="border-t border-border my-4"></div>
                <h3 className="font-semibold text-lg mb-4">{i18n.catalog["text_eaa06e081543"]}</h3>

                {/* Docs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid grid-cols-2 gap-2">
                        <TextInput
                            label={i18n.catalog["text_ed25f13794a2"]}
                            value={form.passport_number}
                            onChange={(e) => setForm({ ...form, passport_number: e.target.value })}
                        />
                        <TextInput
                            label={i18n.catalog["text_ef2164e6707f"]}
                            type="date"
                            value={form.passport_expiry}
                            onChange={(e) => setForm({ ...form, passport_expiry: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <TextInput
                            label={i18n.catalog["text_21075377a5cd"]}
                            value={form.residency_number}
                            onChange={(e) => setForm({ ...form, residency_number: e.target.value })}
                        />
                        <TextInput
                            label={i18n.catalog["text_6448d33592ba"]}
                            type="date"
                            value={form.residency_expiry}
                            onChange={(e) => setForm({ ...form, residency_expiry: e.target.value })}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid grid-cols-2 gap-2">
                        <TextInput
                            label={i18n.catalog["text_98b9cdf4788f"]}
                            value={form.visa_number}
                            onChange={(e) => setForm({ ...form, visa_number: e.target.value })}
                        />
                        <TextInput
                            label={i18n.catalog["text_ae0cb62e028d"]}
                            type="date"
                            value={form.visa_expiry}
                            onChange={(e) => setForm({ ...form, visa_expiry: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <TextInput
                            label={i18n.catalog["text_d8a1ecad8f4c"]}
                            value={form.work_permit_number}
                            onChange={(e) => setForm({ ...form, work_permit_number: e.target.value })}
                        />
                        <TextInput
                            label={i18n.catalog["text_f4e8e7880006"]}
                            type="date"
                            value={form.work_permit_expiry}
                            onChange={(e) => setForm({ ...form, work_permit_expiry: e.target.value })}
                        />
                    </div>
                </div>

                <div className="border-t border-border my-4"></div>
                <h3 className="font-semibold text-lg mb-4">{i18n.catalog["text_e5eff975c8ee"]}</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <TextInput
                        label={i18n.catalog["text_e41b455b29a2"]}
                        type="number"
                        value={form.cost_of_living_adjustment}
                        onChange={(e) => setForm({ ...form, cost_of_living_adjustment: e.target.value })}
                    />
                    <TextInput
                        label={i18n.catalog["text_408c0f457672"]}
                        type="number"
                        value={form.housing_allowance}
                        onChange={(e) => setForm({ ...form, housing_allowance: e.target.value })}
                    />
                    <TextInput
                        label={i18n.catalog["text_91bbce9f47ae"]}
                        type="number"
                        value={form.relocation_package}
                        onChange={(e) => setForm({ ...form, relocation_package: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                    <TextInput
                        label={i18n.catalog["text_4f87a7ef5f90"]}
                        type="date"
                        value={form.repatriation_date}
                        onChange={(e) => setForm({ ...form, repatriation_date: e.target.value })}
                    />
                    <div className="flex items-center gap-2 mb-2 p-2 border rounded border-border bg-gray-50">
                        <input
                            type="checkbox"
                            id="tax_equalization"
                            checked={form.tax_equalization}
                            onChange={(e) => setForm({ ...form, tax_equalization: e.target.checked })}
                            className="checkbox"
                        />
                        <Label htmlFor="tax_equalization" style={{ marginBottom: 0 }}>{i18n.catalog["text_77df6807b75d"]}</Label>
                    </div>
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
