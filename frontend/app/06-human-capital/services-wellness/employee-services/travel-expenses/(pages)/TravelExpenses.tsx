"use client";

import { useI18n, catalogText, catalogMessage } from "@/lib/i18n";
import { ActionButtons, Button, Column, Dialog, Label, SearchableSelect, showToast, Table, TabNavigation } from "@/components/ui";
import { TextInput } from "@/components/ui/TextInput";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/select";
import { fetchAPI } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { getIcon } from "@/lib/icons";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useAuthStore } from "@/stores/useAuthStore";
import { useEmployeeStore } from "@/stores/useEmployeeStore";
import type { Employee, TravelExpense, TravelRequest } from "@/types";
import { useEffect, useState } from "react";

const requestStatusLabels: Record<string, string> = {
    draft: catalogMessage("common.general.draft"),
    pending_approval: catalogMessage("common.general.pendingApproval.alternative2"),
    approved: catalogMessage("common.general.approved"),
    rejected: catalogMessage("common.general.rejected"),
    cancelled: catalogMessage("common.general.canceled"),
    completed: catalogMessage("common.general.completed"),
};

const requestStatusBadges: Record<string, string> = {
    draft: "badge-secondary",
    pending_approval: "badge-warning",
    approved: "badge-success",
    rejected: "badge-danger",
    cancelled: "badge-secondary",
    completed: "badge-info",
};

const expenseTypeLabels: Record<string, string> = {
    flight: catalogMessage("humanCapital.travelexpenses.aviation"),
    hotel: catalogMessage("humanCapital.travelexpenses.hotel"),
    meal: catalogMessage("humanCapital.travelexpenses.meals"),
    transportation: catalogMessage("humanCapital.travelexpenses.transportation"),
    other: catalogMessage("common.general.other"),
};

const expenseStatusLabels: Record<string, string> = {
    pending: catalogMessage("common.general.pending"),
    submitted: catalogMessage("common.general.submitted.alternative2"),
    approved: catalogMessage("common.general.approved"),
    rejected: catalogMessage("common.general.rejected"),
    reimbursed: catalogMessage("common.general.paid"),
};

const expenseStatusBadges: Record<string, string> = {
    pending: "badge-secondary",
    submitted: "badge-warning",
    approved: "badge-success",
    rejected: "badge-danger",
    reimbursed: "badge-info",
};

export function TravelExpenses() {
    const { t: i18n } = useI18n();
    const [activeTab, setActiveTab] = useState("requests");
    const { allEmployees: employees, loadAllEmployees } = useEmployeeStore();

    const { canAccess } = useAuthStore();

    // Travel Requests state
    const [requests, setRequests] = useState<TravelRequest[]>([]);
    const [reqLoading, setReqLoading] = useState(false);
    const [reqPage, setReqPage] = useState(1);
    const [reqTotalPages, setReqTotalPages] = useState(1);
    const [reqStatusFilter, setReqStatusFilter] = useState("");
    const [reqTotal, setReqTotal] = useState(0);
    const [showReqDialog, setShowReqDialog] = useState(false);
    const [showReqDetails, setShowReqDetails] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<TravelRequest | null>(null);
    const [reqForm, setReqForm] = useState({
        employee_id: "",
        destination: "",
        purpose: "",
        departure_date: new Date().toISOString().split("T")[0],
        return_date: "",
        estimated_cost: "",
        notes: "",
    });

    // Travel Expenses state
    const [expenses, setExpenses] = useState<TravelExpense[]>([]);
    const [expLoading, setExpLoading] = useState(false);
    const [expPage, setExpPage] = useState(1);
    const [expTotalPages, setExpTotalPages] = useState(1);
    const [expStatusFilter, setExpStatusFilter] = useState("");
    const [expTotal, setExpTotal] = useState(0);
    const [showExpDialog, setShowExpDialog] = useState(false);
    const [expForm, setExpForm] = useState({
        travel_request_id: "",
        employee_id: "",
        expense_type: "transportation",
        expense_date: new Date().toISOString().split("T")[0],
        amount: "",
        currency: "SAR",
        exchange_rate: "1",
        description: "",
        notes: "",
    });

    useEffect(() => { loadAllEmployees(); }, [loadAllEmployees]);
    useEffect(() => { loadRequests(); }, [reqPage, reqStatusFilter]);
    useEffect(() => { loadExpenses(); }, [expPage, expStatusFilter]);

    const loadRequests = async () => {
        setReqLoading(true);
        try {
            const q = new URLSearchParams({ page: reqPage.toString(), ...(reqStatusFilter && { status: reqStatusFilter }) });
            const res: any = await fetchAPI(`${API_ENDPOINTS.HUMAN_CAPITAL.TRAVEL.REQUESTS.BASE}?${q}`);
            const data = res.data || (Array.isArray(res) ? res : []);
            setRequests(data);
            setReqTotalPages(Number(res.last_page) || 1);
            setReqTotal(Number(res.total) || data.length);
        } catch (e) {
            console.error(e);
            showToast(i18n.catalog["humanCapital.travelexpenses.failedLoadTravelRequests"], "error");
        } finally { setReqLoading(false); }
    };

    const loadExpenses = async () => {
        setExpLoading(true);
        try {
            const q = new URLSearchParams({ page: expPage.toString(), ...(expStatusFilter && { status: expStatusFilter }) });
            const res: any = await fetchAPI(`${API_ENDPOINTS.HUMAN_CAPITAL.TRAVEL.EXPENSES.BASE}?${q}`);
            const data = res.data || (Array.isArray(res) ? res : []);
            setExpenses(data);
            setExpTotalPages(Number(res.last_page) || 1);
            setExpTotal(Number(res.total) || data.length);
        } catch (e) {
            console.error(e);
            showToast(i18n.catalog["humanCapital.travelexpenses.failedLoadExpenses"], "error");
        } finally { setExpLoading(false); }
    };

    // ── Travel Request CRUD ──
    const openNewRequest = () => {
        setReqForm({
            employee_id: "", destination: "", purpose: "",
            departure_date: new Date().toISOString().split("T")[0],
            return_date: "", estimated_cost: "", notes: "",
        });
        setShowReqDialog(true);
    };

    const handleSaveRequest = async () => {
        if (!reqForm.employee_id || !reqForm.destination || !reqForm.purpose || !reqForm.return_date) {
            showToast(i18n.catalog["common.general.pleaseFillAllRequiredFields"], "error");
            return;
        }
        try {
            await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.TRAVEL.REQUESTS.BASE, {
                method: "POST",
                body: JSON.stringify({
                    employee_id: Number(reqForm.employee_id),
                    destination: reqForm.destination,
                    purpose: reqForm.purpose,
                    departure_date: reqForm.departure_date,
                    return_date: reqForm.return_date,
                    estimated_cost: reqForm.estimated_cost ? Number(reqForm.estimated_cost) : undefined,
                    notes: reqForm.notes || undefined,
                }),
            });
            showToast(i18n.catalog["humanCapital.travelexpenses.travelRequestCreatedSuccessfully"], "success");
            setShowReqDialog(false);
            loadRequests();
        } catch (e: any) {
            showToast(e.message || i18n.catalog["humanCapital.travelexpenses.failedSaveTravelRequest"], "error");
        }
    };

    const handleUpdateRequestStatus = async (id: number, status: string) => {
        try {
            await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.TRAVEL.REQUESTS.STATUS(id), {
                method: "PUT",
                body: JSON.stringify({ status }),
            });
            showToast(i18n.catalog["humanCapital.travelexpenses.requestStatusUpdated"], "success");
            loadRequests();
        } catch (e: any) {
            showToast(e.message || i18n.catalog["common.general.failedUpdateStatus"], "error");
        }
    };

    // ── Travel Expense CRUD ──
    const openNewExpense = () => {
        setExpForm({
            travel_request_id: "", employee_id: "", expense_type: "transportation",
            expense_date: new Date().toISOString().split("T")[0],
            amount: "", currency: "SAR", exchange_rate: "1", description: "", notes: "",
        });
        setShowExpDialog(true);
    };

    const handleSaveExpense = async () => {
        if (!expForm.employee_id || !expForm.amount) {
            showToast(i18n.catalog["humanCapital.travelexpenses.pleaseSelectEmployeeEnterAmount"], "error");
            return;
        }
        try {
            await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.TRAVEL.EXPENSES.BASE, {
                method: "POST",
                body: JSON.stringify({
                    travel_request_id: expForm.travel_request_id ? Number(expForm.travel_request_id) : undefined,
                    employee_id: Number(expForm.employee_id),
                    expense_type: expForm.expense_type,
                    expense_date: expForm.expense_date,
                    amount: Number(expForm.amount),
                    currency: expForm.currency,
                    exchange_rate: Number(expForm.exchange_rate) || 1,
                    description: expForm.description || undefined,
                    notes: expForm.notes || undefined,
                }),
            });
            showToast(i18n.catalog["humanCapital.travelexpenses.expenseRecordedSuccessfully"], "success");
            setShowExpDialog(false);
            loadExpenses();
        } catch (e: any) {
            showToast(e.message || i18n.catalog["humanCapital.travelexpenses.failedSaveExpense"], "error");
        }
    };

    const handleUpdateExpenseStatus = async (id: number, status: string) => {
        try {
            await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.TRAVEL.EXPENSES.STATUS(id), {
                method: "PUT",
                body: JSON.stringify({ status }),
            });
            showToast(i18n.catalog["humanCapital.travelexpenses.expenseStatusUpdated"], "success");
            loadExpenses();
        } catch (e: any) {
            showToast(e.message || i18n.catalog["common.general.failedUpdateStatus"], "error");
        }
    };

    // ── Columns ──
    const requestColumns: Column<TravelRequest>[] = [
        { key: "request_number", header: i18n.catalog["common.general.orderNumber"], dataLabel: i18n.catalog["common.general.orderNumber"] },
        { key: "employee", header: i18n.catalog["common.general.employee.alternative3"], dataLabel: i18n.catalog["common.general.employee.alternative3"], render: (item) => item.employee?.full_name || "-" },
        { key: "destination", header: i18n.catalog["common.general.destination"], dataLabel: i18n.catalog["common.general.destination"] },
        { key: "departure_date", header: i18n.catalog["common.general.departure"], dataLabel: i18n.catalog["common.general.departure"], render: (item) => formatDate(item.departure_date) },
        { key: "return_date", header: i18n.catalog["common.general.back"], dataLabel: i18n.catalog["common.general.back"], render: (item) => formatDate(item.return_date) },
        {
            key: "estimated_cost", header: i18n.catalog["common.general.estimatedCost"], dataLabel: i18n.catalog["common.general.estimatedCost"],
            render: (item) => item.estimated_cost ? formatCurrency(item.estimated_cost) : "-"
        },
        {
            key: "status", header: i18n.catalog["common.general.status.alternative2"], dataLabel: i18n.catalog["common.general.status.alternative2"],
            render: (item) => (
                <span className={`badge ${requestStatusBadges[item.status] || "badge-secondary"}`}>
                    {requestStatusLabels[item.status] || item.status}
                </span>
            ),
        },
        {
            key: "id", header: i18n.catalog["common.general.actions"], dataLabel: i18n.catalog["common.general.actions"],
            render: (item) => (
                <ActionButtons
                    actions={[
                        {
                            icon: "eye",
                            title: i18n.catalog["common.general.viewDetails"],
                            variant: "view",
                            onClick: () => { setSelectedRequest(item); setShowReqDetails(true); }
                        },
                        ...(canAccess("travel", "edit") ? [{
                            icon: "send" as const,
                            title: i18n.catalog["common.general.submitApproval"],
                            variant: "edit" as const,
                            onClick: () => handleUpdateRequestStatus(item.id, "pending_approval"),
                            hidden: item.status !== "draft"
                        }] : []),
                        ...(canAccess("travel", "edit") ? [{
                            icon: "check" as const,
                            title: i18n.catalog["common.general.approval"],
                            variant: "success" as const,
                            onClick: () => handleUpdateRequestStatus(item.id, "approved"),
                            hidden: item.status !== "pending_approval"
                        }] : []),
                        ...(canAccess("travel", "edit") ? [{
                            icon: "x" as const,
                            title: i18n.catalog["common.general.rejected.alternative2"],
                            variant: "delete" as const,
                            onClick: () => handleUpdateRequestStatus(item.id, "rejected"),
                            hidden: item.status !== "pending_approval"
                        }] : [])
                    ]}
                />
            ),
        },
    ];

    const expenseColumns: Column<TravelExpense>[] = [
        { key: "employee", header: i18n.catalog["common.general.employee.alternative3"], dataLabel: i18n.catalog["common.general.employee.alternative3"], render: (item) => item.employee?.full_name || "-" },
        {
            key: "expense_type", header: i18n.catalog["common.general.expenseType"], dataLabel: i18n.catalog["common.general.expenseType"],
            render: (item) => expenseTypeLabels[item.expense_type] || item.expense_type
        },
        { key: "expense_date", header: i18n.catalog["common.general.date.alternative7"], dataLabel: i18n.catalog["common.general.date.alternative7"], render: (item) => formatDate(item.expense_date) },
        {
            key: "amount", header: i18n.catalog["common.general.amount"], dataLabel: i18n.catalog["common.general.amount"],
            render: (item) => catalogText(i18n, "common.general.notAvailable.alternative3", { value0: formatCurrency(item.amount), value1: item.currency })
        },
        {
            key: "travel_request", header: i18n.catalog["common.general.travelRequest"], dataLabel: i18n.catalog["common.general.travelRequest"],
            render: (item) => item.travel_request?.request_number || "-"
        },
        {
            key: "status", header: i18n.catalog["common.general.status.alternative2"], dataLabel: i18n.catalog["common.general.status.alternative2"],
            render: (item) => (
                <span className={`badge ${expenseStatusBadges[item.status] || "badge-secondary"}`}>
                    {expenseStatusLabels[item.status] || item.status}
                </span>
            ),
        },
        {
            key: "id", header: i18n.catalog["common.general.actions"], dataLabel: i18n.catalog["common.general.actions"],
            render: (item) => (
                <ActionButtons
                    actions={[
                        ...(canAccess("travel", "edit") ? [{
                            icon: "send" as const,
                            title: i18n.catalog["humanCapital.travelexpenses.submit"],
                            variant: "edit" as const,
                            onClick: () => handleUpdateExpenseStatus(item.id, "submitted"),
                            hidden: item.status !== "pending"
                        }] : []),
                        ...(canAccess("travel", "edit") ? [{
                            icon: "check" as const,
                            title: i18n.catalog["common.general.approval"],
                            variant: "success" as const,
                            onClick: () => handleUpdateExpenseStatus(item.id, "approved"),
                            hidden: item.status !== "submitted"
                        }] : []),
                        ...(canAccess("travel", "edit") ? [{
                            icon: "x" as const,
                            title: i18n.catalog["common.general.rejected.alternative2"],
                            variant: "delete" as const,
                            onClick: () => handleUpdateExpenseStatus(item.id, "rejected"),
                            hidden: item.status !== "submitted"
                        }] : []),
                        ...(canAccess("travel", "edit") ? [{
                            icon: "banknote" as const,
                            title: i18n.catalog["humanCapital.travelexpenses.payment"],
                            variant: "view" as const,
                            onClick: () => handleUpdateExpenseStatus(item.id, "reimbursed"),
                            hidden: item.status !== "approved"
                        }] : [])
                    ]}
                />
            ),
        },
    ];

    const tabs = [
        { key: "requests", label: i18n.catalog["humanCapital.travelexpenses.travelRequests"], icon: "plane" },
        { key: "expenses", label: i18n.catalog["common.general.expenses"], icon: "receipt" },
    ];

    return (
        <div className="sales-card animate-fade">
            <div className="card-header-flex" style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <h3 style={{ margin: 0 }}>{getIcon("plane")} {i18n.catalog["common.general.travelExpenses"]}</h3>
                </div>
            </div>

            <TabNavigation tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

            {activeTab === "requests" && (
                <>
                    {/* Stats */}
                    <div className="sales-card compact" style={{ marginBottom: "1.5rem", marginTop: "1rem", background: "linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%)", border: "1px solid #bfdbfe" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem" }}>
                            <div className="stat-card"><div className="stat-label">{i18n.catalog["humanCapital.travelexpenses.totalOrders"]}</div><div className="stat-value">{reqTotal}</div></div>
                            <div className="stat-card"><div className="stat-label">{i18n.catalog["common.general.draft"]}</div><div className="stat-value text-secondary">{requests.filter(r => r.status === "draft").length}</div></div>
                            <div className="stat-card"><div className="stat-label">{i18n.catalog["common.general.pendingApproval.alternative2"]}</div><div className="stat-value text-warning">{requests.filter(r => r.status === "pending_approval").length}</div></div>
                            <div className="stat-card"><div className="stat-label">{i18n.catalog["humanCapital.travelexpenses.approved"]}</div><div className="stat-value text-success">{requests.filter(r => r.status === "approved").length}</div></div>
                        </div>
                    </div>

                    <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", justifyContent: "flex-end", alignItems: "center" }}>
                        <Select
                            value={reqStatusFilter}
                            onChange={(e) => { setReqStatusFilter(e.target.value); setReqPage(1); }}
                            style={{ minWidth: "160px" }}
                            placeholder={i18n.catalog["common.general.allStatuses"]}
                            options={Object.entries(requestStatusLabels).map(([value, label]) => ({ value, label }))}
                        />
                        {canAccess("travel", "create") && (
                            <Button
                                onClick={openNewRequest}
                                variant="primary"
                                icon="plus"
                            >
                                {i18n.catalog["common.general.newTravelRequest"]}</Button>
                        )}
                    </div>

                    <Table columns={requestColumns} data={requests} keyExtractor={(item) => item.id.toString()} emptyMessage={i18n.catalog["humanCapital.travelexpenses.noTravelRequestsRecorded"]} isLoading={reqLoading}
                        pagination={{ currentPage: reqPage, totalPages: reqTotalPages, onPageChange: setReqPage }} />
                </>
            )}

            {activeTab === "expenses" && (
                <>
                    <div className="sales-card compact" style={{ marginBottom: "1.5rem", marginTop: "1rem", background: "linear-gradient(135deg, #fef9c3 0%, #fefce8 100%)", border: "1px solid #fde68a" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem" }}>
                            <div className="stat-card"><div className="stat-label">{i18n.catalog["common.general.totalExpenses"]}</div><div className="stat-value">{expTotal}</div></div>
                            <div className="stat-card"><div className="stat-label">{i18n.catalog["common.general.pending.alternative3"]}</div><div className="stat-value text-warning">{expenses.filter(e => e.status === "pending" || e.status === "submitted").length}</div></div>
                            <div className="stat-card"><div className="stat-label">{i18n.catalog["common.general.paid"]}</div><div className="stat-value text-success">{expenses.filter(e => e.status === "reimbursed").length}</div></div>
                        </div>
                    </div>

                    <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", justifyContent: "flex-end", alignItems: "center" }}>
                        <Select
                            value={expStatusFilter}
                            onChange={(e) => { setExpStatusFilter(e.target.value); setExpPage(1); }}
                            style={{ minWidth: "160px" }}
                            placeholder={i18n.catalog["common.general.allStatuses"]}
                            options={Object.entries(expenseStatusLabels).map(([value, label]) => ({ value, label }))}
                        />
                        {canAccess("travel", "create") && <Button onClick={openNewExpense} className="btn-primary"><i className="fas fa-plus"></i> {i18n.catalog["humanCapital.travelexpenses.recordExpense"]}</Button>}
                    </div>

                    <Table columns={expenseColumns} data={expenses} keyExtractor={(item) => item.id.toString()} emptyMessage={i18n.catalog["humanCapital.travelexpenses.noExpensesRecorded"]} isLoading={expLoading}
                        pagination={{ currentPage: expPage, totalPages: expTotalPages, onPageChange: setExpPage }} />
                </>
            )}

            {/* New Travel Request Dialog */}
            <Dialog isOpen={showReqDialog} onClose={() => setShowReqDialog(false)} title={i18n.catalog["common.general.newTravelRequest"]} maxWidth="700px">
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label className="block mb-1" style={{ color: "var(--text-secondary)" }}>{i18n.catalog["common.general.employee"]}</Label>
                            <SearchableSelect options={employees.map((emp: Employee) => ({ value: emp.id.toString(), label: emp.full_name }))}
                                value={reqForm.employee_id} onChange={(val) => setReqForm(prev => ({ ...prev, employee_id: val?.toString() || "" }))} placeholder={i18n.catalog["common.general.selectEmployee"]} />
                        </div>
                        <div>
                            <Label className="block mb-1" style={{ color: "var(--text-secondary)" }}>{i18n.catalog["humanCapital.travelexpenses.destination.alternative2"]}</Label>
                            <TextInput value={reqForm.destination} onChange={(e) => setReqForm({ ...reqForm, destination: e.target.value })} placeholder={i18n.catalog["humanCapital.travelexpenses.exampleRiyadhJeddah"]} />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label className="block mb-1" style={{ color: "var(--text-secondary)" }}>{i18n.catalog["humanCapital.travelexpenses.departureDate"]}</Label>
                            <TextInput type="date" value={reqForm.departure_date} onChange={(e) => setReqForm({ ...reqForm, departure_date: e.target.value })} />
                        </div>
                        <div>
                            <Label className="block mb-1" style={{ color: "var(--text-secondary)" }}>{i18n.catalog["humanCapital.travelexpenses.returnDate"]}</Label>
                            <TextInput type="date" value={reqForm.return_date} onChange={(e) => setReqForm({ ...reqForm, return_date: e.target.value })} />
                        </div>
                        <div>
                            <Label className="block mb-1" style={{ color: "var(--text-secondary)" }}>{i18n.catalog["common.general.estimatedCost"]}</Label>
                            <TextInput type="number" value={reqForm.estimated_cost} onChange={(e) => setReqForm({ ...reqForm, estimated_cost: e.target.value })} placeholder={i18n.catalog["common.general.message000"]} />
                        </div>
                    </div>
                    <div>
                        <Label className="block mb-1" style={{ color: "var(--text-secondary)" }}>{i18n.catalog["humanCapital.travelexpenses.purposeTravel"]}</Label>
                        <Textarea value={reqForm.purpose} onChange={(e) => setReqForm({ ...reqForm, purpose: e.target.value })} rows={3} />
                    </div>
                    <div>
                        <Label className="block mb-1" style={{ color: "var(--text-secondary)" }}>{i18n.catalog["common.general.notes.alternative2"]}</Label>
                        <Textarea value={reqForm.notes} onChange={(e) => setReqForm({ ...reqForm, notes: e.target.value })} rows={2} />
                    </div>
                    <div className="flex justify-end gap-2" style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid var(--border-color)" }}>
                        <Button variant="secondary" onClick={() => setShowReqDialog(false)}>{i18n.catalog["common.general.cancel"]}</Button>
                        <Button variant="primary" onClick={handleSaveRequest} icon="save">{i18n.catalog["common.general.save"]}</Button>
                    </div>
                </div>
            </Dialog>

            {/* Request Details Dialog */}
            <Dialog isOpen={showReqDetails} onClose={() => setShowReqDetails(false)} title={i18n.catalog["humanCapital.travelexpenses.travelRequestDetails"]} maxWidth="700px">
                {selectedRequest && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><strong>{i18n.catalog["common.general.orderNumber.alternative2"]}</strong> {selectedRequest.request_number}</div>
                            <div><strong>{i18n.catalog["common.general.employee.alternative2"]}</strong> {selectedRequest.employee?.full_name || "-"}</div>
                            <div><strong>{i18n.catalog["humanCapital.travelexpenses.destination"]}</strong> {selectedRequest.destination}</div>
                            <div><strong>{i18n.catalog["common.general.status"]}</strong>{" "}
                                <span className={`badge ${requestStatusBadges[selectedRequest.status] || "badge-secondary"}`}>
                                    {requestStatusLabels[selectedRequest.status] || selectedRequest.status}
                                </span>
                            </div>
                            <div><strong>{i18n.catalog["humanCapital.travelexpenses.departure"]}</strong> {formatDate(selectedRequest.departure_date)}</div>
                            <div><strong>{i18n.catalog["humanCapital.travelexpenses.return"]}</strong> {formatDate(selectedRequest.return_date)}</div>
                            {selectedRequest.estimated_cost && <div><strong>{i18n.catalog["humanCapital.travelexpenses.estimatedCost"]}</strong> {formatCurrency(selectedRequest.estimated_cost)}</div>}
                        </div>
                        <div><strong>{i18n.catalog["humanCapital.travelexpenses.purpose"]}</strong><p style={{ marginTop: "0.5rem" }}>{selectedRequest.purpose}</p></div>
                        {selectedRequest.notes && <div><strong>{i18n.catalog["common.general.notes"]}</strong><p style={{ marginTop: "0.5rem" }}>{selectedRequest.notes}</p></div>}
                        {selectedRequest.rejection_reason && <div><strong>{i18n.catalog["humanCapital.travelexpenses.reasonRejection"]}</strong><p style={{ marginTop: "0.5rem", color: "var(--danger-color)" }}>{selectedRequest.rejection_reason}</p></div>}
                    </div>
                )}
            </Dialog>

            {/* New Expense Dialog */}
            <Dialog isOpen={showExpDialog} onClose={() => setShowExpDialog(false)} title={i18n.catalog["humanCapital.travelexpenses.registerNewExpense"]} maxWidth="700px">
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label className="block mb-1" style={{ color: "var(--text-secondary)" }}>{i18n.catalog["common.general.employee"]}</Label>
                            <SearchableSelect options={employees.map((emp: Employee) => ({ value: emp.id.toString(), label: emp.full_name }))}
                                value={expForm.employee_id} onChange={(val) => setExpForm(prev => ({ ...prev, employee_id: val?.toString() || "" }))} placeholder={i18n.catalog["common.general.selectEmployee"]} />
                        </div>
                        <div>
                            <Label className="block mb-1" style={{ color: "var(--text-secondary)" }}>{i18n.catalog["common.general.expenseType"]}</Label>
                            <Select
                                value={expForm.expense_type}
                                onChange={(e) => setExpForm({ ...expForm, expense_type: e.target.value })}
                                options={Object.entries(expenseTypeLabels).map(([value, label]) => ({ value, label }))}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label className="block mb-1" style={{ color: "var(--text-secondary)" }}>{i18n.catalog["common.general.amount.alternative3"]}</Label>
                            <TextInput type="number" value={expForm.amount} onChange={(e) => setExpForm({ ...expForm, amount: e.target.value })} placeholder={i18n.catalog["common.general.message000"]} />
                        </div>
                        <div>
                            <Label className="block mb-1" style={{ color: "var(--text-secondary)" }}>{i18n.catalog["common.general.currency"]}</Label>
                            <TextInput value={expForm.currency} onChange={(e) => setExpForm({ ...expForm, currency: e.target.value })} placeholder={i18n.catalog["humanCapital.travelexpenses.sar"]} />
                        </div>
                        <div>
                            <Label className="block mb-1" style={{ color: "var(--text-secondary)" }}>{i18n.catalog["humanCapital.travelexpenses.expenseDate"]}</Label>
                            <TextInput type="date" value={expForm.expense_date} onChange={(e) => setExpForm({ ...expForm, expense_date: e.target.value })} />
                        </div>
                    </div>
                    <div>
                        <Label className="block mb-1" style={{ color: "var(--text-secondary)" }}>{i18n.catalog["common.general.description.alternative2"]}</Label>
                        <Textarea value={expForm.description} onChange={(e) => setExpForm({ ...expForm, description: e.target.value })} rows={2} />
                    </div>
                    <div className="flex justify-end gap-2" style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid var(--border-color)" }}>
                        <Button variant="secondary" onClick={() => setShowExpDialog(false)}>{i18n.catalog["common.general.cancel"]}</Button>
                        <Button variant="primary" onClick={handleSaveExpense} icon="save">{i18n.catalog["common.general.save"]}</Button>
                    </div>
                </div>
            </Dialog>
        </div>
    );
}
