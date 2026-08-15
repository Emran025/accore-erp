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
            console.error(i18n.catalog["text_e9e02927e5e3"], error);
            showToast(i18n.catalog["text_af0f2422c455"], "error");
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
            showToast(i18n.catalog["text_d22999c3f617"], "success");
            loadData();
        } catch (error) {
            console.error(i18n.catalog["text_19f271dd547d"], error);
            showToast(i18n.catalog["text_d06feffda539"], "error");
        }
    };

    const handleUpdateStatus = async (request: PurchaseRequest, newStatus: string) => {
        try {
            await fetchAPI(API_ENDPOINTS.COMMERCIAL.PROCUREMENT.REQUESTS, {
                method: "PUT",
                body: JSON.stringify({ id: request.id, status: newStatus }),
            });
            showToast(i18n.catalog["text_5ef9a2cd787f"], "success");
            loadData();
        } catch (error) {
            console.error(i18n.catalog["text_9e93be01c172"], error);
            showToast(i18n.catalog["text_7863dda1b923"], "error");
        }
    };

    const handleAutoGenerate = async () => {
        setIsAutoGenerating(true);
        try {
            const response = await fetchAPI(API_ENDPOINTS.COMMERCIAL.PROCUREMENT.REQUESTS + "/auto-generate", {
                method: "POST",
            });

            // The backend merges the response object if it's associative
            const message = (response.message as string) || i18n.catalog["text_4d6cab40cfc6"];
            const generatedCount = (response.generated_count as number) || 0;

            showToast(message, "success");
            setIsAutoOpen(false);
            if (generatedCount > 0) {
                await loadData();
            }
        } catch (error) {
            console.error(i18n.catalog["text_d2bd02e1ed53"], error);
            showToast(i18n.catalog["text_eaed314f8aba"], "error");
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
                                    {i18n.catalog["text_028151e4e83b"]}</Button>
                            )}
                            {canAccess(permissions, "purchases", "create") && (
                                <Button
                                    variant="primary"
                                    icon="plus"
                                    onClick={() => setIsAddOpen(true)}
                                >
                                    {i18n.catalog["text_6d43782b2c9f"]}</Button>
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
                title={i18n.catalog["text_ee5ba976cd58"]}
                message={i18n.catalog["text_a65240ba0920"]}
                confirmText={isAutoGenerating ? i18n.catalog["text_925f385326f2"] : i18n.catalog["text_086458c38f16"]}
                cancelText={i18n.catalog["text_9a30dc2a96b8"]}
                onConfirm={handleAutoGenerate}
            />
        </MainLayout>
    );
}
