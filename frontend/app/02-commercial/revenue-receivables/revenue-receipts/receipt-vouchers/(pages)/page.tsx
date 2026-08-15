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
            showToast(i18n.catalog["text_e1e1dc7023c4"], "error");
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
            console.error(i18n.catalog["text_5150589fdbe0"], error);
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
            showAlert("alert-container", i18n.catalog["text_8596f1b18e53"], "error");
            return;
        }

        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            showAlert("alert-container", i18n.catalog["text_457ff7bc7182"], "error");
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
                showAlert("alert-container", i18n.catalog["text_2c33a1e8602b"], "success");

                // Reset form
                setSelectedCustomer(null);
                setAmount("");
                setDescription("");
                setDate(new Date().toISOString().split("T")[0]);

                // Reload data
                await Promise.all([loadCustomers(), loadReceipts(1, searchTerm)]);
            } else {
                showAlert("alert-container", response.message || i18n.catalog["text_bceefd20567c"], "error");
            }
        } catch {
            showAlert("alert-container", i18n.catalog["text_9709a87f3bfe"], "error");
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
                showToast(i18n.catalog["text_62b245330ed1"], "success");
                loadReceipts(currentPage, searchTerm);
            } else {
                showToast(response.message || i18n.catalog["text_f46bfc521612"], "error");
            }
        } catch {
            showToast(i18n.catalog["text_efa19ed994b9"], "error");
        } finally {
            setConfirmDialog(false);
            setDeleteId(null);
        }
    };

    const customerOptions: SelectOption[] = customers.map((c) => ({
        value: c.id,
        label: c.name,
        subtitle: catalogText(i18n, "text_4b3672e910cf", { value0: formatCurrency(c.current_balance) }),
        original: c,
    }));

    const columns: Column<Receipt>[] = [
        {
            key: "customer_name",
            header: i18n.catalog["text_a042411e90be"],
            dataLabel: i18n.catalog["text_a042411e90be"],
            render: (item) => item.customer?.name || i18n.catalog["text_d44d443520df"],
        },
        {
            key: "amount",
            header: i18n.catalog["text_1cd480f91b24"],
            dataLabel: i18n.catalog["text_1cd480f91b24"],
            render: (item) => <span className="text-success fw-bold">{formatCurrency(item.amount)}</span>,
        },
        {
            key: "transaction_date",
            header: i18n.catalog["text_d90c384199ac"],
            dataLabel: i18n.catalog["text_d90c384199ac"],
            render: (item) => formatDate(item.transaction_date),
        },
        {
            key: "description",
            header: i18n.catalog["text_263b62fdd71b"],
            dataLabel: i18n.catalog["text_263b62fdd71b"],
            render: (item) => item.description || "-",
        },
        {
            key: "actions",
            header: i18n.catalog["text_7797240d6caf"],
            dataLabel: i18n.catalog["text_7797240d6caf"],
            render: (item) => (
                <div className="action-buttons">
                    <button className="icon-btn delete" onClick={() => confirmDelete(item.id)} title={i18n.catalog["text_59ca629220a6"]}>
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
                        <h3>{i18n.catalog["text_75b3aeabab5e"]}</h3>
                    </div>

                    <form onSubmit={handleSubmit} className="sales-form-grid">
                        <div className="form-group">
                            <label>{i18n.catalog["text_8fb18f581806"]}</label>
                            <SearchableSelect
                                options={customerOptions}
                                value={selectedCustomer ? selectedCustomer.id : null}
                                onChange={(val, opt) => setSelectedCustomer(opt ? (opt.original as Customer) : null)}
                                placeholder={i18n.catalog["text_96b809b02ccc"]}
                            />
                            {selectedCustomer && (
                                <small className="text-muted mt-1 d-block">
                                    {i18n.catalog["text_73a95ba2ae3d"]}<span dir="ltr">{formatCurrency(selectedCustomer.current_balance)}</span>
                                </small>
                            )}
                        </div>

                        <div className="form-group">
                            <label>{i18n.catalog["text_3cfbd3350215"]}</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                className="styled-input"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder={i18n.catalog["text_561b2814d3c0"]}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>{i18n.catalog["text_24ab9ad4f30d"]}</label>
                            <input
                                type="date"
                                className="styled-input"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                            <label>{i18n.catalog["text_263b62fdd71b"]}</label>
                            <input
                                type="text"
                                className="styled-input"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder={i18n.catalog["text_5181ae2bdcaa"]}
                            />
                        </div>

                        <div className="form-actions" style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                            <Button
                                variant="primary"
                                icon="check"
                                type="submit"
                                disabled={isSubmitting || !selectedCustomer || !amount}
                            >
                                {isSubmitting ? i18n.catalog["text_8688b0ff5f34"] : i18n.catalog["text_f95b81cb1ce4"]}
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Table Card */}
                <div className="sales-card animate-fade">
                    <div className="card-header-flex" style={{ marginBottom: '15px' }}>
                        <h3>{i18n.catalog["text_09217dd85277"]}</h3>
                        <div className="search-bar">
                            <input
                                type="text"
                                placeholder={i18n.catalog["text_afb84f951136"]}
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
                        emptyMessage={i18n.catalog["text_99676bba6584"]}
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
                title={i18n.catalog["text_5f9cb54dc136"]}
                message={i18n.catalog["text_7d9b904f0f1b"]}
                confirmText={i18n.catalog["text_45ce3d5e8a57"]}
                confirmVariant="danger"
            />
        </MainLayout>
    );
}
