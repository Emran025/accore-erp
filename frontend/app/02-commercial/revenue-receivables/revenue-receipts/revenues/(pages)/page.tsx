"use client";

import { useI18n, catalogText, catalogMessage } from "@/lib/i18n";
import { MainLayout, PageSubHeader } from "@/components/layout";
import { Button, Column, ConfirmDialog, Dialog, SearchableSelect, Table, showToast } from "@/components/ui";
import { fetchAPI } from "@/lib/api";
import { Permission, User, canAccess, getStoredPermissions, getStoredUser } from "@/lib/auth";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { getIcon } from "@/lib/icons";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useCallback, useEffect, useState } from "react";

interface Revenue {
    id: number;
    source: string;
    amount: number;
    description: string;
    revenue_date: string;
    created_at: string;
}

const revenueCategories = [
    { value: "sales", label: catalogMessage("text_f05df07cd974") },
    { value: "services", label: catalogMessage("text_f53b39989760") },
    { value: "rental", label: catalogMessage("text_b73ae0125ca9") },
    { value: "investment", label: catalogMessage("text_e5829f405a45") },
    { value: "other", label: catalogMessage("text_17a9f38e22b6") },
];

export default function RevenuesPage() {
    const { t: i18n } = useI18n();
    const [user, setUser] = useState<User | null>(null);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [revenues, setRevenues] = useState<Revenue[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Dialogs
    const [formDialog, setFormDialog] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState(false);
    const [selectedRevenue, setSelectedRevenue] = useState<Revenue | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    // Form
    const [formData, setFormData] = useState({
        description: "",
        amount: "",
        category: "sales",
        revenue_date: new Date().toISOString().split("T")[0],
        notes: "",
    });

    const itemsPerPage = 10;

    const loadRevenues = useCallback(async (page: number = 1, search: string = "") => {
        try {
            setIsLoading(true);
            const response = await fetchAPI(
                `${API_ENDPOINTS.FINANCE.REVENUES}?page=${page}&limit=${itemsPerPage}&search=${encodeURIComponent(search)}`
            );
            setRevenues((response.revenues as Revenue[]) || []);
            setTotalPages(Math.ceil((Number(response.total) || 0) / itemsPerPage));
            setCurrentPage(page);
        } catch {
            showToast(i18n.catalog["text_3172de175d99"], "error");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const storedUser = getStoredUser();
        const storedPermissions = getStoredPermissions();
        setUser(storedUser);
        setPermissions(storedPermissions);
        loadRevenues();
    }, [loadRevenues]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);
        loadRevenues(1, value);
    };

    const openAddDialog = () => {
        setSelectedRevenue(null);
        setFormData({
            description: "",
            amount: "",
            category: "sales",
            revenue_date: new Date().toISOString().split("T")[0],
            notes: "",
        });
        setFormDialog(true);
    };

    const openEditDialog = (revenue: Revenue) => {
        setSelectedRevenue(revenue);
        setFormData({
            description: revenue.description,
            amount: String(revenue.amount),
            category: revenue.source,
            revenue_date: revenue.revenue_date.split("T")[0],
            notes: "",
        });
        setFormDialog(true);
    };

    const handleSubmit = async () => {
        if (!formData.description.trim() || !formData.amount) {
            showToast(i18n.catalog["text_0a8eb85d0081"], "error");
            return;
        }

        try {
            if (selectedRevenue) {
                await fetchAPI(catalogText(i18n, "text_0907f4dfb304", { value0: API_ENDPOINTS.FINANCE.REVENUES, value1: selectedRevenue.id }), {
                    method: "PUT",
                    body: JSON.stringify({
                        id: selectedRevenue.id,
                        source: formData.category,
                        amount: parseFloat(formData.amount),
                        revenue_date: formData.revenue_date,
                        description: formData.description,
                    }),
                });
                showToast(i18n.catalog["text_2a5a3a6fbd3e"], "success");
            } else {
                await fetchAPI(API_ENDPOINTS.FINANCE.REVENUES, {
                    method: "POST",
                    body: JSON.stringify({
                        source: formData.category,
                        amount: parseFloat(formData.amount),
                        revenue_date: formData.revenue_date,
                        description: formData.description,
                    }),
                });
                showToast(i18n.catalog["text_b89b1a6d79c5"], "success");
            }
            setFormDialog(false);
            loadRevenues(currentPage, searchTerm);
        } catch {
            showToast(i18n.catalog["text_8403e059a507"], "error");
        }
    };

    const confirmDelete = (id: number) => {
        setDeleteId(id);
        setConfirmDialog(true);
    };

    const handleDelete = async () => {
        if (!deleteId) return;

        try {
            await fetchAPI(catalogText(i18n, "text_0907f4dfb304", { value0: API_ENDPOINTS.FINANCE.REVENUES, value1: deleteId }), { method: "DELETE" });
            showToast(i18n.catalog["text_f6a7a617e006"], "success");
            loadRevenues(currentPage, searchTerm);
        } catch {
            showToast(i18n.catalog["text_c794e4b3f12c"], "error");
        }
    };

    const getCategoryLabel = (value: string) => {
        const cat = revenueCategories.find((c) => c.value === value);
        return cat?.label || value;
    };

    const columns: Column<Revenue>[] = [
        { key: "description", header: i18n.catalog["text_95023fc76e1b"], dataLabel: i18n.catalog["text_95023fc76e1b"] },
        {
            key: "amount",
            header: i18n.catalog["text_1cd480f91b24"],
            dataLabel: i18n.catalog["text_1cd480f91b24"],
            render: (item) => <span className="text-success">{formatCurrency(item.amount)}</span>,
        },
        {
            key: "source",
            header: i18n.catalog["text_ff61fb213ffc"],
            dataLabel: i18n.catalog["text_ff61fb213ffc"],
            render: (item) => (
                <span className="badge badge-info">{getCategoryLabel(item.source)}</span>
            ),
        },
        {
            key: "revenue_date",
            header: i18n.catalog["text_d90c384199ac"],
            dataLabel: i18n.catalog["text_d90c384199ac"],
            render: (item) => formatDate(item.revenue_date),
        },
        {
            key: "actions",
            header: i18n.catalog["text_7797240d6caf"],
            dataLabel: i18n.catalog["text_7797240d6caf"],
            render: (item) => (
                <div className="action-buttons">
                    {canAccess(permissions, "revenues", "edit") && (
                        <button className="icon-btn edit" onClick={() => openEditDialog(item)} title={i18n.catalog["text_113d570d6555"]}>
                            {getIcon("edit")}
                        </button>
                    )}
                    {canAccess(permissions, "revenues", "delete") && (
                        <button className="icon-btn delete" onClick={() => confirmDelete(item.id)} title={i18n.catalog["text_59ca629220a6"]}>
                            {getIcon("trash")}
                        </button>
                    )}
                </div>
            ),
        },
    ];

    return (
        <MainLayout>

            <div className="sales-card animate-fade">
                <PageSubHeader
                    title=""
                    user={user}
                    searchInput={
                        <SearchableSelect
                            options={[]}
                            value={null}
                            onChange={() => { }}
                            onSearch={(val) => {
                                setSearchTerm(val);
                                loadRevenues(1, val);
                            }}
                            placeholder={i18n.catalog["text_c0d15d40fd31"]}
                            className="header-search-bar"
                        />
                    }
                    actions={
                        canAccess(permissions, "revenues", "create") && (
                            <Button icon="plus" onClick={openAddDialog}>
                                {i18n.catalog["text_fd924320d9e6"]}</Button>
                        )
                    }
                />
                <Table
                    columns={columns}
                    data={revenues}
                    keyExtractor={(item) => item.id}
                    emptyMessage={i18n.catalog["text_c67a7f573316"]}
                    isLoading={isLoading}
                    pagination={{
                        currentPage,
                        totalPages,
                        onPageChange: (page) => loadRevenues(page, searchTerm),
                    }}
                />
            </div>

            {/* Form Dialog */}
            <Dialog
                isOpen={formDialog}
                onClose={() => setFormDialog(false)}
                title={selectedRevenue ? i18n.catalog["text_cc3a82d4dc42"] : i18n.catalog["text_1991728a3e18"]}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setFormDialog(false)}>
                            {i18n.catalog["text_9a30dc2a96b8"]}</Button>
                        <Button variant="primary" onClick={handleSubmit}>
                            {selectedRevenue ? i18n.catalog["text_00eab31f95b7"] : i18n.catalog["text_d52453ac627d"]}
                        </Button>
                    </>
                }
            >
                <div className="form-group">
                    <label htmlFor="description">{i18n.catalog["text_c5293e340faa"]}</label>
                    <input
                        type="text"
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="amount">{i18n.catalog["text_3cfbd3350215"]}</label>
                        <input
                            type="number"
                            id="amount"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            min="0"
                            step="0.01"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="category">{i18n.catalog["text_ff61fb213ffc"]}</label>
                        <SearchableSelect
                            id="category"
                            options={revenueCategories}
                            value={formData.category}
                            onChange={(val) => setFormData({ ...formData, category: String(val) })}
                            placeholder={i18n.catalog["text_c2670d58ec52"]}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="revenue_date">{i18n.catalog["text_d90c384199ac"]}</label>
                    <input
                        type="date"
                        id="revenue_date"
                        value={formData.revenue_date}
                        onChange={(e) => setFormData({ ...formData, revenue_date: e.target.value })}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="notes">{i18n.catalog["text_d446d2dc6b81"]}</label>
                    <textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        rows={3}
                    />
                </div>
            </Dialog>

            {/* Confirm Delete Dialog */}
            <ConfirmDialog
                isOpen={confirmDialog}
                onClose={() => setConfirmDialog(false)}
                onConfirm={handleDelete}
                title={i18n.catalog["text_5f9cb54dc136"]}
                message={i18n.catalog["text_248146fff48f"]}
                confirmText={i18n.catalog["text_59ca629220a6"]}
                confirmVariant="danger"
            />
        </MainLayout>
    );
}

