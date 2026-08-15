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
                title={catalogMessage("text_666f5dd27fb1")}
                value={formatCurrency(stats.total_commissions)}
                icon={getIcon("dollar")}
                colorClass="alert"
            />
            <StatsCard
                title={catalogMessage("text_db4a944c89e8")}
                value={formatCurrency(stats.total_payments + stats.total_returns)}
                icon={getIcon("check")}
                colorClass="products"
            />
            <StatsCard
                title={catalogMessage("text_b0f981453405")}
                value={formatCurrency(stats.balance)}
                icon={getIcon("building")}
                colorClass="total"
            />
            <StatsCard
                title={catalogMessage("text_1efbe75bbc4d")}
                value={stats.transaction_count}
                icon={getIcon("eye")}
                colorClass="sales"
            />
        </div>
    );
}
