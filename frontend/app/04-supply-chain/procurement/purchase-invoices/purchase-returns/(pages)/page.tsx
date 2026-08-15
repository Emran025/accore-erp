"use client";

import { useI18n, catalogText } from "@/lib/i18n";
import { MainLayout } from "@/components/layout";
import {
    ActionButtons,
    Column,
    Dialog,
    InvoiceTableColumn,
    PurchaseReturnDialog,
    SearchableSelect,
    SelectableInvoice,
    SelectableInvoiceTable,
    SelectedItem,
    SelectableInvoiceItem as UiInvoiceItem,
    showAlert,
    showToast,
} from "@/components/ui";
import { fetchAPI } from "@/lib/api";
import { checkAuth, getStoredPermissions, getStoredUser } from "@/lib/auth";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { useCallback, useEffect, useState } from "react";

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
    payment_type?: string;
    purchase_date?: string;
    created_at?: string;
    unit_type?: string;
    notes?: string;
    expiry_date?: string;
}

export default function PurchaseReturnsPage() {
    const { t: i18n } = useI18n();
    const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(true);

    const [returnDialog, setReturnDialog] = useState(false);
    const [selectedReturnItems, setSelectedReturnItems] = useState<SelectedItem[]>([]);
    const [purchasesMap, setPurchasesMap] = useState<Record<number, SelectableInvoice>>({});
    const [selectedPurchase, setSelectedPurchase] = useState<PurchaseRecord | null>(null);
    const [viewDialog, setViewDialog] = useState(false);

    const itemsPerPage = 20;

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

    useEffect(() => {
        const init = async () => {
            const ok = await checkAuth();
            if (!ok) return;
            await loadPurchases();
        };
        init();
    }, [loadPurchases]);

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

    const viewDetail = async (id: number) => {
        try {
            const response = await fetchAPI(`${API_ENDPOINTS.COMMERCIAL.PROCUREMENT.RETURNS.SHOW}?id=${id}`);
            if (response.success && response.data) setSelectedPurchase(response.data as PurchaseRecord);
            else setSelectedPurchase(purchases.find((p) => p.id === id) || null);
        } catch {
            setSelectedPurchase(purchases.find((p) => p.id === id) || null);
        }
        setViewDialog(true);
    };

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
                    actions={[{ icon: "view", title: i18n.catalog["text_3824e18ca83b"], variant: "view", onClick: () => viewDetail(item.id) }]}
                />
            ),
        },
    ];

    return (
        <MainLayout>
            <div id="alert-container"></div>
            <div className="sales-layout">
                <div className="sales-card animate-slide">
                    <div className="card-header-flex">
                        <h3>{i18n.catalog["text_0ba88658969c"]}</h3>
                        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                            {i18n.catalog["text_65043270bc33"]}</p>
                    </div>
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
                            onSearch={() => {}}
                            openReturnDialog={openReturnDialog}
                        />
                    </div>
                </div>
            </div>

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
                }}
            />

            <Dialog isOpen={viewDialog} onClose={() => setViewDialog(false)} title={i18n.catalog["text_8f68e7eb79e2"]}>
                {selectedPurchase && (
                    <div>
                        <div className="form-row">
                            <div className="summary-stat">
                                <span className="stat-label">{i18n.catalog["text_a79e304d96a1"]}</span>
                                <span className="stat-value">{selectedPurchase.product_name || "-"}</span>
                            </div>
                            <div className="summary-stat">
                                <span className="stat-label">{i18n.catalog["text_935e21853946"]}</span>
                                <span className="stat-value">
                                    {selectedPurchase.quantity} {selectedPurchase.unit_type === "main" ? i18n.catalog["text_cc7593424dc5"] : i18n.catalog["text_d400a30ad5f3"]}
                                </span>
                            </div>
                        </div>
                        <div className="form-row" style={{ marginTop: "1rem" }}>
                            <div className="summary-stat">
                                <span className="stat-label">{i18n.catalog["text_4680c31a727f"]}</span>
                                <span className="stat-value">{selectedPurchase.supplier_name || selectedPurchase.supplier || "-"}</span>
                            </div>
                            <div className="summary-stat">
                                <span className="stat-label">{i18n.catalog["text_d90c384199ac"]}</span>
                                <span className="stat-value">{formatDate(selectedPurchase.purchase_date || selectedPurchase.created_at || "")}</span>
                            </div>
                        </div>
                        <div className="sales-summary-bar" style={{ marginTop: "1.5rem", background: "var(--grad-primary)", color: "white" }}>
                            <div className="summary-stat">
                                <span className="stat-label" style={{ color: "rgba(255,255,255,0.8)" }}>{i18n.catalog["text_baed6e999960"]}</span>
                                <span className="stat-value highlight" style={{ color: "white" }}>
                                    {formatCurrency(selectedPurchase.invoice_price || selectedPurchase.total_price || 0)}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </Dialog>
        </MainLayout>
    );
}

