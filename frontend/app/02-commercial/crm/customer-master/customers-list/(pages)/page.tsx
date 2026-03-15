"use client";

import { MainLayout, PageSubHeader } from "@/components/layout";
import { ActionButtons, Button, Column, ConfirmDialog, Dialog, SearchableSelect, Table, showToast } from "@/components/ui";
import { fetchAPI } from "@/lib/api";
import { Permission, User, canAccess, checkAuth, getStoredPermissions, getStoredUser } from "@/lib/auth";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { Icon, getIcon } from "@/lib/icons";
import { formatCurrency } from "@/lib/utils";
import { useCustomerStore } from "@/stores/useCustomerStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Customer } from "@/types";

export default function ARCustomersPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    const {
        items: customers,
        currentPage,
        totalPages,
        isLoading,
        load: loadCustomers,
        save: saveCustomer,
        remove: deleteCustomer,
    } = useCustomerStore();

    // Dialogs
    const [formDialog, setFormDialog] = useState(false);
    const [viewDialog, setViewDialog] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const [formData, setFormData] = useState({
        customer_code: "",
        name: "",
        phone: "",
        email: "",
        address: "",
        tax_number: "",
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
            loadCustomers();

            // Load Numbering Range Groups for Customers
            try {
                const res: any = await fetchAPI(API_ENDPOINTS.PLATFORM.NUMBER_RANGES.OBJECTS.byType("ar_customers"));
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
    }, [loadCustomers]);

    useEffect(() => {
        const fetchNextNumber = async () => {
            // Only fetch if dialog is open, we're not editing (no selectedCustomer), 
            // group/object are set, and code field is currently empty
            if (formDialog && !selectedCustomer && selectedGroup && nrObjectId && !formData.customer_code) {
                try {
                    const numRes: any = await fetchAPI(API_ENDPOINTS.PLATFORM.NUMBER_RANGES.PREVIEW_NUMBER, {
                        method: 'POST',
                        body: JSON.stringify({ object_id: nrObjectId, group_id: selectedGroup })
                    });

                    const generatedNumber = numRes.number || numRes.data?.number;
                    if (numRes.success && generatedNumber) {
                        setFormData(prev => ({ ...prev, customer_code: generatedNumber }));
                    }
                } catch (error) {
                    console.error("Failed to generate numbering code", error);
                }
            }
        };
        fetchNextNumber();
    }, [selectedGroup, nrObjectId, formDialog, selectedCustomer]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);
        loadCustomers(1, value);
    };

    const openAddDialog = () => {
        setSelectedCustomer(null);
        setFormData({ customer_code: "", name: "", phone: "", email: "", address: "", tax_number: "" });
        setFormDialog(true);
    };

    const openEditDialog = (c: Customer) => {
        setSelectedCustomer(c);
        setFormData({
            customer_code: c.customer_code || "",
            name: c.name,
            phone: c.phone || "",
            email: c.email || "",
            address: c.address || "",
            tax_number: c.tax_number || "",
        });
        setFormDialog(true);
    };

    const handleSubmit = async () => {
        if (!formData.name.trim()) {
            showToast("يرجى إدخال اسم العميل", "error");
            return;
        }

        const submitData = { ...formData } as any;

        // If using auto-numbering for a NEW customer, we let the backend generate it
        if (!selectedCustomer && nrObjectId && selectedGroup) {
            submitData.nr_object_id = nrObjectId;
            submitData.nr_group_id = selectedGroup;
            // Clear the preview code so backend generates a fresh sequential one
            submitData.customer_code = '';
        }

        const success = await saveCustomer(submitData, selectedCustomer?.id);
        if (success) {
            setFormDialog(false);
            loadCustomers(currentPage, searchTerm);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        const success = await deleteCustomer(deleteId);
        if (success) {
            setConfirmDialog(false);
        }
    };

    const columns: Column<Customer>[] = [
        { key: "customer_code", header: "الكود", dataLabel: "الكود" },
        { key: "name", header: "اسم العميل", dataLabel: "اسم العميل" },
        { key: "phone", header: "الهاتف", dataLabel: "الهاتف" },
        {
            key: "total_debt",
            header: "إجمالي الدين",
            dataLabel: "إجمالي الدين",
            render: (it) => formatCurrency(it.total_debt)
        },
        {
            key: "total_paid",
            header: "إجمالي المدفوع",
            dataLabel: "إجمالي المدفوع",
            render: (it) => <span className="text-success">{formatCurrency(it.total_paid)}</span>
        },
        {
            key: "balance",
            header: "الرصيد المتبقي",
            dataLabel: "الرصيد المتبقي",
            render: (it) => (
                <span className={it.balance > 0 ? "text-danger strong" : "text-success"}>
                    {formatCurrency(it.balance)}
                </span>
            )
        },
        {
            key: "actions",
            header: "الإجراءات",
            dataLabel: "الإجراءات",
            render: (it) => (
                <ActionButtons
                    actions={[
                        {
                            icon: "list",
                            title: "كشف الحساب",
                            variant: "view",
                            onClick: () => { router.push(`/02-commercial/crm/customer-master/customer-ledger?customer_id=${it.id}`); }
                        },
                        {
                            icon: "eye",
                            title: "تفاصيل",
                            variant: "info",
                            onClick: () => { setSelectedCustomer(it); setViewDialog(true); },
                        },
                        {
                            icon: "edit",
                            title: "تعديل",
                            variant: "edit",
                            onClick: () => { openEditDialog(it) },
                            hidden: canAccess(permissions, "ar_customers", "edit")
                        },
                        {
                            icon: "trash",
                            title: "حذف",
                            variant: "delete",
                            onClick: () => { setDeleteId(it.id); setConfirmDialog(true); },
                            hidden: canAccess(permissions, "ar_customers", "delete")
                        }
                    ]}
                />
            ),
        }
    ];

    return (
        <MainLayout>
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
                        canAccess(permissions, "ar_customers", "create") && (
                            <Button variant="primary" icon="plus" onClick={openAddDialog}>
                                إضافة عميل
                            </Button>
                        )
                    }
                />
                <Table
                    columns={columns}
                    data={customers}
                    keyExtractor={(it) => it.id}
                    isLoading={isLoading}
                    pagination={{
                        currentPage,
                        totalPages,
                        onPageChange: (page) => loadCustomers(page, searchTerm)
                    }}
                />
            </div>

            {/* Form Dialog */}
            <Dialog
                isOpen={formDialog}
                onClose={() => setFormDialog(false)}
                title={selectedCustomer ? "تعديل العميل" : "إضافة عميل جديد"}
                maxWidth="600px"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setFormDialog(false)}>إلغاء</Button>
                        <Button variant="primary" onClick={handleSubmit}>{selectedCustomer ? "تحديث" : "إضافة"}</Button>
                    </>
                }
            >
                <div className="form-row">
                    <div className="form-group">
                        <label>كود العميل</label>
                        <input
                            type="text"
                            value={formData.customer_code}
                            onChange={(e) => setFormData({ ...formData, customer_code: e.target.value })}
                            placeholder={selectedCustomer ? "" : (nrGroups.length > 0 ? "يتم التوليد تلقائيا..." : "أدخل الكود")}
                        />
                    </div>
                    {(!selectedCustomer && nrGroups.length > 0) && (
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
                    <label>اسم العميل *</label>
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
            <Dialog
                isOpen={viewDialog}
                onClose={() => setViewDialog(false)}
                title="ملف العميل"
                maxWidth="600px"
            >
                {selectedCustomer && (
                    <div className="customer-profile-view">
                        <div className="profile-header">
                            <div className="profile-avatar">
                                <Icon name="user" size={32} />
                            </div>
                            <div className="profile-info">
                                <h2>{selectedCustomer.name}</h2>
                                <span className={`badge ${selectedCustomer.balance > 0 ? "badge-danger" : "badge-success"}`}>
                                    {selectedCustomer.balance > 0 ? "مدين" : "رصيد مكتمل"}
                                </span>
                            </div>
                        </div>

                        <div className="details-section">
                            <div className="info-grid">
                                <div className="info-item">
                                    <Icon name="user" className="info-icon" />
                                    <div className="info-content">
                                        <label>رقم الهاتف</label>
                                        <span>{selectedCustomer.phone || "غير متوفر"}</span>
                                    </div>
                                </div>
                                <div className="info-item">
                                    <Icon name="check" className="info-icon" />
                                    <div className="info-content">
                                        <label>الرقم الضريبي</label>
                                        <span>{selectedCustomer.tax_number || "غير متوفر"}</span>
                                    </div>
                                </div>
                                <div className="info-item full-width">
                                    <Icon name="home" className="info-icon" />
                                    <div className="info-content">
                                        <label>العنوان</label>
                                        <span>{selectedCustomer.address || "بدون عنوان مسجل"}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="dashboard-stats compact" style={{ padding: 0, marginTop: "1.5rem" }}>
                            <div className="stat-card">
                                <div className="stat-icon alert">{getIcon("dollar")}</div>
                                <div className="stat-info">
                                    <h3>المبيعات (مدين)</h3>
                                    <p className="text-danger">{formatCurrency(selectedCustomer.total_debt)}</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon products">{getIcon("check")}</div>
                                <div className="stat-info">
                                    <h3>المدفوعات (دائن)</h3>
                                    <p className="text-success">{formatCurrency(selectedCustomer.total_paid)}</p>
                                </div>
                            </div>
                            <div className="stat-card highlighted">
                                <div className="stat-icon total">{getIcon("building")}</div>
                                <div className="stat-info">
                                    <h3>الرصيد المستحق</h3>
                                    <p className={selectedCustomer.balance > 0 ? "text-danger" : "text-success"}>
                                        {formatCurrency(selectedCustomer.balance)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="dialog-actions-alt mt-6" style={{ marginTop: "2rem", display: "flex", justifyContent: "flex-end" }}>
                            <Button
                                variant="primary"
                                icon="clipboard-list"
                                onClick={() => router.push(`/02-commercial/crm/customer-master/customer-ledger?customer_id=${selectedCustomer.id}`)}
                            >
                                عرض كشف الحساب الكامل
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
                message="هل أنت متأكد من حذف هذا العميل؟ سيتم حذف جميع الفواتير المرتبطة به."
            />
        </MainLayout>
    );
}
