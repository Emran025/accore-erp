"use client";

import { useI18n, catalogText } from "@/lib/i18n";
import { MainLayout } from "@/components/layout";
import {
    ActionButtons,
    Column,
    ConfirmDialog,
    DatePicker,
    Dialog,
    InvoiceTableColumn,
    NumberInput,
    PurchaseReturnDialog,
    SearchableSelect,
    SegmentedToggle,
    SelectOption,
    SelectableInvoice,
    SelectableInvoiceTable,
    SelectedItem,
    Table,
    SelectableInvoiceItem as UiInvoiceItem,
    showAlert,
    showToast,
} from "@/components/ui";
import { fetchAPI } from "@/lib/api";
import { Permission, User, checkAuth, getStoredPermissions, getStoredUser } from "@/lib/auth";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatCurrency, formatDate, formatDateTime, parseNumber } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";
import { useOperatingContextStore } from "@/stores/useOperatingContextStore";

// ─── Local types ───────────────────────────────────────────────────────────────

interface Supplier {
    id: number;
    name: string;
    phone?: string;
}

interface Product {
    id: number;
    name: string;
    barcode?: string;
    stock_quantity: number;
    purchase_price?: number;
    unit_price?: number;
    unit_name?: string;
    sub_unit_name?: string;
    items_per_unit?: number;
}

interface PurchaseItem {
    product_id: number;
    product_name: string;
    display_name: string;
    quantity: number;
    unit_type: "sub" | "main";
    unit_name?: string;
    total_sub_units: number;
    unit_price: number;
    subtotal: number;
    expiry_date?: string;
}

interface PurchaseRecord {
    id: number;
    product_id?: number;
    product_name?: string;
    quantity: number;
    unit_price: number;
    total_price?: number;
    invoice_price?: number;
    supplier?: string;
    supplier_name?: string;
    supplier_id?: number;
    payment_type?: string;
    purchase_date?: string;
    created_at?: string;
    unit_type?: string;
    notes?: string;
    expiry_date?: string;
    subtotal?: number;
    total_amount?: number;
    invoice_number?: string;
    items?: any[];
}

// ──────────────────────────────────────────────────────────────────────────────

export interface ProductPurchasesPageProps {
    mode: "cash" | "credit";
}

export function ProductPurchases({ mode }: ProductPurchasesPageProps) {
    const { t: i18n } = useI18n();
    const isCredit = mode === "credit";
    const { readiness, loadReadiness } = useOperatingContextStore();
    const [user, setUser] = useState<User | null>(null);
    const [permissions, setPermissions] = useState<Permission[]>([]);

    // Products
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    // Suppliers
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
    const [supplierSearchTerm, setSupplierSearchTerm] = useState("");

    // Invoice form
    const [quantity, setQuantity] = useState("1");
    const [unitType, setUnitType] = useState<"sub" | "main">("sub");
    const [unitPrice, setUnitPrice] = useState("");
    const [subtotal, setSubtotal] = useState(0);
    const [paymentType, setPaymentType] = useState<"cash" | "credit">(mode);
    const [amountPaid, setAmountPaid] = useState("");
    const [discountValue, setDiscountValue] = useState("0");
    const [discountType, setDiscountType] = useState<"fixed" | "percent">("fixed");
    const [invoiceNotes, setInvoiceNotes] = useState("");
    const [itemExpiryDate, setItemExpiryDate] = useState("");

    // Current invoice items
    const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([]);
    const [invoiceNumber, setInvoiceNumber] = useState("");

    // History
    const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 20;

    // Dialogs
    const [viewDialog, setViewDialog] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState(false);
    const [selectedPurchase, setSelectedPurchase] = useState<PurchaseRecord | null>(null);
    const [deletePurchaseId, setDeletePurchaseId] = useState<number | null>(null);

    // Returns
    const [returnDialog, setReturnDialog] = useState(false);
    const [selectedReturnItems, setSelectedReturnItems] = useState<SelectedItem[]>([]);
    const [purchasesMap, setPurchasesMap] = useState<Record<number, SelectableInvoice>>({});
    const [isLoadingPurchases, setIsLoadingPurchases] = useState(false);

    const [isLoading, setIsLoading] = useState(true);

    // Ref for advancing focus to quantity field after barcode auto-select
    const quantityInputRef = useRef<HTMLInputElement | null>(null);
    // Ref for returning focus to product select input after adding item
    const productSelectRef = useRef<HTMLInputElement | null>(null);

    // ── Computed ──────────────────────────────────────────────────────────

    const purchaseTotal = purchaseItems.reduce((sum, item) => sum + item.subtotal, 0);

    const calculatedDiscount = useCallback(() => {
        const val = parseNumber(discountValue);
        if (discountType === "percent") {
            return (purchaseTotal * val) / 100;
        }
        return val;
    }, [discountValue, discountType, purchaseTotal]);

    const finalTotal = Math.max(0, purchaseTotal - calculatedDiscount());
    const paidAmountVal = parseNumber(amountPaid);
    const remainingAmount = Math.max(0, finalTotal - paidAmountVal);

    const generateInvoiceNumber = useCallback(() => {
        const ts = Date.now().toString().slice(-6);
        const rand = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
        setInvoiceNumber("PUR-" + ts + rand);
    }, []);

    // ── Data loaders ──────────────────────────────────────────────────────

    const loadProducts = useCallback(async () => {
        try {
            const response = await fetchAPI(`${API_ENDPOINTS.SUPPLY_CHAIN.PRODUCTS}?limit=2000`);
            if (response.success && response.data) {
                setProducts(response.data as Product[]);
            }
        } catch {
            showAlert("alert-container", i18n.catalog["text_bf68e6f346c3"], "error");
        }
    }, []);

    const loadSuppliers = useCallback(async (search: string = "") => {
        if (search.length < 2) { setSuppliers([]); return; }
        try {
            const response = await fetchAPI(
                `${API_ENDPOINTS.COMMERCIAL.PROCUREMENT.SUPPLIERS.BASE}?limit=20&search=${encodeURIComponent(search)}`
            );
            if (response.success && response.data) {
                setSuppliers(response.data as Supplier[]);
            }
        } catch { }
    }, []);

    const loadPurchases = useCallback(async (page: number = 1) => {
        try {
            setIsLoading(true);
            const response = await fetchAPI(
                `${API_ENDPOINTS.COMMERCIAL.PROCUREMENT.BASE}?page=${page}&limit=${itemsPerPage}`
            );
            if (response.success && response.data) {
                const raw = response.data as any;
                const list: PurchaseRecord[] = Array.isArray(raw) ? raw : (raw.data ?? []);
                setPurchases(list);
                setTotalPages((response.pagination as any)?.total_pages || 1);
                setCurrentPage(page);
            }
        } catch {
            showAlert("alert-container", i18n.catalog["text_7df68dc366ee"], "error");
        } finally {
            setIsLoading(false);
        }
    }, []);

    // ── Init ──────────────────────────────────────────────────────────────

    useEffect(() => {
        const init = async () => {
            const authenticated = await checkAuth();
            if (!authenticated) return;
            setUser(getStoredUser());
            setPermissions(getStoredPermissions());
            await Promise.all([loadProducts(), loadPurchases(), loadReadiness()]);
            generateInvoiceNumber();
            setIsLoading(false);
        };
        init();
    }, [loadProducts, loadPurchases, generateInvoiceNumber, loadReadiness]);

    // Supplier search debounce
    useEffect(() => {
        if (!supplierSearchTerm) return;
        const timer = setTimeout(() => loadSuppliers(supplierSearchTerm), 300);
        return () => clearTimeout(timer);
    }, [supplierSearchTerm, loadSuppliers]);

    // Subtotal calculation
    useEffect(() => {
        if (!selectedProduct) { setSubtotal(0); return; }
        const qty = parseNumber(quantity);
        const price = parseNumber(unitPrice);
        const itemsPerUnit = selectedProduct.items_per_unit || 1;
        setSubtotal(unitType === "main" ? qty * price * itemsPerUnit : qty * price);
    }, [quantity, unitPrice, unitType, selectedProduct]);

    // ── Options ───────────────────────────────────────────────────────────

    const productOptions: SelectOption[] = products.map((p) => ({
        value: p.id,
        label: p.name,
        subtitle: catalogText(i18n, "text_e4fa70d25c95", { value0: p.stock_quantity, value1: p.sub_unit_name || i18n.catalog["text_d400a30ad5f3"], value2: formatCurrency(p.purchase_price || p.unit_price || 0) }),
        original: p,
    }));

    const supplierOptions: SelectOption[] = suppliers.map((s) => ({
        value: s.id,
        label: s.name,
        subtitle: s.phone || "",
        original: s,
    }));

    // ── Handlers ──────────────────────────────────────────────────────────

    const handleProductSelect = (value: string | number | null, option: SelectOption | null) => {
        if (!option) { setSelectedProduct(null); return; }

        // Sequential barcode scanning:
        // If a product was already selected in the form, commit it to the invoice list first!
        if (selectedProduct && selectedProduct.id !== option.value) {
            const qty = parseNumber(quantity);
            const price = parseNumber(unitPrice);
            if (qty > 0 && price > 0) {
                const itemsPerUnit = selectedProduct.items_per_unit || 1;
                const totalSubUnits = unitType === "main" ? qty * itemsPerUnit : qty;
                const calcSubtotal = unitType === "main" ? qty * price * itemsPerUnit : qty * price;
                const unitName = unitType === "main" ? selectedProduct.unit_name : selectedProduct.sub_unit_name;
                const prevItem: PurchaseItem = {
                    product_id: selectedProduct.id,
                    product_name: selectedProduct.name,
                    display_name: catalogText(i18n, "text_eb6d330d21db", { value0: selectedProduct.name, value1: qty, value2: unitName || "" }),
                    quantity: qty,
                    unit_type: unitType,
                    unit_name: unitName || undefined,
                    total_sub_units: totalSubUnits,
                    unit_price: price,
                    subtotal: calcSubtotal,
                    expiry_date: itemExpiryDate || undefined,
                };
                setPurchaseItems((prev) => [...prev, prevItem]);
            }
        }

        const product = option.original as Product;
        setSelectedProduct(product);
        const price = Number(product.purchase_price) || Number(product.unit_price) || 0;
        setUnitPrice(price.toFixed(2));
        setQuantity("1");
        setItemExpiryDate("");
    };

    const handleSupplierSelect = (value: string | number | null, option: SelectOption | null) => {
        if (!option) { setSelectedSupplier(null); setSupplierSearchTerm(""); return; }
        const supplier = option.original as Supplier;
        setSelectedSupplier(supplier);
        setSupplierSearchTerm(supplier.name);
    };

    const addItemToPurchase = () => {
        if (!selectedProduct) {
            showAlert("alert-container", i18n.catalog["text_b64fbda7786b"], "error");
            return;
        }
        const qty = parseNumber(quantity);
        const price = parseNumber(unitPrice);
        if (qty <= 0 || price <= 0) {
            showAlert("alert-container", i18n.catalog["text_b69b5b91e69f"], "error");
            return;
        }

        const itemsPerUnit = selectedProduct.items_per_unit || 1;
        const totalSubUnits = unitType === "main" ? qty * itemsPerUnit : qty;
        const calcSubtotal = unitType === "main" ? qty * price * itemsPerUnit : qty * price;
        const unitName = unitType === "main" ? selectedProduct.unit_name : selectedProduct.sub_unit_name;

        const newItem: PurchaseItem = {
            product_id: selectedProduct.id,
            product_name: selectedProduct.name,
            display_name: catalogText(i18n, "text_eb6d330d21db", { value0: selectedProduct.name, value1: qty, value2: unitName || "" }),
            quantity: qty,
            unit_type: unitType,
            unit_name: unitName || undefined,
            total_sub_units: totalSubUnits,
            unit_price: price,
            subtotal: calcSubtotal,
            expiry_date: itemExpiryDate || undefined,
        };

        setPurchaseItems([...purchaseItems, newItem]);
        setSelectedProduct(null);
        setQuantity("1");
        setUnitPrice("");
        setItemExpiryDate("");
        setSubtotal(0);
        setTimeout(() => productSelectRef.current?.focus(), 60);
    };

    const removeItem = (index: number) => {
        setPurchaseItems(purchaseItems.filter((_, i) => i !== index));
    };

    const finishPurchase = async () => {
        if (purchaseItems.length === 0) {
            showAlert("alert-container", i18n.catalog["text_f8f3d3e7ffca"], "error");
            return;
        }
        if (!readiness?.ready || !readiness.context?.warehouse_id) {
            showAlert("alert-container", i18n.catalog["text_6a3c1690c86f"], "error");
            return;
        }
        if (isCredit && !selectedSupplier) {
            showAlert("alert-container", i18n.catalog["text_f88382859045"], "error");
            return;
        }

        try {
            const results: boolean[] = [];
            for (const item of purchaseItems) {
                const payload = {
                    product_id: item.product_id,
                    quantity: item.total_sub_units,
                    invoice_price: Number(item.subtotal.toFixed(2)),
                    unit_type: item.unit_type,
                    supplier_id: selectedSupplier?.id ?? null,
                    payment_type: paymentType,
                    amount_paid: paidAmountVal > 0 ? paidAmountVal : null,
                    discount_value: parseNumber(discountValue),
                    discount_type: discountType,
                    expiry_date: item.expiry_date || null,
                    notes: invoiceNotes || null,
                    warehouse_id: readiness.context.warehouse_id,
                    cost_center_id: readiness.context.cost_center_id,
                    profit_center_id: readiness.context.profit_center_id,
                };
                const response = await fetchAPI(API_ENDPOINTS.COMMERCIAL.PROCUREMENT.BASE, {
                    method: "POST",
                    body: JSON.stringify(payload),
                });
                results.push(response.success === true);
            }

            const allSuccess = results.every(Boolean);
            if (allSuccess) {
                showAlert(
                    "alert-container",
                    catalogText(i18n, "text_1710fa801096", { value0: purchaseItems.length, value1: formatCurrency(finalTotal) }),
                    "success"
                );
                setPurchaseItems([]);
                setSelectedSupplier(null);
                setSupplierSearchTerm("");
                setAmountPaid("");
                setDiscountValue("0");
                setDiscountType("fixed");
                setInvoiceNotes("");
                generateInvoiceNumber();
                await loadProducts();
                await loadPurchases();
            } else {
                showAlert("alert-container", i18n.catalog["text_27c1cdabab4b"], "error");
            }
        } catch (error) {
            const msg = error instanceof Error ? error.message : i18n.catalog["text_a80b88135eb4"];
            showAlert("alert-container", i18n.catalog["text_4c4968aba347"] + msg, "error");
        }
    };

    const viewPurchaseDetail = async (id: number) => {
        try {
            const response = await fetchAPI(`${API_ENDPOINTS.COMMERCIAL.PROCUREMENT.RETURNS.SHOW}?id=${id}`);
            if (response.success && response.data) {
                setSelectedPurchase(response.data as PurchaseRecord);
            } else {
                setSelectedPurchase(purchases.find((p) => p.id === id) || null);
            }
        } catch {
            setSelectedPurchase(purchases.find((p) => p.id === id) || null);
        }
        setViewDialog(true);
    };

    const confirmDeletePurchase = (id: number) => {
        setDeletePurchaseId(id);
        setConfirmDialog(true);
    };

    const deletePurchase = async () => {
        if (!deletePurchaseId) return;
        try {
            const response = await fetchAPI(
                catalogText(i18n, "text_0907f4dfb304", { value0: API_ENDPOINTS.COMMERCIAL.PROCUREMENT.BASE, value1: deletePurchaseId }),
                { method: "DELETE" }
            );
            if (response.success) {
                showAlert("alert-container", i18n.catalog["text_4ea5f2f0bfc7"], "success");
                await loadPurchases();
                await loadProducts();
            } else {
                showAlert("alert-container", response.message || i18n.catalog["text_f46bfc521612"], "error");
            }
        } catch {
            showAlert("alert-container", i18n.catalog["text_3bdb299872fb"], "error");
        } finally {
            setConfirmDialog(false);
            setDeletePurchaseId(null);
        }
    };

    // ── Return flow ───────────────────────────────────────────────────────

    const getPurchaseItemsForTable = useCallback(async (purchase: PurchaseRecord): Promise<UiInvoiceItem[]> => {
        try {
            const response = await fetchAPI(`${API_ENDPOINTS.COMMERCIAL.PROCUREMENT.RETURNS.SHOW}?id=${purchase.id}`);
            if (response.success && response.data) {
                const detail = response.data as any;
                if (detail.items && Array.isArray(detail.items)) {
                    return detail.items.map((item: any) => ({
                        id: item.id,
                        product_id: item.product_id,
                        product: { name: item.product?.name || item.product_name },
                        quantity: item.quantity,
                        unit_price: item.unit_price,
                        subtotal: item.subtotal || item.unit_price * item.quantity,
                        unit_type: item.unit_type || "sub",
                    }));
                }
            }
            // Single-item purchase fallback
            return [{
                id: purchase.id,
                product_id: purchase.product_id || 0,
                product: { name: purchase.product_name || "" },
                quantity: purchase.quantity,
                unit_price: purchase.unit_price,
                subtotal: purchase.invoice_price || purchase.total_price || 0,
                unit_type: purchase.unit_type || "sub",
            }];
        } catch {
            return [];
        }
    }, []);

    const handleReturnSelection = useCallback((items: SelectedItem[]) => {
        setSelectedReturnItems(items);
    }, []);

    const openReturnDialog = async () => {
        if (selectedReturnItems.length === 0) {
            showToast(i18n.catalog["text_54f0b0947619"], "warning");
            return;
        }
        const uniqueIds = Array.from(new Set(selectedReturnItems.map((i) => i.invoiceId)));
        const missingIds = uniqueIds.filter((id) => !purchasesMap[id]);
        if (missingIds.length > 0) {
            setIsLoadingPurchases(true);
            try {
                const newMap = { ...purchasesMap };
                await Promise.all(
                    missingIds.map(async (id) => {
                        const res = await fetchAPI(`${API_ENDPOINTS.COMMERCIAL.PROCUREMENT.RETURNS.SHOW}?id=${id}`);
                        if (res.success && res.data) newMap[id] = res.data as SelectableInvoice;
                    })
                );
                setPurchasesMap(newMap);
            } catch {
                showToast(i18n.catalog["text_f154fa31b161"], "error");
            } finally {
                setIsLoadingPurchases(false);
            }
        }
        setReturnDialog(true);
    };

    const handleConfirmReturn = async (data: any | any[]) => {
        const dataArray = Array.isArray(data) ? data : [data];
        try {
            for (const returnData of dataArray) {
                const payload = { ...returnData, type: "return" };
                const response = await fetchAPI(API_ENDPOINTS.COMMERCIAL.PROCUREMENT.BASE, {
                    method: "POST",
                    body: JSON.stringify(payload),
                });
                if (!response.success) throw new Error(response.message || i18n.catalog["text_311143511f9e"]);
            }
            showToast(i18n.catalog["text_11195848250a"], "success");
        } catch (error: any) {
            showToast(error.message || i18n.catalog["text_633a9d0a74cd"], "error");
            throw error;
        }
    };

    // ── Columns ───────────────────────────────────────────────────────────

    const historyColumns: InvoiceTableColumn<PurchaseRecord>[] = [
        {
            key: "product_name",
            header: i18n.catalog["text_a79e304d96a1"],
            dataLabel: i18n.catalog["text_a79e304d96a1"],
            render: (item) => <strong>{item.product_name || "-"}</strong>,
        },
        {
            key: "quantity",
            header: i18n.catalog["text_935e21853946"],
            dataLabel: i18n.catalog["text_935e21853946"],
            render: (item) => catalogText(i18n, "text_54ef3bb1085e", { value0: item.quantity, value1: item.unit_type === "main" ? i18n.catalog["text_cc7593424dc5"] : i18n.catalog["text_d400a30ad5f3"] }),
        },
        {
            key: "unit_price",
            header: i18n.catalog["text_c274e3ec351e"],
            dataLabel: i18n.catalog["text_c274e3ec351e"],
            render: (item) => formatCurrency(item.unit_price),
        },
        {
            key: "total_price" as keyof PurchaseRecord,
            header: i18n.catalog["text_baed6e999960"],
            dataLabel: i18n.catalog["text_baed6e999960"],
            render: (item) => formatCurrency(item.invoice_price || item.total_price || 0),
        },
        {
            key: "supplier" as keyof PurchaseRecord,
            header: i18n.catalog["text_4680c31a727f"],
            dataLabel: i18n.catalog["text_4680c31a727f"],
            render: (item) => item.supplier_name || item.supplier || "-",
        },
        {
            key: "payment_type" as keyof PurchaseRecord,
            header: i18n.catalog["text_82c34fe99a13"],
            dataLabel: i18n.catalog["text_82c34fe99a13"],
            render: (item) => (
                <span className={`badge ${item.payment_type === "cash" ? "badge-success" : "badge-warning"}`}>
                    {item.payment_type === "cash" ? i18n.catalog["text_1beb05a45173"] : i18n.catalog["text_bf7775843f7c"]}
                </span>
            ),
        },
        {
            key: "created_at",
            header: i18n.catalog["text_d90c384199ac"],
            dataLabel: i18n.catalog["text_d90c384199ac"],
            render: (item) => formatDateTime(item.created_at || item.purchase_date || ""),
        },
        {
            key: "actions",
            header: i18n.catalog["text_7797240d6caf"],
            dataLabel: i18n.catalog["text_7797240d6caf"],
            render: (item) => (
                <ActionButtons
                    actions={[
                        { icon: "view", title: i18n.catalog["text_3824e18ca83b"], variant: "view", onClick: () => viewPurchaseDetail(item.id) },
                    ]}
                />
            ),
        },
    ];

    const currentItemColumns: Column<PurchaseItem>[] = [
        { key: "display_name", header: i18n.catalog["text_a79e304d96a1"], dataLabel: i18n.catalog["text_a79e304d96a1"] },
        {
            key: "quantity",
            header: i18n.catalog["text_935e21853946"],
            dataLabel: i18n.catalog["text_935e21853946"],
            render: (item) => catalogText(i18n, "text_54ef3bb1085e", { value0: item.quantity, value1: item.unit_name || "" }),
        },
        {
            key: "unit_price",
            header: i18n.catalog["text_2b080520c372"],
            dataLabel: i18n.catalog["text_2b080520c372"],
            render: (item) => formatCurrency(item.unit_price),
        },
        {
            key: "subtotal",
            header: i18n.catalog["text_9c33cdc71a89"],
            dataLabel: i18n.catalog["text_9c33cdc71a89"],
            render: (item) => formatCurrency(item.subtotal),
        },
        {
            key: "actions",
            header: "",
            dataLabel: i18n.catalog["text_7797240d6caf"],
            render: (_, index) => (
                <ActionButtons
                    actions={[{ icon: "trash", title: i18n.catalog["text_59ca629220a6"], variant: "delete", onClick: () => removeItem(index) }]}
                />
            ),
        },
    ];

    // ── Render panels ─────────────────────────────────────────────────────

    const InputPanelForm = (
        <div className="sales-card compact animate-slide">
            <div className="card-header-flex">
                <h3>{isCredit ? i18n.catalog["text_1aed95c27420"] : i18n.catalog["text_e22e5364422c"]}</h3>
                <div className="invoice-badge">
                    <span className="stat-label">{i18n.catalog["text_2cd4e7c1b5fb"]}</span>
                    <input type="text" id="purchase-number" value={invoiceNumber} readOnly className="minimal-input" />
                </div>
            </div>
            <form id="purchase-form" onSubmit={(e) => { e.preventDefault(); addItemToPurchase(); }}>
                <div className="form-group">
                    <label htmlFor="purchase-product-select">{i18n.catalog["text_f823e0243f4f"]}</label>
                    <SearchableSelect
                        id="purchase-product-select"
                        inputRef={productSelectRef}
                        options={productOptions}
                        value={selectedProduct?.id || null}
                        onChange={handleProductSelect}
                        placeholder={i18n.catalog["text_05b154cfc523"]}
                        required
                        autoFocus
                        onAutoSelect={() => quantityInputRef.current?.focus()}
                        filterOption={(opt, term) =>
                            opt.label.toLowerCase().includes(term.toLowerCase()) ||
                            (opt.original?.barcode && opt.original.barcode.includes(term))
                        }
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="purchase-unit-type">{i18n.catalog["text_0b7ee6a6a05b"]}</label>
                        <select
                            id="purchase-unit-type"
                            value={unitType}
                            onChange={(e) => setUnitType(e.target.value as "sub" | "main")}
                            className="glass"
                        >
                            <option className="option-name" value="sub">{selectedProduct?.sub_unit_name || i18n.catalog["text_d400a30ad5f3"]}</option>
                            <option className="option-name" value="main">
                                {selectedProduct?.unit_name || i18n.catalog["text_cc7593424dc5"]} (
                                {selectedProduct?.items_per_unit || 1}{" "}
                                {selectedProduct?.sub_unit_name || i18n.catalog["text_d400a30ad5f3"]})
                            </option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="purchase-expiry">{i18n.catalog["text_ec3093bd6fd5"]}</label>
                        <DatePicker
                            id="purchase-expiry"
                            value={itemExpiryDate}
                            onChange={(val) => setItemExpiryDate(val)}
                            placeholder={i18n.catalog["text_45a51eec3729"]}
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <NumberInput
                            id="purchase-quantity"
                            label={i18n.catalog["text_82ed8e968688"]}
                            min={1}
                            value={quantity}
                            onChange={(val) => setQuantity(val)}
                            required
                            inputRef={quantityInputRef}
                        />
                    </div>
                    <div className="form-group">
                        <NumberInput
                            id="purchase-unit-price"
                            label={i18n.catalog["text_75270145b809"]}
                            min={0}
                            step={1}
                            value={unitPrice}
                            onChange={(val) => setUnitPrice(val)}
                            required
                        />
                    </div>
                </div>

                <div className="summary-stat-box">
                    <div className="stat-item">
                        <span className="stat-label">{i18n.catalog["text_4793cceb7aa3"]}</span>
                        <span className="stat-value highlight">{formatCurrency(subtotal)}</span>
                    </div>
                    <button type="button" className="btn btn-primary btn-add" onClick={addItemToPurchase} data-icon="plus">
                        {i18n.catalog["text_c40f2ef41888"]}</button>
                </div>
            </form>
        </div>
    );

    const SupplierPanelForm = (
        <div className="sales-card compact animate-slide">
            <h3>{isCredit ? i18n.catalog["text_23e239ec0b1c"] : i18n.catalog["text_cb3ec49ab437"]}</h3>
            <div className="form-row" style={{ marginTop: "1rem" }}>
                <div className="form-group">
                    <label htmlFor="supplier-select">
                        {i18n.catalog["text_4680c31a727f"]}{isCredit && <span style={{ color: "var(--color-danger)" }}>*</span>}
                    </label>
                    <SearchableSelect
                        id="supplier-select"
                        options={supplierOptions}
                        value={selectedSupplier?.id || null}
                        onChange={handleSupplierSelect}
                        onSearch={(term) => setSupplierSearchTerm(term)}
                        placeholder={i18n.catalog["text_2b38d4d9f340"]}
                        noResultsText={supplierSearchTerm.length < 2 ? i18n.catalog["text_d34f5f1ea138"] : i18n.catalog["text_214e46dfe681"]}
                    />
                </div>
                {isCredit ? (
                    <div className="form-group">
                        <NumberInput
                            id="amount-paid-input"
                            label={i18n.catalog["text_623e1883b3d2"]}
                            min={0}
                            step={1}
                            value={amountPaid}
                            onChange={(val) => setAmountPaid(val)}
                        />
                    </div>
                ) : (
                    <div className="form-group">
                        <SegmentedToggle
                            label={i18n.catalog["text_ae2d60052976"]}
                            value={paymentType}
                            onChange={(val) => setPaymentType(val as "cash" | "credit")}
                            options={[
                                { value: "cash", label: i18n.catalog["text_1beb05a45173"] },
                                { value: "credit", label: i18n.catalog["text_bf7775843f7c"] },
                            ]}
                        />
                    </div>
                )}
            </div>
            {isCredit && (
                <small style={{ color: "var(--text-light)", display: "block", marginBottom: "0.5rem" }}>
                    {i18n.catalog["text_11163ee7d162"]}</small>
            )}
            <div className="form-group" style={{ marginTop: "0.5rem" }}>
                <label htmlFor="purchase-notes">{i18n.catalog["text_4e039afd0464"]}</label>
                <textarea
                    id="purchase-notes"
                    value={invoiceNotes}
                    onChange={(e) => setInvoiceNotes(e.target.value)}
                    rows={2}
                    placeholder={i18n.catalog["text_4f42bf3f07ec"]}
                    style={{ width: "100%" }}
                />
            </div>
        </div>
    );

    return (
        <MainLayout>
            <div id="alert-container"></div>
            <div className="sales-layout">
                <div className="sales-card" style={{ marginBottom: "1rem" }}>
                    {readiness?.ready && readiness.context?.warehouse ? (
                        <span>{i18n.catalog["text_9189aa23a931"]}{readiness.context.warehouse.name}</span>
                    ) : (
                        <span>{i18n.catalog["text_9f615da03340"]}</span>
                    )}
                </div>
                <div className="sales-top-grids">
                    {/* Left: product entry */}
                    {InputPanelForm}

                    {/* Right: supplier/payment + current invoice items */}
                    <div className="side-panel" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                        {SupplierPanelForm}

                        <div className="sales-card animate-slide" style={{ animationDelay: "0.1s" }}>
                            <h3>{i18n.catalog["text_0dd962e486c9"]}</h3>
                            <div className="current-invoice-table" style={{ width: "100%", overflowX: "auto" }}>
                                <Table
                                    columns={currentItemColumns}
                                    data={purchaseItems}
                                    keyExtractor={(_, index) => index}
                                    emptyMessage={i18n.catalog["text_9172081b079d"]}
                                />
                            </div>

                            <div className="invoice-adjustments">
                                <div className="discount-section">
                                    <div className="form-group" style={{ marginBottom: 0, flex: '1 1 200px', minWidth: '0' }}>
                                        <NumberInput
                                            id="purchase-discount"
                                            label={i18n.catalog["text_9820f0061954"]}
                                            value={discountValue}
                                            onChange={(val) => setDiscountValue(val)}
                                            min={0}
                                            placeholder={i18n.catalog["text_561b2814d3c0"]}
                                        />
                                    </div>
                                    <SegmentedToggle
                                        label={i18n.catalog["text_3bf1c1fc67c1"]}
                                        value={discountType}
                                        onChange={(val) => setDiscountType(val as "fixed" | "percent")}
                                        options={[
                                            { value: "fixed", label: i18n.catalog["text_30de87b72026"] },
                                            { value: "percent", label: i18n.catalog["text_d75c4c7090fc"] },
                                        ]}
                                    />
                                </div>
                                {calculatedDiscount() > 0 && (
                                    <div className="summary-stat animate-fade" style={{ marginRight: 'auto', borderRight: '1px solid var(--border-color)', paddingRight: '1.5rem' }}>
                                        <span className="stat-label">{i18n.catalog["text_8b9ac0222699"]}</span>
                                        <span className="stat-value text-danger" style={{ fontSize: '1.1rem' }}>
                                            -{formatCurrency(calculatedDiscount())}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="sales-summary-bar">
                                <div className="summary-stat">
                                    <span className="stat-label">{i18n.catalog["text_a86ed2466035"]}</span>
                                    <span className="stat-value">{formatCurrency(purchaseTotal)}</span>
                                </div>

                                <div className="summary-stat">
                                    <span className="stat-label">{isCredit ? i18n.catalog["text_1f4a626bcba2"] : i18n.catalog["text_50a90c019154"]}</span>
                                    <span id="purchase-total" className="stat-value highlight">
                                        {formatCurrency(finalTotal)}
                                    </span>
                                </div>

                                {paidAmountVal > 0 && (
                                    <div className="summary-stat">
                                        <span className="stat-label">{i18n.catalog["text_0e34abaab7bf"]}</span>
                                        <span className="stat-value text-success">{formatCurrency(paidAmountVal)}</span>
                                    </div>
                                )}

                                {isCredit && (
                                    <div className="summary-stat">
                                        <span className="stat-label">{i18n.catalog["text_7c1a4f4c5bd3"]}</span>
                                        <span className="stat-value text-danger">{formatCurrency(remainingAmount)}</span>
                                    </div>
                                )}

                                <button
                                    type="button"
                                    className="btn btn-primary btn-add"
                                    onClick={finishPurchase}
                                    id="finish-purchase-btn"
                                    data-icon="check"
                                    disabled={purchaseItems.length === 0 || !readiness?.ready}
                                >
                                    {isCredit ? i18n.catalog["text_06873ff74693"] : i18n.catalog["text_f663f7a034fa"]}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Purchase History ── */}
                <div className="sales-card animate-slide" style={{ animationDelay: "0.2s" }}>
                    <h3>{i18n.catalog["text_686c4194fb34"]}</h3>
                    <div className="table-container">
                        <div className="table-wrapper">
                            <SelectableInvoiceTable
                                invoices={purchases as any[]}
                                columns={historyColumns as any}
                                keyExtractor={(item: any) => item.id}
                                emptyMessage={i18n.catalog["text_6ae79ed76824"]}
                                isLoading={isLoading}
                                pagination={{ currentPage, totalPages, onPageChange: loadPurchases }}
                                getInvoiceItems={getPurchaseItemsForTable as any}
                                onSelectionChange={handleReturnSelection}
                                onSearch={() => { }}
                                openReturnDialog={openReturnDialog}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Purchase Return Dialog */}
            <PurchaseReturnDialog
                isOpen={returnDialog}
                onClose={() => setReturnDialog(false)}
                selectedItems={selectedReturnItems}
                invoicesMap={purchasesMap}
                onConfirmReturn={handleConfirmReturn}
                onSuccess={() => {
                    setReturnDialog(false);
                    setSelectedReturnItems([]);
                    loadPurchases(currentPage);
                    loadProducts();
                }}
            />

            {/* View Dialog */}
            <Dialog isOpen={viewDialog} onClose={() => setViewDialog(false)} title={i18n.catalog["text_8f68e7eb79e2"]}>
                {selectedPurchase && (
                    <div id="purchase-view-dialog-body">
                        <div
                            className="invoice-details-header"
                            style={{ marginBottom: "2rem", borderBottom: "2px solid var(--border-color)", paddingBottom: "1rem" }}
                        >
                            <div className="form-row">
                                <div className="summary-stat">
                                    <span className="stat-label">{i18n.catalog["text_a79e304d96a1"]}</span>
                                    <span className="stat-value">{selectedPurchase.product_name || "-"}</span>
                                </div>
                                <div className="summary-stat">
                                    <span className="stat-label">{i18n.catalog["text_935e21853946"]}</span>
                                    <span className="stat-value">
                                        {selectedPurchase.quantity}{" "}
                                        {selectedPurchase.unit_type === "main" ? i18n.catalog["text_cc7593424dc5"] : i18n.catalog["text_d400a30ad5f3"]}
                                    </span>
                                </div>
                                <div className="summary-stat">
                                    <span className="stat-label">{i18n.catalog["text_ae2d60052976"]}</span>
                                    <span className="stat-value">
                                        <span className={`badge ${selectedPurchase.payment_type === "cash" ? "badge-success" : "badge-warning"}`}>
                                            {selectedPurchase.payment_type === "cash" ? i18n.catalog["text_1beb05a45173"] : i18n.catalog["text_bf7775843f7c"]}
                                        </span>
                                    </span>
                                </div>
                            </div>
                            <div
                                className="form-row"
                                style={{ marginTop: "1rem", background: "var(--surface-hover)", padding: "1rem", borderRadius: "var(--radius-md)" }}
                            >
                                <div className="summary-stat">
                                    <span className="stat-label">{i18n.catalog["text_4680c31a727f"]}</span>
                                    <span className="stat-value">
                                        {selectedPurchase.supplier_name || selectedPurchase.supplier || "-"}
                                    </span>
                                </div>
                                <div className="summary-stat">
                                    <span className="stat-label">{i18n.catalog["text_d90c384199ac"]}</span>
                                    <span className="stat-value">
                                        {formatDate(selectedPurchase.purchase_date || selectedPurchase.created_at || "")}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="sales-summary-bar" style={{ marginTop: "2rem", background: "var(--grad-primary)", color: "white" }}>
                            <div className="summary-stat">
                                <span className="stat-label" style={{ color: "rgba(255,255,255,0.8)" }}>{i18n.catalog["text_c274e3ec351e"]}</span>
                                <span className="stat-value" style={{ color: "white", fontSize: "1.2rem" }}>
                                    {formatCurrency(selectedPurchase.unit_price)}
                                </span>
                            </div>
                            <div className="summary-stat">
                                <span className="stat-label" style={{ color: "rgba(255,255,255,0.8)" }}>{i18n.catalog["text_baed6e999960"]}</span>
                                <span className="stat-value highlight" style={{ color: "white" }}>
                                    {formatCurrency(selectedPurchase.invoice_price || selectedPurchase.total_price || 0)}
                                </span>
                            </div>
                        </div>

                        {selectedPurchase.notes && (
                            <div className="form-group" style={{ marginTop: "1rem" }}>
                                <span className="stat-label">{i18n.catalog["text_d446d2dc6b81"]}</span>
                                <p style={{ marginTop: "0.25rem" }}>{selectedPurchase.notes}</p>
                            </div>
                        )}
                    </div>
                )}
            </Dialog>

            {/* Confirm Delete */}
            <ConfirmDialog
                isOpen={confirmDialog}
                onClose={() => { setConfirmDialog(false); setDeletePurchaseId(null); }}
                onConfirm={deletePurchase}
                title={i18n.catalog["text_5f9cb54dc136"]}
                message={i18n.catalog["text_f45bea5c16d3"]}
                confirmText={i18n.catalog["text_f900e96c0235"]}
                confirmVariant="primary"
            />
        </MainLayout>
    );
}
