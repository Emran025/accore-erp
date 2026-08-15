"use client";

import { useI18n } from "@/lib/i18n";
import { MainLayout, PageSubHeader } from "@/components/layout";
import { ActionButtons, Button, Column, ConfirmDialog, Dialog, SearchableSelect, Table, showToast } from "@/components/ui";
import { fetchAPI } from "@/lib/api";
import { Permission, User, canAccess, checkAuth, getStoredPermissions, getStoredUser } from "@/lib/auth";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatCurrency } from "@/lib/utils";
import { useSupplierStore } from "@/stores/useSupplierStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Supplier } from "@/types";

export default function SuppliersPage() {
    const { t: i18n } = useI18n();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    const {
        items: suppliers,
        currentPage,
        totalPages,
        isLoading,
        load: loadSuppliers,
        save: saveSupplier,
        remove: deleteSupplier,
    } = useSupplierStore();

    // Dialogs
    const [formDialog, setFormDialog] = useState(false);
    const [viewDialog, setViewDialog] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const [formData, setFormData] = useState({
        supplier_code: "",
        name: "",
        phone: "",
        email: "",
        address: "",
        tax_number: "",
        credit_limit: "0",
        payment_terms: "30",
    });

    // Number Range State
    const [nrObjectId, setNrObjectId] = useState<number | null>(null);
    const [nrGroups, setNrGroups] = useState<any[]>([]);
    const [selectedGroup, setSelectedGroup] = useState("");

    useEffect(() => {
        const init = async () => {
            const authenticated = await checkAuth();
            if (!authenticated) return;
            setUser(getStoredUser());
            setPermissions(getStoredPermissions());
            loadSuppliers();

            // Load Numbering Range Groups for Suppliers
            try {
                const res: any = await fetchAPI(API_ENDPOINTS.PLATFORM.NUMBER_RANGES.OBJECTS.byType("ap_suppliers"));
                if (res.success && (res.data || res.id)) {
                    const data = res.data || res;
                    setNrObjectId(data.id);
                    if (data.groups && data.groups.length > 0) {
                        setNrGroups(data.groups);
                        setSelectedGroup(data.groups[0].id.toString());
                    }
                }
            } catch (e) {
                console.error(i18n.catalog["text_8863d50a501e"], e);
            }
        };
        init();
    }, [loadSuppliers]);

    useEffect(() => {
        const fetchNextNumber = async () => {
            if (formDialog && !selectedSupplier && selectedGroup && nrObjectId && !formData.supplier_code) {
                try {
                    const numRes: any = await fetchAPI(API_ENDPOINTS.PLATFORM.NUMBER_RANGES.PREVIEW_NUMBER, {
                        method: 'POST',
                        body: JSON.stringify({ object_id: nrObjectId, group_id: selectedGroup })
                    });

                    const generatedNumber = numRes.number || numRes.data?.number;
                    if (numRes.success && generatedNumber) {
                        setFormData(prev => ({ ...prev, supplier_code: generatedNumber }));
                    }
                } catch (error) {
                    console.error(i18n.catalog["text_5c64142f4a76"], error);
                }
            }
        };
        fetchNextNumber();
    }, [selectedGroup, nrObjectId, formDialog, selectedSupplier]);

    const openAddDialog = () => {
        setSelectedSupplier(null);
        setFormData({ supplier_code: "", name: "", phone: "", email: "", address: "", tax_number: "", credit_limit: "0", payment_terms: "30" });
        setFormDialog(true);
    };

    const openEditDialog = (s: Supplier) => {
        setSelectedSupplier(s);
        setFormData({
            supplier_code: s.supplier_code || "",
            name: s.name,
            phone: s.phone || "",
            email: s.email || "",
            address: s.address || "",
            tax_number: s.tax_number || "",
            credit_limit: String(s.credit_limit),
            payment_terms: String(s.payment_terms),
        });
        setFormDialog(true);
    };

    const handleSubmit = async () => {
        if (!formData.name.trim()) {
            showToast(i18n.catalog["text_bea88ca35e28"], "error");
            return;
        }

        const submitData = { ...formData } as any;

        // If using auto-numbering for a NEW supplier, we let the backend generate it
        if (!selectedSupplier && nrObjectId && selectedGroup) {
            submitData.nr_object_id = nrObjectId;
            submitData.nr_group_id = selectedGroup;
            // Clear the preview code so backend generates a fresh sequential one
            submitData.supplier_code = '';
        }

        const success = await saveSupplier(submitData, selectedSupplier?.id);
        if (success) {
            setFormDialog(false);
            loadSuppliers(currentPage, searchTerm);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        const success = await deleteSupplier(deleteId);
        if (success) {
            setConfirmDialog(false);
        }
    };

    const columns: Column<Supplier>[] = [
        { key: "supplier_code", header: i18n.catalog["text_e28ef005ab68"], dataLabel: i18n.catalog["text_e28ef005ab68"] },
        { key: "name", header: i18n.catalog["text_63df5e485ac7"], dataLabel: i18n.catalog["text_63df5e485ac7"] },
        { key: "phone", header: i18n.catalog["text_94b59a5125fb"], dataLabel: i18n.catalog["text_94b59a5125fb"] },
        {
            key: "current_balance",
            header: i18n.catalog["text_fada69965d9d"],
            dataLabel: i18n.catalog["text_fada69965d9d"],
            render: (it) => (
                <span className={it.current_balance > 0 ? "text-danger strong" : "text-success"}>
                    {formatCurrency(it.current_balance)}
                </span>
            )
        },
        { key: "payment_terms", header: i18n.catalog["text_40f5f25136ed"], dataLabel: i18n.catalog["text_a97195003727"] },
        {
            key: "actions",
            header: i18n.catalog["text_7797240d6caf"],
            dataLabel: i18n.catalog["text_7797240d6caf"],
            render: (it) => (
                <ActionButtons
                    actions={[
                        {
                            icon: "view",
                            title: i18n.catalog["text_7c9977c2a35b"],
                            variant: "view",
                            onClick: () => { router.push(`/04-supply-chain/supplier-sourcing/supplier-master/supplier-ledger?supplier_id=${it.id}`) },
                        },
                        {
                            icon: "view",
                            title: i18n.catalog["text_29f382c73779"],
                            variant: "view",
                            onClick: () => { setSelectedSupplier(it); setViewDialog(true); },
                        },
                        {
                            icon: "edit",
                            title: i18n.catalog["text_113d570d6555"],
                            variant: "edit",
                            onClick: () => { openEditDialog(it) },
                            hidden: !canAccess(permissions, "ap_suppliers", "edit")
                        },
                        {
                            icon: "trash",
                            title: i18n.catalog["text_59ca629220a6"],
                            variant: "delete",
                            onClick: () => { setDeleteId(it.id); setConfirmDialog(true); },
                            hidden: !canAccess(permissions, "ap_suppliers", "delete")
                        }
                    ]}
                />
            )
        }
    ];

    return (
        <MainLayout requiredModule="ap_suppliers">


            <div className="sales-card animate-fade">
                <PageSubHeader
                    user={user}
                    searchInput={
                        <SearchableSelect
                            options={[]}
                            value={null}
                            onChange={() => { }}
                            onSearch={(val) => {
                                setSearchTerm(val);
                                loadSuppliers(1, val);
                            }}
                            placeholder={i18n.catalog["text_a271bcbebe07"]}
                            className="header-search-bar"
                        />
                    }
                    actions={
                        canAccess(permissions, "ap_suppliers", "create") && (
                            <Button
                                variant="primary"
                                icon="plus"
                                onClick={openAddDialog}
                            >
                                {i18n.catalog["text_ca6613fedacd"]}</Button>
                        )
                    }
                />
                <Table
                    columns={columns}
                    data={suppliers}
                    keyExtractor={(item) => item.id}
                    isLoading={isLoading}
                    pagination={{
                        currentPage,
                        totalPages,
                        onPageChange: (page) => loadSuppliers(page, searchTerm)
                    }}
                />
            </div>

            {/* Form Dialog */}
            <Dialog
                isOpen={formDialog}
                onClose={() => setFormDialog(false)}
                title={selectedSupplier ? i18n.catalog["text_491a2b55387d"] : i18n.catalog["text_87842dcb677b"]}
                maxWidth="600px"
                footer={
                    <>
                        <Button
                            variant="secondary"
                            onClick={() => setFormDialog(false)}
                        >
                            {i18n.catalog["text_9a30dc2a96b8"]}</Button>
                        <Button
                            variant="primary"
                            onClick={handleSubmit}
                        >
                            {selectedSupplier ? i18n.catalog["text_00eab31f95b7"] : i18n.catalog["text_d52453ac627d"]}
                        </Button>
                    </>
                }
            >
                <div className="form-row">
                    <div className="form-group">
                        <label>{i18n.catalog["text_2a090a9210da"]}</label>
                        <input
                            type="text"
                            value={formData.supplier_code}
                            onChange={(e) => setFormData({ ...formData, supplier_code: e.target.value })}
                            placeholder={selectedSupplier ? "" : (nrGroups.length > 0 ? i18n.catalog["text_3bebb10295e4"] : i18n.catalog["text_dcbab81a1fa8"])}
                        />
                    </div>
                    {(!selectedSupplier && nrGroups.length > 0) && (
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>{i18n.catalog["text_30b23b8e5db8"]}</label>
                            <SearchableSelect
                                options={nrGroups.map(grp => ({ value: grp.id.toString(), label: grp.name }))}
                                value={selectedGroup}
                                onChange={(val) => setSelectedGroup(val ? val.toString() : "")}
                                placeholder={i18n.catalog["text_cceb790da419"]}
                            />
                        </div>
                    )}
                </div>

                <div className="form-group">
                    <label>{i18n.catalog["text_f4fb488f0b95"]}</label>
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

                <div className="form-row">
                    <div className="form-group">
                        <label>{i18n.catalog["text_0305ad1923a5"]}</label>
                        <input type="number" value={formData.credit_limit} onChange={(e) => setFormData({ ...formData, credit_limit: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label>{i18n.catalog["text_40f5f25136ed"]}</label>
                        <input type="number" value={formData.payment_terms} onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })} />
                    </div>
                </div>

                <div className="form-group">
                    <label>{i18n.catalog["text_74b3eeb4b88d"]}</label>
                    <input type="text" value={formData.tax_number} onChange={(e) => setFormData({ ...formData, tax_number: e.target.value })} />
                </div>

                <div className="form-group">
                    <label>{i18n.catalog["text_2d110e56d5f5"]}</label>
                    <textarea value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} rows={2} />
                </div>
            </Dialog>

            {/* View Dialog */}
            <Dialog isOpen={viewDialog} onClose={() => setViewDialog(false)} title={i18n.catalog["text_a3e561a4a6ba"]} maxWidth="600px">
                {selectedSupplier && (
                    <div className="supplier-details">
                        <div className="details-grid">
                            <div className="detail-item">
                                <span className="label">{i18n.catalog["text_63df5e485ac7"]}</span>
                                <span className="value strong">{selectedSupplier.name}</span>
                            </div>
                            <div className="detail-item">
                                <span className="label">{i18n.catalog["text_94b59a5125fb"]}</span>
                                <span className="value">{selectedSupplier.phone || "-"}</span>
                            </div>
                            <div className="detail-item">
                                <span className="label">{i18n.catalog["text_ddf0fca39a4f"]}</span>
                                <span className="value">{selectedSupplier.email || "-"}</span>
                            </div>
                            <div className="detail-item">
                                <span className="label">{i18n.catalog["text_74b3eeb4b88d"]}</span>
                                <span className="value">{selectedSupplier.tax_number || "-"}</span>
                            </div>
                            <div className="detail-item">
                                <span className="label">{i18n.catalog["text_0305ad1923a5"]}</span>
                                <span className="value">{formatCurrency(selectedSupplier.credit_limit)}</span>
                            </div>
                            <div className="detail-item">
                                <span className="label">{i18n.catalog["text_a97195003727"]}</span>
                                <span className="value">{selectedSupplier.payment_terms} {i18n.catalog["text_eb07f635d883"]}</span>
                            </div>
                        </div>

                        <div className="balance-cards">
                            <div className="balance-card highlighted">
                                <span className="label">{i18n.catalog["text_337dc0628570"]}</span>
                                <span className={`value ${selectedSupplier.current_balance > 0 ? "danger" : "success"}`}>
                                    {formatCurrency(selectedSupplier.current_balance)}
                                </span>
                            </div>
                        </div>

                        <div className="mt-4 flex justify-end">
                            <Button
                                variant="primary"
                                icon="list"
                                onClick={() => router.push(`/04-supply-chain/supplier-sourcing/supplier-master/supplier-ledger?supplier_id=${selectedSupplier.id}`)}
                            >
                                {i18n.catalog["text_7818712a19ae"]}</Button>
                        </div>
                    </div>
                )}
            </Dialog>

            <ConfirmDialog
                isOpen={confirmDialog}
                onClose={() => setConfirmDialog(false)}
                onConfirm={handleDelete}
                title={i18n.catalog["text_5f9cb54dc136"]}
                message={i18n.catalog["text_d2119a4b2910"]}
            />
        </MainLayout>
    );
}
