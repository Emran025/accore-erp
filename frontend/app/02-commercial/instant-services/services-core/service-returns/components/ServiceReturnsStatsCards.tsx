import { StatsCard } from "@/components/ui/StatsCard";
import { getIcon } from "@/lib/icons";
import { formatCurrency } from "@/lib/utils";

export interface ServiceReturnsStats {
    total_debit?: number;
    total_credit?: number;
    total_returns: number;
    total_cash_returns: number;
    total_credit_returns: number;
    total_receipts?: number;
    balance?: number;
    transaction_count: number;
    [key: string]: number | undefined;
}

export interface ServiceReturnsStatsCardsProps {
    stats: ServiceReturnsStats;
}

export function ServiceReturnsStatsCards({ stats }: ServiceReturnsStatsCardsProps) {
    return (
        <div className="dashboard-stats animate-fade" style={{ marginBottom: "2rem" }}>
            <StatsCard
                title="إجمالي مرتجعات الخدمات"
                value={formatCurrency(stats.total_returns)}
                icon={getIcon("repeat")}
                colorClass="alert"
            />
            <StatsCard
                title="مرتجعات نقدية"
                value={formatCurrency(stats.total_cash_returns)}
                icon={getIcon("dollar")}
                colorClass="products"
            />
            <StatsCard
                title="مرتجعات ذمم (آجل)"
                value={formatCurrency(stats.total_credit_returns)}
                icon={getIcon("dollar")}
                colorClass="total"
            />
            <StatsCard
                title="عدد المرتجعات"
                value={stats.transaction_count}
                icon={getIcon("eye")}
                colorClass="sales"
            />
        </div>
    );
}
