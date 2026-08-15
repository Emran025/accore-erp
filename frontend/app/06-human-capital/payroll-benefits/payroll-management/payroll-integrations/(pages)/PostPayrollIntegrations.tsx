"use client";

import { useI18n, catalogText, catalogMessage } from "@/lib/i18n";
import { PageSubHeader } from "@/components/layout";
import { ActionButtons, Button, Column, Dialog, showToast, Table } from "@/components/ui";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/Textarea";
import { fetchAPI } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useAuthStore } from "@/stores/useAuthStore";
import type { PostPayrollIntegration } from "@/types";
import { useEffect, useState } from "react";

const integrationTypeLabels: Record<string, string> = { bank_file: catalogMessage("humanCapital.postpayrollintegrations.bankFile"), gl_entry: catalogMessage("common.general.accountingEntries"), third_party_pay: catalogMessage("common.general.thirdPartyPayments"), garnishment: catalogMessage("common.general.salaryHold") };
const statusLabels: Record<string, string> = { pending: catalogMessage("common.general.pending"), processing: catalogMessage("common.general.processing"), completed: catalogMessage("common.general.completed"), failed: catalogMessage("common.general.failed.alternative2"), reconciled: catalogMessage("common.general.matched") };
const statusBadges: Record<string, string> = { pending: "badge-warning", processing: "badge-info", completed: "badge-success", failed: "badge-danger", reconciled: "badge-primary" };

export function PostPayrollIntegrations() {
    const { t: i18n } = useI18n();
    const { canAccess } = useAuthStore();
    const [integrations, setIntegrations] = useState<PostPayrollIntegration[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showDetailDialog, setShowDetailDialog] = useState(false);
    const [selectedItem, setSelectedItem] = useState<PostPayrollIntegration | null>(null);
    const [payrollCycles, setPayrollCycles] = useState<any[]>([]);
    const [form, setForm] = useState({ payroll_cycle_id: "", integration_type: "bank_file", file_format: "", notes: "" });

    useEffect(() => { loadIntegrations(); }, [currentPage, statusFilter, typeFilter]);
    useEffect(() => { loadPayrollCycles(); }, []);

    const loadPayrollCycles = async () => {
        try { const r: any = await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.PAYROLL.CYCLES); setPayrollCycles(r.data || (Array.isArray(r) ? r : [])); } catch { }
    };

    const loadIntegrations = async () => {
        setIsLoading(true);
        try {
            const q = new URLSearchParams({ page: currentPage.toString(), ...(statusFilter && { status: statusFilter }), ...(typeFilter && { integration_type: typeFilter }) });
            const r: any = await fetchAPI(`${API_ENDPOINTS.HUMAN_CAPITAL.POST_PAYROLL.BASE}?${q}`);
            const d = r.data || (Array.isArray(r) ? r : []);
            setIntegrations(d); setTotalPages(Number(r.last_page) || 1);
        } catch { showToast(i18n.catalog["humanCapital.postpayrollintegrations.failedLoadIntegrations"], "error"); }
        finally { setIsLoading(false); }
    };

    const handleCreate = async () => {
        if (!form.payroll_cycle_id || !form.integration_type) { showToast(i18n.catalog["humanCapital.postpayrollintegrations.pleaseSelectCycleType"], "error"); return; }
        try {
            await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.POST_PAYROLL.BASE, { method: "POST", body: JSON.stringify({ payroll_cycle_id: Number(form.payroll_cycle_id), integration_type: form.integration_type, file_format: form.file_format || undefined, notes: form.notes || undefined }) });
            showToast(i18n.catalog["humanCapital.postpayrollintegrations.integrationCreatedSuccessfully"], "success"); setShowCreateDialog(false); loadIntegrations();
        } catch (e: any) { showToast(e.message || i18n.catalog["common.general.creationFailed"], "error"); }
    };

    const handleProcess = async (id: number) => {
        try {
            await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.POST_PAYROLL.PROCESS(id), { method: "POST" });
            showToast(i18n.catalog["humanCapital.postpayrollintegrations.processingStarted"], "success"); loadIntegrations();
        } catch (e: any) { showToast(e.message || i18n.catalog["humanCapital.postpayrollintegrations.processingFailed"], "error"); }
    };

    const handleReconcile = async (id: number) => {
        const item = integrations.find(i => i.id === id);
        try {
            await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.POST_PAYROLL.RECONCILE(id), { method: "POST", body: JSON.stringify({ reconciled_amount: item?.total_amount || 0 }) });
            showToast(i18n.catalog["humanCapital.postpayrollintegrations.matchedSuccessfully"], "success"); loadIntegrations();
        } catch (e: any) { showToast(e.message || i18n.catalog["humanCapital.postpayrollintegrations.matchingFailed"], "error"); }
    };

    const columns: Column<PostPayrollIntegration>[] = [
        { key: "payroll_cycle", header: i18n.catalog["humanCapital.postpayrollintegrations.payrollCycle"], dataLabel: i18n.catalog["common.general.cycle"], render: (i) => i.payroll_cycle?.cycle_name || catalogText(i18n, "common.general.course", { value0: i.payroll_cycle_id }) },
        { key: "integration_type", header: i18n.catalog["common.general.type.alternative3"], dataLabel: i18n.catalog["common.general.type.alternative3"], render: (i) => integrationTypeLabels[i.integration_type] || i.integration_type },
        { key: "total_amount", header: i18n.catalog["common.general.amount"], dataLabel: i18n.catalog["common.general.amount"], render: (i) => formatCurrency(i.total_amount) },
        { key: "transaction_count", header: i18n.catalog["common.general.transactions"], dataLabel: i18n.catalog["common.general.transactions"] },
        { key: "status", header: i18n.catalog["common.general.status.alternative2"], dataLabel: i18n.catalog["common.general.status.alternative2"], render: (i) => <span className={`badge ${statusBadges[i.status]}`}>{statusLabels[i.status]}</span> },
        { key: "processed_at", header: i18n.catalog["humanCapital.postpayrollintegrations.processingDate"], dataLabel: i18n.catalog["humanCapital.postpayrollintegrations.processing"], render: (i) => i.processed_at ? formatDate(i.processed_at) : "-" },
        {
            key: "id", header: i18n.catalog["common.general.actions.alternative2"], dataLabel: i18n.catalog["common.general.actions.alternative2"], render: (i) => (
                <ActionButtons
                    actions={[
                        {
                            icon: "eye",
                            title: i18n.catalog["common.general.details"],
                            variant: "view",
                            onClick: () => { setSelectedItem(i); setShowDetailDialog(true); }
                        },
                        ...(canAccess("payroll", "edit") ? [{
                            icon: "settings" as const,
                            title: i18n.catalog["common.general.processing.alternative2"],
                            variant: "view" as const,
                            onClick: () => handleProcess(i.id),
                            hidden: i.status !== "pending"
                        }] : []),
                        ...(canAccess("payroll", "edit") ? [{
                            icon: "check-check" as const,
                            title: i18n.catalog["common.general.matching"],
                            variant: "success" as const,
                            onClick: () => handleReconcile(i.id),
                            hidden: i.status !== "completed"
                        }] : [])
                    ]}
                />
            )
        },
    ];

    return (
        <div className="sales-card animate-fade">
            <PageSubHeader
                title={i18n.catalog["humanCapital.postpayrollintegrations.payrollIntegrations"]}
                titleIcon="repeat"
                actions={
                    <>
                        <Select
                            value={typeFilter}
                            onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
                            style={{ minWidth: "140px" }}
                            placeholder={i18n.catalog["common.general.allTypes"]}
                            options={Object.entries(integrationTypeLabels).map(([value, label]) => ({ value, label }))}
                        />
                        <Select
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                            style={{ minWidth: "140px" }}
                            placeholder={i18n.catalog["common.general.allStatuses"]}
                            options={Object.entries(statusLabels).map(([value, label]) => ({ value, label })).filter(o => ["pending", "completed", "reconciled", "failed"].includes(o.value))}
                        />
                        {canAccess("payroll", "create") && (
                            <Button
                                onClick={() => { setForm({ payroll_cycle_id: "", integration_type: "bank_file", file_format: "", notes: "" }); setShowCreateDialog(true); }}
                                variant="primary"
                                icon="plus"
                            >
                                {i18n.catalog["common.general.newIntegration"]}</Button>
                        )}
                    </>
                }
            />

            <div className="sales-card compact" style={{ marginBottom: "1.5rem", background: "linear-gradient(135deg, #ede9fe 0%, #f5f3ff 100%)", border: "1px solid #ddd6fe" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem" }}>
                    <div className="stat-card"><div className="stat-label">{i18n.catalog["common.general.total.alternative3"]}</div><div className="stat-value">{integrations.length}</div></div>
                    <div className="stat-card"><div className="stat-label">{i18n.catalog["common.general.pending.alternative3"]}</div><div className="stat-value text-warning">{integrations.filter(i => i.status === "pending").length}</div></div>
                    <div className="stat-card"><div className="stat-label">{i18n.catalog["common.general.completed.alternative2"]}</div><div className="stat-value text-success">{integrations.filter(i => i.status === "completed").length}</div></div>
                    <div className="stat-card"><div className="stat-label">{i18n.catalog["common.general.matched"]}</div><div className="stat-value text-info">{integrations.filter(i => i.status === "reconciled").length}</div></div>
                </div>
            </div>

            <Table columns={columns} data={integrations} keyExtractor={(i) => i.id.toString()} emptyMessage={i18n.catalog["humanCapital.postpayrollintegrations.noIntegrations"]} isLoading={isLoading} pagination={{ currentPage, totalPages, onPageChange: setCurrentPage }} />

            {/* Create Dialog */}
            <Dialog isOpen={showCreateDialog} onClose={() => setShowCreateDialog(false)} title={i18n.catalog["common.general.newIntegration"]} maxWidth="600px">
                <div className="space-y-4">
                    <Select
                        label={i18n.catalog["humanCapital.postpayrollintegrations.payrollCycle.alternative2"]}
                        value={form.payroll_cycle_id}
                        onChange={(e) => setForm({ ...form, payroll_cycle_id: e.target.value })}
                        options={payrollCycles.map(c => ({ value: c.id, label: c.cycle_name || catalogText(i18n, "common.general.course", { value0: c.id }) }))}
                        placeholder={i18n.catalog["common.general.selectPeriod"]}
                    />
                    <Select
                        label={i18n.catalog["humanCapital.postpayrollintegrations.integrationType"]}
                        value={form.integration_type}
                        onChange={(e) => setForm({ ...form, integration_type: e.target.value })}
                        options={[
                            { value: 'bank_file', label: i18n.catalog["humanCapital.postpayrollintegrations.bankFileNachaSepa"] },
                            { value: 'gl_entry', label: i18n.catalog["common.general.accountingEntries"] },
                            { value: 'third_party_pay', label: i18n.catalog["common.general.thirdPartyPayments"] },
                            { value: 'garnishment', label: i18n.catalog["common.general.salaryHold"] }
                        ]}
                    />
                    <Textarea label={i18n.catalog["common.general.notes.alternative2"]} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
                    <div className="flex justify-end gap-2" style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid var(--border-color)" }}><Button variant="secondary" onClick={() => setShowCreateDialog(false)}>{i18n.catalog["common.general.cancel"]}</Button><Button variant="primary" onClick={handleCreate} icon="save">{i18n.catalog["common.general.create"]}</Button></div>
                </div>
            </Dialog>

            {/* Detail Dialog */}
            <Dialog isOpen={showDetailDialog} onClose={() => setShowDetailDialog(false)} title={i18n.catalog["humanCapital.postpayrollintegrations.integrationDetails"]} maxWidth="700px">
                {selectedItem && <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><strong>{i18n.catalog["humanCapital.postpayrollintegrations.payrollCycle.alternative3"]}</strong> {selectedItem.payroll_cycle?.cycle_name || `#${selectedItem.payroll_cycle_id}`}</div>
                        <div><strong>{i18n.catalog["common.general.type"]}</strong> {integrationTypeLabels[selectedItem.integration_type]}</div>
                        <div><strong>{i18n.catalog["common.general.amount.alternative4"]}</strong> {formatCurrency(selectedItem.total_amount)}</div>
                        <div><strong>{i18n.catalog["humanCapital.postpayrollintegrations.transactions"]}</strong> {selectedItem.transaction_count}</div>
                        <div><strong>{i18n.catalog["common.general.status"]}</strong> <span className={`badge ${statusBadges[selectedItem.status]}`}>{statusLabels[selectedItem.status]}</span></div>
                        {selectedItem.processed_at && <div><strong>{i18n.catalog["humanCapital.postpayrollintegrations.processingDate.alternative2"]}</strong> {formatDate(selectedItem.processed_at)}</div>}
                        {selectedItem.reconciled_at && <div><strong>{i18n.catalog["humanCapital.postpayrollintegrations.matchDate"]}</strong> {formatDate(selectedItem.reconciled_at)}</div>}
                        {selectedItem.file_path && <div><strong>{i18n.catalog["humanCapital.postpayrollintegrations.file"]}</strong> {selectedItem.file_path}</div>}
                        {selectedItem.error_message && <div style={{ color: "var(--danger-color)" }}><strong>{i18n.catalog["common.general.error"]}</strong> {selectedItem.error_message}</div>}
                    </div>
                    {selectedItem.notes && <div><strong>{i18n.catalog["common.general.notes"]}</strong><p>{selectedItem.notes}</p></div>}
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                        {selectedItem.status === "pending" && <Button variant="primary" onClick={() => { handleProcess(selectedItem.id); setShowDetailDialog(false); }} icon="settings">{i18n.catalog["common.general.processing.alternative2"]}</Button>}
                        {selectedItem.status === "completed" && <Button variant="primary" onClick={() => { handleReconcile(selectedItem.id); setShowDetailDialog(false); }} icon="check-check">{i18n.catalog["common.general.matching"]}</Button>}
                    </div>
                </div>}
            </Dialog>
        </div>
    );
}
