"use client";

import { useI18n } from "@/lib/i18n";
import { importCopy, productImportAliases } from "@/lib/i18n/import-copy";
import { MainLayout, PageSubHeader } from "@/components/layout";
import { ActionButtons, Button, Column, ConfirmDialog, DataImportWorkspace, Dialog, NumberInput, SearchableSelect, Table, showToast } from "@/components/ui";
import type { ImportCommitContext, ImportRow } from "@/components/ui";
import { buildProductImportFields, applyProductClassPolicy, getProductApprovalRequirements, isProductFieldVisible } from "@/lib/imports/product-field-registry";
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
            console.error(i18n.catalog["supplyChain.products.errorLoadingCategories"], e);
        }
    }, []);

    // Dialogs
    const [productDialog, setProductDialog] = useState(false);
    const [importDialog, setImportDialog] = useState(false);
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
            showToast(i18n.catalog["common.general.pleaseFillAllRequiredFields"], "error");
            return;
        }

        const payload = {
            name: formData.name,
            catalog_code: formData.barcode,
            category_id: parseInt(formData.category_id),
            unit_price: parseFloat(formData.selling_price),
            minimum_profit_margin: parseFloat(formData.profit_margin) || 0,
            stock_quantity: parseInt(formData.stock) || 0,
            unit_name: formData.unit_type === 'ctn' ? i18n.catalog["common.general.carton"] : i18n.catalog["common.general.each"],
            items_per_unit: parseInt(formData.units_per_package) || 1,
            sub_unit_name: formData.unit_type === 'ctn' ? i18n.catalog["common.general.each"] : null,
            description: formData.description,
            purchase_price: parseFloat(formData.purchase_price),
            item_type: formData.item_type,
            sellable: formData.sellable,
            inventory_control: formData.inventory_control,
            taxable: formData.taxable,
        };

        const success = await saveProduct(applyProductClassPolicy(payload, new Set(Object.keys(payload))), selectedProduct?.id);
        if (success) {
            setProductDialog(false);
            await loadProducts(currentPage, searchTerm);
        }
    };

    const importFields = buildProductImportFields({
        name: i18n.catalog["common.general.productName.alternative2"],
        barcode: i18n.catalog["common.general.barcode"],
        itemType: i18n.catalog["supplyChain.products.itemType"],
        category: i18n.catalog["common.general.category"],
        purchasePrice: i18n.catalog["supplyChain.products.purchasePrice"],
        salePrice: i18n.catalog["supplyChain.products.salePrice"],
        profitMargin: i18n.catalog["supplyChain.products.profitMargin.alternative2"],
        unitName: i18n.catalog["common.general.unit.alternative2"],
        unitsPerPackage: i18n.catalog["supplyChain.products.unitsBox"],
        currentInventory: i18n.catalog["common.general.currentInventory"],
        minimumStock: i18n.catalog["supplyChain.products.minimumOrder"],
        inventoryTracking: i18n.catalog["supplyChain.products.inventoryTracking"],
        sellable: i18n.catalog["supplyChain.products.sellable"],
        taxable: i18n.catalog["common.general.taxable"],
        description: i18n.catalog["common.general.description.alternative2"],
    }, productImportAliases);

    const importProducts = async (rows: ImportRow[], context: ImportCommitContext) => {
        const normalizedRows = rows.map((row) => {
            const rawCategory = String(row.category_id || "").trim();
            const category = categories.find((item) => String(item.id) === rawCategory || item.name.trim().toLocaleLowerCase() === rawCategory.toLocaleLowerCase());
            return applyProductClassPolicy({
                name: String(row.name || "").trim(),
                catalog_code: String(row.barcode || "").trim(),
                category_id: category?.id || (rawCategory !== "" && Number.isFinite(Number(rawCategory)) ? Number(rawCategory) : null),
                unit_price: Number(row.unit_price || 0),
                minimum_profit_margin: Number(row.minimum_profit_margin || 0),
                stock_quantity: Number(row.stock_quantity || 0),
                low_stock_threshold: Number(row.low_stock_threshold || 10),
                unit_name: String(row.unit_name || "piece"),
                items_per_unit: Number(row.items_per_unit || 1),
                sub_unit_name: String(row.sub_unit_name || "piece"),
                purchase_price: Number(row.purchase_price || 0),
                description: String(row.description || ""),
                item_type: row.item_type,
                sellable: row.sellable,
                inventory_control: row.inventory_control,
                taxable: row.taxable,
            }, new Set(Object.keys(row)));
        });
        const response = await fetchAPI(API_ENDPOINTS.SUPPLY_CHAIN.PRODUCT_IMPORT, { method: "POST", body: JSON.stringify({
            rows: normalizedRows,
            batch_id: context.batchId,
            source_file: context.sourceFile,
            approval_acknowledged: context.approvalAcknowledged,
            approval_field_ids: context.approvalFieldIds.map((fieldId) => fieldId === "barcode" ? "catalog_code" : fieldId),
        }) });
        if (!response.success) throw new Error(response.message || importCopy("importFailed"));
        await loadProducts(1, searchTerm);
        return { imported: normalizedRows.length, message: importCopy("readyForImport") };
    };

    const addCategory = async () => {
        if (!newCategoryName.trim()) {
            showToast(i18n.catalog["supplyChain.products.pleaseEnterCategoryName"], "error");
            return;
        }
        try {
            const res = await fetchAPI(API_ENDPOINTS.SUPPLY_CHAIN.CATEGORIES, {
                method: "POST",
                body: JSON.stringify({ name: newCategoryName }),
            });
            if (res.success) {
                showToast(i18n.catalog["supplyChain.products.categoryAddedSuccessfully"], "success");
                setCategoryDialog(false);
                setNewCategoryName("");
                loadCategories();
            }
        } catch {
            showToast(i18n.catalog["supplyChain.products.errorAddingCategory"], "error");
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
        { key: "name", header: i18n.catalog["common.general.productName"], dataLabel: i18n.catalog["common.general.productName"] },
        { key: "barcode", header: i18n.catalog["common.general.barcode"], dataLabel: i18n.catalog["common.general.barcode"] },
        { key: "category_name", header: i18n.catalog["common.general.category"], dataLabel: i18n.catalog["common.general.category"] },
        {
            key: "item_type",
            header: i18n.catalog["common.general.type.alternative3"],
            dataLabel: i18n.catalog["common.general.type.alternative3"],
            render: (it) => (
                <span className={`badge badge-${it.item_type === 'product' ? 'info' : it.item_type === 'raw_material' ? 'secondary' : 'warning'}`}>
                    {it.item_type === 'product' ? i18n.catalog["supplyChain.products.product"] : it.item_type === 'raw_material' ? i18n.catalog["supplyChain.products.rawMaterial"] : i18n.catalog["common.general.service"]}
                </span>
            )
        },
        {
            key: "sellable",
            header: i18n.catalog["common.general.notRawMaterial"],
            dataLabel: i18n.catalog["common.general.notRawMaterial"],
            render: (it) => (
                <span className={`badge badge-${it.sellable ? 'success' : 'danger'}`}>
                    {it.sellable ? i18n.catalog["common.general.yes"] : i18n.catalog["common.general.no"]}
                </span>
            )
        },
        {
            key: "selling_price",
            header: i18n.catalog["common.general.salePrice"],
            dataLabel: i18n.catalog["common.general.salePrice"],
            render: (it) => formatCurrency(it.selling_price || 0)
        },
        {
            key: "stock",
            header: i18n.catalog["common.general.inventory"],
            dataLabel: i18n.catalog["common.general.inventory"],
            render: (it) => (
                <div className="stock-badge-container">
                    <span>{it.stock}</span>
                    {(it.stock || 0) <= 0 ? (
                        <span className="badge badge-danger">{i18n.catalog["supplyChain.products.execute"]}</span>
                    ) : (it.stock || 0) <= (it.min_stock || 10) ? (
                        <span className="badge badge-warning">{i18n.catalog["common.general.low"]}</span>
                    ) : (
                        <span className="badge badge-success">{i18n.catalog["supplyChain.products.available"]}</span>
                    )}
                </div>
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
                            icon: "eye",
                            title: i18n.catalog["common.general.view"],
                            variant: "view",
                            onClick: () => { setSelectedProduct(it); setViewDialog(true); }
                        },
                        {
                            icon: "edit",
                            title: i18n.catalog["common.general.edit"],
                            variant: "edit",
                            onClick: () => openEditDialog(it),
                            hidden: !canAccess(permissions, "products", "edit")
                        },
                        {
                            icon: "trash",
                            title: i18n.catalog["common.general.delete"],
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
                            placeholder={i18n.catalog["supplyChain.products.searchNameBarcode"]}
                            className="header-search-bar"
                        />
                    }
                    actions={
                        canAccess(permissions, "products", "create") && (
                            <>
                                <Button variant="secondary" icon="upload" onClick={() => setImportDialog(true)}>
                                    {importCopy("importItemsButton")}
                                </Button>
                                <Button variant="primary" icon="plus" onClick={openAddDialog}>
                                    {i18n.catalog["common.general.addProduct"]}
                                </Button>
                            </>
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

            <Dialog isOpen={importDialog} onClose={() => setImportDialog(false)} title={importCopy("inventoryReport")} maxWidth="1400px">
                <DataImportWorkspace
                    title={importCopy("reusableBridge")}
                    subtitle={importCopy("linkClassDescription")}
                    fields={importFields}
                    onImport={importProducts}
                    approvalRequirements={getProductApprovalRequirements}
                    isFieldVisible={isProductFieldVisible}
                    onClose={() => setImportDialog(false)}
                />
            </Dialog>

            {/* Product Dialog */}
            <Dialog
                isOpen={productDialog}
                onClose={() => setProductDialog(false)}
                title={selectedProduct ? i18n.catalog["supplyChain.products.editProduct"] : i18n.catalog["supplyChain.products.addNewProduct"]}
                maxWidth="800px"
                footer={
                    <>
                        <Button
                            variant="secondary"
                            onClick={() => setProductDialog(false)}
                        >
                            {i18n.catalog["common.general.cancel"]}</Button>
                        <Button
                            variant="primary"
                            onClick={handleSubmit}
                        >
                            {selectedProduct ? i18n.catalog["common.general.update"] : i18n.catalog["common.general.add"]}
                        </Button>
                    </>
                }
            >
                {/* القسم الأول: المعلومات الأساسية */}
                <div className="permission-group">
                    <div className="group-title">
                        <Icon name="box" size={18} />
                        <span>{i18n.catalog["supplyChain.products.basicProductInformation"]}</span>
                    </div>

                    <div className="form-row">
                        <TextInput
                            label={i18n.catalog["common.general.productName.alternative2"]}
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                        <TextInput
                            label={i18n.catalog["common.general.barcode"]}
                            value={formData.barcode}
                            onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>{i18n.catalog["common.general.category"]}</label>
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
                            label={i18n.catalog["supplyChain.products.itemType"]}
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
                                { value: "product", label: i18n.catalog["supplyChain.products.finishedProduct"] },
                                { value: "raw_material", label: i18n.catalog["supplyChain.products.rawMaterialNotSale"] }
                            ]}
                        />
                    </div>
                </div>

                {/* القسم الثاني: خصائص وإعدادات المنتج */}
                <div className="permission-group">
                    <div className="group-title">
                        <Icon name="check-square" size={18} />
                        <span>{i18n.catalog["supplyChain.products.productPropertiesStatus"]}</span>
                    </div>

                    <div className="actions-grid">
                        <label className="action-checkbox">
                            <input
                                type="checkbox"
                                checked={formData.sellable}
                                onChange={(e) => setFormData({ ...formData, sellable: e.target.checked })}
                            />
                            <span>{i18n.catalog["supplyChain.products.sellable"]}</span>
                        </label>
                        <label className="action-checkbox">
                            <input
                                type="checkbox"
                                checked={formData.inventory_control}
                                onChange={(e) => setFormData({ ...formData, inventory_control: e.target.checked })}
                            />
                            <span>{i18n.catalog["supplyChain.products.inventoryTracking"]}</span>
                        </label>
                        <label className="action-checkbox">
                            <input
                                type="checkbox"
                                checked={formData.taxable}
                                onChange={(e) => setFormData({ ...formData, taxable: e.target.checked })}
                            />
                            <span>{i18n.catalog["common.general.taxable"]}</span>
                        </label>
                    </div>
                </div>

                {/* القسم الثالث: التسعير ورأس المال */}
                <div className="permission-group">
                    <div className="group-title">
                        <Icon name="coins" size={18} />
                        <span>{i18n.catalog["supplyChain.products.pricingProfitMargin"]}</span>
                    </div>

                    <div className="form-row">
                        <NumberInput
                            label={i18n.catalog["supplyChain.products.purchasePrice"]}
                            value={formData.purchase_price}
                            onChange={(val) => calculatePrices("purchase_price", String(val))}
                            step={0.01}
                        />
                        <NumberInput
                            label={i18n.catalog["supplyChain.products.profitMargin.alternative2"]}
                            value={formData.profit_margin}
                            onChange={(val) => calculatePrices("profit_margin", String(val))}
                            step={0.1}
                        />
                    </div>
                    <div className="form-row">
                        <NumberInput
                            label={i18n.catalog["supplyChain.products.salePrice"]}
                            value={formData.selling_price}
                            onChange={(val) => calculatePrices("selling_price", String(val))}
                            step={0.01}
                        />
                        <NumberInput
                            label={i18n.catalog["supplyChain.products.unitsBox"]}
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
                        <span>{i18n.catalog["supplyChain.products.inventoryAdditionalData"]}</span>
                    </div>

                    <div className="form-row">
                        <NumberInput
                            label={i18n.catalog["common.general.currentInventory"]}
                            value={formData.stock}
                            onChange={(val) => setFormData({ ...formData, stock: String(val) })}
                        />
                        <NumberInput
                            label={i18n.catalog["supplyChain.products.minimumOrder"]}
                            value={formData.min_stock}
                            onChange={(val) => setFormData({ ...formData, min_stock: String(val) })}
                        />
                    </div>

                    <Textarea
                        label={i18n.catalog["common.general.description.alternative2"]}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={2}
                    />
                </div>
            </Dialog>

            <Dialog
                isOpen={categoryDialog}
                onClose={() => setCategoryDialog(false)}
                title={i18n.catalog["supplyChain.products.addNewCategory"]}
                maxWidth="400px"
                footer={
                    <>
                        <Button
                            variant="secondary"
                            onClick={() => setCategoryDialog(false)}
                        >
                            {i18n.catalog["common.general.cancel"]}</Button>
                        <Button
                            variant="primary"
                            onClick={addCategory}
                        >
                            {i18n.catalog["common.general.add"]}</Button>
                    </>
                }
            >
                <TextInput
                    label={i18n.catalog["supplyChain.products.categoryName"]}
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                />
            </Dialog>

            <Dialog isOpen={viewDialog} onClose={() => setViewDialog(false)} title={i18n.catalog["supplyChain.products.productDetails"]} maxWidth="600px">
                {selectedProduct && (
                    <div className="details-grid">
                        <div className="detail-item">
                            <span className="label">{i18n.catalog["common.general.productName"]}</span>
                            <span className="value strong">{selectedProduct.name}</span>
                        </div>
                        <div className="detail-item">
                            <span className="label">{i18n.catalog["common.general.barcode"]}</span>
                            <span className="value">{selectedProduct.barcode || "-"}</span>
                        </div>
                        <div className="detail-item">
                            <span className="label">{i18n.catalog["common.general.category"]}</span>
                            <span className="value">{selectedProduct.category_name || "-"}</span>
                        </div>
                        <div className="detail-item">
                            <span className="label">{i18n.catalog["common.general.purchasePrice"]}</span>
                            <span className="value">{formatCurrency(selectedProduct.purchase_price || 0)}</span>
                        </div>
                        <div className="detail-item">
                            <span className="label">{i18n.catalog["common.general.salePrice"]}</span>
                            <span className="value strong primary">{formatCurrency(selectedProduct.selling_price || 0)}</span>
                        </div>
                        <div className="detail-item">
                            <span className="label">{i18n.catalog["supplyChain.products.profitMargin"]}</span>
                            <span className="value">{selectedProduct.profit_margin}%</span>
                        </div>
                        <div className="detail-item">
                            <span className="label">{i18n.catalog["common.general.inventory"]}</span>
                            <span className="value">{selectedProduct.stock} {selectedProduct.unit_name}</span>
                        </div>
                        <div className="detail-item full-width">
                            <span className="label">{i18n.catalog["common.general.description.alternative2"]}</span>
                            <span className="value">{selectedProduct.description || "-"}</span>
                        </div>
                    </div>
                )}
            </Dialog>

            <ConfirmDialog
                isOpen={confirmDialog}
                onClose={() => setConfirmDialog(false)}
                onConfirm={handleDelete}
                title={i18n.catalog["common.general.confirmDeletion"]}
                message={i18n.catalog["supplyChain.products.areYouSureYouWantDeleteThisProduct"]}
            />
        </MainLayout>
    );
}
