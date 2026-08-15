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
                title={catalogMessage("commercial.servicereturnsstatscards.totalServiceReturns")}
                value={formatCurrency(stats.total_returns)}
                icon={getIcon("repeat")}
                colorClass="alert"
            />
            <StatsCard
                title={catalogMessage("common.general.cashRefunds")}
                value={formatCurrency(stats.total_cash_returns)}
                icon={getIcon("dollar")}
                colorClass="products"
            />
            <StatsCard
                title={catalogMessage("common.general.receivablesReturnsCredit")}
                value={formatCurrency(stats.total_credit_returns)}
                icon={getIcon("dollar")}
                colorClass="total"
            />
            <StatsCard
                title={catalogMessage("common.general.numberReturns")}
                value={stats.transaction_count}
                icon={getIcon("eye")}
                colorClass="sales"
            />
        </div>
    );
}
