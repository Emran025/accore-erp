import { catalogMessage } from "@/lib/i18n";
import { getIcon } from "@/lib/icons";
import { formatCurrency } from "@/lib/utils";
import { StatsCard } from "@/components/ui/StatsCard";
import { LedgerStatsRepresentatives } from "@/types";

interface LedgerStatsCardsProps {
    stats: LedgerStatsRepresentatives;
}

export function LedgerStatsCards({ stats }: LedgerStatsCardsProps) {
    return (
        <div className="dashboard-stats animate-fade" style={{ marginBottom: "2rem", display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <StatsCard
                title={catalogMessage("common.general.totalCommissions")}
                value={formatCurrency(stats.total_commissions)}
                icon={getIcon("dollar")}
                colorClass="alert"
            />
            <StatsCard
                title={catalogMessage("commercial.ledgerstatscards.paymentsRefunds")}
                value={formatCurrency(stats.total_payments + stats.total_returns)}
                icon={getIcon("check")}
                colorClass="products"
            />
            <StatsCard
                title={catalogMessage("common.general.payableAgent")}
                value={formatCurrency(stats.balance)}
                icon={getIcon("building")}
                colorClass="total"
            />
            <StatsCard
                title={catalogMessage("common.general.numberOperations")}
                value={stats.transaction_count}
                icon={getIcon("eye")}
                colorClass="sales"
            />
        </div>
    );
}
