import { catalogMessage } from "@/lib/i18n";
import { PageSubHeader } from "@/components/layout";
import { Button, DateRangePicker, FilterActions, showToast } from "@/components/ui";
import { fetchAPI } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { APICashFlow, CashFlowView } from "@/types";
import { useCallback, useEffect, useState } from "react";

export function CashFlowTab() {
    const [isLoading, setIsLoading] = useState(false);
    const [cashFlow, setCashFlow] = useState<CashFlowView | null>(null);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    useEffect(() => {
        const today = new Date().toISOString().split("T")[0];
        const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0];
        setStartDate(firstDay);
        setEndDate(today);
    }, []);

    const loadCashFlow = useCallback(async () => {
        if (!startDate || !endDate) {
            // Wait for input
            return;
        }

        try {
            setIsLoading(true);
            const response = await fetchAPI(
                `reports/cash_flow?start_date=${startDate}&end_date=${endDate}`
            );
            if (response.success && response.data) {
                const apiData = response.data as APICashFlow;
                setCashFlow({
                    operating_activities: {
                        net_profit: Number(apiData.operating_activities.net_income || 0),
                        net_cash_flow: Number(apiData.operating_activities.net_income || 0), // Fallback
                    },
                    investing_activities: {
                        asset_purchases: Number(apiData.investing_activities.total || 0)
                    },
                    financing_activities: {
                        capital: Number(apiData.financing_activities.total || 0)
                    },
                    net_cash_flow: Number(apiData.net_change_in_cash || 0)
                });
            } else {
                showToast(response.message || catalogMessage("finance.cashflow.failedLoadCashFlowList"), "error");
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
                title={catalogMessage("finance.cashflow.cashFlowStatement.alternative2")}
                titleIcon="money-bill-wave"
                actions={
                    <>
                        <DateRangePicker
                            // label="فترة التقرير"
                            startDate={startDate}
                            endDate={endDate}
                            onStartDateChange={setStartDate}
                            onEndDateChange={setEndDate}
                        />
                        <FilterActions>
                            <Button onClick={loadCashFlow} icon="search">
                                {catalogMessage("common.general.viewReport")}</Button>
                        </FilterActions>
                    </>
                } />

            {isLoading ? (
                <div style={{ textAlign: "center", padding: "3rem" }}>
                    <i className="fas fa-spinner fa-spin" style={{ fontSize: "2rem" }}></i>
                </div>
            ) : cashFlow ? (
                <div className="report-section animate-fade" style={{ marginTop: "1.5rem" }}>
                    <h2 style={{ marginBottom: "1.5rem" }}>
                        <i className="fas fa-money-bill-wave"></i> {catalogMessage("finance.cashflow.cashFlowStatement")}{startDate} {catalogMessage("common.general.notAvailable.alternative6")}{endDate})
                    </h2>

                    <h3 style={{ marginTop: "1.5rem", marginBottom: "1rem", color: "var(--primary-dark)" }}>{catalogMessage("finance.cashflow.operationalActivities")}</h3>
                    <div className="financial-row">
                        <span className="report-label">{catalogMessage("common.general.netProfit")}</span>
                        <span className="report-value">{formatCurrency(cashFlow.operating_activities?.net_profit || 0)}</span>
                    </div>
                    <div className="financial-row">
                        <span className="report-label">{catalogMessage("finance.cashflow.cashFlowsOperatingActivities")}</span>
                        <span className="report-value">{formatCurrency(cashFlow.operating_activities?.net_cash_flow || 0)}</span>
                    </div>

                    <h3 style={{ marginTop: "1.5rem", marginBottom: "1rem", color: "var(--primary-dark)" }}>{catalogMessage("finance.cashflow.investmentActivities")}</h3>
                    <div className="financial-row">
                        <span className="report-label">{catalogMessage("finance.cashflow.assetPurchase")}</span>
                        <span className="report-value text-danger">-{formatCurrency(cashFlow.investing_activities?.asset_purchases || 0)}</span>
                    </div>

                    <h3 style={{ marginTop: "1.5rem", marginBottom: "1rem", color: "var(--primary-dark)" }}>{catalogMessage("finance.cashflow.financingActivities")}</h3>
                    <div className="financial-row">
                        <span className="report-label">{catalogMessage("common.general.capital")}</span>
                        <span className="report-value text-success">{formatCurrency(cashFlow.financing_activities?.capital || 0)}</span>
                    </div>

                    <div className="financial-row">
                        <span className="report-label">{catalogMessage("finance.cashflow.netCashFlow")}</span>
                        <span className="report-value">{formatCurrency(cashFlow.net_cash_flow || 0)}</span>
                    </div>
                </div>
            ) : (
                <p style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)" }}>
                    {catalogMessage("common.general.selectTimePeriodClickShowReport")}</p>
            )}
        </div>
    );
}
