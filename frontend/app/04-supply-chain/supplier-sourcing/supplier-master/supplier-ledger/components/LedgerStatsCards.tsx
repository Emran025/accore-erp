import { catalogMessage } from "@/lib/i18n";
import { StatsCard } from "@/components/ui/StatsCard";
import { getIcon } from "@/lib/icons";
import { formatCurrency } from "@/lib/utils";
import { LedgerStatsSuppliers } from "@/types";

interface LedgerStatsCardsProps {
    stats: LedgerStatsSuppliers;
}

export function LedgerStatsCards({ stats }: LedgerStatsCardsProps) {
    return (
        <div className="dashboard-stats animate-fade" style={{ marginBottom: "2rem" }}>
            <StatsCard
                title={catalogMessage("text_db2e74dd7b3d")}
                value={formatCurrency(stats.total_credit)}
                icon={getIcon("dollar")}
                colorClass="alert"
            />
            <StatsCard
                title={catalogMessage("text_69122fef9850")}
                value={formatCurrency(stats.total_returns)}
                icon={getIcon("dollar")}
                colorClass="alert"
            />
            <StatsCard
                title={catalogMessage("text_788e1e64f9b7")}
                value={formatCurrency(stats.total_payments)}
                icon={getIcon("check")}
                colorClass="products"
            />
            <StatsCard
                title={catalogMessage("text_e7e015275aae")}
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

