"use client";

import { useI18n, catalogMessage } from "@/lib/i18n";
import { PageSubHeader } from "@/components/layout";
import { ActionButtons, Button, Column, Dialog, Label, SearchableSelect, showToast, Table } from "@/components/ui";
import { TextInput } from "@/components/ui/TextInput";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/select";
import { fetchAPI } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useAuthStore } from "@/stores/useAuthStore";
import { useEmployeeStore } from "@/stores/useEmployeeStore";
import type { Employee, EmployeeLoan } from "@/types";
import { useEffect, useState } from "react";

const loanTypeLabels: Record<string, string> = {
    salary_advance: catalogMessage("text_2ad883313526"), housing: catalogMessage("text_ed2e67025bbd"), car: catalogMessage("text_a1a19dd8094a"),
    personal: catalogMessage("text_c4d650b9d744"), other: catalogMessage("text_17a9f38e22b6"),
};
const statusLabels: Record<string, string> = {
    pending: catalogMessage("text_701d5d7a86f9"), approved: catalogMessage("text_a98d8a418ba0"), active: catalogMessage("text_629e90b3af3d"),
    completed: catalogMessage("text_c2da5684d63b"), cancelled: catalogMessage("text_616d302cb016"), defaulted: catalogMessage("text_d506fdf79c68"),
};
const statusBadges: Record<string, string> = {
    pending: "badge-warning", approved: "badge-info", active: "badge-success",
    completed: "badge-secondary", cancelled: "badge-secondary", defaulted: "badge-danger",
};

export function EmployeeLoans() {
    const { t: i18n } = useI18n();
    const [loans, setLoans] = useState<EmployeeLoan[]>([]);
    const { allEmployees: employees, loadAllEmployees } = useEmployeeStore();
    const { canAccess } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState("");
    const [totalRecords, setTotalRecords] = useState(0);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showDetailDialog, setShowDetailDialog] = useState(false);
    const [selectedLoan, setSelectedLoan] = useState<EmployeeLoan | null>(null);
    const [form, setForm] = useState({
        employee_id: "", loan_type: "personal", loan_amount: "", interest_rate: "0",
        installment_count: "12", start_date: new Date().toISOString().split("T")[0],
        auto_deduction: true, notes: "",
    });

    useEffect(() => { loadAllEmployees(); }, [loadAllEmployees]);
    useEffect(() => { loadLoans(); }, [currentPage, statusFilter]);

    const loadLoans = async () => {
        setIsLoading(true);
        try {
            const q = new URLSearchParams({ page: currentPage.toString(), ...(statusFilter && { status: statusFilter }) });
            const res: any = await fetchAPI(`${API_ENDPOINTS.HUMAN_CAPITAL.EMPLOYEE_LOANS.BASE}?${q}`);
            const data = res.data || (Array.isArray(res) ? res : []);
            setLoans(data); setTotalPages(Number(res.last_page) || 1); setTotalRecords(Number(res.total) || data.length);
        } catch (e) { console.error(e); showToast(i18n.catalog["text_56ebf13a16a2"], "error"); }
        finally { setIsLoading(false); }
    };

    const openCreate = () => {
        setForm({ employee_id: "", loan_type: "personal", loan_amount: "", interest_rate: "0", installment_count: "12", start_date: new Date().toISOString().split("T")[0], auto_deduction: true, notes: "" });
        setShowCreateDialog(true);
    };

    const handleSave = async () => {
        if (!form.employee_id || !form.loan_amount || !form.installment_count) { showToast(i18n.catalog["text_0a8eb85d0081"], "error"); return; }
        try {
            await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.EMPLOYEE_LOANS.BASE, {
                method: "POST", body: JSON.stringify({
                    employee_id: Number(form.employee_id), loan_type: form.loan_type, loan_amount: Number(form.loan_amount),
                    interest_rate: Number(form.interest_rate) || 0, installment_count: Number(form.installment_count),
                    start_date: form.start_date, auto_deduction: form.auto_deduction, notes: form.notes || undefined,
                })
            });
            showToast(i18n.catalog["text_093c2367eb42"], "success"); setShowCreateDialog(false); loadLoans();
        } catch (e: any) { showToast(e.message || i18n.catalog["text_b30ed0d598cd"], "error"); }
    };

    const openDetail = async (loan: EmployeeLoan) => {
        try { const res: any = await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.EMPLOYEE_LOANS.withId(loan.id)); setSelectedLoan(res.data || res); }
        catch { setSelectedLoan(loan); }
        setShowDetailDialog(true);
    };

    const handleStatusUpdate = async (id: number, status: string) => {
        try {
            await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.EMPLOYEE_LOANS.STATUS(id), { method: "PUT", body: JSON.stringify({ status }) });
            showToast(i18n.catalog["text_825d48a2bba3"], "success"); loadLoans();
        } catch (e: any) { showToast(e.message || i18n.catalog["text_0b460415228d"], "error"); }
    };

    const handleRecordRepayment = async (loanId: number, repaymentId: number) => {
        try {
            await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.EMPLOYEE_LOANS.REPAYMENT(loanId, repaymentId), { method: "PUT", body: JSON.stringify({ paid_date: new Date().toISOString().split("T")[0] }) });
            showToast(i18n.catalog["text_6f83df16a0aa"], "success"); openDetail({ id: loanId } as EmployeeLoan); loadLoans();
        } catch (e: any) { showToast(e.message || i18n.catalog["text_2742e3d81f29"], "error"); }
    };

    const calcPreview = () => {
        const p = Number(form.loan_amount) || 0; const r = (Number(form.interest_rate) || 0) / 100 / 12; const n = Number(form.installment_count) || 1;
        return r > 0 ? (p * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)).toFixed(2) : (p / n).toFixed(2);
    };

    const columns: Column<EmployeeLoan>[] = [
        { key: "loan_number", header: i18n.catalog["text_16c4a8cdd0a8"], dataLabel: i18n.catalog["text_16c4a8cdd0a8"] },
        { key: "employee", header: i18n.catalog["text_b71a39c832a6"], dataLabel: i18n.catalog["text_b71a39c832a6"], render: (item) => item.employee?.full_name || "-" },
        { key: "loan_type", header: i18n.catalog["text_caa3f2bb4a36"], dataLabel: i18n.catalog["text_caa3f2bb4a36"], render: (item) => loanTypeLabels[item.loan_type] || item.loan_type },
        { key: "loan_amount", header: i18n.catalog["text_1cd480f91b24"], dataLabel: i18n.catalog["text_1cd480f91b24"], render: (item) => formatCurrency(item.loan_amount) },
        { key: "monthly_installment", header: i18n.catalog["text_bfff6d7edaab"], dataLabel: i18n.catalog["text_bfff6d7edaab"], render: (item) => formatCurrency(item.monthly_installment) },
        { key: "remaining_balance", header: i18n.catalog["text_b2127e3a35be"], dataLabel: i18n.catalog["text_b2127e3a35be"], render: (item) => formatCurrency(item.remaining_balance) },
        { key: "status", header: i18n.catalog["text_c3a4749caed4"], dataLabel: i18n.catalog["text_c3a4749caed4"], render: (item) => <span className={`badge ${statusBadges[item.status] || "badge-secondary"}`}>{statusLabels[item.status] || item.status}</span> },
        {
            key: "id", header: i18n.catalog["text_7797240d6caf"], dataLabel: i18n.catalog["text_7797240d6caf"], render: (item) => (
                <ActionButtons
                    actions={[
                        {
                            icon: "eye",
                            title: i18n.catalog["text_29f382c73779"],
                            variant: "view",
                            onClick: () => openDetail(item)
                        },
                        ...(canAccess("loans", "edit") ? [{
                            icon: "check" as const,
                            title: i18n.catalog["text_f4e17def8c1b"],
                            variant: "success" as const,
                            onClick: () => handleStatusUpdate(item.id, "approved"),
                            hidden: item.status !== "pending"
                        }] : []),
                        ...(canAccess("loans", "edit") ? [{
                            icon: "x" as const,
                            title: i18n.catalog["text_eb3b1bcc04e5"],
                            variant: "delete" as const,
                            onClick: () => handleStatusUpdate(item.id, "cancelled"),
                            hidden: item.status !== "pending"
                        }] : [])
                    ]}
                />
            )
        },
    ];

    return (
        <div className="sales-card animate-fade">
            <PageSubHeader
                title={i18n.catalog["text_336a408fc831"]}
                titleIcon="hand-holding-usd"
                actions={
                    <>
                        <Select
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                            style={{ minWidth: "140px" }}
                            placeholder={i18n.catalog["text_1ef213109d57"]}
                            options={Object.entries(statusLabels).map(([value, label]) => ({ value, label })).filter(o => ["pending", "active", "completed"].includes(o.value))}
                        />
                        {canAccess("loans", "create") && (
                            <Button
                                variant="primary"
                                icon="plus"
                                onClick={openCreate}
                            >
                                {i18n.catalog["text_f10642b2f120"]}</Button>
                        )}
                    </>
                }
            />
            <div className="sales-card compact" style={{ marginBottom: "1.5rem", background: "linear-gradient(135deg, #dcfce7 0%, #f0fdf4 100%)", border: "1px solid #bbf7d0" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem" }}>
                    <div className="stat-card"><div className="stat-label">{i18n.catalog["text_baed6e999960"]}</div><div className="stat-value">{totalRecords}</div></div>
                    <div className="stat-card"><div className="stat-label">{i18n.catalog["text_debc42b60ecd"]}</div><div className="stat-value text-warning">{loans.filter(l => l.status === "pending").length}</div></div>
                    <div className="stat-card"><div className="stat-label">{i18n.catalog["text_8ab217d48613"]}</div><div className="stat-value text-success">{loans.filter(l => l.status === "active").length}</div></div>
                    <div className="stat-card"><div className="stat-label">{i18n.catalog["text_f1d6d15f76da"]}</div><div className="stat-value text-info">{loans.filter(l => l.status === "completed").length}</div></div>
                </div>
            </div>
            <Table columns={columns} data={loans} keyExtractor={(i) => i.id.toString()} emptyMessage={i18n.catalog["text_484bff8a4b0e"]} isLoading={isLoading} pagination={{ currentPage, totalPages, onPageChange: setCurrentPage }} />

            {/* Create Dialog */}
            <Dialog isOpen={showCreateDialog} onClose={() => setShowCreateDialog(false)} title={i18n.catalog["text_99b33d1ebd90"]} maxWidth="700px">
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <Label className="text-secondary mb-1">{i18n.catalog["text_972803dc7d86"]}</Label>
                            <SearchableSelect options={employees.map((e: Employee) => ({ value: e.id.toString(), label: e.full_name }))} value={form.employee_id} onChange={(v) => setForm(p => ({ ...p, employee_id: v?.toString() || "" }))} placeholder={i18n.catalog["text_dee783929dea"]} />
                        </div>
                        <Select label={i18n.catalog["text_101593eb8fe4"]} value={form.loan_type} onChange={(e) => setForm({ ...form, loan_type: e.target.value })} options={Object.entries(loanTypeLabels).map(([value, label]) => ({ value, label }))} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <TextInput label={i18n.catalog["text_0d0d28f149b8"]} type="number" value={form.loan_amount} onChange={(e) => setForm({ ...form, loan_amount: e.target.value })} />
                        <TextInput label={i18n.catalog["text_d46b85faea87"]} type="number" value={form.interest_rate} onChange={(e) => setForm({ ...form, interest_rate: e.target.value })} />
                        <TextInput label={i18n.catalog["text_57f9c5fcbf37"]} type="number" value={form.installment_count} onChange={(e) => setForm({ ...form, installment_count: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <TextInput label={i18n.catalog["text_90f719b91522"]} type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
                        <div style={{ display: "flex", alignItems: "flex-end", gap: "0.5rem", paddingBottom: "1.25rem" }}>
                            <input type="checkbox" checked={form.auto_deduction} onChange={(e) => setForm({ ...form, auto_deduction: e.target.checked })} id="ad" />
                            <Label htmlFor="ad" className="text-secondary">{i18n.catalog["text_e4a4310f1b63"]}</Label>
                        </div>
                    </div>
                    {form.loan_amount && form.installment_count && <div className="sales-card compact" style={{ background: "linear-gradient(135deg,#e0f2fe,#f0f9ff)", border: "1px solid #bae6fd", padding: "1rem" }}><strong>{i18n.catalog["text_48197bce7839"]}</strong> <span style={{ fontWeight: "bold", color: "var(--primary-color)" }}>{formatCurrency(Number(calcPreview()))}</span></div>}
                    <Textarea label={i18n.catalog["text_d446d2dc6b81"]} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
                    <div className="flex justify-end gap-2" style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid var(--border-color)" }}><Button variant="secondary" onClick={() => setShowCreateDialog(false)}>{i18n.catalog["text_9a30dc2a96b8"]}</Button><Button variant="primary" onClick={handleSave} icon="save">{i18n.catalog["text_ddfcaf9d0144"]}</Button></div>
                </div>
            </Dialog>

            {/* Detail Dialog */}
            <Dialog isOpen={showDetailDialog} onClose={() => setShowDetailDialog(false)} title={i18n.catalog["text_9473909d9246"]} maxWidth="900px">
                {selectedLoan && <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div><strong>{i18n.catalog["text_0c6013848e7f"]}</strong> {selectedLoan.loan_number}</div><div><strong>{i18n.catalog["text_b6293eeef8b9"]}</strong> {selectedLoan.employee?.full_name || "-"}</div>
                        <div><strong>{i18n.catalog["text_0e20d829bef2"]}</strong> {loanTypeLabels[selectedLoan.loan_type] || selectedLoan.loan_type}</div><div><strong>{i18n.catalog["text_47687d58c7e2"]}</strong> {formatCurrency(selectedLoan.loan_amount)}</div>
                        <div><strong>{i18n.catalog["text_e523c5a665e0"]}</strong> {formatCurrency(selectedLoan.monthly_installment)}</div><div><strong>{i18n.catalog["text_d9c2f6959bb3"]}</strong> {formatCurrency(selectedLoan.remaining_balance)}</div>
                        <div><strong>{i18n.catalog["text_02e196bdec60"]}</strong> <span className={`badge ${statusBadges[selectedLoan.status]}`}>{statusLabels[selectedLoan.status]}</span></div>
                        <div><strong>{i18n.catalog["text_40957348b993"]}</strong> {formatDate(selectedLoan.start_date)}</div><div><strong>{i18n.catalog["text_2017ca0dd13a"]}</strong> {formatDate(selectedLoan.end_date)}</div>
                    </div>
                    {selectedLoan.status === "pending" && canAccess("loans", "edit") && (
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                            <Button variant="primary" icon="check" onClick={() => handleStatusUpdate(selectedLoan.id, "approved")}>{i18n.catalog["text_f4e17def8c1b"]}</Button>
                            <Button variant="secondary" icon="x" onClick={() => handleStatusUpdate(selectedLoan.id, "cancelled")}>{i18n.catalog["text_eb3b1bcc04e5"]}</Button>
                        </div>
                    )}
                    <div><h4 style={{ marginBottom: "0.5rem" }}>{i18n.catalog["text_f0c74cded1bc"]}</h4>
                        {selectedLoan.repayments && selectedLoan.repayments.length > 0 ? <div style={{ maxHeight: "300px", overflowY: "auto" }}><table className="table" style={{ width: "100%", fontSize: "0.9rem" }}><thead><tr><th>#</th><th>{i18n.catalog["text_095205f4d3c6"]}</th><th>{i18n.catalog["text_1cd480f91b24"]}</th><th>{i18n.catalog["text_deed2fbb770e"]}</th><th>{i18n.catalog["text_60ce18b502bd"]}</th><th>{i18n.catalog["text_c3a4749caed4"]}</th><th>{i18n.catalog["text_8b2c85333b99"]}</th></tr></thead><tbody>
                            {selectedLoan.repayments.map(r => <tr key={r.id}><td>{r.installment_number}</td><td>{formatDate(r.due_date)}</td><td>{formatCurrency(r.amount)}</td><td>{formatCurrency(r.principal)}</td><td>{formatCurrency(r.interest)}</td><td><span className={`badge ${r.status === "paid" ? "badge-success" : "badge-warning"}`}>{r.status === "paid" ? i18n.catalog["text_75f7db4415ec"] : i18n.catalog["text_701d5d7a86f9"]}</span></td><td>{r.status === "pending" && selectedLoan.status === "active" && canAccess("loans", "edit") && (
                                <ActionButtons
                                    actions={[
                                        {
                                            icon: "check-circle" as const,
                                            title: i18n.catalog["text_ee20bfe88097"],
                                            variant: "success" as const,
                                            onClick: () => handleRecordRepayment(selectedLoan.id, r.id)
                                        }
                                    ]}
                                />
                            )}</td></tr>)}
                        </tbody></table></div> : <p style={{ color: "var(--text-muted)" }}>{i18n.catalog["text_faf1a3ab347e"]}</p>}
                    </div>
                </div>}
            </Dialog>
        </div>
    );
}
