"use client";

import { useI18n, catalogText, catalogMessage } from "@/lib/i18n";
import { PageSubHeader } from "@/components/layout";
import { ActionButtons, Button, Column, Table, TabNavigation } from "@/components/ui";
import { fetchAPI } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatCurrency } from "@/lib/utils";
import { useAuthStore } from "@/stores/useAuthStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface CompensationPlan {
    id: number;
    plan_name: string;
    plan_type: string;
    fiscal_year: string;
    effective_date: string;
    status: string;
    budget_pool: number;
    allocated_amount: number;
}

interface CompensationEntry {
    id: number;
    employee?: { full_name: string };
    current_salary: number;
    proposed_salary: number;
    increase_amount: number;
    increase_percentage: number;
    comp_ratio?: number;
    status: string;
}

const planTypeLabels: Record<string, string> = {
    merit: catalogMessage("text_6e8c89702521"),
    promotion: catalogMessage("text_dd4fb886e84d"),
    adjustment: catalogMessage("text_113d570d6555"),
    bonus: catalogMessage("text_c396e6b8b30a"),
    commission: catalogMessage("text_1cae74794eb1"),
};

const statusLabels: Record<string, string> = {
    draft: catalogMessage("text_552aec56f591"),
    pending_approval: catalogMessage("text_38c10ba741b1"),
    approved: catalogMessage("text_a98d8a418ba0"),
    active: catalogMessage("text_629e90b3af3d"),
    closed: catalogMessage("text_e655261f9c96"),
    pending: catalogMessage("text_7d7913fdef74"),
    rejected: catalogMessage("text_5d969a71dad3"),
    processed: catalogMessage("text_15fa5b98bec0"),
};

const statusBadges: Record<string, string> = {
    draft: "badge-secondary",
    pending_approval: "badge-warning",
    approved: "badge-success",
    active: "badge-success",
    closed: "badge-secondary",
    pending: "badge-warning",
    rejected: "badge-danger",
    processed: "badge-info",
};

export function Compensation() {
    const { t: i18n } = useI18n();
    const router = useRouter();
    const { canAccess } = useAuthStore();
    const [activeTab, setActiveTab] = useState("plans");
    const [plans, setPlans] = useState<CompensationPlan[]>([]);
    const [entries, setEntries] = useState<CompensationEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        if (activeTab === "plans") {
            loadPlans();
        } else {
            loadEntries();
        }
    }, [activeTab, currentPage]);

    const loadPlans = async () => {
        setIsLoading(true);
        try {
            const query = new URLSearchParams({
                page: currentPage.toString(),
            });
            const res = await fetchAPI(`${API_ENDPOINTS.HUMAN_CAPITAL.COMPENSATION.PLANS.BASE}?${query}`);
            setPlans(res.data as CompensationPlan[] || []);
            setTotalPages(Number(res.last_page) || 1);
        } catch (error) {
            console.error(i18n.catalog["text_a37d4d9af6c0"], error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadEntries = async () => {
        setIsLoading(true);
        try {
            const query = new URLSearchParams({
                page: currentPage.toString(),
            });
            const res = await fetchAPI(`${API_ENDPOINTS.HUMAN_CAPITAL.COMPENSATION.ENTRIES.BASE}?${query}`);
            setEntries(res.data as CompensationEntry[] || []);
            setTotalPages(Number(res.last_page) || 1);
        } catch (error) {
            console.error(i18n.catalog["text_345d08a2a175"], error);
        } finally {
            setIsLoading(false);
        }
    };

    const planColumns: Column<CompensationPlan>[] = [
        {
            key: "plan_name",
            header: i18n.catalog["text_0dbb5c16476f"],
            dataLabel: i18n.catalog["text_0dbb5c16476f"],
        },
        {
            key: "plan_type",
            header: i18n.catalog["text_caa3f2bb4a36"],
            dataLabel: i18n.catalog["text_caa3f2bb4a36"],
            render: (item) => planTypeLabels[item.plan_type] || item.plan_type,
        },
        {
            key: "fiscal_year",
            header: i18n.catalog["text_956acd975554"],
            dataLabel: i18n.catalog["text_956acd975554"],
        },
        {
            key: "budget_pool",
            header: i18n.catalog["text_c15b068a504b"],
            dataLabel: i18n.catalog["text_c15b068a504b"],
            render: (item) => formatCurrency(item.budget_pool),
        },
        {
            key: "allocated_amount",
            header: i18n.catalog["text_e8fabd53d8e4"],
            dataLabel: i18n.catalog["text_e8fabd53d8e4"],
            render: (item) => formatCurrency(item.allocated_amount),
        },
        {
            key: "status",
            header: i18n.catalog["text_c3a4749caed4"],
            dataLabel: i18n.catalog["text_c3a4749caed4"],
            render: (item) => (
                <span className={`badge ${statusBadges[item.status] || 'badge-secondary'}`}>
                    {statusLabels[item.status] || item.status}
                </span>
            ),
        },
        {
            key: "id",
            header: i18n.catalog["text_7797240d6caf"],
            dataLabel: i18n.catalog["text_7797240d6caf"],
            render: (item) => (
                <ActionButtons
                    actions={[
                        {
                            icon: "eye",
                            title: i18n.catalog["text_4b615d0e6dd2"],
                            variant: "view",
                            onClick: () => alert(i18n.catalog["text_5ba17dbe5a91"])
                        },
                        ...(canAccess("compensation", "edit") ? [{
                            icon: "edit" as const,
                            title: i18n.catalog["text_113d570d6555"],
                            variant: "edit" as const,
                            onClick: () => alert(i18n.catalog["text_5ba17dbe5a91"])
                        }] : [])
                    ]}
                />
            ),
        },
    ];

    const entryColumns: Column<CompensationEntry>[] = [
        {
            key: "employee",
            header: i18n.catalog["text_b71a39c832a6"],
            dataLabel: i18n.catalog["text_b71a39c832a6"],
            render: (item) => item.employee?.full_name || '-',
        },
        {
            key: "current_salary",
            header: i18n.catalog["text_c6db8a859950"],
            dataLabel: i18n.catalog["text_c6db8a859950"],
            render: (item) => formatCurrency(item.current_salary),
        },
        {
            key: "proposed_salary",
            header: i18n.catalog["text_cd4af52917a0"],
            dataLabel: i18n.catalog["text_cd4af52917a0"],
            render: (item) => formatCurrency(item.proposed_salary),
        },
        {
            key: "increase_amount",
            header: i18n.catalog["text_c70faaf771c7"],
            dataLabel: i18n.catalog["text_c70faaf771c7"],
            render: (item) => (
                <span className={item.increase_amount > 0 ? 'text-success' : 'text-danger'}>
                    {formatCurrency(item.increase_amount)}
                </span>
            ),
        },
        {
            key: "increase_percentage",
            header: i18n.catalog["text_0778d2bfe740"],
            dataLabel: i18n.catalog["text_0778d2bfe740"],
            render: (item) => catalogText(i18n, "text_518ef1823474", { value0: item.increase_percentage }),
        },
        {
            key: "comp_ratio",
            header: i18n.catalog["text_a98fb08fe037"],
            dataLabel: i18n.catalog["text_a98fb08fe037"],
            render: (item) => item.comp_ratio ? item.comp_ratio.toFixed(2) : '-',
        },
        {
            key: "status",
            header: i18n.catalog["text_c3a4749caed4"],
            dataLabel: i18n.catalog["text_c3a4749caed4"],
            render: (item) => (
                <span className={`badge ${statusBadges[item.status] || 'badge-secondary'}`}>
                    {statusLabels[item.status] || item.status}
                </span>
            ),
        },
        {
            key: "id",
            header: i18n.catalog["text_7797240d6caf"],
            dataLabel: i18n.catalog["text_7797240d6caf"],
            render: (item) => (
                <ActionButtons
                    actions={[
                        {
                            icon: "eye",
                            title: i18n.catalog["text_4b615d0e6dd2"],
                            variant: "view",
                            onClick: () => alert(i18n.catalog["text_5ba17dbe5a91"])
                        },
                        ...(canAccess("compensation", "edit") ? [{
                            icon: "edit" as const,
                            title: i18n.catalog["text_113d570d6555"],
                            variant: "edit" as const,
                            onClick: () => alert(i18n.catalog["text_5ba17dbe5a91"])
                        }] : [])
                    ]}
                />
            ),
        },
    ];

    return (
        <div className="sales-card animate-fade">
            <PageSubHeader
                title={i18n.catalog["text_6334fe113b74"]}
                titleIcon="money-bill-wave"
                actions={
                    <>
                        {activeTab === "plans" && canAccess("compensation", "create") && (
                            <Button
                                onClick={() => alert(i18n.catalog["text_5ba17dbe5a91"])}
                                variant="primary"
                                icon="plus"
                            >
                                {i18n.catalog["text_4687f6dd0432"]}</Button>
                        )}
                        {activeTab === "entries" && canAccess("compensation", "create") && (
                            <Button
                                onClick={() => alert(i18n.catalog["text_5ba17dbe5a91"])}
                                variant="primary"
                                icon="plus"
                            >
                                {i18n.catalog["text_10120057af71"]}</Button>
                        )}
                    </>
                }
            />

            <TabNavigation
                tabs={[
                    { key: "plans", label: i18n.catalog["text_082dde4337e4"], icon: "file-alt" },
                    { key: "entries", label: i18n.catalog["text_bf7821475226"], icon: "list" },
                ]}
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />

            {activeTab === "plans" ? (
                <Table
                    columns={planColumns}
                    data={plans}
                    keyExtractor={(item) => item.id.toString()}
                    emptyMessage={i18n.catalog["text_2bbc89afcfa2"]}
                    isLoading={isLoading}
                    pagination={{
                        currentPage,
                        totalPages,
                        onPageChange: setCurrentPage,
                    }}
                />
            ) : (
                <Table
                    columns={entryColumns}
                    data={entries}
                    keyExtractor={(item) => item.id.toString()}
                    emptyMessage={i18n.catalog["text_c404fe3ad7c2"]}
                    isLoading={isLoading}
                    pagination={{
                        currentPage,
                        totalPages,
                        onPageChange: setCurrentPage,
                    }}
                />
            )}
        </div>
    );
}


