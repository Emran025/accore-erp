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
    salary_advance: catalogMessage("humanCapital.employeeloans.salaryAdvance"), housing: catalogMessage("humanCapital.employeeloans.housingLoan"), car: catalogMessage("humanCapital.employeeloans.carLoan"),
    personal: catalogMessage("humanCapital.employeeloans.personalLoan"), other: catalogMessage("common.general.other"),
};
const statusLabels: Record<string, string> = {
    pending: catalogMessage("common.general.pending"), approved: catalogMessage("common.general.approved"), active: catalogMessage("common.general.active"),
    completed: catalogMessage("common.general.completed"), cancelled: catalogMessage("common.general.canceled"), defaulted: catalogMessage("humanCapital.employeeloans.delinquent"),
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
        } catch (e) { console.error(e); showToast(i18n.catalog["humanCapital.employeeloans.failedLoadLoans"], "error"); }
        finally { setIsLoading(false); }
    };

    const openCreate = () => {
        setForm({ employee_id: "", loan_type: "personal", loan_amount: "", interest_rate: "0", installment_count: "12", start_date: new Date().toISOString().split("T")[0], auto_deduction: true, notes: "" });
        setShowCreateDialog(true);
    };

    const handleSave = async () => {
        if (!form.employee_id || !form.loan_amount || !form.installment_count) { showToast(i18n.catalog["common.general.pleaseFillAllRequiredFields"], "error"); return; }
        try {
            await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.EMPLOYEE_LOANS.BASE, {
                method: "POST", body: JSON.stringify({
                    employee_id: Number(form.employee_id), loan_type: form.loan_type, loan_amount: Number(form.loan_amount),
                    interest_rate: Number(form.interest_rate) || 0, installment_count: Number(form.installment_count),
                    start_date: form.start_date, auto_deduction: form.auto_deduction, notes: form.notes || undefined,
                })
            });
            showToast(i18n.catalog["humanCapital.employeeloans.loanCreatedSuccessfully"], "success"); setShowCreateDialog(false); loadLoans();
        } catch (e: any) { showToast(e.message || i18n.catalog["humanCapital.employeeloans.failedCreateLoan"], "error"); }
    };

    const openDetail = async (loan: EmployeeLoan) => {
        try { const res: any = await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.EMPLOYEE_LOANS.withId(loan.id)); setSelectedLoan(res.data || res); }
        catch { setSelectedLoan(loan); }
        setShowDetailDialog(true);
    };

    const handleStatusUpdate = async (id: number, status: string) => {
        try {
            await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.EMPLOYEE_LOANS.STATUS(id), { method: "PUT", body: JSON.stringify({ status }) });
            showToast(i18n.catalog["humanCapital.employeeloans.loanStatusUpdated"], "success"); loadLoans();
        } catch (e: any) { showToast(e.message || i18n.catalog["common.general.failedUpdateStatus"], "error"); }
    };

    const handleRecordRepayment = async (loanId: number, repaymentId: number) => {
        try {
            await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.EMPLOYEE_LOANS.REPAYMENT(loanId, repaymentId), { method: "PUT", body: JSON.stringify({ paid_date: new Date().toISOString().split("T")[0] }) });
            showToast(i18n.catalog["humanCapital.employeeloans.paymentRecordedSuccessfully"], "success"); openDetail({ id: loanId } as EmployeeLoan); loadLoans();
        } catch (e: any) { showToast(e.message || i18n.catalog["humanCapital.employeeloans.batchRegistrationFailed"], "error"); }
    };

    const calcPreview = () => {
        const p = Number(form.loan_amount) || 0; const r = (Number(form.interest_rate) || 0) / 100 / 12; const n = Number(form.installment_count) || 1;
        return r > 0 ? (p * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)).toFixed(2) : (p / n).toFixed(2);
    };

    const columns: Column<EmployeeLoan>[] = [
        { key: "loan_number", header: i18n.catalog["common.general.loanNumber"], dataLabel: i18n.catalog["common.general.loanNumber"] },
        { key: "employee", header: i18n.catalog["common.general.employee.alternative3"], dataLabel: i18n.catalog["common.general.employee.alternative3"], render: (item) => item.employee?.full_name || "-" },
        { key: "loan_type", header: i18n.catalog["common.general.type.alternative3"], dataLabel: i18n.catalog["common.general.type.alternative3"], render: (item) => loanTypeLabels[item.loan_type] || item.loan_type },
        { key: "loan_amount", header: i18n.catalog["common.general.amount"], dataLabel: i18n.catalog["common.general.amount"], render: (item) => formatCurrency(item.loan_amount) },
        { key: "monthly_installment", header: i18n.catalog["common.general.installment"], dataLabel: i18n.catalog["common.general.installment"], render: (item) => formatCurrency(item.monthly_installment) },
        { key: "remaining_balance", header: i18n.catalog["common.general.remaining.alternative2"], dataLabel: i18n.catalog["common.general.remaining.alternative2"], render: (item) => formatCurrency(item.remaining_balance) },
        { key: "status", header: i18n.catalog["common.general.status.alternative2"], dataLabel: i18n.catalog["common.general.status.alternative2"], render: (item) => <span className={`badge ${statusBadges[item.status] || "badge-secondary"}`}>{statusLabels[item.status] || item.status}</span> },
        {
            key: "id", header: i18n.catalog["common.general.actions"], dataLabel: i18n.catalog["common.general.actions"], render: (item) => (
                <ActionButtons
                    actions={[
                        {
                            icon: "eye",
                            title: i18n.catalog["common.general.details"],
                            variant: "view",
                            onClick: () => openDetail(item)
                        },
                        ...(canAccess("loans", "edit") ? [{
                            icon: "check" as const,
                            title: i18n.catalog["common.general.approval"],
                            variant: "success" as const,
                            onClick: () => handleStatusUpdate(item.id, "approved"),
                            hidden: item.status !== "pending"
                        }] : []),
                        ...(canAccess("loans", "edit") ? [{
                            icon: "x" as const,
                            title: i18n.catalog["common.general.rejected.alternative2"],
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
                title={i18n.catalog["humanCapital.employeeloans.employeeLoans"]}
                titleIcon="hand-holding-usd"
                actions={
                    <>
                        <Select
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                            style={{ minWidth: "140px" }}
                            placeholder={i18n.catalog["common.general.allStatuses"]}
                            options={Object.entries(statusLabels).map(([value, label]) => ({ value, label })).filter(o => ["pending", "active", "completed"].includes(o.value))}
                        />
                        {canAccess("loans", "create") && (
                            <Button
                                variant="primary"
                                icon="plus"
                                onClick={openCreate}
                            >
                                {i18n.catalog["humanCapital.employeeloans.loanRequest"]}</Button>
                        )}
                    </>
                }
            />
            <div className="sales-card compact" style={{ marginBottom: "1.5rem", background: "linear-gradient(135deg, #dcfce7 0%, #f0fdf4 100%)", border: "1px solid #bbf7d0" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem" }}>
                    <div className="stat-card"><div className="stat-label">{i18n.catalog["common.general.total.alternative3"]}</div><div className="stat-value">{totalRecords}</div></div>
                    <div className="stat-card"><div className="stat-label">{i18n.catalog["common.general.pending.alternative3"]}</div><div className="stat-value text-warning">{loans.filter(l => l.status === "pending").length}</div></div>
                    <div className="stat-card"><div className="stat-label">{i18n.catalog["common.general.active.alternative2"]}</div><div className="stat-value text-success">{loans.filter(l => l.status === "active").length}</div></div>
                    <div className="stat-card"><div className="stat-label">{i18n.catalog["common.general.completed.alternative2"]}</div><div className="stat-value text-info">{loans.filter(l => l.status === "completed").length}</div></div>
                </div>
            </div>
            <Table columns={columns} data={loans} keyExtractor={(i) => i.id.toString()} emptyMessage={i18n.catalog["humanCapital.employeeloans.noLoans"]} isLoading={isLoading} pagination={{ currentPage, totalPages, onPageChange: setCurrentPage }} />

            {/* Create Dialog */}
            <Dialog isOpen={showCreateDialog} onClose={() => setShowCreateDialog(false)} title={i18n.catalog["humanCapital.employeeloans.newLoanRequest"]} maxWidth="700px">
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <Label className="text-secondary mb-1">{i18n.catalog["common.general.employee"]}</Label>
                            <SearchableSelect options={employees.map((e: Employee) => ({ value: e.id.toString(), label: e.full_name }))} value={form.employee_id} onChange={(v) => setForm(p => ({ ...p, employee_id: v?.toString() || "" }))} placeholder={i18n.catalog["common.general.selectEmployee"]} />
                        </div>
                        <Select label={i18n.catalog["humanCapital.employeeloans.loanType"]} value={form.loan_type} onChange={(e) => setForm({ ...form, loan_type: e.target.value })} options={Object.entries(loanTypeLabels).map(([value, label]) => ({ value, label }))} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <TextInput label={i18n.catalog["humanCapital.employeeloans.loanAmount"]} type="number" value={form.loan_amount} onChange={(e) => setForm({ ...form, loan_amount: e.target.value })} />
                        <TextInput label={i18n.catalog["humanCapital.employeeloans.interest.alternative2"]} type="number" value={form.interest_rate} onChange={(e) => setForm({ ...form, interest_rate: e.target.value })} />
                        <TextInput label={i18n.catalog["humanCapital.employeeloans.numberInstallments"]} type="number" value={form.installment_count} onChange={(e) => setForm({ ...form, installment_count: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <TextInput label={i18n.catalog["common.general.startDate.alternative2"]} type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
                        <div style={{ display: "flex", alignItems: "flex-end", gap: "0.5rem", paddingBottom: "1.25rem" }}>
                            <input type="checkbox" checked={form.auto_deduction} onChange={(e) => setForm({ ...form, auto_deduction: e.target.checked })} id="ad" />
                            <Label htmlFor="ad" className="text-secondary">{i18n.catalog["humanCapital.employeeloans.automaticDeduction"]}</Label>
                        </div>
                    </div>
                    {form.loan_amount && form.installment_count && <div className="sales-card compact" style={{ background: "linear-gradient(135deg,#e0f2fe,#f0f9ff)", border: "1px solid #bae6fd", padding: "1rem" }}><strong>{i18n.catalog["humanCapital.employeeloans.estimatedMonthlyInstallment"]}</strong> <span style={{ fontWeight: "bold", color: "var(--primary-color)" }}>{formatCurrency(Number(calcPreview()))}</span></div>}
                    <Textarea label={i18n.catalog["common.general.notes.alternative2"]} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
                    <div className="flex justify-end gap-2" style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid var(--border-color)" }}><Button variant="secondary" onClick={() => setShowCreateDialog(false)}>{i18n.catalog["common.general.cancel"]}</Button><Button variant="primary" onClick={handleSave} icon="save">{i18n.catalog["common.general.save"]}</Button></div>
                </div>
            </Dialog>

            {/* Detail Dialog */}
            <Dialog isOpen={showDetailDialog} onClose={() => setShowDetailDialog(false)} title={i18n.catalog["humanCapital.employeeloans.loanDetails"]} maxWidth="900px">
                {selectedLoan && <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div><strong>{i18n.catalog["humanCapital.employeeloans.loanNumber"]}</strong> {selectedLoan.loan_number}</div><div><strong>{i18n.catalog["common.general.employee.alternative2"]}</strong> {selectedLoan.employee?.full_name || "-"}</div>
                        <div><strong>{i18n.catalog["common.general.type"]}</strong> {loanTypeLabels[selectedLoan.loan_type] || selectedLoan.loan_type}</div><div><strong>{i18n.catalog["common.general.amount.alternative4"]}</strong> {formatCurrency(selectedLoan.loan_amount)}</div>
                        <div><strong>{i18n.catalog["humanCapital.employeeloans.installment"]}</strong> {formatCurrency(selectedLoan.monthly_installment)}</div><div><strong>{i18n.catalog["humanCapital.employeeloans.remaining"]}</strong> {formatCurrency(selectedLoan.remaining_balance)}</div>
                        <div><strong>{i18n.catalog["common.general.status"]}</strong> <span className={`badge ${statusBadges[selectedLoan.status]}`}>{statusLabels[selectedLoan.status]}</span></div>
                        <div><strong>{i18n.catalog["humanCapital.employeeloans.start"]}</strong> {formatDate(selectedLoan.start_date)}</div><div><strong>{i18n.catalog["common.general.end.alternative2"]}</strong> {formatDate(selectedLoan.end_date)}</div>
                    </div>
                    {selectedLoan.status === "pending" && canAccess("loans", "edit") && (
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                            <Button variant="primary" icon="check" onClick={() => handleStatusUpdate(selectedLoan.id, "approved")}>{i18n.catalog["common.general.approval"]}</Button>
                            <Button variant="secondary" icon="x" onClick={() => handleStatusUpdate(selectedLoan.id, "cancelled")}>{i18n.catalog["common.general.rejected.alternative2"]}</Button>
                        </div>
                    )}
                    <div><h4 style={{ marginBottom: "0.5rem" }}>{i18n.catalog["humanCapital.employeeloans.repaymentSchedule"]}</h4>
                        {selectedLoan.repayments && selectedLoan.repayments.length > 0 ? <div style={{ maxHeight: "300px", overflowY: "auto" }}><table className="table" style={{ width: "100%", fontSize: "0.9rem" }}><thead><tr><th>#</th><th>{i18n.catalog["humanCapital.employeeloans.due"]}</th><th>{i18n.catalog["common.general.amount"]}</th><th>{i18n.catalog["humanCapital.employeeloans.origin"]}</th><th>{i18n.catalog["humanCapital.employeeloans.interest"]}</th><th>{i18n.catalog["common.general.status.alternative2"]}</th><th>{i18n.catalog["common.general.action"]}</th></tr></thead><tbody>
                            {selectedLoan.repayments.map(r => <tr key={r.id}><td>{r.installment_number}</td><td>{formatDate(r.due_date)}</td><td>{formatCurrency(r.amount)}</td><td>{formatCurrency(r.principal)}</td><td>{formatCurrency(r.interest)}</td><td><span className={`badge ${r.status === "paid" ? "badge-success" : "badge-warning"}`}>{r.status === "paid" ? i18n.catalog["common.general.paid.alternative2"] : i18n.catalog["common.general.pending"]}</span></td><td>{r.status === "pending" && selectedLoan.status === "active" && canAccess("loans", "edit") && (
                                <ActionButtons
                                    actions={[
                                        {
                                            icon: "check-circle" as const,
                                            title: i18n.catalog["humanCapital.employeeloans.batchRegistration"],
                                            variant: "success" as const,
                                            onClick: () => handleRecordRepayment(selectedLoan.id, r.id)
                                        }
                                    ]}
                                />
                            )}</td></tr>)}
                        </tbody></table></div> : <p style={{ color: "var(--text-muted)" }}>{i18n.catalog["humanCapital.employeeloans.noRepaymentScheduleYet"]}</p>}
                    </div>
                </div>}
            </Dialog>
        </div>
    );
}
