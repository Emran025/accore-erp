"use client";

import { useI18n, catalogText } from "@/lib/i18n";
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
    const { t: i18n } = useI18n();
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
            console.error(i18n.catalog["common.general.failedLoadTaxEngineLogic"], e);
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
                showAlert("alert-container", i18n.catalog["common.general.failedLoadRecord"], "error");
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
                console.error(i18n.catalog["ui.servicesales.failedLoadVatRate"], e);
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
            showAlert("alert-container", i18n.catalog["ui.servicesales.pleaseSelectServiceFirst"], "error");
            return;
        }
        const qty = parseNumber(quantity);
        const price = parseNumber(unitPrice);
        if (qty <= 0) {
            showAlert("alert-container", i18n.catalog["ui.servicesales.quantityMustBeGreaterThanZero"], "error");
            return;
        }

        const newItem: InvoiceItem = {
            service_id: selectedService.id,
            service_name: selectedService.name,
            display_name: catalogText(i18n, "common.general.message.alternative7", { value0: selectedService.name, value1: qty }),
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
            showAlert("alert-container", i18n.catalog["common.general.invoiceIsEmpty"], "error");
            return;
        }
        if (!isCash && !selectedCustomer) {
            showAlert("alert-container", i18n.catalog["common.general.pleaseSelectCustomerDeferredInvoice"], "error");
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
                    catalogText(i18n, "ui.servicesales.successTotal", { value0: formatCurrency(finalTotal) }),
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
                showAlert("alert-container", response.message || i18n.catalog["common.general.failedSaveInvoice"], "error");
                if (
                    response.message?.includes("UNIQUE") ||
                    response.message?.includes("exists") ||
                    response.message?.includes(i18n.catalog["common.general.available.alternative3"])
                ) {
                    generateInvoiceNumber();
                }
            }
        } catch (error) {
            const msg = error instanceof Error ? error.message : i18n.catalog["common.general.unknownError"];
            showAlert("alert-container", i18n.catalog["common.general.error"] + msg, "error");
            if (msg.includes("UNIQUE") || msg.includes("exists") || msg.includes(i18n.catalog["common.general.available.alternative3"])) {
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
            showAlert("alert-container", i18n.catalog["common.general.errorFetchingDetails"], "error");
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
                showAlert("alert-container", i18n.catalog["common.general.deletedSuccessfully"], "success");
                await loadInvoices();
            } else {
                showAlert("alert-container", response.message || i18n.catalog["common.general.deletionFailed"], "error");
            }
        } catch {
            showAlert("alert-container", i18n.catalog["common.general.deletionError"], "error");
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
            showToast(i18n.catalog["common.general.pleaseSelectItemsReturnFirst"], "warning");
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
                showToast(i18n.catalog["common.general.failedLoadInvoiceData"], "error");
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
            if (!response.success) throw new Error(response.message || i18n.catalog["common.general.failedRegisterReturn"]);
        }
        showToast(i18n.catalog["common.general.returnRecordedSuccessfully"], "success");
    };

    /* ──────────────────────────────────────────
       Columns
    ────────────────────────────────────────── */

    const currentInvoiceColumns: Column<InvoiceItem>[] = [
        { key: "display_name", header: i18n.catalog["common.general.service.alternative2"], dataLabel: i18n.catalog["common.general.service.alternative2"] },
        {
            key: "quantity",
            header: i18n.catalog["common.general.quantity.alternative3"],
            dataLabel: i18n.catalog["common.general.quantity.alternative3"],
            render: (item) => `${item.quantity}`,
        },
        {
            key: "unit_price",
            header: i18n.catalog["common.general.price"],
            dataLabel: i18n.catalog["common.general.price"],
            render: (item) => formatCurrency(item.unit_price),
        },
        {
            key: "subtotal",
            header: i18n.catalog["common.general.total.alternative2"],
            dataLabel: i18n.catalog["common.general.total.alternative2"],
            render: (item) => formatCurrency(item.subtotal),
        },
        {
            key: "actions",
            header: "",
            dataLabel: i18n.catalog["common.general.actions"],
            render: (_, index) => (
                <ActionButtons
                actions={[
                    {
                    icon: "trash",
                    title: i18n.catalog["common.general.delete"],
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
            header: i18n.catalog["common.general.invoiceNumber.alternative2"],
            dataLabel: i18n.catalog["common.general.invoiceNumber.alternative2"],
            render: (item) => <strong>{item.invoice_number}</strong>,
        },
        {
            key: "total_amount",
            header: i18n.catalog["common.general.totalAmount"],
            dataLabel: i18n.catalog["common.general.totalAmount"],
            render: (item) => formatCurrency(item.total_amount),
        },
        ...(isCash
            ? []
            : [
                {
                    key: "amount_paid" as keyof Invoice,
                    header: i18n.catalog["common.general.paidRemaining"],
                    dataLabel: i18n.catalog["common.general.paidRemaining"],
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
                    header: i18n.catalog["common.general.customer"],
                    render: (item: Invoice) => item.customer_name || "—",
                } as InvoiceTableColumn<Invoice>,
            ]),
        {
            key: "created_at",
            header: i18n.catalog["common.general.dateTime"],
            dataLabel: i18n.catalog["common.general.dateTime"],
            render: (item) => formatDateTime(item.created_at),
        },
        {
            key: "actions",
            header: i18n.catalog["common.general.actions"],
            dataLabel: i18n.catalog["common.general.actions"],
            render: (item) => (
                <ActionButtons
                    actions={[
                    {
                        icon: "view",
                        title: i18n.catalog["common.general.view"],
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
                                <h3>{i18n.catalog["common.general.addServices"]}</h3>
                                <div className="invoice-badge">
                                    <span className="stat-label">{i18n.catalog["common.general.invoiceNumber"]}</span>
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
                                    <label htmlFor="service-select">{i18n.catalog["common.general.selectService"]}</label>
                                    <SearchableSelect
                                        id="service-select"
                                        options={serviceOptions}
                                        value={selectedService?.id || null}
                                        onChange={handleServiceSelect}
                                        placeholder={i18n.catalog["common.general.searchService"]}
                                        required
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <NumberInput
                                            id="item-quantity"
                                            label={i18n.catalog["common.general.quantity.alternative2"]}
                                            min={1}
                                            value={quantity}
                                            onChange={(val) => setQuantity(val)}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <NumberInput
                                            id="item-unit-price"
                                            label={i18n.catalog["common.general.unitPrice.alternative2"]}
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
                                        <span className="stat-label">{i18n.catalog["common.general.subtotal"]}</span>
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
                                        {i18n.catalog["common.general.addInvoice"]}</button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        /* Credit mode: side-panel with input + customer cards */
                        <div className="side-panel">
                            <div className="sales-card compact animate-slide">
                                <div className="card-header-flex">
                                    <h3>{i18n.catalog["common.general.addServices"]}</h3>
                                    <div className="invoice-badge">
                                        <span className="stat-label">{i18n.catalog["common.general.invoiceNumber"]}</span>
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
                                        <label htmlFor="service-select">{i18n.catalog["common.general.selectService"]}</label>
                                        <SearchableSelect
                                            id="service-select"
                                            options={serviceOptions}
                                            value={selectedService?.id || null}
                                            onChange={handleServiceSelect}
                                            placeholder={i18n.catalog["common.general.searchService"]}
                                            required
                                        />
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <NumberInput
                                                id="item-quantity"
                                                label={i18n.catalog["common.general.quantity.alternative2"]}
                                                min={1}
                                                value={quantity}
                                                onChange={(val) => setQuantity(val)}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <NumberInput
                                                id="item-unit-price"
                                                label={i18n.catalog["common.general.unitPrice.alternative2"]}
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
                                            <span className="stat-label">{i18n.catalog["common.general.subtotal"]}</span>
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
                                            {i18n.catalog["common.general.add"]}</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* ── Right panel: Items + Summary ── */}
                    {isCash ? (
                        <div className="sales-card animate-slide" style={{ animationDelay: "0.1s" }}>
                            <h3>{i18n.catalog["common.general.currentInvoiceItems"]}</h3>
                            <div className="current-invoice-table" style={{ width: "100%", overflowX: "auto" }}>
                                <Table
                                    columns={currentInvoiceColumns}
                                    data={invoiceItems}
                                    keyExtractor={(_, index) => index}
                                    emptyMessage={i18n.catalog["common.general.noItemsAdded"]}
                                />
                            </div>

                            <div className="invoice-adjustments">
                                <div className="discount-section">
                                    <div className="form-group" style={{ marginBottom: 0, flex: "1 1 200px", minWidth: "0" }}>
                                        <NumberInput
                                            id="invoice-discount"
                                            label={i18n.catalog["common.general.discountAmount"]}
                                            value={discountValue}
                                            onChange={(val) => setDiscountValue(val)}
                                            min={0}
                                            placeholder={i18n.catalog["common.general.message000"]}
                                        />
                                    </div>
                                    <SegmentedToggle
                                        label={i18n.catalog["common.general.discountType"]}
                                        value={discountType}
                                        onChange={(val) => setDiscountType(val as "fixed" | "percent")}
                                        options={[
                                            { value: "fixed", label: i18n.catalog["common.general.amount.alternative2"] },
                                            { value: "percent", label: i18n.catalog["common.general.percentage.alternative2"] },
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
                                        <span className="stat-label">{i18n.catalog["common.general.totalDiscount"]}</span>
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
                                <h3>{i18n.catalog["common.general.customerData"]}</h3>
                                <div className="form-row" style={{ marginTop: "1rem" }}>
                                    <div className="form-group">
                                        <label htmlFor="customer-select">{i18n.catalog["common.general.selectCustomer"]}</label>
                                        <SearchableSelect
                                            id="customer-select"
                                            options={customerOptions}
                                            value={selectedCustomer?.id || null}
                                            onChange={handleCustomerSelect}
                                            onSearch={(term) => setCustomerSearchTerm(term)}
                                            placeholder={i18n.catalog["common.general.searchClient"]}
                                            required
                                            noResultsText={
                                                customerSearchTerm.length < 2
                                                    ? i18n.catalog["common.general.typeLeastTwoCharactersSearch"]
                                                    : i18n.catalog["common.general.noCustomers"]
                                            }
                                        />
                                    </div>
                                    <div className="form-group">
                                        <NumberInput
                                            id="amount-paid"
                                            label={i18n.catalog["common.general.amountPaidCash"]}
                                            min={0}
                                            step={0.01}
                                            value={amountPaid}
                                            onChange={(val) => setAmountPaid(val)}
                                        />
                                    </div>
                                </div>
                                <small style={{ color: "var(--text-light)", display: "block" }}>
                                    {i18n.catalog["common.general.amountCustomerWillPayNowTowardInvoice"]}</small>
                            </div>

                            {/* Invoice items + summary */}
                            <div className="sales-card animate-slide" style={{ animationDelay: "0.1s" }}>
                                <h3>{i18n.catalog["common.general.currentInvoiceItems"]}</h3>
                                <div className="current-invoice-table" style={{ width: "100%", overflowX: "auto" }}>
                                    <Table
                                        columns={currentInvoiceColumns}
                                        data={invoiceItems}
                                        keyExtractor={(_, index) => index}
                                        emptyMessage={i18n.catalog["common.general.noItemsAdded"]}
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
                                                label={i18n.catalog["common.general.discountAmount"]}
                                                value={discountValue}
                                                onChange={(val) => setDiscountValue(val)}
                                                min={0}
                                                placeholder={i18n.catalog["common.general.message000"]}
                                            />
                                        </div>
                                        <SegmentedToggle
                                            label={i18n.catalog["common.general.discountType"]}
                                            value={discountType}
                                            onChange={(val) => setDiscountType(val as "fixed" | "percent")}
                                            options={[
                                                { value: "fixed", label: i18n.catalog["common.general.amount.alternative2"] },
                                                { value: "percent", label: i18n.catalog["common.general.percentage.alternative2"] },
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
                                            <span className="stat-label">{i18n.catalog["common.general.totalDiscount"]}</span>
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
                    <h3>{i18n.catalog["common.general.previousInvoiceRecords"]}</h3>
                    <div className="table-container">
                        <div className="table-wrapper">
                            <SelectableInvoiceTable
                                invoices={invoices}
                                columns={invoiceColumns}
                                keyExtractor={(item) => item.id}
                                emptyMessage={i18n.catalog["common.general.noPreviousInvoices"]}
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
            <Dialog isOpen={viewDialog} onClose={() => setViewDialog(false)} title={i18n.catalog["common.general.invoiceDetails"]}>
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
                                    <span className="stat-label">{i18n.catalog["common.general.invoiceNumber.alternative2"]}</span>
                                    <span className="stat-value">{selectedInvoice.invoice_number}</span>
                                </div>
                                <div className="summary-stat">
                                    <span className="stat-label">{i18n.catalog["common.general.date.alternative7"]}</span>
                                    <span className="stat-value">{formatDateTime(selectedInvoice.created_at)}</span>
                                </div>
                                <div className="summary-stat">
                                    <span className="stat-label">{i18n.catalog["common.general.paymentType.alternative2"]}</span>
                                    <span className="stat-value">
                                        <span className={`badge ${isCash ? "badge-success" : "badge-warning"}`}>
                                            {isCash ? i18n.catalog["common.general.cash"] : i18n.catalog["common.general.creditReceivables"]}
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
                                        <span className="stat-label">{i18n.catalog["common.general.customer"]}</span>
                                        <span className="stat-value">{selectedInvoice.customer_name}</span>
                                    </div>
                                    {selectedInvoice.customer_phone && (
                                        <div className="summary-stat">
                                            <span className="stat-label">{i18n.catalog["common.general.phone"]}</span>
                                            <span className="stat-value">{selectedInvoice.customer_phone}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {!isCash && (
                                <div className="form-row" style={{ marginTop: "1rem" }}>
                                    <div className="summary-stat">
                                        <span className="stat-label">{i18n.catalog["common.general.amountPaid.alternative2"]}</span>
                                        <span className="stat-value" style={{ color: "var(--success-color)" }}>
                                            {formatCurrency(selectedInvoice.amount_paid || 0)}
                                        </span>
                                    </div>
                                    <div className="summary-stat">
                                        <span className="stat-label">{i18n.catalog["common.general.remainingAmount"]}</span>
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
                            <h4 style={{ marginBottom: "1rem" }}>{i18n.catalog["ui.servicesales.servicesSold"]}</h4>
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
                                            {i18n.catalog["common.general.unitPrice"]}{formatCurrency(item.unit_price)}
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
                                                        ? i18n.catalog["common.general.fullyRefunded"]
                                                        : catalogText(i18n, "common.general.returned", { value0: item.returned_quantity })}
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
                                                catalogText(i18n, "common.general.message.alternative3", { value0: item.original_quantity })}
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
                                    {i18n.catalog["common.general.numberItems.alternative2"]}</span>
                                <span className="stat-value" style={{ color: "white", fontSize: "1.2rem" }}>
                                    {selectedInvoice.item_count || selectedInvoice.items?.length || 0}
                                </span>
                            </div>
                            <div className="summary-stat">
                                <span className="stat-label" style={{ color: "rgba(255,255,255,0.8)" }}>
                                    {i18n.catalog["common.general.subtotal"]}</span>
                                <span className="stat-value" style={{ color: "white", fontSize: "1.2rem" }}>
                                    {formatCurrency(selectedInvoice.subtotal || 0)}
                                </span>
                            </div>
                            {selectedInvoice.discount_amount && selectedInvoice.discount_amount > 0 && (
                                <div className="summary-stat">
                                    <span className="stat-label" style={{ color: "rgba(255,255,255,0.8)" }}>
                                        {i18n.catalog["common.general.discount"]}</span>
                                    <span className="stat-value" style={{ color: "#ffccd5", fontSize: "1.2rem" }}>
                                        -{formatCurrency(selectedInvoice.discount_amount)}
                                    </span>
                                </div>
                            )}
                            <div className="summary-stat">
                                <span className="stat-label" style={{ color: "rgba(255,255,255,0.8)" }}>
                                    {i18n.catalog["common.general.total.alternative3"]}</span>
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
                title={i18n.catalog["common.general.confirmDeletion"]}
                message={i18n.catalog["ui.servicesales.areYouSureYouWantDeleteThisInvoice"]}
                confirmText={i18n.catalog["common.general.yesContinue"]}
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
                    <span className="stat-label">{i18n.catalog["ui.servicesales.totalServices"]}</span>
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
                            <span className="stat-label">{fee.name} {i18n.catalog["common.general.liability"]}</span>
                            <span className="stat-value">{formatCurrency(feeAmount)}</span>
                        </div>
                    );
                })}

                {totalVAT > 0 && (
                    <div className="summary-stat">
                        <span className="stat-label">
                            {i18n.catalog["common.general.valueAddedTax"]}{(vatRate * 100).toFixed(0)}%)
                        </span>
                        <span className="stat-value">{formatCurrency(totalVAT)}</span>
                    </div>
                )}

                <div className="summary-stat">
                    <span className="stat-label">{isCash ? i18n.catalog["common.general.invoiceTotal"] : i18n.catalog["common.general.totalAmount"]}</span>
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
                    {isCash ? i18n.catalog["common.general.finalizeInvoice"] : i18n.catalog["common.general.saveInvoice"]}
                </button>
            </div>
        );
    }
}
