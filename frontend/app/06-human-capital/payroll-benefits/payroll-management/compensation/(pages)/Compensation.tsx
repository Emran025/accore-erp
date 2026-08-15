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
    merit: catalogMessage("humanCapital.compensation.entitlement"),
    promotion: catalogMessage("humanCapital.compensation.promotion"),
    adjustment: catalogMessage("common.general.edit"),
    bonus: catalogMessage("common.general.bonus"),
    commission: catalogMessage("humanCapital.compensation.commission"),
};

const statusLabels: Record<string, string> = {
    draft: catalogMessage("common.general.draft"),
    pending_approval: catalogMessage("common.general.pendingApproval"),
    approved: catalogMessage("common.general.approved"),
    active: catalogMessage("common.general.active"),
    closed: catalogMessage("common.general.closed.alternative2"),
    pending: catalogMessage("common.general.pending.alternative2"),
    rejected: catalogMessage("common.general.rejected"),
    processed: catalogMessage("humanCapital.compensation.wizard"),
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
            console.error(i18n.catalog["common.general.failedLoadPlans"], error);
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
            console.error(i18n.catalog["humanCapital.compensation.failedLoadEntries"], error);
        } finally {
            setIsLoading(false);
        }
    };

    const planColumns: Column<CompensationPlan>[] = [
        {
            key: "plan_name",
            header: i18n.catalog["common.general.planName"],
            dataLabel: i18n.catalog["common.general.planName"],
        },
        {
            key: "plan_type",
            header: i18n.catalog["common.general.type.alternative3"],
            dataLabel: i18n.catalog["common.general.type.alternative3"],
            render: (item) => planTypeLabels[item.plan_type] || item.plan_type,
        },
        {
            key: "fiscal_year",
            header: i18n.catalog["common.general.fiscalYear"],
            dataLabel: i18n.catalog["common.general.fiscalYear"],
        },
        {
            key: "budget_pool",
            header: i18n.catalog["common.general.planBudget"],
            dataLabel: i18n.catalog["common.general.planBudget"],
            render: (item) => formatCurrency(item.budget_pool),
        },
        {
            key: "allocated_amount",
            header: i18n.catalog["common.general.provision"],
            dataLabel: i18n.catalog["common.general.provision"],
            render: (item) => formatCurrency(item.allocated_amount),
        },
        {
            key: "status",
            header: i18n.catalog["common.general.status.alternative2"],
            dataLabel: i18n.catalog["common.general.status.alternative2"],
            render: (item) => (
                <span className={`badge ${statusBadges[item.status] || 'badge-secondary'}`}>
                    {statusLabels[item.status] || item.status}
                </span>
            ),
        },
        {
            key: "id",
            header: i18n.catalog["common.general.actions"],
            dataLabel: i18n.catalog["common.general.actions"],
            render: (item) => (
                <ActionButtons
                    actions={[
                        {
                            icon: "eye",
                            title: i18n.catalog["common.general.viewDetails"],
                            variant: "view",
                            onClick: () => alert(i18n.catalog["common.general.thisFeatureIsUnderDevelopmentWillBeAdded"])
                        },
                        ...(canAccess("compensation", "edit") ? [{
                            icon: "edit" as const,
                            title: i18n.catalog["common.general.edit"],
                            variant: "edit" as const,
                            onClick: () => alert(i18n.catalog["common.general.thisFeatureIsUnderDevelopmentWillBeAdded"])
                        }] : [])
                    ]}
                />
            ),
        },
    ];

    const entryColumns: Column<CompensationEntry>[] = [
        {
            key: "employee",
            header: i18n.catalog["common.general.employee.alternative3"],
            dataLabel: i18n.catalog["common.general.employee.alternative3"],
            render: (item) => item.employee?.full_name || '-',
        },
        {
            key: "current_salary",
            header: i18n.catalog["common.general.currentSalary"],
            dataLabel: i18n.catalog["common.general.currentSalary"],
            render: (item) => formatCurrency(item.current_salary),
        },
        {
            key: "proposed_salary",
            header: i18n.catalog["common.general.proposedSalary"],
            dataLabel: i18n.catalog["common.general.proposedSalary"],
            render: (item) => formatCurrency(item.proposed_salary),
        },
        {
            key: "increase_amount",
            header: i18n.catalog["common.general.increaseAmount"],
            dataLabel: i18n.catalog["common.general.increaseAmount"],
            render: (item) => (
                <span className={item.increase_amount > 0 ? 'text-success' : 'text-danger'}>
                    {formatCurrency(item.increase_amount)}
                </span>
            ),
        },
        {
            key: "increase_percentage",
            header: i18n.catalog["common.general.percentageIncrease"],
            dataLabel: i18n.catalog["common.general.percentageIncrease"],
            render: (item) => catalogText(i18n, "common.general.message.alternative4", { value0: item.increase_percentage }),
        },
        {
            key: "comp_ratio",
            header: i18n.catalog["common.general.compensationRate"],
            dataLabel: i18n.catalog["common.general.compensationRate"],
            render: (item) => item.comp_ratio ? item.comp_ratio.toFixed(2) : '-',
        },
        {
            key: "status",
            header: i18n.catalog["common.general.status.alternative2"],
            dataLabel: i18n.catalog["common.general.status.alternative2"],
            render: (item) => (
                <span className={`badge ${statusBadges[item.status] || 'badge-secondary'}`}>
                    {statusLabels[item.status] || item.status}
                </span>
            ),
        },
        {
            key: "id",
            header: i18n.catalog["common.general.actions"],
            dataLabel: i18n.catalog["common.general.actions"],
            render: (item) => (
                <ActionButtons
                    actions={[
                        {
                            icon: "eye",
                            title: i18n.catalog["common.general.viewDetails"],
                            variant: "view",
                            onClick: () => alert(i18n.catalog["common.general.thisFeatureIsUnderDevelopmentWillBeAdded"])
                        },
                        ...(canAccess("compensation", "edit") ? [{
                            icon: "edit" as const,
                            title: i18n.catalog["common.general.edit"],
                            variant: "edit" as const,
                            onClick: () => alert(i18n.catalog["common.general.thisFeatureIsUnderDevelopmentWillBeAdded"])
                        }] : [])
                    ]}
                />
            ),
        },
    ];

    return (
        <div className="sales-card animate-fade">
            <PageSubHeader
                title={i18n.catalog["common.general.compensationManagement"]}
                titleIcon="money-bill-wave"
                actions={
                    <>
                        {activeTab === "plans" && canAccess("compensation", "create") && (
                            <Button
                                onClick={() => alert(i18n.catalog["common.general.thisFeatureIsUnderDevelopmentWillBeAdded"])}
                                variant="primary"
                                icon="plus"
                            >
                                {i18n.catalog["humanCapital.compensation.newCompensationPlan"]}</Button>
                        )}
                        {activeTab === "entries" && canAccess("compensation", "create") && (
                            <Button
                                onClick={() => alert(i18n.catalog["common.general.thisFeatureIsUnderDevelopmentWillBeAdded"])}
                                variant="primary"
                                icon="plus"
                            >
                                {i18n.catalog["humanCapital.compensation.addNewCompensation"]}</Button>
                        )}
                    </>
                }
            />

            <TabNavigation
                tabs={[
                    { key: "plans", label: i18n.catalog["humanCapital.compensation.compensationPlans"], icon: "file-alt" },
                    { key: "entries", label: i18n.catalog["humanCapital.compensation.compensationEntries"], icon: "list" },
                ]}
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />

            {activeTab === "plans" ? (
                <Table
                    columns={planColumns}
                    data={plans}
                    keyExtractor={(item) => item.id.toString()}
                    emptyMessage={i18n.catalog["humanCapital.compensation.noCompensationPlans"]}
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
                    emptyMessage={i18n.catalog["humanCapital.compensation.noCompensationEntries"]}
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


