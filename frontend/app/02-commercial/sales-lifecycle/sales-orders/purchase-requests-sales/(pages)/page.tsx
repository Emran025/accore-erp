"use client";

import { useI18n } from "@/lib/i18n";
import { MainLayout, PageSubHeader } from "@/components/layout";
import { Button, ConfirmDialog, showToast } from "@/components/ui";
import { fetchAPI } from "@/lib/api";
import { Permission, User, canAccess, checkAuth } from "@/lib/auth";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { useCallback, useEffect, useState } from "react";
import { AddRequestDialog } from "../components/AddRequestDialog";
import { RequestsTable } from "../components/RequestsTable";
import { Product, PurchaseRequest } from "@/types";

export default function PurchaseRequestsPage() {
    const { t: i18n } = useI18n();
    const [user, setUser] = useState<User | null>(null);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [requests, setRequests] = useState<PurchaseRequest[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Dialog states
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isAutoOpen, setIsAutoOpen] = useState(false);
    const [isAutoGenerating, setIsAutoGenerating] = useState(false);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [reqRes, prodRes] = await Promise.all([
                fetchAPI(API_ENDPOINTS.COMMERCIAL.PROCUREMENT.REQUESTS),
                fetchAPI(`${API_ENDPOINTS.SUPPLY_CHAIN.PRODUCTS}?limit=1000`),
            ]);
            setRequests((reqRes.data as PurchaseRequest[]) || []);
            setProducts((prodRes.data as Product[]) || []);
        } catch (error) {
            console.error(i18n.catalog["commercial.purchaseRequestsSales.failedLoadRequests"], error);
            showToast(i18n.catalog["commercial.purchaseRequestsSales.errorLoadingOrders"], "error");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const init = async () => {
            const authState = await checkAuth();
            if (!authState.isAuthenticated) return;
            setUser(authState.user);
            setPermissions(authState.permissions);
            await loadData();
        };
        init();
    }, [loadData]);

    const handleCreateRequest = async (data: { product_id: string; product_name: string; quantity: number; notes: string }) => {
        try {
            await fetchAPI(API_ENDPOINTS.COMMERCIAL.PROCUREMENT.REQUESTS, {
                method: "POST",
                body: JSON.stringify(data),
            });
            showToast(i18n.catalog["commercial.purchaseRequestsSales.orderCreatedSuccessfully"], "success");
            loadData();
        } catch (error) {
            console.error(i18n.catalog["commercial.purchaseRequestsSales.failedCreateRequest"], error);
            showToast(i18n.catalog["commercial.purchaseRequestsSales.errorOccurredDuringCreation"], "error");
        }
    };

    const handleUpdateStatus = async (request: PurchaseRequest, newStatus: string) => {
        try {
            await fetchAPI(API_ENDPOINTS.COMMERCIAL.PROCUREMENT.REQUESTS, {
                method: "PUT",
                body: JSON.stringify({ id: request.id, status: newStatus }),
            });
            showToast(i18n.catalog["commercial.purchaseRequestsSales.statusUpdatedSuccessfully"], "success");
            loadData();
        } catch (error) {
            console.error(i18n.catalog["commercial.purchaseRequestsSales.failedUpdateStatus"], error);
            showToast(i18n.catalog["commercial.purchaseRequestsSales.errorOccurredWhileUpdating"], "error");
        }
    };

    const handleAutoGenerate = async () => {
        setIsAutoGenerating(true);
        try {
            const response = await fetchAPI(API_ENDPOINTS.COMMERCIAL.PROCUREMENT.REQUESTS + "/auto-generate", {
                method: "POST",
            });

            // The backend merges the response object if it's associative
            const message = (response.message as string) || i18n.catalog["commercial.purchaseRequestsSales.operationCompletedSuccessfully"];
            const generatedCount = (response.generated_count as number) || 0;

            showToast(message, "success");
            setIsAutoOpen(false);
            if (generatedCount > 0) {
                await loadData();
            }
        } catch (error) {
            console.error(i18n.catalog["commercial.purchaseRequestsSales.failedAutoGenerateRequests"], error);
            showToast(i18n.catalog["commercial.purchaseRequestsSales.errorOccurredDuringAutoGeneration"], "error");
        } finally {
            setIsAutoGenerating(false);
        }
    };

    return (
        <MainLayout >

            <div className="sales-card animate-fade">
                <PageSubHeader
                    user={user}
                    actions={
                        <>
                            {canAccess(permissions, "purchases", "create") && (
                                <Button
                                    variant="secondary"
                                    icon="refresh"
                                    onClick={() => setIsAutoOpen(true)}
                                >
                                    {i18n.catalog["commercial.purchaseRequestsSales.generateShortageRequests"]}</Button>
                            )}
                            {canAccess(permissions, "purchases", "create") && (
                                <Button
                                    variant="primary"
                                    icon="plus"
                                    onClick={() => setIsAddOpen(true)}
                                >
                                    {i18n.catalog["common.general.newRequest"]}</Button>
                            )}
                        </>
                    }
                />
                <RequestsTable
                    requests={requests}
                    isLoading={isLoading}
                    permissions={permissions}
                    onEditStatus={handleUpdateStatus}
                />
            </div>

            <AddRequestDialog
                isOpen={isAddOpen}
                onClose={() => setIsAddOpen(false)}
                onSave={handleCreateRequest}
                products={products}
            />

            <ConfirmDialog
                isOpen={isAutoOpen}
                onClose={() => setIsAutoOpen(false)}
                title={i18n.catalog["commercial.purchaseRequestsSales.automaticOrderGeneration"]}
                message={i18n.catalog["commercial.purchaseRequestsSales.areYouSureYouWantReviewStockShortages"]}
                confirmText={isAutoGenerating ? i18n.catalog["commercial.purchaseRequestsSales.generating"] : i18n.catalog["commercial.purchaseRequestsSales.yesGenerate"]}
                cancelText={i18n.catalog["common.general.cancel"]}
                onConfirm={handleAutoGenerate}
            />
        </MainLayout>
    );
}
