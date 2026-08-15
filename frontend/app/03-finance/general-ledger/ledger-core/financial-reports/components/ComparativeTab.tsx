import { catalogMessage } from "@/lib/i18n";
import { Button, DateRangePicker, FilterActions, FilterSection, showToast, Table } from "@/components/ui";
import { fetchAPI } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { APIComparative } from "@/types";
import { useCallback, useEffect, useState } from "react";

export function ComparativeTab() {
    const [isLoading, setIsLoading] = useState(false);
    const [comparative, setComparative] = useState<APIComparative | null>(null);

    const [currentStart, setCurrentStart] = useState("");
    const [currentEnd, setCurrentEnd] = useState("");
    const [previousStart, setPreviousStart] = useState("");
    const [previousEnd, setPreviousEnd] = useState("");

    useEffect(() => {
        const today = new Date().toISOString().split("T")[0];
        const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0];
        setCurrentStart(firstDay);
        setCurrentEnd(today);

        // Previous period defaults
        const prevMonthFirst = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString().split("T")[0];
        const prevMonthLast = new Date(new Date().getFullYear(), new Date().getMonth(), 0).toISOString().split("T")[0];
        setPreviousStart(prevMonthFirst);
        setPreviousEnd(prevMonthLast);
    }, []);

    const loadComparative = useCallback(async () => {
        if (!currentStart || !currentEnd) {
            // Wait for input
            return;
        }

        try {
            setIsLoading(true);
            let url = `reports/comparative?current_start=${currentStart}&current_end=${currentEnd}`;
            if (previousStart && previousEnd) {
                url += `&previous_start=${previousStart}&previous_end=${previousEnd}`;
            }

            const response = await fetchAPI(url);
            if (response.success && response.data) {
                setComparative(response.data as APIComparative);
            } else {
                showToast(response.message || catalogMessage("finance.comparative.failedLoadComparison"), "error");
            }
        } catch {
            showToast(catalogMessage("common.general.errorConnectingServer"), "error");
        } finally {
            setIsLoading(false);
        }
    }, [currentStart, currentEnd, previousStart, previousEnd]);

    return (
        <div className="sales-card">
            <h2><i className="fas fa-chart-bar"></i> {catalogMessage("common.general.financialComparison")}</h2>

            <FilterSection>
                <DateRangePicker
                    label={catalogMessage("common.general.currentPeriod")}
                    startDate={currentStart}
                    endDate={currentEnd}
                    onStartDateChange={setCurrentStart}
                    onEndDateChange={setCurrentEnd}
                />
                <DateRangePicker
                    label={catalogMessage("finance.comparative.previousPeriodOptional")}
                    startDate={previousStart}
                    endDate={previousEnd}
                    onStartDateChange={setPreviousStart}
                    onEndDateChange={setPreviousEnd}
                />
                <FilterActions>
                    <Button onClick={loadComparative} icon="search">
                        {catalogMessage("finance.comparative.comparisonView")}</Button>
                </FilterActions>
            </FilterSection>

            {isLoading ? (
                <div style={{ textAlign: "center", padding: "3rem" }}>
                    <i className="fas fa-spinner fa-spin" style={{ fontSize: "2rem" }}></i>
                </div>
            ) : comparative ? (
                <div className="report-section animate-fade" style={{ marginTop: "1.5rem" }}>
                    <h2 style={{ marginBottom: "1.5rem" }}>
                        <i className="fas fa-chart-bar"></i> {catalogMessage("common.general.financialComparison")}</h2>

                    <Table
                        columns={[
                            {
                                key: "label",
                                header: catalogMessage("finance.comparative.item"),
                                render: (item) => <strong>{item.label}</strong>
                            },
                            {
                                key: "previous",
                                header: catalogMessage("finance.comparative.previousPeriod"),
                                render: (item) => formatCurrency(item.previous)
                            },
                            {
                                key: "current",
                                header: catalogMessage("common.general.currentPeriod"),
                                render: (item) => formatCurrency(item.current)
                            },
                            {
                                key: "amount",
                                header: catalogMessage("finance.comparative.change"),
                                render: (item) => (
                                    <span className={item.amount >= 0 ? (item.positiveIsGood ? "text-success" : "text-danger") : (item.positiveIsGood ? "text-danger" : "text-success")}>
                                        {formatCurrency(item.amount)}
                                    </span>
                                )
                            },
                            {
                                key: "percentage",
                                header: catalogMessage("finance.comparative.changePercentage"),
                                render: (item) => (
                                    <span style={{ direction: 'ltr', textAlign: 'right', display: 'block' }}>
                                        {item.percentage.toFixed(2)}%
                                    </span>
                                )
                            }
                        ]}
                        data={[
                            {
                                label: catalogMessage("common.general.revenue"),
                                previous: comparative.previous_period?.revenue || 0,
                                current: comparative.current_period?.revenue || 0,
                                amount: comparative.changes?.revenue?.amount || 0,
                                percentage: comparative.changes?.revenue?.percentage || 0,
                                positiveIsGood: true
                            },
                            {
                                label: catalogMessage("common.general.expenses"),
                                previous: comparative.previous_period?.expenses || 0,
                                current: comparative.current_period?.expenses || 0,
                                amount: comparative.changes?.expenses?.amount || 0,
                                percentage: comparative.changes?.expenses?.percentage || 0,
                                positiveIsGood: false
                            },
                            {
                                label: catalogMessage("common.general.netProfit"),
                                previous: comparative.previous_period?.net_profit || 0,
                                current: comparative.current_period?.net_profit || 0,
                                amount: comparative.changes?.net_profit?.amount || 0,
                                percentage: comparative.changes?.net_profit?.percentage || 0,
                                positiveIsGood: true
                            }
                        ]}
                        keyExtractor={(item) => item.label}
                    />
                </div>
            ) : (
                <p style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)" }}>
                    {catalogMessage("finance.comparative.selectTimePeriodsClickShowComparison")}</p>
            )}
        </div>
    );
}
