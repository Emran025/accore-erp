"use client";

import { MainLayout, PageSubHeader } from "@/components/layout";
import { Button, Column, ConfirmDialog, Dialog, SearchableSelect, Table, showToast } from "@/components/ui";
import { fetchAPI } from "@/lib/api";
import { Permission, User, canAccess, checkAuth, getStoredPermissions, getStoredUser } from "@/lib/auth";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { Icon } from "@/lib/icons";
import { formatCurrency } from "@/lib/utils";
import { useSupplierStore } from "@/stores/useSupplierStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Supplier } from "@/types";

export default function SuppliersPage() {
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
                console.error("Failed to load number range groups", e);
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
                    console.error("Failed to generate numbering code", error);
                }
            }
        };
        fetchNextNumber();
    }, [selectedGroup, nrObjectId, formDialog, selectedSupplier]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);
        loadSuppliers(1, value);
    };

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
            showToast("يرجى إدخال اسم المورد", "error");
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
        { key: "supplier_code", header: "الكود", dataLabel: "الكود" },
        { key: "name", header: "اسم المورد", dataLabel: "اسم المورد" },
        { key: "phone", header: "الهاتف", dataLabel: "الهاتف" },
        {
            key: "current_balance",
            header: "الرصيد المستحق",
            dataLabel: "الرصيد المستحق",
            render: (it) => (
                <span className={it.current_balance > 0 ? "text-danger strong" : "text-success"}>
                    {formatCurrency(it.current_balance)}
                </span>
            )
        },
        { key: "payment_terms", header: "شروط الدفع (يوم)", dataLabel: "شروط الدفع" },
        {
            key: "actions",
            header: "الإجراءات",
            dataLabel: "الإجراءات",
            render: (it) => (
                <div className="action-buttons">
                    <button
                        className="icon-btn view"
                        onClick={() => router.push(`/04-supply-chain/supplier-sourcing/supplier-master/supplier-ledger?supplier_id=${it.id}`)}
                        title="كشف الحساب"
                    >
                        <Icon name="clipboard-list" />
                    </button>
                    <button
                        className="icon-btn info"
                        onClick={() => { setSelectedSupplier(it); setViewDialog(true); }}
                        title="تفاصيل"
                    >
                        <Icon name="eye" />
                    </button>
                    {canAccess(permissions, "ap_suppliers", "edit") && (
                        <button className="icon-btn edit" onClick={() => openEditDialog(it)} title="تعديل">
                            <Icon name="edit" />
                        </button>
                    )}
                    {canAccess(permissions, "ap_suppliers", "delete") && (
                        <button className="icon-btn delete" onClick={() => { setDeleteId(it.id); setConfirmDialog(true); }} title="حذف">
                            <Icon name="trash" />
                        </button>
                    )}
                </div>
            )
        }
    ];

    return (
        <MainLayout requiredModule="ap_suppliers">


            <div className="sales-card animate-fade">
                <PageSubHeader
                    user={user}
                    searchInput={
                        <input
                            type="text"
                            placeholder="بحث بالاسم أو الهاتف..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className="search-control"
                        />
                    }
                    actions={
                        canAccess(permissions, "ap_suppliers", "create") && (
                            <Button variant="primary" icon="plus" onClick={openAddDialog}>
                                إضافة مورد
                            </Button>
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
                title={selectedSupplier ? "تعديل المورد" : "إضافة مورد جديد"}
                maxWidth="600px"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setFormDialog(false)}>إلغاء</Button>
                        <Button variant="primary" onClick={handleSubmit}>{selectedSupplier ? "تحديث" : "إضافة"}</Button>
                    </>
                }
            >
                <div className="form-row">
                    <div className="form-group">
                        <label>كود المورد</label>
                        <input
                            type="text"
                            value={formData.supplier_code}
                            onChange={(e) => setFormData({ ...formData, supplier_code: e.target.value })}
                            placeholder={selectedSupplier ? "" : (nrGroups.length > 0 ? "يتم التوليد تلقائيا..." : "أدخل الكود")}
                        />
                    </div>
                    {(!selectedSupplier && nrGroups.length > 0) && (
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>مجموعة الترقيم</label>
                            <SearchableSelect
                                options={nrGroups.map(grp => ({ value: grp.id.toString(), label: grp.name }))}
                                value={selectedGroup}
                                onChange={(val) => setSelectedGroup(val ? val.toString() : "")}
                                placeholder="ابحث أو اختر مجموعة الترقيم"
                            />
                        </div>
                    )}
                </div>

                <div className="form-group">
                    <label>اسم المورد *</label>
                    <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>رقم الهاتف</label>
                        <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label>البريد الإلكتروني</label>
                        <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>الحد الائتماني</label>
                        <input type="number" value={formData.credit_limit} onChange={(e) => setFormData({ ...formData, credit_limit: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label>شروط الدفع (يوم)</label>
                        <input type="number" value={formData.payment_terms} onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })} />
                    </div>
                </div>

                <div className="form-group">
                    <label>الرقم الضريبي</label>
                    <input type="text" value={formData.tax_number} onChange={(e) => setFormData({ ...formData, tax_number: e.target.value })} />
                </div>

                <div className="form-group">
                    <label>العنوان</label>
                    <textarea value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} rows={2} />
                </div>
            </Dialog>

            {/* View Dialog */}
            <Dialog isOpen={viewDialog} onClose={() => setViewDialog(false)} title="تفاصيل المورد" maxWidth="600px">
                {selectedSupplier && (
                    <div className="supplier-details">
                        <div className="details-grid">
                            <div className="detail-item">
                                <span className="label">اسم المورد</span>
                                <span className="value strong">{selectedSupplier.name}</span>
                            </div>
                            <div className="detail-item">
                                <span className="label">الهاتف</span>
                                <span className="value">{selectedSupplier.phone || "-"}</span>
                            </div>
                            <div className="detail-item">
                                <span className="label">البريد الإلكتروني</span>
                                <span className="value">{selectedSupplier.email || "-"}</span>
                            </div>
                            <div className="detail-item">
                                <span className="label">الرقم الضريبي</span>
                                <span className="value">{selectedSupplier.tax_number || "-"}</span>
                            </div>
                            <div className="detail-item">
                                <span className="label">الحد الائتماني</span>
                                <span className="value">{formatCurrency(selectedSupplier.credit_limit)}</span>
                            </div>
                            <div className="detail-item">
                                <span className="label">شروط الدفع</span>
                                <span className="value">{selectedSupplier.payment_terms} يوم</span>
                            </div>
                        </div>

                        <div className="balance-cards">
                            <div className="balance-card highlighted">
                                <span className="label">الرصيد المستحق حالياً</span>
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
                                عرض كشف الحساب
                            </Button>
                        </div>
                    </div>
                )}
            </Dialog>

            <ConfirmDialog
                isOpen={confirmDialog}
                onClose={() => setConfirmDialog(false)}
                onConfirm={handleDelete}
                title="تأكيد الحذف"
                message="هل أنت متأكد من حذف هذا المورد؟ لا يمكن التراجع عن هذا الإجراء إذا كانت هناك معاملات مسجلة."
            />
        </MainLayout>
    );
}
