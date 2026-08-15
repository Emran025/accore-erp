"use client";

import { useI18n } from "@/lib/i18n";
import { MainLayout, PageSubHeader } from "@/components/layout";
import { ActionButtons, Button, Column, ConfirmDialog, Dialog, SearchableSelect, Table, showToast } from "@/components/ui";
import { Permission, User, canAccess, checkAuth, getStoredPermissions, getStoredUser } from "@/lib/auth";
import { Icon, getIcon } from "@/lib/icons";
import { formatCurrency } from "@/lib/utils";
import { useSalesRepresentativeStore } from "@/stores/useSalesRepresentativeStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SalesRepresentative } from "./types";

export default function SalesRepresentativesPage() {
    const { t: i18n } = useI18n();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    const {
        items: representatives,
        currentPage,
        totalPages,
        isLoading,
        load: loadRepresentatives,
        save: saveRepresentative,
        remove: deleteRepresentative,
    } = useSalesRepresentativeStore();

    // Dialogs
    const [formDialog, setFormDialog] = useState(false);
    const [viewDialog, setViewDialog] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState(false);
    const [selectedRepresentative, setSelectedRepresentative] = useState<SalesRepresentative | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    // Form
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        address: "",
    });

    useEffect(() => {
        const init = async () => {
            const authenticated = await checkAuth();
            if (!authenticated) return;
            setUser(getStoredUser());
            setPermissions(getStoredPermissions());
            loadRepresentatives();
        };
        init();
    }, [loadRepresentatives]);

    const openAddDialog = () => {
        setSelectedRepresentative(null);
        setFormData({ name: "", phone: "", email: "", address: "" });
        setFormDialog(true);
    };

    const openEditDialog = (r: SalesRepresentative) => {
        setSelectedRepresentative(r);
        setFormData({
            name: r.name,
            phone: r.phone || "",
            email: r.email || "",
            address: r.address || "",
        });
        setFormDialog(true);
    };

    const handleSubmit = async () => {
        if (!formData.name.trim()) {
            showToast(i18n.catalog["text_41af6ee6302b"], "error");
            return;
        }

        const success = await saveRepresentative(formData, selectedRepresentative?.id);
        if (success) {
            setFormDialog(false);
            loadRepresentatives(currentPage, searchTerm);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        const success = await deleteRepresentative(deleteId);
        if (success) {
            setConfirmDialog(false);
        }
    };

    const columns: Column<SalesRepresentative>[] = [
        { key: "name", header: i18n.catalog["text_336a418f5408"], dataLabel: i18n.catalog["text_336a418f5408"] },
        { key: "phone", header: i18n.catalog["text_94b59a5125fb"], dataLabel: i18n.catalog["text_94b59a5125fb"] },
        {
            key: "total_sales",
            header: i18n.catalog["text_19905dc9f961"],
            dataLabel: i18n.catalog["text_666f5dd27fb1"],
            render: (it) => formatCurrency(it.total_sales)
        },
        {
            key: "total_paid",
            header: i18n.catalog["text_bcfc50ef7c18"],
            dataLabel: i18n.catalog["text_bcfc50ef7c18"],
            render: (it) => <span className="text-success">{formatCurrency(it.total_paid)}</span>
        },
        {
            key: "current_balance",
            header: i18n.catalog["text_95a82033ffe7"],
            dataLabel: i18n.catalog["text_95a82033ffe7"],
            render: (it) => (
                <span className={it.current_balance > 0 ? "text-danger strong" : "text-success"}>
                    {formatCurrency(it.current_balance)}
                </span>
            )
        },
        {
            key: "actions",
            header: i18n.catalog["text_7797240d6caf"],
            dataLabel: i18n.catalog["text_7797240d6caf"],
            render: (it) => (
                <ActionButtons
                    actions={[
                        {
                            icon: "list",
                            title: i18n.catalog["text_7c9977c2a35b"],
                            variant: "view",
                            onClick: () => { router.push(`/02-commercial/marketing-distribution/representatives/reps-ledger?sales_representative_id=${it.id}`); }
                        },
                        {
                            icon: "eye",
                            title: i18n.catalog["text_29f382c73779"],
                            variant: "info",
                            onClick: () => { setSelectedRepresentative(it); setViewDialog(true); },
                        },
                        {
                            icon: "edit",
                            title: i18n.catalog["text_113d570d6555"],
                            variant: "edit",
                            onClick: () => { openEditDialog(it) },
                            hidden: !canAccess(permissions, "representatives", "edit")
                        },
                        {
                            icon: "trash",
                            title: i18n.catalog["text_59ca629220a6"],
                            variant: "delete",
                            onClick: () => { setDeleteId(it.id); setConfirmDialog(true); },
                            hidden: !canAccess(permissions, "representatives", "delete")
                        }
                    ]}
                />
            ),
        }
    ];

    return (
        <MainLayout >

            <div className="sales-card animate-fade">
                <PageSubHeader
                    title=""
                    searchInput={
                        <SearchableSelect
                            options={[]}
                            value={null}
                            onChange={() => { }}
                            onSearch={(val) => {
                                setSearchTerm(val);
                                loadRepresentatives(1, val);
                            }}
                            placeholder={i18n.catalog["text_a271bcbebe07"]}
                            className="header-search-bar"
                        />
                    }
                    actions={
                        canAccess(permissions, "representatives", "create") && (
                            <Button
                                variant="primary"
                                icon="plus"
                                onClick={openAddDialog}
                            >
                                {i18n.catalog["text_2cd7ef25fd17"]}</Button>
                        )
                    }
                />
                <Table
                    columns={columns}
                    data={representatives}
                    keyExtractor={(it) => it.id}
                    isLoading={isLoading}
                    pagination={{
                        currentPage,
                        totalPages,
                        onPageChange: (page) => loadRepresentatives(page, searchTerm)
                    }}
                />
            </div>

            {/* Form Dialog */}
            <Dialog
                isOpen={formDialog}
                onClose={() => setFormDialog(false)}
                title={selectedRepresentative ? i18n.catalog["text_ac2633e82acf"] : i18n.catalog["text_0a047579d7a9"]}
                maxWidth="600px"
                footer={
                    <>
                        <Button
                            variant="secondary" onClick={() => setFormDialog(false)}>{i18n.catalog["text_9a30dc2a96b8"]}</Button>
                        <Button variant="primary" onClick={handleSubmit}>{selectedRepresentative ? i18n.catalog["text_00eab31f95b7"] : i18n.catalog["text_d52453ac627d"]}</Button>
                    </>
                }
            >
                <div className="form-group">
                    <label>{i18n.catalog["text_493d8055084e"]}</label>
                    <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>{i18n.catalog["text_42095a7a6c15"]}</label>
                        <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label>{i18n.catalog["text_ddf0fca39a4f"]}</label>
                        <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                    </div>
                </div>

                <div className="form-group">
                    <label>{i18n.catalog["text_2d110e56d5f5"]}</label>
                    <textarea value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} rows={2} />
                </div>
            </Dialog>

            {/* View Dialog */}
            <Dialog
                isOpen={viewDialog}
                onClose={() => setViewDialog(false)}
                title={i18n.catalog["text_67c359aaf791"]}
                maxWidth="600px"
            >
                {selectedRepresentative && (
                    <div className="customer-profile-view">
                        <div className="profile-header">
                            <div className="profile-avatar">
                                <Icon name="user" size={32} />
                            </div>
                            <div className="profile-info">
                                <h2>{selectedRepresentative.name}</h2>
                                <span className={`badge ${selectedRepresentative.current_balance > 0 ? "badge-danger" : "badge-success"}`}>
                                    {selectedRepresentative.current_balance > 0 ? i18n.catalog["text_51b11255b597"] : i18n.catalog["text_35dc9e4f6a9a"]}
                                </span>
                            </div>
                        </div>

                        <div className="details-section">
                            <div className="info-grid">
                                <div className="info-item">
                                    <Icon name="user" className="info-icon" />
                                    <div className="info-content">
                                        <label>{i18n.catalog["text_42095a7a6c15"]}</label>
                                        <span>{selectedRepresentative.phone || i18n.catalog["text_e34b06cc7a25"]}</span>
                                    </div>
                                </div>
                                <div className="info-item">
                                    <Icon name="check" className="info-icon" />
                                    <div className="info-content">
                                        <label>{i18n.catalog["text_ddf0fca39a4f"]}</label>
                                        <span>{selectedRepresentative.email || i18n.catalog["text_e34b06cc7a25"]}</span>
                                    </div>
                                </div>
                                <div className="info-item full-width">
                                    <Icon name="home" className="info-icon" />
                                    <div className="info-content">
                                        <label>{i18n.catalog["text_2d110e56d5f5"]}</label>
                                        <span>{selectedRepresentative.address || i18n.catalog["text_59762001c956"]}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="dashboard-stats compact" style={{ padding: 0, marginTop: "1.5rem" }}>
                            <div className="stat-card">
                                <div className="stat-icon alert">{getIcon("dollar")}</div>
                                <div className="stat-info">
                                    <h3>{i18n.catalog["text_666f5dd27fb1"]}</h3>
                                    <p className="text-danger">{formatCurrency(selectedRepresentative.total_sales)}</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon products">{getIcon("check")}</div>
                                <div className="stat-info">
                                    <h3>{i18n.catalog["text_46e02865def4"]}</h3>
                                    <p className="text-success">{formatCurrency(selectedRepresentative.total_paid)}</p>
                                </div>
                            </div>
                            <div className="stat-card highlighted">
                                <div className="stat-icon total">{getIcon("building")}</div>
                                <div className="stat-info">
                                    <h3>{i18n.catalog["text_b0f981453405"]}</h3>
                                    <p className={selectedRepresentative.current_balance > 0 ? "text-danger" : "text-success"}>
                                        {formatCurrency(selectedRepresentative.current_balance)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="dialog-actions-alt mt-6" style={{ marginTop: "2rem", display: "flex", justifyContent: "flex-end" }}>
                            <Button
                                variant="primary"
                                icon="clipboard-list"
                                onClick={() => router.push(`/02-commercial/marketing-distribution/representatives/reps-ledger?sales_representative_id=${selectedRepresentative.id}`)}
                            >
                                {i18n.catalog["text_70fc48215fef"]}</Button>
                        </div>
                    </div>
                )}
            </Dialog>

            <ConfirmDialog
                isOpen={confirmDialog}
                onClose={() => setConfirmDialog(false)}
                onConfirm={handleDelete}
                title={i18n.catalog["text_5f9cb54dc136"]}
                message={i18n.catalog["text_f23c174fe3d0"]}
            />
        </MainLayout>
    );
}
