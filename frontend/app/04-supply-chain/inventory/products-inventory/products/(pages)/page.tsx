"use client";

import { useI18n } from "@/lib/i18n";
import { MainLayout, PageSubHeader } from "@/components/layout";
import { ActionButtons, Button, Column, ConfirmDialog, Dialog, NumberInput, SearchableSelect, Table, showToast } from "@/components/ui";
import { TextInput } from "@/components/ui/TextInput";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/select";
import { fetchAPI } from "@/lib/api";
import { Permission, User, canAccess, checkAuth, getStoredPermissions, getStoredUser } from "@/lib/auth";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatCurrency } from "@/lib/utils";
import { useProductStore } from "@/stores/useProductStore";
import { useCallback, useEffect, useState } from "react";
import { Icon } from "@/lib/icons";
import { Category, Product } from "./types";

export default function ProductsPage() {
    const { t: i18n } = useI18n();
    const [user, setUser] = useState<User | null>(null);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    const {
        items: products,
        currentPage,
        totalPages,
        isLoading,
        load: loadProducts,
        save: saveProduct,
        remove: deleteProduct,
    } = useProductStore();

    // Categories are page-specific; keep as local state
    const [categories, setCategories] = useState<Category[]>([]);
    const loadCategories = useCallback(async () => {
        try {
            const response = await fetchAPI(API_ENDPOINTS.SUPPLY_CHAIN.CATEGORIES);
            if (response.success) {
                setCategories((response.data as Category[]) || []);
            }
        } catch (e) {
            console.error(i18n.catalog["text_a400f101d9de"], e);
        }
    }, []);

    // Dialogs
    const [productDialog, setProductDialog] = useState(false);
    const [categoryDialog, setCategoryDialog] = useState(false);
    const [viewDialog, setViewDialog] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    // Form
    const [formData, setFormData] = useState({
        name: "",
        barcode: "",
        category_id: "",
        purchase_price: "",
        selling_price: "",
        stock: "",
        min_stock: "10",
        unit_type: "piece",
        units_per_package: "1",
        description: "",
        profit_margin: "",
        item_type: "product",
        sellable: true,
        inventory_control: true,
        taxable: true,
    });

    const [newCategoryName, setNewCategoryName] = useState("");

    useEffect(() => {
        const init = async () => {
            const authenticated = await checkAuth();
            if (!authenticated) return;
            setUser(getStoredUser());
            setPermissions(getStoredPermissions());
            await Promise.all([loadProducts(), loadCategories()]);
        };
        init();
    }, [loadProducts, loadCategories]);

    const openAddDialog = () => {
        setSelectedProduct(null);
        setFormData({
            name: "",
            barcode: "",
            category_id: categories[0]?.id?.toString() || "",
            purchase_price: "",
            selling_price: "",
            stock: "",
            min_stock: "10",
            unit_type: "piece",
            units_per_package: "1",
            description: "",
            profit_margin: "",
            item_type: "product",
            sellable: true,
            inventory_control: true,
            taxable: true,
        });
        setProductDialog(true);
    };

    const openEditDialog = (product: Product) => {
        setSelectedProduct(product);
        setFormData({
            name: product.name,
            barcode: product.barcode || "",
            category_id: String(product.category_id || ""),
            purchase_price: String(product.purchase_price || ""),
            selling_price: String(product.selling_price || ""),
            stock: String(product.stock || "0"),
            min_stock: String(product.min_stock || "10"),
            unit_type: product.unit_type || "piece",
            units_per_package: String(product.items_per_unit || "1"),
            description: product.description || "",
            profit_margin: String(product.profit_margin || ""),
            item_type: product.item_type || "product",
            sellable: product.sellable ?? true,
            inventory_control: product.inventory_control ?? true,
            taxable: product.taxable ?? true,
        });
        setProductDialog(true);
    };

    const calculatePrices = (field: string, value: string) => {
        const newData = { ...formData, [field]: value };
        const purchasePrice = parseFloat(newData.purchase_price) || 0;
        const sellingPrice = parseFloat(newData.selling_price) || 0;
        const margin = parseFloat(newData.profit_margin) || 0;

        if (field === "profit_margin" && purchasePrice > 0) {
            newData.selling_price = (purchasePrice * (1 + margin / 100)).toFixed(2);
        } else if (field === "selling_price" && purchasePrice > 0) {
            newData.profit_margin = (((sellingPrice - purchasePrice) / purchasePrice) * 100).toFixed(2);
        } else if (field === "purchase_price" && margin > 0) {
            newData.selling_price = (purchasePrice * (1 + margin / 100)).toFixed(2);
        }

        setFormData(newData);
    };

    const handleSubmit = async () => {
        if (!formData.name.trim() || !formData.purchase_price || !formData.selling_price) {
            showToast(i18n.catalog["text_0a8eb85d0081"], "error");
            return;
        }

        const payload = {
            name: formData.name,
            barcode: formData.barcode,
            category_id: parseInt(formData.category_id),
            unit_price: parseFloat(formData.selling_price),
            minimum_profit_margin: parseFloat(formData.profit_margin) || 0,
            stock_quantity: parseInt(formData.stock) || 0,
            unit_name: formData.unit_type === 'ctn' ? i18n.catalog["text_cc7593424dc5"] : i18n.catalog["text_d400a30ad5f3"],
            items_per_unit: parseInt(formData.units_per_package) || 1,
            sub_unit_name: formData.unit_type === 'ctn' ? i18n.catalog["text_d400a30ad5f3"] : null,
            description: formData.description,
            purchase_price: parseFloat(formData.purchase_price),
            item_type: formData.item_type,
            sellable: formData.sellable,
            inventory_control: formData.inventory_control,
            taxable: formData.taxable,
        };

        const success = await saveProduct(payload, selectedProduct?.id);
        if (success) {
            setProductDialog(false);
            await loadProducts(currentPage, searchTerm);
        }
    };

    const addCategory = async () => {
        if (!newCategoryName.trim()) {
            showToast(i18n.catalog["text_7c496f8155c1"], "error");
            return;
        }
        try {
            const res = await fetchAPI(API_ENDPOINTS.SUPPLY_CHAIN.CATEGORIES, {
                method: "POST",
                body: JSON.stringify({ name: newCategoryName }),
            });
            if (res.success) {
                showToast(i18n.catalog["text_e5835868a342"], "success");
                setCategoryDialog(false);
                setNewCategoryName("");
                loadCategories();
            }
        } catch {
            showToast(i18n.catalog["text_d3373ebaddea"], "error");
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        const success = await deleteProduct(deleteId);
        if (success) {
            setConfirmDialog(false);
        }
    };

    const columns: Column<Product>[] = [
        { key: "name", header: i18n.catalog["text_57efd1ac6869"], dataLabel: i18n.catalog["text_57efd1ac6869"] },
        { key: "barcode", header: i18n.catalog["text_501881931acd"], dataLabel: i18n.catalog["text_501881931acd"] },
        { key: "category_name", header: i18n.catalog["text_ff61fb213ffc"], dataLabel: i18n.catalog["text_ff61fb213ffc"] },
        {
            key: "item_type",
            header: i18n.catalog["text_caa3f2bb4a36"],
            dataLabel: i18n.catalog["text_caa3f2bb4a36"],
            render: (it) => (
                <span className={`badge badge-${it.item_type === 'product' ? 'info' : it.item_type === 'raw_material' ? 'secondary' : 'warning'}`}>
                    {it.item_type === 'product' ? i18n.catalog["text_f8720c7412f1"] : it.item_type === 'raw_material' ? i18n.catalog["text_ada78f6ec149"] : i18n.catalog["text_11f4216e101b"]}
                </span>
            )
        },
        {
            key: "sellable",
            header: i18n.catalog["text_07991139690d"],
            dataLabel: i18n.catalog["text_07991139690d"],
            render: (it) => (
                <span className={`badge badge-${it.sellable ? 'success' : 'danger'}`}>
                    {it.sellable ? i18n.catalog["text_4b2d2c65d365"] : i18n.catalog["text_2bd073516a87"]}
                </span>
            )
        },
        {
            key: "selling_price",
            header: i18n.catalog["text_2d37565e6fe3"],
            dataLabel: i18n.catalog["text_2d37565e6fe3"],
            render: (it) => formatCurrency(it.selling_price || 0)
        },
        {
            key: "stock",
            header: i18n.catalog["text_a0e7c1b2423d"],
            dataLabel: i18n.catalog["text_a0e7c1b2423d"],
            render: (it) => (
                <div className="stock-badge-container">
                    <span>{it.stock}</span>
                    {(it.stock || 0) <= 0 ? (
                        <span className="badge badge-danger">{i18n.catalog["text_50777a9576a9"]}</span>
                    ) : (it.stock || 0) <= (it.min_stock || 10) ? (
                        <span className="badge badge-warning">{i18n.catalog["text_5dddca7f4a48"]}</span>
                    ) : (
                        <span className="badge badge-success">{i18n.catalog["text_17b91f56a97b"]}</span>
                    )}
                </div>
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
                            icon: "eye",
                            title: i18n.catalog["text_3824e18ca83b"],
                            variant: "view",
                            onClick: () => { setSelectedProduct(it); setViewDialog(true); }
                        },
                        {
                            icon: "edit",
                            title: i18n.catalog["text_113d570d6555"],
                            variant: "edit",
                            onClick: () => openEditDialog(it),
                            hidden: !canAccess(permissions, "products", "edit")
                        },
                        {
                            icon: "trash",
                            title: i18n.catalog["text_59ca629220a6"],
                            variant: "delete",
                            onClick: () => { setDeleteId(it.id); setConfirmDialog(true); },
                            hidden: !canAccess(permissions, "products", "delete")
                        }
                    ]}
                />
            )
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
                                loadProducts(1, val);
                            }}
                            placeholder={i18n.catalog["text_f52222a6a929"]}
                            className="header-search-bar"
                        />
                    }
                    actions={
                        canAccess(permissions, "products", "create") && (
                            <Button
                                variant="primary"
                                icon="plus"
                                onClick={openAddDialog}
                            >
                                {i18n.catalog["text_515506c4eaa6"]}</Button>
                        )
                    }
                />
                <Table
                    columns={columns}
                    data={products}
                    keyExtractor={(it) => it.id}
                    isLoading={isLoading}
                    pagination={{
                        currentPage,
                        totalPages,
                        onPageChange: (page) => loadProducts(page, searchTerm)
                    }}
                />
            </div>

            {/* Product Dialog */}
            <Dialog
                isOpen={productDialog}
                onClose={() => setProductDialog(false)}
                title={selectedProduct ? i18n.catalog["text_f952513ba85f"] : i18n.catalog["text_9f9df8ce10ba"]}
                maxWidth="800px"
                footer={
                    <>
                        <Button
                            variant="secondary"
                            onClick={() => setProductDialog(false)}
                        >
                            {i18n.catalog["text_9a30dc2a96b8"]}</Button>
                        <Button
                            variant="primary"
                            onClick={handleSubmit}
                        >
                            {selectedProduct ? i18n.catalog["text_00eab31f95b7"] : i18n.catalog["text_d52453ac627d"]}
                        </Button>
                    </>
                }
            >
                {/* القسم الأول: المعلومات الأساسية */}
                <div className="permission-group">
                    <div className="group-title">
                        <Icon name="box" size={18} />
                        <span>{i18n.catalog["text_d8d9330c62c0"]}</span>
                    </div>

                    <div className="form-row">
                        <TextInput
                            label={i18n.catalog["text_f1f73a577b94"]}
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                        <TextInput
                            label={i18n.catalog["text_501881931acd"]}
                            value={formData.barcode}
                            onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>{i18n.catalog["text_ff61fb213ffc"]}</label>
                            <div className="input-with-action">
                                <Select
                                    value={formData.category_id}
                                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                    options={categories.map(c => ({ value: String(c.id), label: c.name }))}
                                />
                                <Button
                                    variant="secondary"
                                    icon="plus"
                                    onClick={() => setCategoryDialog(true)}
                                    className="btn-sm"
                                />
                            </div>
                        </div>
                        <Select
                            label={i18n.catalog["text_606bf32290b0"]}
                            value={formData.item_type}
                            onChange={(e) => {
                                const val = e.target.value as any;
                                setFormData({
                                    ...formData,
                                    item_type: val,
                                    sellable: val === 'product',
                                    inventory_control: val !== 'service'
                                });
                            }}
                            options={[
                                { value: "product", label: i18n.catalog["text_b6c9e054c437"] },
                                { value: "raw_material", label: i18n.catalog["text_16c848be11e7"] }
                            ]}
                        />
                    </div>
                </div>

                {/* القسم الثاني: خصائص وإعدادات المنتج */}
                <div className="permission-group">
                    <div className="group-title">
                        <Icon name="check-square" size={18} />
                        <span>{i18n.catalog["text_22fc62eed0bf"]}</span>
                    </div>

                    <div className="actions-grid">
                        <label className="action-checkbox">
                            <input
                                type="checkbox"
                                checked={formData.sellable}
                                onChange={(e) => setFormData({ ...formData, sellable: e.target.checked })}
                            />
                            <span>{i18n.catalog["text_1f8d8a811d36"]}</span>
                        </label>
                        <label className="action-checkbox">
                            <input
                                type="checkbox"
                                checked={formData.inventory_control}
                                onChange={(e) => setFormData({ ...formData, inventory_control: e.target.checked })}
                            />
                            <span>{i18n.catalog["text_5ba3b4722ba1"]}</span>
                        </label>
                        <label className="action-checkbox">
                            <input
                                type="checkbox"
                                checked={formData.taxable}
                                onChange={(e) => setFormData({ ...formData, taxable: e.target.checked })}
                            />
                            <span>{i18n.catalog["text_8d1c87e5718b"]}</span>
                        </label>
                    </div>
                </div>

                {/* القسم الثالث: التسعير ورأس المال */}
                <div className="permission-group">
                    <div className="group-title">
                        <Icon name="coins" size={18} />
                        <span>{i18n.catalog["text_de07ad8308e2"]}</span>
                    </div>

                    <div className="form-row">
                        <NumberInput
                            label={i18n.catalog["text_f35d3f1366c0"]}
                            value={formData.purchase_price}
                            onChange={(val) => calculatePrices("purchase_price", String(val))}
                            step={0.01}
                        />
                        <NumberInput
                            label={i18n.catalog["text_d6bcb1583fc6"]}
                            value={formData.profit_margin}
                            onChange={(val) => calculatePrices("profit_margin", String(val))}
                            step={0.1}
                        />
                    </div>
                    <div className="form-row">
                        <NumberInput
                            label={i18n.catalog["text_76b4385b6ead"]}
                            value={formData.selling_price}
                            onChange={(val) => calculatePrices("selling_price", String(val))}
                            step={0.01}
                        />
                        <NumberInput
                            label={i18n.catalog["text_f9db4a0169a7"]}
                            value={formData.units_per_package}
                            onChange={(val) => calculatePrices("units_per_package", String(val))}
                            min={1}
                        />
                    </div>
                </div>

                {/* القسم الرابع: المخزون والبيانات الإضافية */}
                <div className="permission-group">
                    <div className="group-title">
                        <Icon name="layers" size={18} />
                        <span>{i18n.catalog["text_6cfe3f8ab8ff"]}</span>
                    </div>

                    <div className="form-row">
                        <NumberInput
                            label={i18n.catalog["text_eabfe10ecac0"]}
                            value={formData.stock}
                            onChange={(val) => setFormData({ ...formData, stock: String(val) })}
                        />
                        <NumberInput
                            label={i18n.catalog["text_ea7f5f360f4a"]}
                            value={formData.min_stock}
                            onChange={(val) => setFormData({ ...formData, min_stock: String(val) })}
                        />
                    </div>

                    <Textarea
                        label={i18n.catalog["text_95023fc76e1b"]}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={2}
                    />
                </div>
            </Dialog>

            <Dialog
                isOpen={categoryDialog}
                onClose={() => setCategoryDialog(false)}
                title={i18n.catalog["text_d11d4b31d77b"]}
                maxWidth="400px"
                footer={
                    <>
                        <Button
                            variant="secondary"
                            onClick={() => setCategoryDialog(false)}
                        >
                            {i18n.catalog["text_9a30dc2a96b8"]}</Button>
                        <Button
                            variant="primary"
                            onClick={addCategory}
                        >
                            {i18n.catalog["text_d52453ac627d"]}</Button>
                    </>
                }
            >
                <TextInput
                    label={i18n.catalog["text_b4b331965eea"]}
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                />
            </Dialog>

            <Dialog isOpen={viewDialog} onClose={() => setViewDialog(false)} title={i18n.catalog["text_d6d397948e95"]} maxWidth="600px">
                {selectedProduct && (
                    <div className="details-grid">
                        <div className="detail-item">
                            <span className="label">{i18n.catalog["text_57efd1ac6869"]}</span>
                            <span className="value strong">{selectedProduct.name}</span>
                        </div>
                        <div className="detail-item">
                            <span className="label">{i18n.catalog["text_501881931acd"]}</span>
                            <span className="value">{selectedProduct.barcode || "-"}</span>
                        </div>
                        <div className="detail-item">
                            <span className="label">{i18n.catalog["text_ff61fb213ffc"]}</span>
                            <span className="value">{selectedProduct.category_name || "-"}</span>
                        </div>
                        <div className="detail-item">
                            <span className="label">{i18n.catalog["text_2b080520c372"]}</span>
                            <span className="value">{formatCurrency(selectedProduct.purchase_price || 0)}</span>
                        </div>
                        <div className="detail-item">
                            <span className="label">{i18n.catalog["text_2d37565e6fe3"]}</span>
                            <span className="value strong primary">{formatCurrency(selectedProduct.selling_price || 0)}</span>
                        </div>
                        <div className="detail-item">
                            <span className="label">{i18n.catalog["text_ceb4ee89b1bd"]}</span>
                            <span className="value">{selectedProduct.profit_margin}%</span>
                        </div>
                        <div className="detail-item">
                            <span className="label">{i18n.catalog["text_a0e7c1b2423d"]}</span>
                            <span className="value">{selectedProduct.stock} {selectedProduct.unit_name}</span>
                        </div>
                        <div className="detail-item full-width">
                            <span className="label">{i18n.catalog["text_95023fc76e1b"]}</span>
                            <span className="value">{selectedProduct.description || "-"}</span>
                        </div>
                    </div>
                )}
            </Dialog>

            <ConfirmDialog
                isOpen={confirmDialog}
                onClose={() => setConfirmDialog(false)}
                onConfirm={handleDelete}
                title={i18n.catalog["text_5f9cb54dc136"]}
                message={i18n.catalog["text_b876352cde8f"]}
            />
        </MainLayout>
    );
}
