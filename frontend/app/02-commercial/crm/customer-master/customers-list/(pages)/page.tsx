"use client";

import { useI18n } from "@/lib/i18n";
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
    const { t: i18n } = useI18n();
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
                console.error(i18n.catalog["common.general.failedLoadNumberRangeGroups"], e);
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
                    console.error(i18n.catalog["common.general.failedGenerateNumberingCode"], error);
                }
            }
        };
        fetchNextNumber();
    }, [selectedGroup, nrObjectId, formDialog, selectedCustomer]);

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
            showToast(i18n.catalog["commercial.customersList.pleaseEnterClientSName"], "error");
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
        { key: "customer_code", header: i18n.catalog["common.general.code.alternative4"], dataLabel: i18n.catalog["common.general.code.alternative4"] },
        { key: "name", header: i18n.catalog["common.general.customerName"], dataLabel: i18n.catalog["common.general.customerName"] },
        { key: "phone", header: i18n.catalog["common.general.phone"], dataLabel: i18n.catalog["common.general.phone"] },
        {
            key: "total_debt",
            header: i18n.catalog["common.general.totalDebt"],
            dataLabel: i18n.catalog["common.general.totalDebt"],
            render: (it) => formatCurrency(it.total_debt)
        },
        {
            key: "total_paid",
            header: i18n.catalog["common.general.totalPaid"],
            dataLabel: i18n.catalog["common.general.totalPaid"],
            render: (it) => <span className="text-success">{formatCurrency(it.total_paid)}</span>
        },
        {
            key: "balance",
            header: i18n.catalog["common.general.remainingBalance"],
            dataLabel: i18n.catalog["common.general.remainingBalance"],
            render: (it) => (
                <span className={it.balance > 0 ? "text-danger strong" : "text-success"}>
                    {formatCurrency(it.balance)}
                </span>
            )
        },
        {
            key: "actions",
            header: i18n.catalog["common.general.actions"],
            dataLabel: i18n.catalog["common.general.actions"],
            render: (it) => (
                <ActionButtons
                    actions={[
                        {
                            icon: "list",
                            title: i18n.catalog["common.general.accountStatement"],
                            variant: "view",
                            onClick: () => { router.push(`/02-commercial/crm/customer-master/customer-ledger?customer_id=${it.id}`); }
                        },
                        {
                            icon: "eye",
                            title: i18n.catalog["common.general.details"],
                            variant: "info",
                            onClick: () => { setSelectedCustomer(it); setViewDialog(true); },
                        },
                        {
                            icon: "edit",
                            title: i18n.catalog["common.general.edit"],
                            variant: "edit",
                            onClick: () => { openEditDialog(it) },
                            hidden: canAccess(permissions, "ar_customers", "edit")
                        },
                        {
                            icon: "trash",
                            title: i18n.catalog["common.general.delete"],
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
                        <SearchableSelect
                            options={[]}
                            value={null}
                            onChange={() => { }}
                            onSearch={(val) => {
                                setSearchTerm(val);
                                loadCustomers(1, val);
                            }}
                            placeholder={i18n.catalog["common.general.searchNamePhone"]}
                            className="header-search-bar"
                        />
                    }
                    actions={
                        canAccess(permissions, "ar_customers", "create") && (
                            <Button
                                variant="primary"
                                icon="plus"
                                onClick={openAddDialog}
                            >
                                {i18n.catalog["commercial.customersList.addClient"]}</Button>
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
                title={selectedCustomer ? i18n.catalog["commercial.customersList.editCustomer"] : i18n.catalog["commercial.customersList.addNewCustomer"]}
                maxWidth="600px"
                footer={
                    <>
                        <Button
                            variant="secondary"
                            onClick={() => setFormDialog(false)}
                        >
                            {i18n.catalog["common.general.cancel"]}</Button>
                        <Button
                            variant="primary"
                            onClick={handleSubmit}
                        >
                            {selectedCustomer ? i18n.catalog["common.general.update"] : i18n.catalog["common.general.add"]}
                        </Button>
                    </>
                }
            >
                <div className="form-row">
                    <div className="form-group">
                        <label>{i18n.catalog["commercial.customersList.customerCode"]}</label>
                        <input
                            type="text"
                            value={formData.customer_code}
                            onChange={(e) => setFormData({ ...formData, customer_code: e.target.value })}
                            placeholder={selectedCustomer ? "" : (nrGroups.length > 0 ? i18n.catalog["common.general.generatedAutomatically"] : i18n.catalog["common.general.enterCode"])}
                        />
                    </div>
                    {(!selectedCustomer && nrGroups.length > 0) && (
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>{i18n.catalog["common.general.numberingGroup"]}</label>
                            <SearchableSelect
                                options={nrGroups.map(grp => ({ value: grp.id.toString(), label: grp.name }))}
                                value={selectedGroup}
                                onChange={(val) => setSelectedGroup(val ? val.toString() : "")}
                                placeholder={i18n.catalog["common.general.searchSelectNumberingGroup"]}
                            />
                        </div>
                    )}
                </div>

                <div className="form-group">
                    <label>{i18n.catalog["commercial.customersList.customerName"]}</label>
                    <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>{i18n.catalog["common.general.phoneNumber"]}</label>
                        <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label>{i18n.catalog["common.general.email"]}</label>
                        <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                    </div>
                </div>

                <div className="form-group">
                    <label>{i18n.catalog["common.general.taxNumber"]}</label>
                    <input type="text" value={formData.tax_number} onChange={(e) => setFormData({ ...formData, tax_number: e.target.value })} />
                </div>

                <div className="form-group">
                    <label>{i18n.catalog["common.general.title"]}</label>
                    <textarea value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} rows={2} />
                </div>
            </Dialog>

            {/* View Dialog */}
            <Dialog
                isOpen={viewDialog}
                onClose={() => setViewDialog(false)}
                title={i18n.catalog["commercial.customersList.customerFile"]}
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
                                    {selectedCustomer.balance > 0 ? i18n.catalog["common.general.debit"] : i18n.catalog["commercial.customersList.fullBalance"]}
                                </span>
                            </div>
                        </div>

                        <div className="details-section">
                            <div className="info-grid">
                                <div className="info-item">
                                    <Icon name="user" className="info-icon" />
                                    <div className="info-content">
                                        <label>{i18n.catalog["common.general.phoneNumber"]}</label>
                                        <span>{selectedCustomer.phone || i18n.catalog["common.general.notAvailable.alternative9"]}</span>
                                    </div>
                                </div>
                                <div className="info-item">
                                    <Icon name="check" className="info-icon" />
                                    <div className="info-content">
                                        <label>{i18n.catalog["common.general.taxNumber"]}</label>
                                        <span>{selectedCustomer.tax_number || i18n.catalog["common.general.notAvailable.alternative9"]}</span>
                                    </div>
                                </div>
                                <div className="info-item full-width">
                                    <Icon name="home" className="info-icon" />
                                    <div className="info-content">
                                        <label>{i18n.catalog["common.general.title"]}</label>
                                        <span>{selectedCustomer.address || i18n.catalog["common.general.noRegisteredAddress"]}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="dashboard-stats compact" style={{ padding: 0, marginTop: "1.5rem" }}>
                            <div className="stat-card">
                                <div className="stat-icon alert">{getIcon("dollar")}</div>
                                <div className="stat-info">
                                    <h3>{i18n.catalog["commercial.customersList.salesDebit"]}</h3>
                                    <p className="text-danger">{formatCurrency(selectedCustomer.total_debt)}</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon products">{getIcon("check")}</div>
                                <div className="stat-info">
                                    <h3>{i18n.catalog["commercial.customersList.paymentsCredit"]}</h3>
                                    <p className="text-success">{formatCurrency(selectedCustomer.total_paid)}</p>
                                </div>
                            </div>
                            <div className="stat-card highlighted">
                                <div className="stat-icon total">{getIcon("building")}</div>
                                <div className="stat-info">
                                    <h3>{i18n.catalog["common.general.outstandingBalance"]}</h3>
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
                                {i18n.catalog["common.general.viewFullAccountStatement"]}</Button>
                        </div>
                    </div>
                )}
            </Dialog>

            <ConfirmDialog
                isOpen={confirmDialog}
                onClose={() => setConfirmDialog(false)}
                onConfirm={handleDelete}
                title={i18n.catalog["common.general.confirmDeletion"]}
                message={i18n.catalog["commercial.customersList.areYouSureYouWantDeleteThisCustomer"]}
            />
        </MainLayout>
    );
}
