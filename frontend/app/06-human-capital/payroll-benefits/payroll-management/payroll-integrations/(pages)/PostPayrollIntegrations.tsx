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

const integrationTypeLabels: Record<string, string> = { bank_file: catalogMessage("text_994ecade540d"), gl_entry: catalogMessage("text_6f81d7a200b7"), third_party_pay: catalogMessage("text_5aea4ae4eea5"), garnishment: catalogMessage("text_5259c89ebe12") };
const statusLabels: Record<string, string> = { pending: catalogMessage("text_701d5d7a86f9"), processing: catalogMessage("text_0cc6a7db6080"), completed: catalogMessage("text_c2da5684d63b"), failed: catalogMessage("text_2519fef457aa"), reconciled: catalogMessage("text_261530fdf2ae") };
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
        } catch { showToast(i18n.catalog["text_54b37005fc56"], "error"); }
        finally { setIsLoading(false); }
    };

    const handleCreate = async () => {
        if (!form.payroll_cycle_id || !form.integration_type) { showToast(i18n.catalog["text_e55cd36507bd"], "error"); return; }
        try {
            await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.POST_PAYROLL.BASE, { method: "POST", body: JSON.stringify({ payroll_cycle_id: Number(form.payroll_cycle_id), integration_type: form.integration_type, file_format: form.file_format || undefined, notes: form.notes || undefined }) });
            showToast(i18n.catalog["text_b2bc58a7902f"], "success"); setShowCreateDialog(false); loadIntegrations();
        } catch (e: any) { showToast(e.message || i18n.catalog["text_33807b6d3510"], "error"); }
    };

    const handleProcess = async (id: number) => {
        try {
            await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.POST_PAYROLL.PROCESS(id), { method: "POST" });
            showToast(i18n.catalog["text_dd884dcf0053"], "success"); loadIntegrations();
        } catch (e: any) { showToast(e.message || i18n.catalog["text_b061090f67fa"], "error"); }
    };

    const handleReconcile = async (id: number) => {
        const item = integrations.find(i => i.id === id);
        try {
            await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.POST_PAYROLL.RECONCILE(id), { method: "POST", body: JSON.stringify({ reconciled_amount: item?.total_amount || 0 }) });
            showToast(i18n.catalog["text_75d18ca92da4"], "success"); loadIntegrations();
        } catch (e: any) { showToast(e.message || i18n.catalog["text_3b789f09aafa"], "error"); }
    };

    const columns: Column<PostPayrollIntegration>[] = [
        { key: "payroll_cycle", header: i18n.catalog["text_2621c929ae1c"], dataLabel: i18n.catalog["text_41195137d9ea"], render: (i) => i.payroll_cycle?.cycle_name || catalogText(i18n, "text_640a58e2463d", { value0: i.payroll_cycle_id }) },
        { key: "integration_type", header: i18n.catalog["text_caa3f2bb4a36"], dataLabel: i18n.catalog["text_caa3f2bb4a36"], render: (i) => integrationTypeLabels[i.integration_type] || i.integration_type },
        { key: "total_amount", header: i18n.catalog["text_1cd480f91b24"], dataLabel: i18n.catalog["text_1cd480f91b24"], render: (i) => formatCurrency(i.total_amount) },
        { key: "transaction_count", header: i18n.catalog["text_af7fb819a8a2"], dataLabel: i18n.catalog["text_af7fb819a8a2"] },
        { key: "status", header: i18n.catalog["text_c3a4749caed4"], dataLabel: i18n.catalog["text_c3a4749caed4"], render: (i) => <span className={`badge ${statusBadges[i.status]}`}>{statusLabels[i.status]}</span> },
        { key: "processed_at", header: i18n.catalog["text_0e9a98c21383"], dataLabel: i18n.catalog["text_6423b630e42d"], render: (i) => i.processed_at ? formatDate(i.processed_at) : "-" },
        {
            key: "id", header: i18n.catalog["text_9f0a0f722601"], dataLabel: i18n.catalog["text_9f0a0f722601"], render: (i) => (
                <ActionButtons
                    actions={[
                        {
                            icon: "eye",
                            title: i18n.catalog["text_29f382c73779"],
                            variant: "view",
                            onClick: () => { setSelectedItem(i); setShowDetailDialog(true); }
                        },
                        ...(canAccess("payroll", "edit") ? [{
                            icon: "settings" as const,
                            title: i18n.catalog["text_526d1e74634d"],
                            variant: "view" as const,
                            onClick: () => handleProcess(i.id),
                            hidden: i.status !== "pending"
                        }] : []),
                        ...(canAccess("payroll", "edit") ? [{
                            icon: "check-check" as const,
                            title: i18n.catalog["text_1105887afdb7"],
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
                title={i18n.catalog["text_39d5891a5bc7"]}
                titleIcon="repeat"
                actions={
                    <>
                        <Select
                            value={typeFilter}
                            onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
                            style={{ minWidth: "140px" }}
                            placeholder={i18n.catalog["text_76b1679edecf"]}
                            options={Object.entries(integrationTypeLabels).map(([value, label]) => ({ value, label }))}
                        />
                        <Select
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                            style={{ minWidth: "140px" }}
                            placeholder={i18n.catalog["text_1ef213109d57"]}
                            options={Object.entries(statusLabels).map(([value, label]) => ({ value, label })).filter(o => ["pending", "completed", "reconciled", "failed"].includes(o.value))}
                        />
                        {canAccess("payroll", "create") && (
                            <Button
                                onClick={() => { setForm({ payroll_cycle_id: "", integration_type: "bank_file", file_format: "", notes: "" }); setShowCreateDialog(true); }}
                                variant="primary"
                                icon="plus"
                            >
                                {i18n.catalog["text_d0c535ea4e12"]}</Button>
                        )}
                    </>
                }
            />

            <div className="sales-card compact" style={{ marginBottom: "1.5rem", background: "linear-gradient(135deg, #ede9fe 0%, #f5f3ff 100%)", border: "1px solid #ddd6fe" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem" }}>
                    <div className="stat-card"><div className="stat-label">{i18n.catalog["text_baed6e999960"]}</div><div className="stat-value">{integrations.length}</div></div>
                    <div className="stat-card"><div className="stat-label">{i18n.catalog["text_debc42b60ecd"]}</div><div className="stat-value text-warning">{integrations.filter(i => i.status === "pending").length}</div></div>
                    <div className="stat-card"><div className="stat-label">{i18n.catalog["text_f1d6d15f76da"]}</div><div className="stat-value text-success">{integrations.filter(i => i.status === "completed").length}</div></div>
                    <div className="stat-card"><div className="stat-label">{i18n.catalog["text_261530fdf2ae"]}</div><div className="stat-value text-info">{integrations.filter(i => i.status === "reconciled").length}</div></div>
                </div>
            </div>

            <Table columns={columns} data={integrations} keyExtractor={(i) => i.id.toString()} emptyMessage={i18n.catalog["text_71b55ae9586d"]} isLoading={isLoading} pagination={{ currentPage, totalPages, onPageChange: setCurrentPage }} />

            {/* Create Dialog */}
            <Dialog isOpen={showCreateDialog} onClose={() => setShowCreateDialog(false)} title={i18n.catalog["text_d0c535ea4e12"]} maxWidth="600px">
                <div className="space-y-4">
                    <Select
                        label={i18n.catalog["text_75fa80e83a13"]}
                        value={form.payroll_cycle_id}
                        onChange={(e) => setForm({ ...form, payroll_cycle_id: e.target.value })}
                        options={payrollCycles.map(c => ({ value: c.id, label: c.cycle_name || catalogText(i18n, "text_640a58e2463d", { value0: c.id }) }))}
                        placeholder={i18n.catalog["text_9f23ce35c60c"]}
                    />
                    <Select
                        label={i18n.catalog["text_37543473ff6b"]}
                        value={form.integration_type}
                        onChange={(e) => setForm({ ...form, integration_type: e.target.value })}
                        options={[
                            { value: 'bank_file', label: i18n.catalog["text_099faeff0ce8"] },
                            { value: 'gl_entry', label: i18n.catalog["text_6f81d7a200b7"] },
                            { value: 'third_party_pay', label: i18n.catalog["text_5aea4ae4eea5"] },
                            { value: 'garnishment', label: i18n.catalog["text_5259c89ebe12"] }
                        ]}
                    />
                    <Textarea label={i18n.catalog["text_d446d2dc6b81"]} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
                    <div className="flex justify-end gap-2" style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid var(--border-color)" }}><Button variant="secondary" onClick={() => setShowCreateDialog(false)}>{i18n.catalog["text_9a30dc2a96b8"]}</Button><Button variant="primary" onClick={handleCreate} icon="save">{i18n.catalog["text_a820f3590d36"]}</Button></div>
                </div>
            </Dialog>

            {/* Detail Dialog */}
            <Dialog isOpen={showDetailDialog} onClose={() => setShowDetailDialog(false)} title={i18n.catalog["text_1621dfe2706e"]} maxWidth="700px">
                {selectedItem && <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><strong>{i18n.catalog["text_94c4e45c5a6b"]}</strong> {selectedItem.payroll_cycle?.cycle_name || `#${selectedItem.payroll_cycle_id}`}</div>
                        <div><strong>{i18n.catalog["text_0e20d829bef2"]}</strong> {integrationTypeLabels[selectedItem.integration_type]}</div>
                        <div><strong>{i18n.catalog["text_47687d58c7e2"]}</strong> {formatCurrency(selectedItem.total_amount)}</div>
                        <div><strong>{i18n.catalog["text_9288d9f87aed"]}</strong> {selectedItem.transaction_count}</div>
                        <div><strong>{i18n.catalog["text_02e196bdec60"]}</strong> <span className={`badge ${statusBadges[selectedItem.status]}`}>{statusLabels[selectedItem.status]}</span></div>
                        {selectedItem.processed_at && <div><strong>{i18n.catalog["text_65224472fea8"]}</strong> {formatDate(selectedItem.processed_at)}</div>}
                        {selectedItem.reconciled_at && <div><strong>{i18n.catalog["text_62e0b2dd14d5"]}</strong> {formatDate(selectedItem.reconciled_at)}</div>}
                        {selectedItem.file_path && <div><strong>{i18n.catalog["text_c8e1a47d081d"]}</strong> {selectedItem.file_path}</div>}
                        {selectedItem.error_message && <div style={{ color: "var(--danger-color)" }}><strong>{i18n.catalog["text_4c4968aba347"]}</strong> {selectedItem.error_message}</div>}
                    </div>
                    {selectedItem.notes && <div><strong>{i18n.catalog["text_8c9d1b5aec34"]}</strong><p>{selectedItem.notes}</p></div>}
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                        {selectedItem.status === "pending" && <Button variant="primary" onClick={() => { handleProcess(selectedItem.id); setShowDetailDialog(false); }} icon="settings">{i18n.catalog["text_526d1e74634d"]}</Button>}
                        {selectedItem.status === "completed" && <Button variant="primary" onClick={() => { handleReconcile(selectedItem.id); setShowDetailDialog(false); }} icon="check-check">{i18n.catalog["text_1105887afdb7"]}</Button>}
                    </div>
                </div>}
            </Dialog>
        </div>
    );
}
