"use client";

import { useI18n, catalogText } from "@/lib/i18n";
import { MainLayout, PageSubHeader } from "@/components/layout";
import { ActionButtons, Button, Column, ConfirmDialog, Dialog, NumberInput, SearchableSelect, Table, showAlert } from "@/components/ui";
import { TextInput } from "@/components/ui/TextInput";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/select";
import { fetchAPI } from "@/lib/api";
import { Permission, User, canAccess, checkAuth, getStoredPermissions, getStoredUser } from "@/lib/auth";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatCurrency, formatDate, parseNumber } from "@/lib/utils";
import { useCallback, useEffect, useState } from "react";

interface Asset {
    id: number;
    name: string;
    purchase_value: number;
    purchase_date: string;
    depreciation_rate: number;
    status: "active" | "maintenance" | "disposed";
    description?: string;
    recorder_name?: string;
}

export default function AssetsPage() {
    const { t: i18n } = useI18n();
    const [user, setUser] = useState<User | null>(null);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [assets, setAssets] = useState<Asset[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Dialogs
    const [assetDialog, setAssetDialog] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState(false);
    const [deleteAssetId, setDeleteAssetId] = useState<number | null>(null);

    // Form
    const [currentAssetId, setCurrentAssetId] = useState<number | null>(null);
    const [assetName, setAssetName] = useState("");
    const [assetValue, setAssetValue] = useState("");
    const [assetDate, setAssetDate] = useState(new Date().toISOString().split("T")[0]);
    const [assetDepreciation, setAssetDepreciation] = useState("0");
    const [assetStatus, setAssetStatus] = useState<"active" | "maintenance" | "disposed">("active");
    const [assetDescription, setAssetDescription] = useState("");

    const itemsPerPage = 20;

    const loadAssets = useCallback(async (page: number = 1, search: string = "") => {
        try {
            setIsLoading(true);
            const response = await fetchAPI(
                `${API_ENDPOINTS.ASSETS.FIXED_ASSETS}?page=${page}&limit=${itemsPerPage}&search=${encodeURIComponent(search)}`
            );
            if (response.success && Array.isArray(response.data)) {
                const assets = response.data as Asset[];
                setAssets(assets);
                const pagination = response.pagination as { total_pages?: number } | undefined;
                setTotalPages(pagination?.total_pages ?? Math.max(1, Math.ceil(assets.length / itemsPerPage)));
                setCurrentPage(page);
            } else {
                showAlert("alert-container", response.message || i18n.catalog["assets.fixedAssetsRegistry.failedLoadAssets"], "error");
            }
        } catch {
            showAlert("alert-container", i18n.catalog["common.general.errorConnectingServer"], "error");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const init = async () => {
            const authenticated = await checkAuth();
            if (!authenticated) return;

            const storedUser = getStoredUser();
            const storedPermissions = getStoredPermissions();
            setUser(storedUser);
            setPermissions(storedPermissions);
            await loadAssets();
        };
        init();
    }, [loadAssets]);

    // Search debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            loadAssets(1, searchTerm);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchTerm, loadAssets]);

    const translateStatus = (status: string) => {
        const statuses: Record<string, string> = {
            active: i18n.catalog["common.general.active"],
            maintenance: i18n.catalog["common.general.underMaintenance"],
            disposed: i18n.catalog["common.general.excluded"],
        };
        return statuses[status] || status;
    };

    const getStatusClass = (status: string) => {
        const classes: Record<string, string> = {
            active: "badge-success",
            maintenance: "badge-warning",
            disposed: "badge-danger",
        };
        return classes[status] || "badge-secondary";
    };

    const openAddDialog = () => {
        setCurrentAssetId(null);
        setAssetName("");
        setAssetValue("");
        setAssetDate(new Date().toISOString().split("T")[0]);
        setAssetDepreciation("0");
        setAssetStatus("active");
        setAssetDescription("");
        setAssetDialog(true);
    };

    const editAsset = (id: number) => {
        const asset = assets.find((a) => a.id === id);
        if (!asset) return;

        setCurrentAssetId(id);
        setAssetName(asset.name);
        setAssetValue(String(asset.purchase_value));
        setAssetDate(asset.purchase_date);
        setAssetDepreciation(String(asset.depreciation_rate || 0));
        setAssetStatus(asset.status);
        setAssetDescription(asset.description || "");
        setAssetDialog(true);
    };

    const saveAsset = async () => {
        if (!assetName || !assetValue || !assetDate) {
            showAlert("alert-container", i18n.catalog["common.general.pleaseFillAllRequiredFields"], "error");
            return;
        }

        try {
            const method = currentAssetId ? "PUT" : "POST";
            const body = {
                name: assetName,
                purchase_value: parseNumber(assetValue),
                purchase_date: assetDate,
                depreciation_rate: parseNumber(assetDepreciation),
                status: assetStatus,
                description: assetDescription,
            };
            const url = currentAssetId 
                ? catalogText(i18n, "common.general.message", { value0: API_ENDPOINTS.ASSETS.FIXED_ASSETS, value1: currentAssetId })
                : API_ENDPOINTS.ASSETS.FIXED_ASSETS;

            const response = await fetchAPI(url, {
                method,
                body: JSON.stringify(body),
            });

            if (response.success) {
                showAlert("alert-container", i18n.catalog["common.general.savedSuccessfully"], "success");
                setAssetDialog(false);
                await loadAssets(currentPage, searchTerm);
            } else {
                showAlert("alert-container", response.message || i18n.catalog["common.general.failedSave"], "error");
            }
        } catch {
            showAlert("alert-container", i18n.catalog["common.general.errorConnectingServer"], "error");
        }
    };

    const confirmDeleteAsset = (id: number) => {
        setDeleteAssetId(id);
        setConfirmDialog(true);
    };

    const deleteAsset = async () => {
        if (!deleteAssetId) return;

        try {
            const response = await fetchAPI(catalogText(i18n, "common.general.message", { value0: API_ENDPOINTS.ASSETS.FIXED_ASSETS, value1: deleteAssetId }), { method: "DELETE" });
            if (response.success) {
                showAlert("alert-container", i18n.catalog["common.general.deletedSuccessfully"], "success");
                setConfirmDialog(false);
                setDeleteAssetId(null);
                await loadAssets(currentPage, searchTerm);
            } else {
                showAlert("alert-container", response.message || i18n.catalog["common.general.deletionFailed"], "error");
            }
        } catch {
            showAlert("alert-container", i18n.catalog["common.general.deletionError"], "error");
        }
    };

    const columns: Column<Asset>[] = [
        {
            key: "id",
            header: "#",
            dataLabel: "#",
            render: (item) => `#${item.id}`,
        },
        {
            key: "name",
            header: i18n.catalog["common.general.name"],
            dataLabel: i18n.catalog["common.general.name"],
            render: (item) => <strong>{item.name}</strong>,
        },
        {
            key: "purchase_value",
            header: i18n.catalog["common.general.value"],
            dataLabel: i18n.catalog["common.general.value"],
            render: (item) => formatCurrency(item.purchase_value),
        },
        {
            key: "purchase_date",
            header: i18n.catalog["common.general.purchaseDate"],
            dataLabel: i18n.catalog["common.general.purchaseDate"],
            render: (item) => formatDate(item.purchase_date),
        },
        {
            key: "depreciation_rate",
            header: i18n.catalog["common.general.depreciationRate"],
            dataLabel: i18n.catalog["common.general.depreciationRate"],
            render: (item) => catalogText(i18n, "common.general.message.alternative4", { value0: item.depreciation_rate || 0 }),
        },
        {
            key: "status",
            header: i18n.catalog["common.general.status.alternative2"],
            dataLabel: i18n.catalog["common.general.status.alternative2"],
            render: (item) => (
                <span className={`badge ${getStatusClass(item.status)}`}>
                    {translateStatus(item.status)}
                </span>
            ),
        },
        {
            key: "recorder_name",
            header: i18n.catalog["common.general.notAvailable.alternative7"],
            dataLabel: i18n.catalog["common.general.notAvailable.alternative7"],
            render: (item) => (
                <span className="badge badge-secondary">{item.recorder_name || i18n.catalog["common.general.system"]}</span>
            ),
        },
        {
            key: "actions",
            header: i18n.catalog["common.general.actions"],
            dataLabel: i18n.catalog["common.general.actions"],
            render: (item) => (
                <ActionButtons
                    actions={[
                        {
                            icon: "edit",
                            title: i18n.catalog["common.general.edit"],
                            variant: "edit",
                            onClick: () => editAsset(item.id),
                            hidden: !canAccess(permissions, "assets", "edit")
                        },
                        {
                            icon: "trash",
                            title: i18n.catalog["common.general.delete"],
                            variant: "delete",
                            onClick: () => confirmDeleteAsset(item.id),
                            hidden: !canAccess(permissions, "assets", "delete")
                        }
                    ]}
                />
            ),
        },
    ];

    return (
        <MainLayout>


            <div id="alert-container"></div>

            <div className="sales-card animate-fade">
                <PageSubHeader
                    user={user}
                    searchInput={
                        <SearchableSelect
                            placeholder={i18n.catalog["assets.fixedAssetsRegistry.searchNameDescription"]}
                            value={searchTerm}
                            options={assets.map((asset) => ({ value: asset.name, label: asset.name }))}
                            onChange={(val) => setSearchTerm(val?.toString() || "")}
                            onSearch={(term) => setSearchTerm(term)}
                            className="header-search-bar"
                            id="params-search"
                        />
                    }
                    actions={
                        canAccess(permissions, "assets", "create") && (
                            <Button
                                variant="primary"
                                onClick={openAddDialog}
                                icon="plus"
                            >
                                {i18n.catalog["assets.fixedAssetsRegistry.newAsset"]}</Button>
                        )
                    }
                />
                <Table
                    columns={columns}
                    data={assets}
                    keyExtractor={(item) => item.id}
                    emptyMessage={i18n.catalog["common.general.noRegisteredAssets"]}
                    isLoading={isLoading}
                    pagination={{
                        currentPage,
                        totalPages,
                        onPageChange: (page) => loadAssets(page, searchTerm),
                    }}
                />
            </div>

            {/* Asset Dialog */}
            <Dialog
                isOpen={assetDialog}
                onClose={() => setAssetDialog(false)}
                title={currentAssetId ? i18n.catalog["assets.fixedAssetsRegistry.editAssetDetails"] : i18n.catalog["common.general.addNewAsset"]}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setAssetDialog(false)}>
                            {i18n.catalog["common.general.cancel"]}</Button>
                        <Button variant="primary" onClick={saveAsset}>
                            {i18n.catalog["common.general.save"]}</Button>
                    </>
                }
            >
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        saveAsset();
                    }}
                >
                    <TextInput
                        label={i18n.catalog["common.general.assetName"]}
                        id="asset-name"
                        value={assetName}
                        onChange={(e) => setAssetName(e.target.value)}
                        required
                    />

                    <div className="form-row">
                        <NumberInput
                            label={i18n.catalog["assets.fixedAssetsRegistry.value"]}
                            id="asset-value"
                            value={assetValue}
                            onChange={(val) => setAssetValue(val)}
                            min={0}
                            step={0.01}
                            required
                            className="flex-1"
                        />
                        <TextInput
                            type="date"
                            label={i18n.catalog["assets.fixedAssetsRegistry.purchaseDate"]}
                            id="asset-date"
                            value={assetDate}
                            onChange={(e) => setAssetDate(e.target.value)}
                            required
                            className="flex-1"
                        />
                    </div>

                    <div className="form-row">
                        <NumberInput
                            label={i18n.catalog["assets.fixedAssetsRegistry.depreciationRate"]}
                            id="asset-depreciation"
                            value={assetDepreciation}
                            onChange={(val) => setAssetDepreciation(val)}
                            min={0}
                            max={100}
                            step={0.1}
                            className="flex-1"
                        />
                        <Select
                            label={i18n.catalog["common.general.status.alternative2"]}
                            id="asset-status"
                            value={assetStatus}
                            onChange={(e) => setAssetStatus(e.target.value as typeof assetStatus)}
                            className="flex-1"
                            options={[
                                { value: "active", label: i18n.catalog["common.general.active"] },
                                { value: "maintenance", label: i18n.catalog["common.general.underMaintenance"] },
                                { value: "disposed", label: i18n.catalog["common.general.excluded"] }
                            ]}
                        />
                    </div>

                    <Textarea
                        label={i18n.catalog["common.general.description.alternative2"]}
                        id="asset-description"
                        value={assetDescription}
                        onChange={(e) => setAssetDescription(e.target.value)}
                        rows={3}
                    />
                </form>
            </Dialog>

            {/* Confirm Delete Dialog */}
            <ConfirmDialog
                isOpen={confirmDialog}
                onClose={() => setConfirmDialog(false)}
                onConfirm={deleteAsset}
                title={i18n.catalog["common.general.confirmDeletion"]}
                message={i18n.catalog["assets.fixedAssetsRegistry.areYouSureYouWantDeleteThisAsset"]}
                confirmText={i18n.catalog["common.general.delete"]}
                confirmVariant="danger"
            />
        </MainLayout>
    );
}

