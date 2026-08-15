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
                showAlert("alert-container", response.message || i18n.catalog["text_259c51fe072b"], "error");
            }
        } catch {
            showAlert("alert-container", i18n.catalog["text_22fa79f17c32"], "error");
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
            active: i18n.catalog["text_629e90b3af3d"],
            maintenance: i18n.catalog["text_99a308b7c785"],
            disposed: i18n.catalog["text_eb0bd9ba362a"],
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
            showAlert("alert-container", i18n.catalog["text_0a8eb85d0081"], "error");
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
                ? catalogText(i18n, "text_0907f4dfb304", { value0: API_ENDPOINTS.ASSETS.FIXED_ASSETS, value1: currentAssetId })
                : API_ENDPOINTS.ASSETS.FIXED_ASSETS;

            const response = await fetchAPI(url, {
                method,
                body: JSON.stringify(body),
            });

            if (response.success) {
                showAlert("alert-container", i18n.catalog["text_ff783ee2826d"], "success");
                setAssetDialog(false);
                await loadAssets(currentPage, searchTerm);
            } else {
                showAlert("alert-container", response.message || i18n.catalog["text_b0dbba00004b"], "error");
            }
        } catch {
            showAlert("alert-container", i18n.catalog["text_22fa79f17c32"], "error");
        }
    };

    const confirmDeleteAsset = (id: number) => {
        setDeleteAssetId(id);
        setConfirmDialog(true);
    };

    const deleteAsset = async () => {
        if (!deleteAssetId) return;

        try {
            const response = await fetchAPI(catalogText(i18n, "text_0907f4dfb304", { value0: API_ENDPOINTS.ASSETS.FIXED_ASSETS, value1: deleteAssetId }), { method: "DELETE" });
            if (response.success) {
                showAlert("alert-container", i18n.catalog["text_12b6e3813b40"], "success");
                setConfirmDialog(false);
                setDeleteAssetId(null);
                await loadAssets(currentPage, searchTerm);
            } else {
                showAlert("alert-container", response.message || i18n.catalog["text_f46bfc521612"], "error");
            }
        } catch {
            showAlert("alert-container", i18n.catalog["text_3bdb299872fb"], "error");
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
            header: i18n.catalog["text_52ab09847cf8"],
            dataLabel: i18n.catalog["text_52ab09847cf8"],
            render: (item) => <strong>{item.name}</strong>,
        },
        {
            key: "purchase_value",
            header: i18n.catalog["text_4c49efecd6cb"],
            dataLabel: i18n.catalog["text_4c49efecd6cb"],
            render: (item) => formatCurrency(item.purchase_value),
        },
        {
            key: "purchase_date",
            header: i18n.catalog["text_dc24afda1b22"],
            dataLabel: i18n.catalog["text_dc24afda1b22"],
            render: (item) => formatDate(item.purchase_date),
        },
        {
            key: "depreciation_rate",
            header: i18n.catalog["text_104ab9ffd0a7"],
            dataLabel: i18n.catalog["text_104ab9ffd0a7"],
            render: (item) => catalogText(i18n, "text_518ef1823474", { value0: item.depreciation_rate || 0 }),
        },
        {
            key: "status",
            header: i18n.catalog["text_c3a4749caed4"],
            dataLabel: i18n.catalog["text_c3a4749caed4"],
            render: (item) => (
                <span className={`badge ${getStatusClass(item.status)}`}>
                    {translateStatus(item.status)}
                </span>
            ),
        },
        {
            key: "recorder_name",
            header: i18n.catalog["text_a98b66bae2c9"],
            dataLabel: i18n.catalog["text_a98b66bae2c9"],
            render: (item) => (
                <span className="badge badge-secondary">{item.recorder_name || i18n.catalog["text_df8d4a3bd114"]}</span>
            ),
        },
        {
            key: "actions",
            header: i18n.catalog["text_7797240d6caf"],
            dataLabel: i18n.catalog["text_7797240d6caf"],
            render: (item) => (
                <ActionButtons
                    actions={[
                        {
                            icon: "edit",
                            title: i18n.catalog["text_113d570d6555"],
                            variant: "edit",
                            onClick: () => editAsset(item.id),
                            hidden: !canAccess(permissions, "assets", "edit")
                        },
                        {
                            icon: "trash",
                            title: i18n.catalog["text_59ca629220a6"],
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
                            placeholder={i18n.catalog["text_91203668fa54"]}
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
                                {i18n.catalog["text_acb7acbececf"]}</Button>
                        )
                    }
                />
                <Table
                    columns={columns}
                    data={assets}
                    keyExtractor={(item) => item.id}
                    emptyMessage={i18n.catalog["text_af5031abf842"]}
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
                title={currentAssetId ? i18n.catalog["text_582db3fdd97e"] : i18n.catalog["text_7e430444cd59"]}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setAssetDialog(false)}>
                            {i18n.catalog["text_9a30dc2a96b8"]}</Button>
                        <Button variant="primary" onClick={saveAsset}>
                            {i18n.catalog["text_ddfcaf9d0144"]}</Button>
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
                        label={i18n.catalog["text_1f7f12d037c9"]}
                        id="asset-name"
                        value={assetName}
                        onChange={(e) => setAssetName(e.target.value)}
                        required
                    />

                    <div className="form-row">
                        <NumberInput
                            label={i18n.catalog["text_30e32320ab69"]}
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
                            label={i18n.catalog["text_394b2119824c"]}
                            id="asset-date"
                            value={assetDate}
                            onChange={(e) => setAssetDate(e.target.value)}
                            required
                            className="flex-1"
                        />
                    </div>

                    <div className="form-row">
                        <NumberInput
                            label={i18n.catalog["text_31c92663521d"]}
                            id="asset-depreciation"
                            value={assetDepreciation}
                            onChange={(val) => setAssetDepreciation(val)}
                            min={0}
                            max={100}
                            step={0.1}
                            className="flex-1"
                        />
                        <Select
                            label={i18n.catalog["text_c3a4749caed4"]}
                            id="asset-status"
                            value={assetStatus}
                            onChange={(e) => setAssetStatus(e.target.value as typeof assetStatus)}
                            className="flex-1"
                            options={[
                                { value: "active", label: i18n.catalog["text_629e90b3af3d"] },
                                { value: "maintenance", label: i18n.catalog["text_99a308b7c785"] },
                                { value: "disposed", label: i18n.catalog["text_eb0bd9ba362a"] }
                            ]}
                        />
                    </div>

                    <Textarea
                        label={i18n.catalog["text_95023fc76e1b"]}
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
                title={i18n.catalog["text_5f9cb54dc136"]}
                message={i18n.catalog["text_bb7c9c094a6c"]}
                confirmText={i18n.catalog["text_59ca629220a6"]}
                confirmVariant="danger"
            />
        </MainLayout>
    );
}

