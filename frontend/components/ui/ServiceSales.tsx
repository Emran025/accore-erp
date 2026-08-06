"use client";

import { MainLayout } from "@/components/layout";
import {
    ActionButtons,
    Column,
    ConfirmDialog,
    Dialog,
    InvoiceTableColumn,
    NumberInput,
    ReturnData,
    SalesReturnDialog,
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
import { GovernmentFee, Service, InvoiceItem, Customer, Invoice, TaxAuthority, TaxType, TaxRate } from "@/types";
import { formatCurrency, formatDateTime, parseNumber } from "@/lib/utils";
import { useServiceStore } from "@/stores/useServiceStore";
import { useCallback, useEffect, useState } from "react";

/* ──────────────────────────────────────────────
   Props
────────────────────────────────────────────── */

export interface ServiceSalesPageProps {
    /** cash = direct cash sale  |  credit = deferred / AR sale */
    mode: "cash" | "credit";
}

/* ══════════════════════════════════════════════
   COMPONENT
══════════════════════════════════════════════ */

export function ServiceSales({ mode }: ServiceSalesPageProps) {
    const isCash = mode === "cash";
    const { items: rawServices, load: loadServices } = useServiceStore();
    const services: Service[] = rawServices as unknown as Service[];

    const [user, setUser] = useState<User | null>(null);
    const [permissions, setPermissions] = useState<Permission[]>([]);

    // Government Fees & VAT
    const [governmentFees, setGovernmentFees] = useState<GovernmentFee[]>([]);
    const [vatRate, setVatRate] = useState(0.0);

    // Service selection
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [quantity, setQuantity] = useState("1");
    const [unitPrice, setUnitPrice] = useState("");
    const [subtotal, setSubtotal] = useState(0);

    // Customers (credit only)
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [customerSearchTerm, setCustomerSearchTerm] = useState("");
    const [amountPaid, setAmountPaid] = useState("");

    // Current invoice
    const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
    const [invoiceNumber, setInvoiceNumber] = useState("");
    const [discountValue, setDiscountValue] = useState("0");
    const [discountType, setDiscountType] = useState<"fixed" | "percent">("fixed");

    // Invoice history
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 20;

    // Dialogs
    const [viewDialog, setViewDialog] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [deleteInvoiceId, setDeleteInvoiceId] = useState<number | null>(null);

    // Returns
    const [returnDialog, setReturnDialog] = useState(false);
    const [selectedReturnItems, setSelectedReturnItems] = useState<SelectedItem[]>([]);
    const [invoicesMap, setInvoicesMap] = useState<Record<number, SelectableInvoice>>({});

    const [isLoading, setIsLoading] = useState(true);

    /* ──────────────────────────────────────────
       Pricing helpers
    ────────────────────────────────────────── */

    const calculateSellingPrice = (basePrice: number) => {
        const feesPercentage = governmentFees.reduce((sum, f) => sum + (Number(f.percentage) || 0), 0) / 100;
        const fixedFees = governmentFees.reduce((sum, f) => sum + (Number(f.fixed_amount) || 0), 0);
        const variableFeeAmount = basePrice * feesPercentage;
        const vatAmount = basePrice * vatRate;
        return basePrice + variableFeeAmount + vatAmount + fixedFees;
    };

    const calculateBasePrice = (finalPrice: number) => {
        const feesPercentage = governmentFees.reduce((sum, f) => sum + (Number(f.percentage) || 0), 0) / 100;
        const fixedFees = governmentFees.reduce((sum, f) => sum + (Number(f.fixed_amount) || 0), 0);
        const divisor = 1 + feesPercentage + vatRate;
        const base = (finalPrice - fixedFees) / divisor;
        return base > 0 ? base : 0;
    };

    const baseItemsTotal = invoiceItems.reduce((sum, item) => {
        const basePrice = calculateBasePrice(item.unit_price);
        return sum + basePrice * item.quantity;
    }, 0);

    const totalVAT = baseItemsTotal * vatRate;

    const totalFees = invoiceItems.reduce((sum, item) => {
        const base = calculateBasePrice(item.unit_price);
        const feesPercentage = governmentFees.reduce((s, f) => s + (Number(f.percentage) || 0), 0) / 100;
        const fixedFees = governmentFees.reduce((s, f) => s + (Number(f.fixed_amount) || 0), 0);
        return sum + (base * feesPercentage + fixedFees) * item.quantity;
    }, 0);

    const calculatedDiscount = useCallback(() => {
        const val = parseNumber(discountValue);
        if (discountType === "percent") return (baseItemsTotal * val) / 100;
        return val;
    }, [discountValue, discountType, baseItemsTotal]);

    const finalTotal = baseItemsTotal + totalFees + totalVAT - calculatedDiscount();

    /* ──────────────────────────────────────────
       Data loaders
    ────────────────────────────────────────── */

    const generateInvoiceNumber = useCallback(() => {
        const ts = Date.now().toString().slice(-6);
        const rand = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
        setInvoiceNumber("SRV-" + ts + rand);
    }, []);

    const loadFees = useCallback(async () => {
        try {
            const response = await fetchAPI<{ authorities?: TaxAuthority[] }>(API_ENDPOINTS.FINANCE.TAX_ENGINE.SETUP);
            const authorities = response?.data?.authorities;
            if (authorities) {
                const activeFees: GovernmentFee[] = [];
                authorities.forEach((auth: TaxAuthority) => {
                    auth.tax_types?.forEach((type: TaxType) => {
                        let areas: string[] = [];
                        try {
                            const parsed = typeof type.applicable_areas === "string"
                                ? JSON.parse(type.applicable_areas)
                                : type.applicable_areas;
                            if (Array.isArray(parsed)) {
                                areas = parsed;
                            }
                        } catch { }
                        if (type.is_active && type.code !== "VAT" && (areas.includes("sales") || areas.length === 0)) {
                            const defaultRate: TaxRate | undefined = type.tax_rates?.find((r: TaxRate) => r.is_default) || type.tax_rates?.[0];
                            activeFees.push({
                                id: type.id,
                                name: type.name,
                                percentage: defaultRate?.rate ? defaultRate.rate * 100 : 0,
                                fixed_amount: defaultRate?.fixed_amount || 0,
                                is_active: type.is_active,
                            });
                        }
                    });
                });
                setGovernmentFees(activeFees);
            }
        } catch (e) {
            console.error("Failed to load tax engine logic", e);
        }
    }, []);

    const loadInvoices = useCallback(
        async (page: number = 1) => {
            try {
                setIsLoading(true);
                const response = await fetchAPI(
                    `${API_ENDPOINTS.COMMERCIAL.SERVICES.SALES}?payment_type=${mode}&page=${page}&per_page=${itemsPerPage}`
                );

                if (response.success && response.data) {
                    const data = response.data as any;
                    const list: Invoice[] = Array.isArray(data) ? data : (data.data || []);
                    setInvoices(list);

                    const totalPagesCount = (response.pagination as any)?.total_pages || data.last_page || 1;
                    setTotalPages(Number(totalPagesCount));
                    setCurrentPage(page);
                }
            } catch {
                showAlert("alert-container", "خطأ في تحميل السجل", "error");
            } finally {
                setIsLoading(false);
            }
        },
        [mode]
    );

    const loadCustomers = useCallback(async (search: string = "") => {
        if (search.length < 2) {
            setCustomers([]);
            return;
        }
        try {
            const response = await fetchAPI(
                `${API_ENDPOINTS.FINANCE.AR.CUSTOMERS}?limit=10&search=${encodeURIComponent(search)}`
            );
            if (response.success && response.data) {
                setCustomers(response.data as Customer[]);
            }
        } catch { }
    }, []);

    /* ──────────────────────────────────────────
       Init
    ────────────────────────────────────────── */

    useEffect(() => {
        const init = async () => {
            const authenticated = await checkAuth();
            if (!authenticated) return;
            const storedUser = getStoredUser();
            const storedPermissions = getStoredPermissions();
            setUser(storedUser);
            setPermissions(storedPermissions);

            // VAT
            try {
                const settingsRes = await fetchAPI(API_ENDPOINTS.ENTERPRISE_CORE.SETTINGS.INDEX);
                if (settingsRes.success && settingsRes.data) {
                    const vatSetting = (settingsRes.data as any[]).find((s: any) => s.setting_key === "vat_rate");
                    if (vatSetting) setVatRate(parseFloat(vatSetting.setting_value) / 100);
                }
            } catch (e) {
                console.error("Failed to load VAT rate", e);
            }

            await Promise.all([loadServices(1), loadInvoices(), loadFees()]);
            generateInvoiceNumber();
            setIsLoading(false);
        };
        init();
    }, [loadServices, loadInvoices, generateInvoiceNumber, loadFees]);

    // Customer search debounce (credit only)
    useEffect(() => {
        if (!isCash && customerSearchTerm) {
            const timer = setTimeout(() => loadCustomers(customerSearchTerm), 300);
            return () => clearTimeout(timer);
        }
    }, [customerSearchTerm, loadCustomers, isCash]);

    // Subtotal calc
    useEffect(() => {
        if (!selectedService) {
            setSubtotal(0);
            return;
        }
        const qty = parseNumber(quantity);
        const price = parseNumber(unitPrice);
        setSubtotal(qty * price);
    }, [quantity, unitPrice, selectedService]);

    /* ──────────────────────────────────────────
       Handlers
    ────────────────────────────────────────── */

    const serviceOptions: SelectOption[] = services.map((s) => ({
        value: s.id,
        label: s.name,
        subtitle: formatCurrency(s.selling_price || s.unit_price || 0),
        original: s,
    }));

    const customerOptions: SelectOption[] = customers.map((c) => ({
        value: c.id,
        label: c.name,
        subtitle: c.phone || "",
        original: c,
    }));

    const handleServiceSelect = (value: string | number | null, option: SelectOption | null) => {
        if (!option) {
            setSelectedService(null);
            return;
        }
        const svc = option.original as Service;
        setSelectedService(svc);
        const basePrice = svc.selling_price || svc.unit_price || 0;
        const displayPrice = calculateSellingPrice(basePrice);
        setUnitPrice(displayPrice.toFixed(2));
    };

    const handleCustomerSelect = (value: string | number | null, option: SelectOption | null) => {
        if (!option) {
            setSelectedCustomer(null);
            setCustomerSearchTerm("");
            return;
        }
        const customer = option.original as Customer;
        setSelectedCustomer(customer);
        setCustomerSearchTerm(customer.name);
    };

    const addItemToInvoice = () => {
        if (!selectedService) {
            showAlert("alert-container", "يرجى اختيار خدمة أولاً", "error");
            return;
        }
        const qty = parseNumber(quantity);
        const price = parseNumber(unitPrice);
        if (qty <= 0) {
            showAlert("alert-container", "الكمية يجب أن تكون أكبر من صفر", "error");
            return;
        }

        const newItem: InvoiceItem = {
            service_id: selectedService.id,
            service_name: selectedService.name,
            display_name: `${selectedService.name} (${qty})`,
            quantity: qty,
            unit_price: price,
            subtotal: qty * price,
        };

        setInvoiceItems([...invoiceItems, newItem]);
        setSelectedService(null);
        setQuantity("1");
        setUnitPrice("");
    };

    const removeInvoiceItem = (index: number) => {
        setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
    };

    const finishInvoice = async () => {
        if (invoiceItems.length === 0) {
            showAlert("alert-container", "الفاتورة فارغة!", "error");
            return;
        }
        if (!isCash && !selectedCustomer) {
            showAlert("alert-container", "يرجى اختيار العميل للفاتورة الآجلة", "error");
            return;
        }

        try {
            const invoiceData: any = {
                invoice_number: invoiceNumber,
                payment_type: mode,
                items: invoiceItems.map((item) => {
                    const basePrice = calculateBasePrice(item.unit_price);
                    return {
                        service_id: item.service_id,
                        quantity: item.quantity,
                        unit_price: Number(basePrice.toFixed(2)),
                        subtotal: Number((basePrice * item.quantity).toFixed(2)),
                    };
                }),
                discount_amount: calculatedDiscount(),
                subtotal: invoiceItems.reduce((sum, item) => {
                    const bp = calculateBasePrice(item.unit_price);
                    return sum + bp * item.quantity;
                }, 0),
            };

            if (!isCash) {
                invoiceData.customer_id = selectedCustomer!.id;
                invoiceData.amount_paid = parseNumber(amountPaid);
            }

            const response = await fetchAPI(API_ENDPOINTS.COMMERCIAL.SERVICES.SALES, {
                method: "POST",
                body: JSON.stringify(invoiceData),
            });

            if (response.success || response.id) {
                showAlert(
                    "alert-container",
                    `تمت العملية بنجاح (الإجمالي: ${formatCurrency(finalTotal)})`,
                    "success"
                );
                setInvoiceItems([]);
                setDiscountValue("0");
                if (!isCash) {
                    setSelectedCustomer(null);
                    setCustomerSearchTerm("");
                    setAmountPaid("");
                }
                generateInvoiceNumber();
                await loadInvoices();
            } else {
                showAlert("alert-container", response.message || "فشل حفظ الفاتورة", "error");
                if (
                    response.message?.includes("UNIQUE") ||
                    response.message?.includes("exists") ||
                    response.message?.includes("موجود")
                ) {
                    generateInvoiceNumber();
                }
            }
        } catch (error) {
            const msg = error instanceof Error ? error.message : "خطأ غير معروف";
            showAlert("alert-container", "خطأ: " + msg, "error");
            if (msg.includes("UNIQUE") || msg.includes("exists") || msg.includes("موجود")) {
                generateInvoiceNumber();
            }
        }
    };

    const viewInvoice = async (id: number) => {
        try {
            const response = await fetchAPI(
                `${API_ENDPOINTS.COMMERCIAL.SERVICES.INVOICE_DETAILS}?id=${id}`
            );
            if (response.success && response.data) {
                setSelectedInvoice(response.data as Invoice);
                setViewDialog(true);
            }
        } catch {
            showAlert("alert-container", "خطأ في جلب التفاصيل", "error");
        }
    };

    const confirmDeleteInvoice = (id: number) => {
        setDeleteInvoiceId(id);
        setConfirmDialog(true);
    };

    const deleteInvoice = async () => {
        if (!deleteInvoiceId) return;
        try {
            const response = await fetchAPI(
                `${API_ENDPOINTS.COMMERCIAL.SERVICES.SALES}?id=${deleteInvoiceId}`,
                { method: "DELETE" }
            );
            if (response.success) {
                showAlert("alert-container", "تم الحذف بنجاح", "success");
                await loadInvoices();
            } else {
                showAlert("alert-container", response.message || "فشل الحذف", "error");
            }
        } catch {
            showAlert("alert-container", "خطأ في الحذف", "error");
        } finally {
            setConfirmDialog(false);
            setDeleteInvoiceId(null);
        }
    };

    /* ── Returns ── */

    const getInvoiceItemsForTable = useCallback(
        async (invoice: Invoice): Promise<UiInvoiceItem[]> => {
            try {
                const response = await fetchAPI(
                    `${API_ENDPOINTS.COMMERCIAL.SERVICES.INVOICE_DETAILS}?id=${invoice.id}`
                );
                if (response.success && response.data) {
                    const detailed = response.data as any;
                    return (detailed.items || []).map((item: any) => ({
                        id: item.id,
                        product_id: item.service_id || item.product_id,
                        product: { name: item.service_name || item.product?.name || item.product_name },
                        quantity: item.quantity,
                        unit_price: item.unit_price,
                        subtotal: item.subtotal,
                        unit_type: "main",
                    }));
                }
                return [];
            } catch {
                return [];
            }
        },
        []
    );

    const handleReturnSelection = useCallback((items: SelectedItem[]) => {
        setSelectedReturnItems(items);
    }, []);

    const openReturnDialog = async () => {
        if (selectedReturnItems.length === 0) {
            showToast("يرجى تحديد عناصر للإرجاع أولاً", "warning");
            return;
        }
        const uniqueInvoiceIds = Array.from(new Set(selectedReturnItems.map((i) => i.invoiceId)));
        const missingIds = uniqueInvoiceIds.filter((id) => !invoicesMap[id]);
        if (missingIds.length > 0) {
            try {
                const newMap = { ...invoicesMap };
                await Promise.all(
                    missingIds.map(async (id) => {
                        const res = await fetchAPI(
                            `${API_ENDPOINTS.COMMERCIAL.SERVICES.INVOICE_DETAILS}?id=${id}`
                        );
                        if (res.success && res.data) newMap[id] = res.data as SelectableInvoice;
                    })
                );
                setInvoicesMap(newMap);
            } catch {
                showToast("فشل تحميل بيانات الفواتير", "error");
            }
        }
        setReturnDialog(true);
    };

    const handleConfirmReturn = async (data: ReturnData | ReturnData[]) => {
        const dataArray = Array.isArray(data) ? data : [data];
        for (const returnData of dataArray) {
            const response = await fetchAPI(API_ENDPOINTS.COMMERCIAL.SERVICES.RETURNS.BASE, {
                method: "POST",
                body: JSON.stringify(returnData),
            });
            if (!response.success) throw new Error(response.message || "فشل تسجيل المرتجع");
        }
        showToast("تم تسجيل المرتجع بنجاح", "success");
    };

    /* ──────────────────────────────────────────
       Columns
    ────────────────────────────────────────── */

    const currentInvoiceColumns: Column<InvoiceItem>[] = [
        { key: "display_name", header: "الخدمة", dataLabel: "الخدمة" },
        {
            key: "quantity",
            header: "الكمية",
            dataLabel: "الكمية",
            render: (item) => `${item.quantity}`,
        },
        {
            key: "unit_price",
            header: "السعر",
            dataLabel: "السعر",
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
                actions={[
                    {
                    icon: "trash",
                    title: "حذف",
                    variant: "delete",
                    onClick: () => removeInvoiceItem(index)
                    }
                ]}
                />
            ),
        },
    ];

    const invoiceColumns: InvoiceTableColumn<Invoice>[] = [
        {
            key: "invoice_number",
            header: "رقم الفاتورة",
            dataLabel: "رقم الفاتورة",
            render: (item) => <strong>{item.invoice_number}</strong>,
        },
        {
            key: "total_amount",
            header: "المبلغ الإجمالي",
            dataLabel: "المبلغ الإجمالي",
            render: (item) => formatCurrency(item.total_amount),
        },
        ...(isCash
            ? []
            : [
                {
                    key: "amount_paid" as keyof Invoice,
                    header: "المدفوع / المتبقي",
                    dataLabel: "المدفوع / المتبقي",
                    render: (item: Invoice) => (
                        <div style={{ fontSize: "0.85rem" }}>
                            <span className="text-success">{formatCurrency(item.amount_paid || 0)}</span> /{" "}
                            <span className="text-danger">
                                {formatCurrency(item.total_amount - (item.amount_paid || 0))}
                            </span>
                        </div>
                    ),
                } as InvoiceTableColumn<Invoice>,
                {
                    key: "customer_name" as keyof Invoice,
                    header: "العميل",
                    render: (item: Invoice) => item.customer_name || "—",
                } as InvoiceTableColumn<Invoice>,
            ]),
        {
            key: "created_at",
            header: "التاريخ والوقت",
            dataLabel: "التاريخ والوقت",
            render: (item) => formatDateTime(item.created_at),
        },
        {
            key: "actions",
            header: "الإجراءات",
            dataLabel: "الإجراءات",
            render: (item) => (
                <ActionButtons
                    actions={[
                    {
                        icon: "view",
                        title: "عرض",
                        variant: "view",
                        onClick: () => viewInvoice(item.id)
                    }
                    ]}
                />
            ),
        },
    ];

    /* ──────────────────────────────────────────
       Render
    ────────────────────────────────────────── */

    return (
        <MainLayout>
            <div id="alert-container"></div>

            <div className="sales-layout">
                <div className="sales-top-grids">
                    {/* ── Left panel: Input form ── */}
                    {isCash ? (
                        /* Cash mode: single card */
                        <div className="sales-card compact animate-slide">
                            <div className="card-header-flex">
                                <h3>إضافة خدمات</h3>
                                <div className="invoice-badge">
                                    <span className="stat-label">رقم الفاتورة:</span>
                                    <input
                                        type="text"
                                        id="invoice-number"
                                        value={invoiceNumber}
                                        readOnly
                                        className="minimal-input"
                                    />
                                </div>
                            </div>
                            <form
                                id="invoice-form"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    addItemToInvoice();
                                }}
                            >
                                <div className="form-group">
                                    <label htmlFor="service-select">اختر الخدمة *</label>
                                    <SearchableSelect
                                        id="service-select"
                                        options={serviceOptions}
                                        value={selectedService?.id || null}
                                        onChange={handleServiceSelect}
                                        placeholder="ابحث عن خدمة..."
                                        required
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <NumberInput
                                            id="item-quantity"
                                            label="الكمية *"
                                            min={1}
                                            value={quantity}
                                            onChange={(val) => setQuantity(val)}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <NumberInput
                                            id="item-unit-price"
                                            label="سعر الوحدة *"
                                            min={0}
                                            step={0.01}
                                            value={unitPrice}
                                            onChange={(val) => setUnitPrice(val)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="summary-stat-box">
                                    <div className="stat-item">
                                        <span className="stat-label">المجموع الفرعي</span>
                                        <span id="item-subtotal" className="stat-value highlight">
                                            {formatCurrency(subtotal)}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        className="btn btn-primary btn-add"
                                        onClick={addItemToInvoice}
                                        data-icon="plus"
                                    >
                                        إضافة للفاتورة
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        /* Credit mode: side-panel with input + customer cards */
                        <div className="side-panel">
                            <div className="sales-card compact animate-slide">
                                <div className="card-header-flex">
                                    <h3>إضافة خدمات</h3>
                                    <div className="invoice-badge">
                                        <span className="stat-label">رقم الفاتورة:</span>
                                        <input
                                            type="text"
                                            id="invoice-number"
                                            value={invoiceNumber}
                                            readOnly
                                            className="minimal-input"
                                        />
                                    </div>
                                </div>

                                <form
                                    id="invoice-form"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        addItemToInvoice();
                                    }}
                                >
                                    <div className="form-group">
                                        <label htmlFor="service-select">اختر الخدمة *</label>
                                        <SearchableSelect
                                            id="service-select"
                                            options={serviceOptions}
                                            value={selectedService?.id || null}
                                            onChange={handleServiceSelect}
                                            placeholder="ابحث عن خدمة..."
                                            required
                                        />
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <NumberInput
                                                id="item-quantity"
                                                label="الكمية *"
                                                min={1}
                                                value={quantity}
                                                onChange={(val) => setQuantity(val)}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <NumberInput
                                                id="item-unit-price"
                                                label="سعر الوحدة *"
                                                min={0}
                                                step={0.01}
                                                value={unitPrice}
                                                onChange={(val) => setUnitPrice(val)}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="summary-stat-box">
                                        <div className="stat-item">
                                            <span className="stat-label">المجموع الفرعي</span>
                                            <span id="item-subtotal" className="stat-value highlight">
                                                {formatCurrency(subtotal)}
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            className="btn btn-primary btn-add"
                                            onClick={addItemToInvoice}
                                            data-icon="plus"
                                        >
                                            إضافة
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* ── Right panel: Items + Summary ── */}
                    {isCash ? (
                        <div className="sales-card animate-slide" style={{ animationDelay: "0.1s" }}>
                            <h3>عناصر الفاتورة الحالية</h3>
                            <div className="current-invoice-table" style={{ width: "100%", overflowX: "auto" }}>
                                <Table
                                    columns={currentInvoiceColumns}
                                    data={invoiceItems}
                                    keyExtractor={(_, index) => index}
                                    emptyMessage="لا توجد عناصر مضافة"
                                />
                            </div>

                            <div className="invoice-adjustments">
                                <div className="discount-section">
                                    <div className="form-group" style={{ marginBottom: 0, flex: "1 1 200px", minWidth: "0" }}>
                                        <NumberInput
                                            id="invoice-discount"
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
                                    <div
                                        className="summary-stat animate-fade"
                                        style={{
                                            marginRight: "auto",
                                            borderRight: "1px solid var(--border-color)",
                                            paddingRight: "1.5rem",
                                        }}
                                    >
                                        <span className="stat-label">إجمالي الخصم</span>
                                        <span className="stat-value text-danger" style={{ fontSize: "1.1rem" }}>
                                            -{formatCurrency(calculatedDiscount())}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {renderSummaryBar()}
                        </div>
                    ) : (
                        <div className="side-panel" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                            {/* Customer card */}
                            <div className="sales-card compact animate-slide">
                                <h3>بيانات العميل</h3>
                                <div className="form-row" style={{ marginTop: "1rem" }}>
                                    <div className="form-group">
                                        <label htmlFor="customer-select">اختر العميل *</label>
                                        <SearchableSelect
                                            id="customer-select"
                                            options={customerOptions}
                                            value={selectedCustomer?.id || null}
                                            onChange={handleCustomerSelect}
                                            onSearch={(term) => setCustomerSearchTerm(term)}
                                            placeholder="ابحث عن عميل..."
                                            required
                                            noResultsText={
                                                customerSearchTerm.length < 2
                                                    ? "اكتب حرفين على الأقل للبحث"
                                                    : "لا يوجد عملاء"
                                            }
                                        />
                                    </div>
                                    <div className="form-group">
                                        <NumberInput
                                            id="amount-paid"
                                            label="المبلغ المدفوع (نقدًا)"
                                            min={0}
                                            step={0.01}
                                            value={amountPaid}
                                            onChange={(val) => setAmountPaid(val)}
                                        />
                                    </div>
                                </div>
                                <small style={{ color: "var(--text-light)", display: "block" }}>
                                    المبلغ الذي سيسدده العميل حالياً من قيمة الفاتورة
                                </small>
                            </div>

                            {/* Invoice items + summary */}
                            <div className="sales-card animate-slide" style={{ animationDelay: "0.1s" }}>
                                <h3>عناصر الفاتورة الحالية</h3>
                                <div className="current-invoice-table" style={{ width: "100%", overflowX: "auto" }}>
                                    <Table
                                        columns={currentInvoiceColumns}
                                        data={invoiceItems}
                                        keyExtractor={(_, index) => index}
                                        emptyMessage="لا توجد عناصر مضافة"
                                    />
                                </div>

                                <div className="invoice-adjustments">
                                    <div className="discount-section">
                                        <div
                                            className="form-group"
                                            style={{ marginBottom: 0, flex: "1 1 200px", minWidth: "0" }}
                                        >
                                            <NumberInput
                                                id="invoice-discount"
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
                                        <div
                                            className="summary-stat animate-fade"
                                            style={{
                                                marginRight: "auto",
                                                borderRight: "1px solid var(--border-color)",
                                                paddingRight: "1.5rem",
                                            }}
                                        >
                                            <span className="stat-label">إجمالي الخصم</span>
                                            <span className="stat-value text-danger" style={{ fontSize: "1.1rem" }}>
                                                -{formatCurrency(calculatedDiscount())}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {renderSummaryBar()}
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Bottom: Invoice History ── */}
                <div className="sales-card animate-slide" style={{ animationDelay: "0.2s" }}>
                    <h3>سجل الفواتير السابقة</h3>
                    <div className="table-container">
                        <div className="table-wrapper">
                            <SelectableInvoiceTable
                                invoices={invoices}
                                columns={invoiceColumns}
                                keyExtractor={(item) => item.id}
                                emptyMessage="لا توجد فواتير سابقة"
                                isLoading={isLoading}
                                pagination={{
                                    currentPage,
                                    totalPages,
                                    onPageChange: loadInvoices,
                                }}
                                getInvoiceItems={getInvoiceItemsForTable}
                                onSelectionChange={handleReturnSelection}
                                onSearch={() => { }}
                                openReturnDialog={openReturnDialog}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Sales Return Dialog ── */}
            <SalesReturnDialog
                isOpen={returnDialog}
                onClose={() => setReturnDialog(false)}
                selectedItems={selectedReturnItems}
                invoicesMap={invoicesMap}
                onConfirmReturn={handleConfirmReturn}
                onSuccess={() => {
                    setReturnDialog(false);
                    setSelectedReturnItems([]);
                    loadInvoices(currentPage);
                }}
            />

            {/* ── View Invoice Dialog ── */}
            <Dialog isOpen={viewDialog} onClose={() => setViewDialog(false)} title="تفاصيل الفاتورة">
                {selectedInvoice && (
                    <div id="view-dialog-body">
                        <div
                            className="invoice-details-header"
                            style={{
                                marginBottom: "2rem",
                                borderBottom: "2px solid var(--border-color)",
                                paddingBottom: "1rem",
                            }}
                        >
                            <div className="form-row">
                                <div className="summary-stat">
                                    <span className="stat-label">رقم الفاتورة</span>
                                    <span className="stat-value">{selectedInvoice.invoice_number}</span>
                                </div>
                                <div className="summary-stat">
                                    <span className="stat-label">التاريخ</span>
                                    <span className="stat-value">{formatDateTime(selectedInvoice.created_at)}</span>
                                </div>
                                <div className="summary-stat">
                                    <span className="stat-label">نوع الدفع</span>
                                    <span className="stat-value">
                                        <span className={`badge ${isCash ? "badge-success" : "badge-warning"}`}>
                                            {isCash ? "نقدي" : "آجل (ذمم)"}
                                        </span>
                                    </span>
                                </div>
                            </div>

                            {!isCash && selectedInvoice.customer_name && (
                                <div
                                    className="form-row"
                                    style={{
                                        marginTop: "1rem",
                                        background: "var(--surface-hover)",
                                        padding: "1rem",
                                        borderRadius: "var(--radius-md)",
                                    }}
                                >
                                    <div className="summary-stat">
                                        <span className="stat-label">العميل</span>
                                        <span className="stat-value">{selectedInvoice.customer_name}</span>
                                    </div>
                                    {selectedInvoice.customer_phone && (
                                        <div className="summary-stat">
                                            <span className="stat-label">الهاتف</span>
                                            <span className="stat-value">{selectedInvoice.customer_phone}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {!isCash && (
                                <div className="form-row" style={{ marginTop: "1rem" }}>
                                    <div className="summary-stat">
                                        <span className="stat-label">المبلغ المدفوع</span>
                                        <span className="stat-value" style={{ color: "var(--success-color)" }}>
                                            {formatCurrency(selectedInvoice.amount_paid || 0)}
                                        </span>
                                    </div>
                                    <div className="summary-stat">
                                        <span className="stat-label">المبلغ المتبقي</span>
                                        <span
                                            className="stat-value"
                                            style={{ color: "var(--danger-color)", fontWeight: 700 }}
                                        >
                                            {formatCurrency(
                                                selectedInvoice.total_amount - (selectedInvoice.amount_paid || 0)
                                            )}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="invoice-items-minimal">
                            <h4 style={{ marginBottom: "1rem" }}>الخدمات المباعة:</h4>
                            {selectedInvoice.items?.map((item, index) => (
                                <div
                                    key={index}
                                    className="item-row-minimal"
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        padding: "0.75rem",
                                        borderBottom: "1px solid var(--border-color)",
                                        opacity: item.quantity === 0 ? 0.6 : 1,
                                    }}
                                >
                                    <div className="item-info-pkg">
                                        <span
                                            className="item-name-pkg"
                                            style={{
                                                display: "block",
                                                fontWeight: "600",
                                                textDecoration: item.quantity === 0 ? "line-through" : "none",
                                            }}
                                        >
                                            {item.service_name || item.product_name}
                                        </span>
                                        <span
                                            className="item-meta-pkg"
                                            style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}
                                        >
                                            سعر الوحدة: {formatCurrency(item.unit_price)}
                                            {item.returned_quantity && item.returned_quantity > 0 && (
                                                <span
                                                    style={{
                                                        color:
                                                            item.quantity === 0
                                                                ? "var(--danger-color)"
                                                                : "var(--warning-color)",
                                                        marginRight: "8px",
                                                    }}
                                                >
                                                    {item.quantity === 0
                                                        ? "(مسترجع بالكامل)"
                                                        : `(مسترجع: ${item.returned_quantity})`}
                                                </span>
                                            )}
                                        </span>
                                    </div>
                                    <div className="item-info-pkg" style={{ textAlign: "left" }}>
                                        <span
                                            className="item-name-pkg"
                                            style={{ display: "block", fontWeight: "600" }}
                                        >
                                            {formatCurrency(item.unit_price * item.quantity)}
                                        </span>
                                        <span
                                            className="item-meta-pkg"
                                            style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}
                                        >
                                            {item.quantity}{" "}
                                            {item.quantity !== item.original_quantity &&
                                                `(من ${item.original_quantity})`}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div
                            className="sales-summary-bar"
                            style={{ marginTop: "2rem", background: "var(--grad-primary)", color: "white" }}
                        >
                            <div className="summary-stat">
                                <span className="stat-label" style={{ color: "rgba(255,255,255,0.8)" }}>
                                    عدد الأصناف
                                </span>
                                <span className="stat-value" style={{ color: "white", fontSize: "1.2rem" }}>
                                    {selectedInvoice.item_count || selectedInvoice.items?.length || 0}
                                </span>
                            </div>
                            <div className="summary-stat">
                                <span className="stat-label" style={{ color: "rgba(255,255,255,0.8)" }}>
                                    المجموع الفرعي
                                </span>
                                <span className="stat-value" style={{ color: "white", fontSize: "1.2rem" }}>
                                    {formatCurrency(selectedInvoice.subtotal || 0)}
                                </span>
                            </div>
                            {selectedInvoice.discount_amount && selectedInvoice.discount_amount > 0 && (
                                <div className="summary-stat">
                                    <span className="stat-label" style={{ color: "rgba(255,255,255,0.8)" }}>
                                        الخصم
                                    </span>
                                    <span className="stat-value" style={{ color: "#ffccd5", fontSize: "1.2rem" }}>
                                        -{formatCurrency(selectedInvoice.discount_amount)}
                                    </span>
                                </div>
                            )}
                            <div className="summary-stat">
                                <span className="stat-label" style={{ color: "rgba(255,255,255,0.8)" }}>
                                    الإجمالي
                                </span>
                                <span className="stat-value highlight" style={{ color: "white" }}>
                                    {formatCurrency(selectedInvoice.total_amount)}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </Dialog>

            {/* ── Confirm Delete ── */}
            <ConfirmDialog
                isOpen={confirmDialog}
                onClose={() => {
                    setConfirmDialog(false);
                    setDeleteInvoiceId(null);
                }}
                onConfirm={deleteInvoice}
                title="تأكيد الحذف"
                message="هل أنت متأكد من حذف هذه الفاتورة؟"
                confirmText="نعم، متابعة"
                confirmVariant="primary"
            />
        </MainLayout>
    );

    /* ──────────────────────────────────────────
       Helper renders
    ────────────────────────────────────────── */

    function renderSummaryBar() {
        return (
            <div className="sales-summary-bar">
                <div className="summary-stat">
                    <span className="stat-label">مجموع الخدمات</span>
                    <span className="stat-value">{formatCurrency(baseItemsTotal)}</span>
                </div>

                {governmentFees.map((fee) => {
                    const feeAmount = invoiceItems.reduce((sum, item) => {
                        const base = calculateBasePrice(item.unit_price);
                        const variable = (base * (Number(fee.percentage) || 0)) / 100;
                        const fixed = Number(fee.fixed_amount) || 0;
                        return sum + (variable + fixed) * item.quantity;
                    }, 0);
                    if (feeAmount <= 0) return null;
                    return (
                        <div className="summary-stat" key={fee.id}>
                            <span className="stat-label">{fee.name} (التزام)</span>
                            <span className="stat-value">{formatCurrency(feeAmount)}</span>
                        </div>
                    );
                })}

                {totalVAT > 0 && (
                    <div className="summary-stat">
                        <span className="stat-label">
                            ضريبة القيمة المضافة ({(vatRate * 100).toFixed(0)}%)
                        </span>
                        <span className="stat-value">{formatCurrency(totalVAT)}</span>
                    </div>
                )}

                <div className="summary-stat">
                    <span className="stat-label">{isCash ? "إجمالي الفاتورة" : "المبلغ الإجمالي"}</span>
                    <span id="total-amount" className="stat-value highlight">
                        {formatCurrency(finalTotal)}
                    </span>
                </div>

                <button
                    type="button"
                    className="btn btn-primary btn-add"
                    onClick={finishInvoice}
                    id="finish-btn"
                    data-icon="check"
                    disabled={invoiceItems.length === 0}
                >
                    {isCash ? "إنهاء الفاتورة" : "حفظ الفاتورة"}
                </button>
            </div>
        );
    }
}
