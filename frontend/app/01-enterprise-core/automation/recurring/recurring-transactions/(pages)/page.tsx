"use client";

import { useI18n, catalogText } from "@/lib/i18n";
import { MainLayout, PageSubHeader } from "@/components/layout";
import { Button, Column, ConfirmDialog, Dialog, Table, showAlert, showToast } from "@/components/ui";
import { fetchAPI } from "@/lib/api";
import { User, checkAuth, getStoredUser } from "@/lib/auth";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { getIcon } from "@/lib/icons";
import { formatDate, parseNumber } from "@/lib/utils";
import { useCallback, useEffect, useState } from "react";

interface RecurringTemplateData {
    account_code?: string;
    amount?: number;
    description?: string;
    entries?: Array<{
        account_code: string;
        entry_type: "DEBIT" | "CREDIT";
        amount: number;
        description: string;
    }>;
}

interface RecurringTemplate {
    id: number;
    name: string;
    type: "expense" | "revenue" | "journal_voucher";
    frequency: "daily" | "weekly" | "monthly" | "quarterly" | "annually";
    next_due_date: string;
    last_generated_date?: string;
    template_data?: RecurringTemplateData;
}

export default function RecurringTransactionsPage() {
    const { t: i18n } = useI18n();
    const [user, setUser] = useState<User | null>(null);
    const [templates, setTemplates] = useState<RecurringTemplate[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(true);

    // Dialogs
    const [templateDialog, setTemplateDialog] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState(false);
    const [deleteTemplateId, setDeleteTemplateId] = useState<number | null>(null);
    const [generateTemplateId, setGenerateTemplateId] = useState<number | null>(null);

    // Form
    const [currentTemplateId, setCurrentTemplateId] = useState<number | null>(null);
    const [templateName, setTemplateName] = useState("");
    const [templateType, setTemplateType] = useState<"expense" | "revenue" | "journal_voucher">("expense");
    const [templateFrequency, setTemplateFrequency] = useState<"daily" | "weekly" | "monthly" | "quarterly" | "annually">("monthly");
    const [nextDueDate, setNextDueDate] = useState(new Date().toISOString().split("T")[0]);

    // Expense fields
    const [expenseAccount, setExpenseAccount] = useState("");
    const [expenseAmount, setExpenseAmount] = useState("");
    const [expenseDescription, setExpenseDescription] = useState("");

    // Revenue fields
    const [revenueAccount, setRevenueAccount] = useState("");
    const [revenueAmount, setRevenueAmount] = useState("");
    const [revenueDescription, setRevenueDescription] = useState("");

    // Journal fields
    const [journalEntries, setJournalEntries] = useState("");

    const itemsPerPage = 20;

    const loadTemplates = useCallback(async (page: number = 1) => {
        try {
            setIsLoading(true);
            const response = await fetchAPI<RecurringTemplate[]>(`${API_ENDPOINTS.FINANCE.RECURRING.BASE}?page=${page}&limit=${itemsPerPage}`);
            if (response.success && response.data) {
                setTemplates(response.data);
                const total = Number(response.total) || 0;
                setTotalPages(Math.ceil(total / itemsPerPage));
                setCurrentPage(page);
            } else {
                showAlert("alert-container", response.message || i18n.catalog["text_c539e2a5f32a"], "error");
            }
        } catch {
            showAlert("alert-container", i18n.catalog["text_22fa79f17c32"], "error");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const init = async () => {
            const authenticated = await checkAuth();
            if (!authenticated) return;

            const storedUser = getStoredUser();
            setUser(storedUser);
            await loadTemplates();
        };
        init();
    }, [loadTemplates]);

    const openCreateDialog = () => {
        setCurrentTemplateId(null);
        setTemplateName("");
        setTemplateType("expense");
        setTemplateFrequency("monthly");
        setNextDueDate(new Date().toISOString().split("T")[0]);
        setExpenseAccount("");
        setExpenseAmount("");
        setExpenseDescription("");
        setRevenueAccount("");
        setRevenueAmount("");
        setRevenueDescription("");
        setJournalEntries("");
        setTemplateDialog(true);
    };

    const viewTemplate = async (id: number) => {
        try {
            const response = await fetchAPI<RecurringTemplate | RecurringTemplate[]>(`${API_ENDPOINTS.FINANCE.RECURRING.BASE}?id=${id}`);
            if (response.success && response.data) {
                const template = Array.isArray(response.data) ? response.data[0] : response.data;
                if (template) {
                    alert(
                        catalogText(i18n, "text_c78b1d1d8ffc", { value0: template.name, value1: template.type, value2: template.frequency, value3: formatDate(template.next_due_date) })
                    );
                }
            }
        } catch {
            showToast(i18n.catalog["text_cc09051b0fd8"], "error");
        }
    };

    const editTemplate = async (id: number) => {
        try {
            const response = await fetchAPI<RecurringTemplate | RecurringTemplate[]>(`${API_ENDPOINTS.FINANCE.RECURRING.BASE}?id=${id}`);
            if (response.success && response.data) {
                const template = Array.isArray(response.data) ? response.data[0] : response.data;
                if (!template) {
                    showAlert("alert-container", i18n.catalog["text_995c081379d1"], "error");
                    return;
                }

                setCurrentTemplateId(template.id);
                setTemplateName(template.name);
                setTemplateType(template.type);
                setTemplateFrequency(template.frequency);
                setNextDueDate(template.next_due_date);

                const templateData = template.template_data || {};
                if (template.type === "expense") {
                    setExpenseAccount(templateData.account_code || "");
                    setExpenseAmount(String(templateData.amount || ""));
                    setExpenseDescription(templateData.description || "");
                } else if (template.type === "revenue") {
                    setRevenueAccount(templateData.account_code || "");
                    setRevenueAmount(String(templateData.amount || ""));
                    setRevenueDescription(templateData.description || "");
                } else if (template.type === "journal_voucher") {
                    setJournalEntries(JSON.stringify(templateData.entries || [], null, 2));
                }

                setTemplateDialog(true);
            }
        } catch {
            showAlert("alert-container", i18n.catalog["text_cc09051b0fd8"], "error");
        }
    };

    const saveTemplate = async () => {
        if (!templateName || !nextDueDate) {
            showAlert("alert-container", i18n.catalog["text_0a8eb85d0081"], "error");
            return;
        }

        let templateData: RecurringTemplateData = {};
        if (templateType === "expense") {
            if (!expenseAccount || !expenseAmount) {
                showAlert("alert-container", i18n.catalog["text_1038ba0763b8"], "error");
                return;
            }
            templateData = {
                account_code: expenseAccount,
                amount: parseNumber(expenseAmount),
                description: expenseDescription,
            };
        } else if (templateType === "revenue") {
            if (!revenueAccount || !revenueAmount) {
                showAlert("alert-container", i18n.catalog["text_c2ac07f5b030"], "error");
                return;
            }
            templateData = {
                account_code: revenueAccount,
                amount: parseNumber(revenueAmount),
                description: revenueDescription,
            };
        } else if (templateType === "journal_voucher") {
            if (!journalEntries) {
                showAlert("alert-container", i18n.catalog["text_62a8a98682e4"], "error");
                return;
            }
            try {
                templateData = { entries: JSON.parse(journalEntries) };
            } catch {
                showAlert("alert-container", i18n.catalog["text_b2104c294dee"], "error");
                return;
            }
        }

        try {
            interface RecurringTemplateFormBody {
                name: string;
                type: "expense" | "revenue" | "journal_voucher";
                frequency: "daily" | "weekly" | "monthly" | "quarterly" | "annually";
                next_due_date: string;
                template_data: RecurringTemplateData;
                id?: number;
            }

            const body: RecurringTemplateFormBody = {
                name: templateName,
                type: templateType,
                frequency: templateFrequency,
                next_due_date: nextDueDate,
                template_data: templateData,
            };
            if (currentTemplateId) body.id = currentTemplateId;

            const response = await fetchAPI(API_ENDPOINTS.FINANCE.RECURRING.BASE, {
                method: currentTemplateId ? "PUT" : "POST",
                body: JSON.stringify(body),
            });

            if (response.success) {
                showAlert("alert-container", i18n.catalog["text_ff783ee2826d"], "success");
                setTemplateDialog(false);
                await loadTemplates(currentPage);
            } else {
                showAlert("alert-container", response.message || i18n.catalog["text_b0dbba00004b"], "error");
            }
        } catch {
            showAlert("alert-container", i18n.catalog["text_c574313242be"], "error");
        }
    };

    const confirmDeleteTemplate = (id: number) => {
        setDeleteTemplateId(id);
        setConfirmDialog(true);
    };

    const deleteTemplate = async () => {
        if (!deleteTemplateId) return;

        try {
            const response = await fetchAPI(`${API_ENDPOINTS.FINANCE.RECURRING.BASE}?id=${deleteTemplateId}`, {
                method: "DELETE",
            });
            if (response.success) {
                showAlert("alert-container", i18n.catalog["text_a2bc69a3fce3"], "success");
                setConfirmDialog(false);
                setDeleteTemplateId(null);
                await loadTemplates(currentPage);
            } else {
                showAlert("alert-container", response.message || i18n.catalog["text_3ce4224c7569"], "error");
            }
        } catch {
            showAlert("alert-container", i18n.catalog["text_20725a2c07a7"], "error");
        }
    };

    const confirmGenerateTransaction = (id: number) => {
        setGenerateTemplateId(id);
        setConfirmDialog(true);
    };

    const generateTransaction = async () => {
        if (!generateTemplateId) return;

        try {
            const response = await fetchAPI(API_ENDPOINTS.FINANCE.RECURRING.PROCESS, {
                method: "POST",
                body: JSON.stringify({
                    template_id: generateTemplateId,
                    generation_date: new Date().toISOString().split("T")[0],
                }),
            });

            if (response.success && response.data) {
                showAlert(
                    "alert-container",
                    i18n.catalog["text_be5e0e5fe181"],
                    "success"
                );
                setConfirmDialog(false);
                setGenerateTemplateId(null);
                await loadTemplates(currentPage);
            } else {
                showAlert("alert-container", response.message || i18n.catalog["text_402ecb1be854"], "error");
            }
        } catch {
            showAlert("alert-container", i18n.catalog["text_e18b2694dfd0"], "error");
        }
    };

    const getTypeText = (type: string) => {
        const types: Record<string, string> = {
            expense: i18n.catalog["text_29816a44fdcd"],
            revenue: i18n.catalog["text_cc886aa7a813"],
            journal_voucher: i18n.catalog["text_a3e1bc51284d"],
        };
        return types[type] || type;
    };

    const getFrequencyText = (frequency: string) => {
        const frequencies: Record<string, string> = {
            daily: i18n.catalog["text_2a73df3ec9ae"],
            weekly: i18n.catalog["text_e16e5870ecd8"],
            monthly: i18n.catalog["text_9c677bb93912"],
            quarterly: i18n.catalog["text_eb380eddf1ec"],
            annually: i18n.catalog["text_1beeff0b0fec"],
        };
        return frequencies[frequency] || frequency;
    };

    const getStatusBadge = (template: RecurringTemplate) => {
        const isDue =
            template.next_due_date && new Date(template.next_due_date) <= new Date();
        return (
            <span className={`badge ${isDue ? "badge-warning" : "badge-success"}`}>
                {isDue ? i18n.catalog["text_710cab8f8610"] : i18n.catalog["text_629e90b3af3d"]}
            </span>
        );
    };

    const handleConfirm = () => {
        if (deleteTemplateId) {
            deleteTemplate();
        } else if (generateTemplateId) {
            generateTransaction();
        }
    };

    const columns: Column<RecurringTemplate>[] = [
        {
            key: "name",
            header: i18n.catalog["text_52ab09847cf8"],
            dataLabel: i18n.catalog["text_52ab09847cf8"],
            render: (item) => <strong>{item.name}</strong>,
        },
        {
            key: "type",
            header: i18n.catalog["text_caa3f2bb4a36"],
            dataLabel: i18n.catalog["text_caa3f2bb4a36"],
            render: (item) => getTypeText(item.type),
        },
        {
            key: "frequency",
            header: i18n.catalog["text_b308d640bc25"],
            dataLabel: i18n.catalog["text_b308d640bc25"],
            render: (item) => getFrequencyText(item.frequency),
        },
        {
            key: "next_due_date",
            header: i18n.catalog["text_7559f4d2c81a"],
            dataLabel: i18n.catalog["text_7559f4d2c81a"],
            render: (item) => (item.next_due_date ? formatDate(item.next_due_date) : "-"),
        },
        {
            key: "last_generated_date",
            header: i18n.catalog["text_2b830eee21e3"],
            dataLabel: i18n.catalog["text_2b830eee21e3"],
            render: (item) =>
                item.last_generated_date ? formatDate(item.last_generated_date) : i18n.catalog["text_0a3453886430"],
        },
        {
            key: "status",
            header: i18n.catalog["text_c3a4749caed4"],
            dataLabel: i18n.catalog["text_c3a4749caed4"],
            render: (item) => getStatusBadge(item),
        },
        {
            key: "actions",
            header: i18n.catalog["text_7797240d6caf"],
            dataLabel: i18n.catalog["text_7797240d6caf"],
            render: (item) => (
                <div className="action-buttons">
                    <button className="icon-btn view" onClick={() => viewTemplate(item.id)} title={i18n.catalog["text_3824e18ca83b"]}>
                        {getIcon("eye")}
                    </button>
                    <button className="icon-btn edit" onClick={() => editTemplate(item.id)} title={i18n.catalog["text_113d570d6555"]}>
                        {getIcon("edit")}
                    </button>
                    <button
                        className="icon-btn delete"
                        onClick={() => confirmDeleteTemplate(item.id)}
                        title={i18n.catalog["text_59ca629220a6"]}
                    >
                        {getIcon("trash")}
                    </button>
                    <button
                        className="icon-btn"
                        onClick={() => confirmGenerateTransaction(item.id)}
                        title={i18n.catalog["text_6fd1e0fe3b75"]}
                        style={{ background: "var(--success-color)", color: "white" }}
                    >
                        {getIcon("check")}
                    </button>
                </div>
            ),
        },
    ];

    return (
        <MainLayout requiredModule="recurring_transactions">
            <div id="alert-container"></div>

            <div className="sales-card animate-fade">
                <PageSubHeader
                    actions={
                        <Button
                            variant="primary"
                            onClick={openCreateDialog}
                            icon="plus"
                        >
                            {i18n.catalog["text_6e812691a69b"]}</Button>
                    }
                />
                <Table
                    columns={columns}
                    data={templates}
                    keyExtractor={(item) => item.id.toString()}
                    emptyMessage={i18n.catalog["text_310f442b0ebe"]}
                    isLoading={isLoading}
                    pagination={{
                        currentPage,
                        totalPages,
                        onPageChange: loadTemplates,
                    }}
                />
            </div>

            {/* Template Dialog */}
            <Dialog
                isOpen={templateDialog}
                onClose={() => setTemplateDialog(false)}
                title={currentTemplateId ? i18n.catalog["text_11f6eab416bf"] : i18n.catalog["text_d0fdc218719c"]}
                footer={
                    <>
                        <button className="btn btn-secondary" onClick={() => setTemplateDialog(false)}>
                            {i18n.catalog["text_9a30dc2a96b8"]}</button>
                        <button className="btn btn-primary" onClick={saveTemplate}>
                            {i18n.catalog["text_ddfcaf9d0144"]}</button>
                    </>
                }
            >
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        saveTemplate();
                    }}
                >
                    <div className="form-group">
                        <label htmlFor="template-name">{i18n.catalog["text_83ceb0871dd5"]}</label>
                        <input
                            type="text"
                            id="template-name"
                            value={templateName}
                            onChange={(e) => setTemplateName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="template-type">{i18n.catalog["text_27a8ac990d70"]}</label>
                            <select
                                id="template-type"
                                value={templateType}
                                onChange={(e) =>
                                    setTemplateType(e.target.value as RecurringTemplate['type'])
                                }
                                required
                            >
                                <option value="expense">{i18n.catalog["text_29816a44fdcd"]}</option>
                                <option value="revenue">{i18n.catalog["text_cc886aa7a813"]}</option>
                                <option value="journal_voucher">{i18n.catalog["text_a3e1bc51284d"]}</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="template-frequency">{i18n.catalog["text_8ad1fa46519a"]}</label>
                            <select
                                id="template-frequency"
                                value={templateFrequency}
                                onChange={(e) =>
                                    setTemplateFrequency(e.target.value as RecurringTemplate['frequency'])
                                }
                                required
                            >
                                <option value="daily">{i18n.catalog["text_2a73df3ec9ae"]}</option>
                                <option value="weekly">{i18n.catalog["text_e16e5870ecd8"]}</option>
                                <option value="monthly">{i18n.catalog["text_9c677bb93912"]}</option>
                                <option value="quarterly">{i18n.catalog["text_eb380eddf1ec"]}</option>
                                <option value="annually">{i18n.catalog["text_1beeff0b0fec"]}</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="next-due-date">{i18n.catalog["text_b58668e9c6ed"]}</label>
                        <input
                            type="date"
                            id="next-due-date"
                            value={nextDueDate}
                            onChange={(e) => setNextDueDate(e.target.value)}
                            required
                        />
                    </div>

                    {/* Expense Fields */}
                    {templateType === "expense" && (
                        <div>
                            <div className="form-group">
                                <label htmlFor="expense-account">{i18n.catalog["text_7c51fad1363e"]}</label>
                                <input
                                    type="text"
                                    id="expense-account"
                                    value={expenseAccount}
                                    onChange={(e) => setExpenseAccount(e.target.value)}
                                    placeholder={i18n.catalog["text_0c3e1588c25f"]}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="expense-amount">{i18n.catalog["text_3cfbd3350215"]}</label>
                                <input
                                    type="number"
                                    id="expense-amount"
                                    value={expenseAmount}
                                    onChange={(e) => setExpenseAmount(e.target.value)}
                                    step="0.01"
                                    min="0"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="expense-description">{i18n.catalog["text_95023fc76e1b"]}</label>
                                <textarea
                                    id="expense-description"
                                    value={expenseDescription}
                                    onChange={(e) => setExpenseDescription(e.target.value)}
                                    rows={2}
                                />
                            </div>
                        </div>
                    )}

                    {/* Revenue Fields */}
                    {templateType === "revenue" && (
                        <div>
                            <div className="form-group">
                                <label htmlFor="revenue-account">{i18n.catalog["text_9939ed06499b"]}</label>
                                <input
                                    type="text"
                                    id="revenue-account"
                                    value={revenueAccount}
                                    onChange={(e) => setRevenueAccount(e.target.value)}
                                    placeholder={i18n.catalog["text_0c3e1588c25f"]}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="revenue-amount">{i18n.catalog["text_3cfbd3350215"]}</label>
                                <input
                                    type="number"
                                    id="revenue-amount"
                                    value={revenueAmount}
                                    onChange={(e) => setRevenueAmount(e.target.value)}
                                    step="0.01"
                                    min="0"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="revenue-description">{i18n.catalog["text_95023fc76e1b"]}</label>
                                <textarea
                                    id="revenue-description"
                                    value={revenueDescription}
                                    onChange={(e) => setRevenueDescription(e.target.value)}
                                    rows={2}
                                />
                            </div>
                        </div>
                    )}

                    {/* Journal Fields */}
                    {templateType === "journal_voucher" && (
                        <div>
                            <div className="form-group">
                                <label htmlFor="journal-entries">{i18n.catalog["text_9bb920c68658"]}</label>
                                <textarea
                                    id="journal-entries"
                                    value={journalEntries}
                                    onChange={(e) => setJournalEntries(e.target.value)}
                                    rows={6}
                                    placeholder={i18n.catalog["text_a2012a8416cf"]}
                                    required
                                />
                                <small style={{ color: "var(--text-secondary)" }}>
                                    {i18n.catalog["text_dd7f6ec25fa4"]}</small>
                            </div>
                        </div>
                    )}
                </form>
            </Dialog>

            {/* Confirm Dialog */}
            <ConfirmDialog
                isOpen={confirmDialog}
                onClose={() => {
                    setConfirmDialog(false);
                    setDeleteTemplateId(null);
                    setGenerateTemplateId(null);
                }}
                onConfirm={handleConfirm}
                title={i18n.catalog["text_8f7d74ac0eac"]}
                message={
                    deleteTemplateId
                        ? i18n.catalog["text_25afc8d1f0a9"]
                        : i18n.catalog["text_017896388246"]
                }
                confirmText={i18n.catalog["text_8f7d74ac0eac"]}
                confirmVariant={deleteTemplateId ? "danger" : "primary"}
            />
        </MainLayout>
    );
}

