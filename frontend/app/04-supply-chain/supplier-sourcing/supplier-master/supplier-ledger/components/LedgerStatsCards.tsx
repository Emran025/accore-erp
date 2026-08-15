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
                title={catalogMessage("supplyChain.ledgerstatscards.totalPurchasesCredit")}
                value={formatCurrency(stats.total_credit)}
                icon={getIcon("dollar")}
                colorClass="alert"
            />
            <StatsCard
                title={catalogMessage("supplyChain.ledgerstatscards.totalReturnsDebit")}
                value={formatCurrency(stats.total_returns)}
                icon={getIcon("dollar")}
                colorClass="alert"
            />
            <StatsCard
                title={catalogMessage("supplyChain.ledgerstatscards.totalPaymentsDebit")}
                value={formatCurrency(stats.total_payments)}
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

