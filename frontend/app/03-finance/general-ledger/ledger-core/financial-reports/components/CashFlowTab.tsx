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
                showToast(response.message || catalogMessage("text_3bdb68306fc6"), "error");
            }
        } catch {
            showToast(catalogMessage("text_22fa79f17c32"), "error");
        } finally {
            setIsLoading(false);
        }
    }, [startDate, endDate]);

    return (
        <div className="sales-card">
            <PageSubHeader
                title={catalogMessage("text_f8ffa9d3f4d5")}
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
                                {catalogMessage("text_92ad0d774e56")}</Button>
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
                        <i className="fas fa-money-bill-wave"></i> {catalogMessage("text_ebe3ca1ccedb")}{startDate} {catalogMessage("text_97fe3fe5b063")}{endDate})
                    </h2>

                    <h3 style={{ marginTop: "1.5rem", marginBottom: "1rem", color: "var(--primary-dark)" }}>{catalogMessage("text_b077acc711be")}</h3>
                    <div className="financial-row">
                        <span className="report-label">{catalogMessage("text_cceeb6ff14e3")}</span>
                        <span className="report-value">{formatCurrency(cashFlow.operating_activities?.net_profit || 0)}</span>
                    </div>
                    <div className="financial-row">
                        <span className="report-label">{catalogMessage("text_12da860fc5d3")}</span>
                        <span className="report-value">{formatCurrency(cashFlow.operating_activities?.net_cash_flow || 0)}</span>
                    </div>

                    <h3 style={{ marginTop: "1.5rem", marginBottom: "1rem", color: "var(--primary-dark)" }}>{catalogMessage("text_1032d80d7d58")}</h3>
                    <div className="financial-row">
                        <span className="report-label">{catalogMessage("text_4a079e0ce5e0")}</span>
                        <span className="report-value text-danger">-{formatCurrency(cashFlow.investing_activities?.asset_purchases || 0)}</span>
                    </div>

                    <h3 style={{ marginTop: "1.5rem", marginBottom: "1rem", color: "var(--primary-dark)" }}>{catalogMessage("text_df61cb67d19c")}</h3>
                    <div className="financial-row">
                        <span className="report-label">{catalogMessage("text_659bd974c93a")}</span>
                        <span className="report-value text-success">{formatCurrency(cashFlow.financing_activities?.capital || 0)}</span>
                    </div>

                    <div className="financial-row">
                        <span className="report-label">{catalogMessage("text_d39b337da01d")}</span>
                        <span className="report-value">{formatCurrency(cashFlow.net_cash_flow || 0)}</span>
                    </div>
                </div>
            ) : (
                <p style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)" }}>
                    {catalogMessage("text_1c49fa1be4b0")}</p>
            )}
        </div>
    );
}
