import { catalogMessage } from "@/lib/i18n";
import { getIcon } from "@/lib/icons";
import { formatCurrency } from "@/lib/utils";
import { StatsCard } from "@/components/ui/StatsCard";
import { LedgerStatsCustomer } from "@/types";

interface LedgerStatsCardsProps {
    stats: LedgerStatsCustomer;
}

export function LedgerStatsCards({ stats }: LedgerStatsCardsProps) {
    return (
        <div className="dashboard-stats animate-fade" style={{ marginBottom: "2rem" }}>
            <StatsCard
                title={catalogMessage("text_7c9e9bb8e84d")}
                value={formatCurrency(stats.total_debit)}
                icon={getIcon("dollar")}
                colorClass="alert"
            />
            <StatsCard
                title={catalogMessage("text_2447621496ed")}
                value={formatCurrency(stats.total_returns)}
                icon={getIcon("dollar")}
                colorClass="alert"
            />
            <StatsCard
                title={catalogMessage("text_d847b1767338")}
                value={formatCurrency(stats.total_receipts)}
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
