"use client";

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
            showAlert("alert-container", "خطأ في تحميل المنتجات", "error");
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
            showAlert("alert-container", "خطأ في تحميل السجل", "error");
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
        subtitle: `${p.stock_quantity} ${p.sub_unit_name || "حبة"} | ${formatCurrency(p.purchase_price || p.unit_price || 0)}`,
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
                    display_name: `${selectedProduct.name} (${qty} ${unitName || ""})`,
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
            showAlert("alert-container", "يرجى اختيار منتج أولاً", "error");
            return;
        }
        const qty = parseNumber(quantity);
        const price = parseNumber(unitPrice);
        if (qty <= 0 || price <= 0) {
            showAlert("alert-container", "الكمية والسعر يجب أن يكونا أكبر من صفر", "error");
            return;
        }

        const itemsPerUnit = selectedProduct.items_per_unit || 1;
        const totalSubUnits = unitType === "main" ? qty * itemsPerUnit : qty;
        const calcSubtotal = unitType === "main" ? qty * price * itemsPerUnit : qty * price;
        const unitName = unitType === "main" ? selectedProduct.unit_name : selectedProduct.sub_unit_name;

        const newItem: PurchaseItem = {
            product_id: selectedProduct.id,
            product_name: selectedProduct.name,
            display_name: `${selectedProduct.name} (${qty} ${unitName || ""})`,
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
            showAlert("alert-container", "أضف منتجاً واحداً على الأقل للفاتورة!", "error");
            return;
        }
        if (!readiness?.ready || !readiness.context?.warehouse_id) {
            showAlert("alert-container", "لا يمكن ترحيل الشراء قبل إكمال إعداد المستودع.", "error");
            return;
        }
        if (isCredit && !selectedSupplier) {
            showAlert("alert-container", "يرجى اختيار المورد للشراء الآجل", "error");
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
                    `تمت إضافة ${purchaseItems.length} منتج للمخزون بنجاح. إجمالي: ${formatCurrency(finalTotal)}`,
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
                showAlert("alert-container", "بعض المنتجات لم يتم حفظها، راجع الأخطاء", "error");
            }
        } catch (error) {
            const msg = error instanceof Error ? error.message : "خطأ غير معروف";
            showAlert("alert-container", "خطأ: " + msg, "error");
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
                `${API_ENDPOINTS.COMMERCIAL.PROCUREMENT.BASE}/${deletePurchaseId}`,
                { method: "DELETE" }
            );
            if (response.success) {
                showAlert("alert-container", "تم الحذف وإرجاع الكمية للمخزون", "success");
                await loadPurchases();
                await loadProducts();
            } else {
                showAlert("alert-container", response.message || "فشل الحذف", "error");
            }
        } catch {
            showAlert("alert-container", "خطأ في الحذف", "error");
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
            showToast("يرجى تحديد عناصر للإرجاع أولاً", "warning");
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
                showToast("فشل تحميل بيانات الفواتير", "error");
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
                if (!response.success) throw new Error(response.message || "فشل تسجيل المرتجع");
            }
            showToast("تم تسجيل مرتجع المشتريات بنجاح", "success");
        } catch (error: any) {
            showToast(error.message || "خطأ في تسجيل المرتجع", "error");
            throw error;
        }
    };

    // ── Columns ───────────────────────────────────────────────────────────

    const historyColumns: InvoiceTableColumn<PurchaseRecord>[] = [
        {
            key: "product_name",
            header: "المنتج",
            dataLabel: "المنتج",
            render: (item) => <strong>{item.product_name || "-"}</strong>,
        },
        {
            key: "quantity",
            header: "الكمية",
            dataLabel: "الكمية",
            render: (item) => `${item.quantity} ${item.unit_type === "main" ? "كرتون" : "حبة"}`,
        },
        {
            key: "unit_price",
            header: "سعر الوحدة",
            dataLabel: "سعر الوحدة",
            render: (item) => formatCurrency(item.unit_price),
        },
        {
            key: "total_price" as keyof PurchaseRecord,
            header: "الإجمالي",
            dataLabel: "الإجمالي",
            render: (item) => formatCurrency(item.invoice_price || item.total_price || 0),
        },
        {
            key: "supplier" as keyof PurchaseRecord,
            header: "المورد",
            dataLabel: "المورد",
            render: (item) => item.supplier_name || item.supplier || "-",
        },
        {
            key: "payment_type" as keyof PurchaseRecord,
            header: "الدفع",
            dataLabel: "الدفع",
            render: (item) => (
                <span className={`badge ${item.payment_type === "cash" ? "badge-success" : "badge-warning"}`}>
                    {item.payment_type === "cash" ? "نقدي" : "آجل"}
                </span>
            ),
        },
        {
            key: "created_at",
            header: "التاريخ",
            dataLabel: "التاريخ",
            render: (item) => formatDateTime(item.created_at || item.purchase_date || ""),
        },
        {
            key: "actions",
            header: "الإجراءات",
            dataLabel: "الإجراءات",
            render: (item) => (
                <ActionButtons
                    actions={[
                        { icon: "view", title: "عرض", variant: "view", onClick: () => viewPurchaseDetail(item.id) },
                    ]}
                />
            ),
        },
    ];

    const currentItemColumns: Column<PurchaseItem>[] = [
        { key: "display_name", header: "المنتج", dataLabel: "المنتج" },
        {
            key: "quantity",
            header: "الكمية",
            dataLabel: "الكمية",
            render: (item) => `${item.quantity} ${item.unit_name || ""}`,
        },
        {
            key: "unit_price",
            header: "سعر الشراء",
            dataLabel: "سعر الشراء",
            render: (item) => formatCurrency(item.unit_price),
        },
        {
            key: "subtotal",
            header: "المجموع",
            dataLabel: "المجموع",
            render: (item) => formatCurrency(item.subtotal),
        },
        {
            key: "actions",
            header: "",
            dataLabel: "الإجراءات",
            render: (_, index) => (
                <ActionButtons
                    actions={[{ icon: "trash", title: "حذف", variant: "delete", onClick: () => removeItem(index) }]}
                />
            ),
        },
    ];

    // ── Render panels ─────────────────────────────────────────────────────

    const InputPanelForm = (
        <div className="sales-card compact animate-slide">
            <div className="card-header-flex">
                <h3>{isCredit ? "مشتريات آجلة" : "إضافة مشتريات"}</h3>
                <div className="invoice-badge">
                    <span className="stat-label">رقم الفاتورة:</span>
                    <input type="text" id="purchase-number" value={invoiceNumber} readOnly className="minimal-input" />
                </div>
            </div>
            <form id="purchase-form" onSubmit={(e) => { e.preventDefault(); addItemToPurchase(); }}>
                <div className="form-group">
                    <label htmlFor="purchase-product-select">اختر المنتج *</label>
                    <SearchableSelect
                        id="purchase-product-select"
                        inputRef={productSelectRef}
                        options={productOptions}
                        value={selectedProduct?.id || null}
                        onChange={handleProductSelect}
                        placeholder="ابحث عن منتج أو باركود..."
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
                        <label htmlFor="purchase-unit-type">نوع الوحدة</label>
                        <select
                            id="purchase-unit-type"
                            value={unitType}
                            onChange={(e) => setUnitType(e.target.value as "sub" | "main")}
                            className="glass"
                        >
                            <option className="option-name" value="sub">{selectedProduct?.sub_unit_name || "حبة"}</option>
                            <option className="option-name" value="main">
                                {selectedProduct?.unit_name || "كرتون"} (
                                {selectedProduct?.items_per_unit || 1}{" "}
                                {selectedProduct?.sub_unit_name || "حبة"})
                            </option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="purchase-expiry">تاريخ الانتهاء</label>
                        <DatePicker
                            id="purchase-expiry"
                            value={itemExpiryDate}
                            onChange={(val) => setItemExpiryDate(val)}
                            placeholder="اختر تاريخ الانتهاء..."
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <NumberInput
                            id="purchase-quantity"
                            label="الكمية *"
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
                            label="سعر الشراء للوحدة *"
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
                        <span className="stat-label">المجموع الفرعي</span>
                        <span className="stat-value highlight">{formatCurrency(subtotal)}</span>
                    </div>
                    <button type="button" className="btn btn-primary btn-add" onClick={addItemToPurchase} data-icon="plus">
                        إضافة للفاتورة
                    </button>
                </div>
            </form>
        </div>
    );

    const SupplierPanelForm = (
        <div className="sales-card compact animate-slide">
            <h3>{isCredit ? "بيانات المورد (مطلوب)" : "بيانات المورد والدفع"}</h3>
            <div className="form-row" style={{ marginTop: "1rem" }}>
                <div className="form-group">
                    <label htmlFor="supplier-select">
                        المورد {isCredit && <span style={{ color: "var(--color-danger)" }}>*</span>}
                    </label>
                    <SearchableSelect
                        id="supplier-select"
                        options={supplierOptions}
                        value={selectedSupplier?.id || null}
                        onChange={handleSupplierSelect}
                        onSearch={(term) => setSupplierSearchTerm(term)}
                        placeholder="ابحث عن مورد..."
                        noResultsText={supplierSearchTerm.length < 2 ? "اكتب حرفين على الأقل للبحث" : "لا يوجد موردين"}
                    />
                </div>
                {isCredit ? (
                    <div className="form-group">
                        <NumberInput
                            id="amount-paid-input"
                            label="المبلغ المدفوع (نقدًا)"
                            min={0}
                            step={1}
                            value={amountPaid}
                            onChange={(val) => setAmountPaid(val)}
                        />
                    </div>
                ) : (
                    <div className="form-group">
                        <SegmentedToggle
                            label="طريقة الدفع"
                            value={paymentType}
                            onChange={(val) => setPaymentType(val as "cash" | "credit")}
                            options={[
                                { value: "cash", label: "نقدي" },
                                { value: "credit", label: "آجل" },
                            ]}
                        />
                    </div>
                )}
            </div>
            {isCredit && (
                <small style={{ color: "var(--text-light)", display: "block", marginBottom: "0.5rem" }}>
                    المبلغ الذي سيسدد للمورد حالياً من قيمة الفاتورة
                </small>
            )}
            <div className="form-group" style={{ marginTop: "0.5rem" }}>
                <label htmlFor="purchase-notes">ملاحظات الفاتورة</label>
                <textarea
                    id="purchase-notes"
                    value={invoiceNotes}
                    onChange={(e) => setInvoiceNotes(e.target.value)}
                    rows={2}
                    placeholder="ملاحظات اختيارية..."
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
                        <span>سياق التشغيل: {readiness.context.warehouse.name}</span>
                    ) : (
                        <span>إعداد المتجر غير مكتمل. أكمل إعداد المستودع من الهيكل التنظيمي قبل ترحيل المشتريات.</span>
                    )}
                </div>
                <div className="sales-top-grids">
                    {/* Left: product entry */}
                    {InputPanelForm}

                    {/* Right: supplier/payment + current invoice items */}
                    <div className="side-panel" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                        {SupplierPanelForm}

                        <div className="sales-card animate-slide" style={{ animationDelay: "0.1s" }}>
                            <h3>عناصر الفاتورة الحالية</h3>
                            <div className="current-invoice-table" style={{ width: "100%", overflowX: "auto" }}>
                                <Table
                                    columns={currentItemColumns}
                                    data={purchaseItems}
                                    keyExtractor={(_, index) => index}
                                    emptyMessage="لا توجد عناصر مضافة"
                                />
                            </div>

                            <div className="invoice-adjustments">
                                <div className="discount-section">
                                    <div className="form-group" style={{ marginBottom: 0, flex: '1 1 200px', minWidth: '0' }}>
                                        <NumberInput
                                            id="purchase-discount"
                                            label="قيمة الخصم"
                                            value={discountValue}
                                            onChange={(val) => setDiscountValue(val)}
                                            min={0}
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <SegmentedToggle
                                        label="نوع التخفيض"
                                        value={discountType}
                                        onChange={(val) => setDiscountType(val as "fixed" | "percent")}
                                        options={[
                                            { value: "fixed", label: "مبلغ" },
                                            { value: "percent", label: "نسبة" },
                                        ]}
                                    />
                                </div>
                                {calculatedDiscount() > 0 && (
                                    <div className="summary-stat animate-fade" style={{ marginRight: 'auto', borderRight: '1px solid var(--border-color)', paddingRight: '1.5rem' }}>
                                        <span className="stat-label">إجمالي الخصم</span>
                                        <span className="stat-value text-danger" style={{ fontSize: '1.1rem' }}>
                                            -{formatCurrency(calculatedDiscount())}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="sales-summary-bar">
                                <div className="summary-stat">
                                    <span className="stat-label">مجموع المنتجات</span>
                                    <span className="stat-value">{formatCurrency(purchaseTotal)}</span>
                                </div>

                                <div className="summary-stat">
                                    <span className="stat-label">{isCredit ? 'المبلغ الإجمالي' : 'إجمالي الفاتورة'}</span>
                                    <span id="purchase-total" className="stat-value highlight">
                                        {formatCurrency(finalTotal)}
                                    </span>
                                </div>

                                {paidAmountVal > 0 && (
                                    <div className="summary-stat">
                                        <span className="stat-label">المدفوع نقدًا</span>
                                        <span className="stat-value text-success">{formatCurrency(paidAmountVal)}</span>
                                    </div>
                                )}

                                {isCredit && (
                                    <div className="summary-stat">
                                        <span className="stat-label">المتبقي للمورد</span>
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
                                    {isCredit ? 'حفظ الفاتورة' : 'إنهاء الفاتورة'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Purchase History ── */}
                <div className="sales-card animate-slide" style={{ animationDelay: "0.2s" }}>
                    <h3>سجل المشتريات السابقة</h3>
                    <div className="table-container">
                        <div className="table-wrapper">
                            <SelectableInvoiceTable
                                invoices={purchases as any[]}
                                columns={historyColumns as any}
                                keyExtractor={(item: any) => item.id}
                                emptyMessage="لا توجد مشتريات سابقة"
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
            <Dialog isOpen={viewDialog} onClose={() => setViewDialog(false)} title="تفاصيل المشترى">
                {selectedPurchase && (
                    <div id="purchase-view-dialog-body">
                        <div
                            className="invoice-details-header"
                            style={{ marginBottom: "2rem", borderBottom: "2px solid var(--border-color)", paddingBottom: "1rem" }}
                        >
                            <div className="form-row">
                                <div className="summary-stat">
                                    <span className="stat-label">المنتج</span>
                                    <span className="stat-value">{selectedPurchase.product_name || "-"}</span>
                                </div>
                                <div className="summary-stat">
                                    <span className="stat-label">الكمية</span>
                                    <span className="stat-value">
                                        {selectedPurchase.quantity}{" "}
                                        {selectedPurchase.unit_type === "main" ? "كرتون" : "حبة"}
                                    </span>
                                </div>
                                <div className="summary-stat">
                                    <span className="stat-label">طريقة الدفع</span>
                                    <span className="stat-value">
                                        <span className={`badge ${selectedPurchase.payment_type === "cash" ? "badge-success" : "badge-warning"}`}>
                                            {selectedPurchase.payment_type === "cash" ? "نقدي" : "آجل"}
                                        </span>
                                    </span>
                                </div>
                            </div>
                            <div
                                className="form-row"
                                style={{ marginTop: "1rem", background: "var(--surface-hover)", padding: "1rem", borderRadius: "var(--radius-md)" }}
                            >
                                <div className="summary-stat">
                                    <span className="stat-label">المورد</span>
                                    <span className="stat-value">
                                        {selectedPurchase.supplier_name || selectedPurchase.supplier || "-"}
                                    </span>
                                </div>
                                <div className="summary-stat">
                                    <span className="stat-label">التاريخ</span>
                                    <span className="stat-value">
                                        {formatDate(selectedPurchase.purchase_date || selectedPurchase.created_at || "")}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="sales-summary-bar" style={{ marginTop: "2rem", background: "var(--grad-primary)", color: "white" }}>
                            <div className="summary-stat">
                                <span className="stat-label" style={{ color: "rgba(255,255,255,0.8)" }}>سعر الوحدة</span>
                                <span className="stat-value" style={{ color: "white", fontSize: "1.2rem" }}>
                                    {formatCurrency(selectedPurchase.unit_price)}
                                </span>
                            </div>
                            <div className="summary-stat">
                                <span className="stat-label" style={{ color: "rgba(255,255,255,0.8)" }}>الإجمالي</span>
                                <span className="stat-value highlight" style={{ color: "white" }}>
                                    {formatCurrency(selectedPurchase.invoice_price || selectedPurchase.total_price || 0)}
                                </span>
                            </div>
                        </div>

                        {selectedPurchase.notes && (
                            <div className="form-group" style={{ marginTop: "1rem" }}>
                                <span className="stat-label">ملاحظات</span>
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
                title="تأكيد الحذف"
                message="هل أنت متأكد من حذف هذا المشترى؟ سيتم خصم الكمية من المخزون."
                confirmText="نعم، متابعة"
                confirmVariant="primary"
            />
        </MainLayout>
    );
}
