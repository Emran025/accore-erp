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
                title={catalogMessage("commercial.ledgerstatscards.totalSalesDebit")}
                value={formatCurrency(stats.total_debit)}
                icon={getIcon("dollar")}
                colorClass="alert"
            />
            <StatsCard
                title={catalogMessage("commercial.ledgerstatscards.totalReturnsCredit")}
                value={formatCurrency(stats.total_returns)}
                icon={getIcon("dollar")}
                colorClass="alert"
            />
            <StatsCard
                title={catalogMessage("commercial.ledgerstatscards.totalReceiptsCredit")}
                value={formatCurrency(stats.total_receipts)}
                icon={getIcon("check")}
                colorClass="products"
            />
            <StatsCard
                title={catalogMessage("common.general.currentBalance")}
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
