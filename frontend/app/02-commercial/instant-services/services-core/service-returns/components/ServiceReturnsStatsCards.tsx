import { catalogMessage } from "@/lib/i18n";
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
                title={catalogMessage("text_9effe43c76e6")}
                value={formatCurrency(stats.total_returns)}
                icon={getIcon("repeat")}
                colorClass="alert"
            />
            <StatsCard
                title={catalogMessage("text_eb286e2d1542")}
                value={formatCurrency(stats.total_cash_returns)}
                icon={getIcon("dollar")}
                colorClass="products"
            />
            <StatsCard
                title={catalogMessage("text_4023c844d5c1")}
                value={formatCurrency(stats.total_credit_returns)}
                icon={getIcon("dollar")}
                colorClass="total"
            />
            <StatsCard
                title={catalogMessage("text_e802230d56e6")}
                value={stats.transaction_count}
                icon={getIcon("eye")}
                colorClass="sales"
            />
        </div>
    );
}
