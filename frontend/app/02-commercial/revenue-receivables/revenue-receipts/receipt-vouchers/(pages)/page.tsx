"use client";

import { useI18n, catalogText } from "@/lib/i18n";
import { MainLayout } from "@/components/layout";
import { Button, Column, ConfirmDialog, SearchableSelect, SelectOption, Table, showAlert, showToast } from "@/components/ui";
import { fetchAPI } from "@/lib/api";
import { User, checkAuth, getStoredUser } from "@/lib/auth";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { getIcon } from "@/lib/icons";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useCallback, useEffect, useState } from "react";

interface Customer {
    id: number;
    name: string;
    current_balance: number;
}

interface Receipt {
    id: number;
    customer_id: number;
    type: string;
    amount: number;
    description: string;
    transaction_date: string;
    customer?: Customer;
}

export default function ReceiptsPage() {
    const { t: i18n } = useI18n();
    const [user, setUser] = useState<User | null>(null);
    const [customers, setCustomers] = useState<Customer[]>([]);

    // List
    const [receipts, setReceipts] = useState<Receipt[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Form
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [amount, setAmount] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [description, setDescription] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Delete dialog
    const [confirmDialog, setConfirmDialog] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const itemsPerPage = 20;

    const loadReceipts = useCallback(async (page: number = 1, search: string = "") => {
        try {
            setIsLoading(true);
            const response = (await fetchAPI(
                `${API_ENDPOINTS.FINANCE.AR.RECEIPTS}?page=${page}&per_page=${itemsPerPage}&search=${encodeURIComponent(search)}`
            )) as any;

            if (response.success && response.data) {
                setReceipts((response.data as Receipt[]) || []);
                const pagination = response.pagination;
                if (pagination) {
                    setTotalPages(pagination.total_pages || 1);
                    setCurrentPage(pagination.current_page || 1);
                }
            }
        } catch {
            showToast(i18n.catalog["common.general.errorLoadingVouchers"], "error");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const loadCustomers = useCallback(async () => {
        try {
            const response = (await fetchAPI(`${API_ENDPOINTS.FINANCE.AR.CUSTOMERS}?per_page=1000`)) as any;
            if (response.success && response.data) {
                setCustomers((response.data as Customer[]) || []);
            }
        } catch (error) {
            console.error(i18n.catalog["commercial.receiptVouchers.failedLoadCustomers"], error);
        }
    }, []);

    useEffect(() => {
        const init = async () => {
            const authenticated = await checkAuth();
            if (!authenticated) return;

            setUser(getStoredUser());
            await Promise.all([loadCustomers(), loadReceipts(1)]);
        };
        init();
    }, [loadCustomers, loadReceipts]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);
        loadReceipts(1, value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedCustomer) {
            showAlert("alert-container", i18n.catalog["commercial.receiptVouchers.pleaseSelectCustomer"], "error");
            return;
        }

        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            showAlert("alert-container", i18n.catalog["commercial.receiptVouchers.invalidAmount"], "error");
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetchAPI(API_ENDPOINTS.FINANCE.AR.TRANSACTIONS, {
                method: "POST",
                body: JSON.stringify({
                    customer_id: selectedCustomer.id,
                    type: "receipt",
                    amount: numAmount,
                    date: date,
                    description: description,
                }),
            });

            if (response.success) {
                showAlert("alert-container", i18n.catalog["commercial.receiptVouchers.voucherAddedSuccessfully"], "success");

                // Reset form
                setSelectedCustomer(null);
                setAmount("");
                setDescription("");
                setDate(new Date().toISOString().split("T")[0]);

                // Reload data
                await Promise.all([loadCustomers(), loadReceipts(1, searchTerm)]);
            } else {
                showAlert("alert-container", response.message || i18n.catalog["commercial.receiptVouchers.failedSaveVoucher"], "error");
            }
        } catch {
            showAlert("alert-container", i18n.catalog["common.general.errorSavingVoucher"], "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const confirmDelete = (id: number) => {
        setDeleteId(id);
        setConfirmDialog(true);
    };

    const handleDelete = async () => {
        if (!deleteId) return;

        try {
            const response = await fetchAPI(`${API_ENDPOINTS.FINANCE.AR.TRANSACTIONS}?id=${deleteId}`, {
                method: "DELETE"
            });
            if (response.success) {
                showToast(i18n.catalog["commercial.receiptVouchers.voucherDeletedSuccessfully"], "success");
                loadReceipts(currentPage, searchTerm);
            } else {
                showToast(response.message || i18n.catalog["common.general.deletionFailed"], "error");
            }
        } catch {
            showToast(i18n.catalog["common.general.errorDeletingVoucher"], "error");
        } finally {
            setConfirmDialog(false);
            setDeleteId(null);
        }
    };

    const customerOptions: SelectOption[] = customers.map((c) => ({
        value: c.id,
        label: c.name,
        subtitle: catalogText(i18n, "commercial.receiptVouchers.balance", { value0: formatCurrency(c.current_balance) }),
        original: c,
    }));

    const columns: Column<Receipt>[] = [
        {
            key: "customer_name",
            header: i18n.catalog["common.general.customer"],
            dataLabel: i18n.catalog["common.general.customer"],
            render: (item) => item.customer?.name || i18n.catalog["common.general.unknown"],
        },
        {
            key: "amount",
            header: i18n.catalog["common.general.amount"],
            dataLabel: i18n.catalog["common.general.amount"],
            render: (item) => <span className="text-success fw-bold">{formatCurrency(item.amount)}</span>,
        },
        {
            key: "transaction_date",
            header: i18n.catalog["common.general.date.alternative7"],
            dataLabel: i18n.catalog["common.general.date.alternative7"],
            render: (item) => formatDate(item.transaction_date),
        },
        {
            key: "description",
            header: i18n.catalog["common.general.statementDescription"],
            dataLabel: i18n.catalog["common.general.statementDescription"],
            render: (item) => item.description || "-",
        },
        {
            key: "actions",
            header: i18n.catalog["common.general.actions"],
            dataLabel: i18n.catalog["common.general.actions"],
            render: (item) => (
                <div className="action-buttons">
                    <button className="icon-btn delete" onClick={() => confirmDelete(item.id)} title={i18n.catalog["common.general.delete"]}>
                        {getIcon("trash")}
                    </button>
                </div>
            ),
        },
    ];

    return (
        <MainLayout>
            <div id="alert-container"></div>

            <div className="sales-layout" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {/* Form Card (Match Sales / Sales structure) */}
                <div className="sales-card compact animate-slide">
                    <div className="card-header-flex">
                        <h3>{i18n.catalog["commercial.receiptVouchers.registerNewReceiptVoucher"]}</h3>
                    </div>

                    <form onSubmit={handleSubmit} className="sales-form-grid">
                        <div className="form-group">
                            <label>{i18n.catalog["commercial.receiptVouchers.customer"]}</label>
                            <SearchableSelect
                                options={customerOptions}
                                value={selectedCustomer ? selectedCustomer.id : null}
                                onChange={(val, opt) => setSelectedCustomer(opt ? (opt.original as Customer) : null)}
                                placeholder={i18n.catalog["common.general.searchClient"]}
                            />
                            {selectedCustomer && (
                                <small className="text-muted mt-1 d-block">
                                    {i18n.catalog["commercial.receiptVouchers.currentBalance"]}<span dir="ltr">{formatCurrency(selectedCustomer.current_balance)}</span>
                                </small>
                            )}
                        </div>

                        <div className="form-group">
                            <label>{i18n.catalog["common.general.amount.alternative3"]}</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                className="styled-input"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder={i18n.catalog["common.general.message000"]}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>{i18n.catalog["common.general.date.alternative3"]}</label>
                            <input
                                type="date"
                                className="styled-input"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                            <label>{i18n.catalog["common.general.statementDescription"]}</label>
                            <input
                                type="text"
                                className="styled-input"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder={i18n.catalog["commercial.receiptVouchers.examplePaymentAccount"]}
                            />
                        </div>

                        <div className="form-actions" style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                            <Button
                                variant="primary"
                                icon="check"
                                type="submit"
                                disabled={isSubmitting || !selectedCustomer || !amount}
                            >
                                {isSubmitting ? i18n.catalog["common.general.saving"] : i18n.catalog["commercial.receiptVouchers.saveVoucher"]}
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Table Card */}
                <div className="sales-card animate-fade">
                    <div className="card-header-flex" style={{ marginBottom: '15px' }}>
                        <h3>{i18n.catalog["commercial.receiptVouchers.receiptsRegister"]}</h3>
                        <div className="search-bar">
                            <input
                                type="text"
                                placeholder={i18n.catalog["commercial.receiptVouchers.searchVoucher"]}
                                value={searchTerm}
                                onChange={handleSearch}
                                className="styled-input"
                            />
                            <span className="search-icon">{getIcon("search")}</span>
                        </div>
                    </div>

                    <Table
                        columns={columns}
                        data={receipts}
                        keyExtractor={(item) => item.id}
                        emptyMessage={i18n.catalog["commercial.receiptVouchers.noReceiptVouchers"]}
                        isLoading={isLoading}
                        pagination={{
                            currentPage,
                            totalPages,
                            onPageChange: (page) => loadReceipts(page, searchTerm),
                        }}
                    />
                </div>
            </div>

            <ConfirmDialog
                isOpen={confirmDialog}
                onClose={() => setConfirmDialog(false)}
                onConfirm={handleDelete}
                title={i18n.catalog["common.general.confirmDeletion"]}
                message={i18n.catalog["commercial.receiptVouchers.areYouSureYouWantDeleteThisVoucher"]}
                confirmText={i18n.catalog["commercial.receiptVouchers.deleteVoucher"]}
                confirmVariant="danger"
            />
        </MainLayout>
    );
}
