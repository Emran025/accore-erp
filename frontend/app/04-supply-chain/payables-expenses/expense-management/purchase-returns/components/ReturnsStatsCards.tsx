import { catalogMessage } from "@/lib/i18n";
import { StatsCard } from "@/components/ui/StatsCard";
import { getIcon } from "@/lib/icons";
import { formatCurrency } from "@/lib/utils";

export interface ReturnsStats {
    total_debit?: number;
    total_credit?: number;
    total_returns: number;
    total_cash_returns?: number;   // AP ledger may or may not provide this
    total_credit_returns?: number; // AP ledger may or may not provide this
    total_payments?: number;
    balance?: number;
    transaction_count: number;
    [key: string]: number | undefined;
}

export interface ReturnsStatsCardsProps {
    stats: ReturnsStats;
}

export function ReturnsStatsCards({ stats }: ReturnsStatsCardsProps) {
    return (
        <div className="dashboard-stats animate-fade" style={{ marginBottom: "2rem" }}>
            <StatsCard
                title={catalogMessage("common.general.totalReturns")}
                value={formatCurrency(stats.total_returns)}
                icon={getIcon("repeat")}
                colorClass="alert"
            />
            {stats.total_cash_returns !== undefined && (
                <StatsCard
                    title={catalogMessage("common.general.cashRefunds")}
                    value={formatCurrency(stats.total_cash_returns)}
                    icon={getIcon("dollar")}
                    colorClass="products"
                />
            )}
            {stats.total_credit_returns !== undefined && (
                <StatsCard
                    title={catalogMessage("common.general.receivablesReturnsCredit")}
                    value={formatCurrency(stats.total_credit_returns)}
                    icon={getIcon("dollar")}
                    colorClass="total"
                />
            )}
            <StatsCard
                title={catalogMessage("common.general.numberReturns")}
                value={stats.transaction_count}
                icon={getIcon("eye")}
                colorClass="sales"
            />
        </div>
    );
}
