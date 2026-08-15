"use client";

import { useI18n, catalogText } from "@/lib/i18n";
import { Employee, EmployeeContract } from "@/types";
import { PageSubHeader } from "@/components/layout";
import { Button, Label, SearchableSelect, showToast } from "@/components/ui";
import { Checkbox } from "@/components/ui/checkbox";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/Textarea";
import { TextInput } from "@/components/ui/TextInput";
import { fetchAPI } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { useEmployeeStore } from "@/stores/useEmployeeStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ContractFormProps {
    contract?: EmployeeContract;
}

export function ContractForm({ contract }: ContractFormProps) {
    const { t: i18n } = useI18n();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { allEmployees: employees, loadAllEmployees } = useEmployeeStore();

    const [form, setForm] = useState({
        employee_id: "",
        contract_number: "",
        contract_start_date: new Date().toISOString().split('T')[0],
        contract_end_date: "",
        probation_end_date: "",
        base_salary: "",
        contract_type: "full_time",
        is_current: true,
        notes: ""
    });

    useEffect(() => {
        loadAllEmployees();
        if (contract) {
            setForm({
                employee_id: contract.employee_id.toString(),
                contract_number: contract.contract_number,
                contract_start_date: contract.contract_start_date,
                contract_end_date: contract.contract_end_date || "",
                probation_end_date: contract.probation_end_date || "",
                base_salary: contract.base_salary.toString(),
                contract_type: contract.contract_type,
                is_current: contract.is_current,
                notes: contract.notes || ""
            });
        } else {
            // Generate a default contract number
            setForm(prev => ({
                ...prev,
                contract_number: catalogText(i18n, "text_9db692fa47cc", { value0: new Date().getFullYear(), value1: Math.floor(Math.random() * 10000) })
            }));
        }
    }, [contract, loadAllEmployees]);

    const handleSubmit = async () => {
        if (!form.employee_id || !form.contract_number || !form.contract_start_date || !form.base_salary) {
            showToast(i18n.catalog["text_08af4c986257"], "error");
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                ...form,
                employee_id: Number(form.employee_id),
                base_salary: Number(form.base_salary),
                contract_end_date: form.contract_end_date || null,
                probation_end_date: form.probation_end_date || null,
            };

            if (contract) {
                await fetchAPI(catalogText(i18n, "text_0907f4dfb304", { value0: API_ENDPOINTS.HUMAN_CAPITAL.CONTRACTS.BASE, value1: contract.id }), {
                    method: 'PUT',
                    body: JSON.stringify(payload)
                });
                showToast(i18n.catalog["text_9dfb2bbe67ac"], "success");
            } else {
                await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.CONTRACTS.BASE, {
                    method: 'POST',
                    body: JSON.stringify(payload)
                });
                showToast(i18n.catalog["text_8833d2b32281"], "success");
            }
            router.push('/06-human-capital/workforce-admin/employee-master/contracts');
        } catch (error: any) {
            showToast(error.message || i18n.catalog["text_c917377e062c"], "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="sales-card animate-fade">
            <PageSubHeader
                title={contract ? i18n.catalog["text_287d03e9b226"] : i18n.catalog["text_ad6783ceb669"]}
                titleIcon="file-contract"
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
                            disabled={!!contract} // Disable changing employee on edit if desired, usually okay to allow though
                        />
                    </div>
                    <TextInput
                        label={i18n.catalog["text_8597c570f9a8"]}
                        value={form.contract_number}
                        onChange={(e) => setForm({ ...form, contract_number: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TextInput
                        label={i18n.catalog["text_aeadcb6d908e"]}
                        type="date"
                        value={form.contract_start_date}
                        onChange={(e) => setForm({ ...form, contract_start_date: e.target.value })}
                    />
                    <TextInput
                        label={i18n.catalog["text_ec3093bd6fd5"]}
                        type="date"
                        value={form.contract_end_date}
                        onChange={(e) => setForm({ ...form, contract_end_date: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TextInput
                        label={i18n.catalog["text_9762f5030a17"]}
                        type="number"
                        value={form.base_salary}
                        onChange={(e) => setForm({ ...form, base_salary: e.target.value })}
                    />
                    <Select
                        label={i18n.catalog["text_c3a9ab5dcf7e"]}
                        value={form.contract_type}
                        onChange={(e) => setForm({ ...form, contract_type: e.target.value as any })}
                        options={[
                            { value: 'full_time', label: i18n.catalog["text_ae607c34c510"] },
                            { value: 'part_time', label: i18n.catalog["text_68b482db7711"] },
                            { value: 'contract', label: i18n.catalog["text_e2e8af908ce5"] },
                            { value: 'freelance', label: i18n.catalog["text_7d6bc53d4745"] }
                        ]}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TextInput
                        label={i18n.catalog["text_c96e85a3e66c"]}
                        type="date"
                        value={form.probation_end_date}
                        onChange={(e) => setForm({ ...form, probation_end_date: e.target.value })}
                    />

                    <div className="mt-8">
                        <Checkbox
                            id="is_current"
                            checked={form.is_current}
                            onChange={(e) => setForm({ ...form, is_current: e.target.checked })}
                            label={i18n.catalog["text_765fceeda49c"]}
                        />
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
