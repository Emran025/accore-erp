import { catalogMessage } from "@/lib/i18n";
import { PageSubHeader } from "@/components/layout";
import { Button, DateRangePicker, FilterActions, showToast } from "@/components/ui";
import { fetchAPI } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { APIProfitLoss, ProfitLossView } from "@/types";
import { useCallback, useEffect, useState } from "react";

export function ProfitLossTab() {
    const [isLoading, setIsLoading] = useState(false);
    const [profitLoss, setProfitLoss] = useState<ProfitLossView | null>(null);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // Initialize defaults on mount
    useEffect(() => {
        const today = new Date().toISOString().split("T")[0];
        const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0];
        setStartDate(firstDay);
        setEndDate(today);
    }, []);

    const loadProfitLoss = useCallback(async () => {
        if (!startDate || !endDate) {
            // Wait for initialization or user input
            return;
        }

        try {
            setIsLoading(true);
            const response = await fetchAPI(
                `reports/profit_loss?start_date=${startDate}&end_date=${endDate}`
            );
            if (response.success && response.data) {
                const apiData = response.data as APIProfitLoss;
                setProfitLoss({
                    total_revenue: Number(apiData.revenue.total || 0),
                    total_expenses: Number(apiData.expenses.total || 0),
                    net_profit: Number(apiData.net_income || 0)
                });
            } else {
                showToast(response.message || catalogMessage("finance.profitloss.failedLoadIncomeStatement"), "error");
            }
        } catch {
            showToast(catalogMessage("common.general.errorConnectingServer"), "error");
        } finally {
            setIsLoading(false);
        }
    }, [startDate, endDate]);

    return (
        <div className="sales-card">
            <PageSubHeader
                title={catalogMessage("common.general.incomeStatement")}
                titleIcon="chart-line"
                actions={
                    <>
                        <DateRangePicker
                            //label="فترة التقرير"
                            startDate={startDate}
                            endDate={endDate}
                            onStartDateChange={setStartDate}
                            onEndDateChange={setEndDate}
                        />
                        <FilterActions>
                            <Button onClick={loadProfitLoss} icon="search">
                                {catalogMessage("common.general.viewReport")}</Button>
                        </FilterActions>
                    </>
                } />
            {isLoading ? (
                <div style={{ textAlign: "center", padding: "3rem" }}>
                    <i className="fas fa-spinner fa-spin" style={{ fontSize: "2rem" }}></i>
                </div>
            ) : profitLoss ? (
                <div className="report-section animate-fade" style={{ marginTop: "1.5rem" }}>
                    <h2 style={{ marginBottom: "1.5rem" }}>
                        <i className="fas fa-chart-line"></i> {catalogMessage("finance.profitloss.incomeStatement")}{startDate} {catalogMessage("common.general.notAvailable.alternative6")}{endDate})
                    </h2>
                    <div className="financial-row">
                        <span className="report-label">{catalogMessage("common.general.totalRevenue")}</span>
                        <span className="report-value text-success">{formatCurrency(profitLoss.total_revenue || 0)}</span>
                    </div>
                    <div className="financial-row">
                        <span className="report-label">{catalogMessage("common.general.expenses")}</span>
                        <span className="report-value text-danger">-{formatCurrency(profitLoss.total_expenses || 0)}</span>
                    </div>
                    <div className="financial-row">
                        <span className="report-label">{catalogMessage("finance.profitloss.netProfitLoss")}</span>
                        <span className={`report-value ${(profitLoss.net_profit || 0) >= 0 ? "profit" : "loss"}`}>
                            {formatCurrency(profitLoss.net_profit || 0)}
                        </span>
                    </div>
                </div>
            ) : (
                <p style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)" }}>
                    {catalogMessage("common.general.selectTimePeriodClickShowReport")}</p>
            )}
        </div>
    );
}
