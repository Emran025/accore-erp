import { catalogMessage } from "@/lib/i18n";
import { PageSubHeader } from "@/components/layout";
import { Button, showToast } from "@/components/ui";
import { fetchAPI } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatCurrency } from "@/lib/utils";
import { APIAccountSummary, APIBalanceSheet, BalanceSheetView } from "@/types";
import { useCallback, useState } from "react";

export function BalanceSheetTab({ onLoad }: { onLoad?: () => void }) {
    const [isLoading, setIsLoading] = useState(false);
    const [balanceSheet, setBalanceSheet] = useState<BalanceSheetView | null>(null);

    const loadFinancialData = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await fetchAPI(API_ENDPOINTS.INTELLIGENCE.REPORTS.BALANCE_SHEET);

            if (response.success && response.data) {
                const apiData = response.data as APIBalanceSheet;

                const assetsAccounts = apiData.assets.accounts || [];
                const liabilitiesAccounts = apiData.liabilities.accounts || [];
                const equityAccounts = apiData.equity.accounts || [];

                // Helper to sum accounts based on criteria without double counting within a category
                const getSum = (accounts: APIAccountSummary[], criteria: { start?: string, has?: string }[]) => {
                    const uniqueAccounts = new Set<string>();
                    return accounts.filter(a => {
                        const match = criteria.some(c =>
                            (c.start && a.account_code.startsWith(c.start)) ||
                            (c.has && a.account_name.toLowerCase().includes(c.has))
                        );
                        if (match && !uniqueAccounts.has(a.account_code)) {
                            uniqueAccounts.add(a.account_code);
                            return true;
                        }
                        return false;
                    }).reduce((sum, a) => sum + Number(a.balance), 0);
                };

                // Assets Mapping
                const cash = getSum(assetsAccounts, [
                    { start: '101' }, { start: '111' }, { has: 'cash' }, { has: catalogMessage("text_ae53d36eb89a") }, { has: catalogMessage("text_5dd57ac23e9a") }, { has: catalogMessage("text_e8c39755d5e8") }
                ]);
                const stock = getSum(assetsAccounts, [
                    { start: '113' }, { has: 'inventory' }, { has: catalogMessage("text_355217b16f3a") }, { has: catalogMessage("text_9173745d7bd5") }
                ]);
                const fixed = getSum(assetsAccounts, [
                    { start: '12' }, { start: '15' }, { has: 'fixed' }, { has: catalogMessage("text_564c9bf3f131") }, { has: catalogMessage("text_441296311989") }, { has: catalogMessage("text_707efed205f7") }
                ]);
                const ar = getSum(assetsAccounts, [
                    { start: '112' }, { has: 'receivable' }, { has: catalogMessage("text_36afc9ba115a") }, { has: catalogMessage("text_c879d1efe3d3") }
                ]);

                const totalAssets = Number(apiData.assets.total || 0);

                // Liabilities Mapping
                const payable = getSum(liabilitiesAccounts, [
                    { start: '211' }, { has: 'payable' }, { has: catalogMessage("text_09b27bb7a062") }, { has: catalogMessage("text_0d4ea606b882") }
                ]);
                const tax = getSum(liabilitiesAccounts, [
                    { start: '22' }, { has: 'vat' }, { has: 'tax' }, { has: catalogMessage("text_3a1f79e34162") }, { has: catalogMessage("text_16b6be5f9bba") }
                ]);
                const loans = getSum(liabilitiesAccounts, [
                    { start: '23' }, { has: 'loan' }, { has: 'bank' }, { has: catalogMessage("text_f7bdfc7fa11a") }, { has: catalogMessage("text_a644a3229aa3") }
                ]);

                const totalLiabilities = Number(apiData.liabilities.total || 0);

                // Equity Mapping
                const capital = getSum(equityAccounts, [
                    { start: '31' }, { has: 'capital' }, { has: catalogMessage("text_659bd974c93a") }
                ]);
                const retained = getSum(equityAccounts, [
                    { start: '32' }, { has: 'retained' }, { has: catalogMessage("text_0652dc915c7a") }, { has: catalogMessage("text_91cca632f8df") }
                ]);

                const totalEquity = Number(apiData.equity.total || 0);

                const mappedData: BalanceSheetView = {
                    assets: {
                        cash_estimate: cash,
                        stock_value: stock,
                        fixed_assets: fixed,
                        accounts_receivable: ar,
                        other_assets: Math.max(0, totalAssets - (cash + stock + fixed + ar)),
                        total_assets: totalAssets,
                    },
                    liabilities: {
                        accounts_payable: payable,
                        tax_payable: tax,
                        loans: loans,
                        other_liabilities: Math.max(0, totalLiabilities - (payable + tax + loans)),
                        total_liabilities: totalLiabilities,
                    },
                    equity: {
                        capital: capital,
                        retained_earnings: retained,
                        other_equity: Math.max(0, totalEquity - (capital + retained)),
                        total_equity: totalEquity,
                    },
                    total_liabilities_and_equity: Number(apiData.total_liabilities_and_equity || 0),
                    is_balanced: apiData.is_balanced
                };
                setBalanceSheet(mappedData);
                if (onLoad) onLoad();
            } else {
                showToast(catalogMessage("text_5a545fc8201f"), "error");
            }
        } catch (error) {
            console.error(error);
            showToast(catalogMessage("text_22fa79f17c32"), "error");
        } finally {
            setIsLoading(false);
        }
    }, [onLoad]);

    // Initial load? Consider checking if user wants auto-load or manual
    // For now we expose the load function via a button and maybe useEffect in parent if needed, 
    // but the tab structure usually implies loading on mount or demand.
    // The previous implementation loaded on mount of the page.

    // We can use useEffect to load on mount
    useState(() => {
        loadFinancialData();
    });

    return (
        <div className="sales-card balance-sheet-wrapper">
            <PageSubHeader
                title={catalogMessage("text_ad62a7b84f05")}
                titleIcon="chart-line"
                actions={
                    <>
                        <Button
                            variant="primary"
                            icon="sync"
                            onClick={loadFinancialData}
                        >
                            {catalogMessage("text_5bc457c0bbd7")}</Button>
                    </>
                }
            />

            {isLoading ? (
                <div style={{ textAlign: "center", padding: "5rem" }}>
                    <i className="fas fa-spinner fa-spin" style={{ fontSize: "2.5rem", color: "var(--primary-color)" }}></i>
                    <p style={{ marginTop: "1rem", fontSize: "1.1rem" }}>{catalogMessage("text_408d5526924a")}</p>
                </div>
            ) : balanceSheet ? (
                <div className="animate-fade">
                    {/* Summary Cards Row */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
                        <div className="sales-card" style={{ borderTop: "4px solid var(--success-color)", padding: "1.5rem" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <div>
                                    <h3 style={{ fontSize: "1rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>{catalogMessage("text_37252061e51e")}</h3>
                                    <div style={{ fontSize: "1.8rem", fontWeight: "bold", color: "var(--success-color)" }}>
                                        {formatCurrency(balanceSheet.assets.total_assets)}
                                    </div>
                                </div>
                                <div style={{ backgroundColor: "rgba(var(--success-rgb), 0.1)", padding: "1rem", borderRadius: "50%" }}>
                                    <i className="fas fa-wallet fa-lg" style={{ color: "var(--success-color)" }}></i>
                                </div>
                            </div>
                        </div>
                        <div className="sales-card" style={{ borderTop: "4px solid var(--danger-color)", padding: "1.5rem" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <div>
                                    <h3 style={{ fontSize: "1rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>{catalogMessage("text_8080273e1c6e")}</h3>
                                    <div style={{ fontSize: "1.8rem", fontWeight: "bold", color: "var(--danger-color)" }}>
                                        {formatCurrency(balanceSheet.liabilities.total_liabilities)}
                                    </div>
                                </div>
                                <div style={{ backgroundColor: "rgba(var(--danger-rgb), 0.1)", padding: "1rem", borderRadius: "50%" }}>
                                    <i className="fas fa-file-invoice-dollar fa-lg" style={{ color: "var(--danger-color)" }}></i>
                                </div>
                            </div>
                        </div>
                        <div className="sales-card" style={{ borderTop: "4px solid var(--primary-color)", padding: "1.5rem" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <div>
                                    <h3 style={{ fontSize: "1rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>{catalogMessage("text_f70618f9ec8a")}</h3>
                                    <div style={{ fontSize: "1.8rem", fontWeight: "bold", color: "var(--primary-color)" }}>
                                        {formatCurrency(balanceSheet.equity.total_equity)}
                                    </div>
                                </div>
                                <div style={{ backgroundColor: "rgba(var(--primary-rgb), 0.1)", padding: "1rem", borderRadius: "50%" }}>
                                    <i className="fas fa-piggy-bank fa-lg" style={{ color: "var(--primary-color)" }}></i>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Report Layout */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "2rem" }}>
                        {/* Assets Column */}
                        <div className="sales-card h-full">
                            <div style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "1rem", marginBottom: "1rem" }}>
                                <h2 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                    <i className="fas fa-cubes text-success"></i> {catalogMessage("text_713bcf7c8d44")}</h2>
                            </div>

                            <div className="financial-section">
                                <div className="financial-row">
                                    <span className="report-label">{catalogMessage("text_b2354ccd7967")}</span>
                                    <span className="report-value">{formatCurrency(balanceSheet.assets.cash_estimate)}</span>
                                </div>
                                <div className="financial-row">
                                    <span className="report-label">{catalogMessage("text_5a7a1f020cdd")}</span>
                                    <span className="report-value">{formatCurrency(balanceSheet.assets.stock_value)}</span>
                                </div>
                                <div className="financial-row">
                                    <span className="report-label">{catalogMessage("text_0b364f5af1be")}</span>
                                    <span className="report-value">{formatCurrency(balanceSheet.assets.accounts_receivable)}</span>
                                </div>
                                <div className="financial-row">
                                    <span className="report-label">{catalogMessage("text_e5544986019d")}</span>
                                    <span className="report-value">{formatCurrency(balanceSheet.assets.fixed_assets)}</span>
                                </div>
                                {balanceSheet.assets.other_assets > 0 && (
                                    <div className="financial-row">
                                        <span className="report-label">{catalogMessage("text_575af647048a")}</span>
                                        <span className="report-value">{formatCurrency(balanceSheet.assets.other_assets)}</span>
                                    </div>
                                )}
                                <div className="financial-row total-row" style={{ marginTop: "2rem", borderTop: "2px dashed var(--border-color)", paddingTop: "1rem" }}>
                                    <span className="report-label font-bold text-lg">{catalogMessage("text_37252061e51e")}</span>
                                    <span className="report-value text-success font-bold text-lg">{formatCurrency(balanceSheet.assets.total_assets)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Liabilities & Equity Column */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                            {/* Liabilities */}
                            <div className="sales-card">
                                <div style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "1rem", marginBottom: "1rem" }}>
                                    <h2 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                        <i className="fas fa-hand-holding-usd text-danger"></i> {catalogMessage("text_6bd373fdd253")}</h2>
                                </div>
                                <div className="financial-section">
                                    <div className="financial-row">
                                        <span className="report-label">{catalogMessage("text_f4460e8ce12c")}</span>
                                        <span className="report-value">{formatCurrency(balanceSheet.liabilities.accounts_payable)}</span>
                                    </div>
                                    <div className="financial-row">
                                        <span className="report-label">{catalogMessage("text_4dde21aae599")}</span>
                                        <span className="report-value">{formatCurrency(balanceSheet.liabilities.tax_payable)}</span>
                                    </div>
                                    {balanceSheet.liabilities.loans > 0 && (
                                        <div className="financial-row">
                                            <span className="report-label">{catalogMessage("text_3fdfe7c630b2")}</span>
                                            <span className="report-value">{formatCurrency(balanceSheet.liabilities.loans)}</span>
                                        </div>
                                    )}
                                    {balanceSheet.liabilities.other_liabilities > 0 && (
                                        <div className="financial-row">
                                            <span className="report-label">{catalogMessage("text_0e6dae3b7180")}</span>
                                            <span className="report-value">{formatCurrency(balanceSheet.liabilities.other_liabilities)}</span>
                                        </div>
                                    )}
                                    <div className="financial-row total-row" style={{ marginTop: "1rem", borderTop: "1px solid var(--border-color)", paddingTop: "0.5rem" }}>
                                        <span className="report-label font-bold">{catalogMessage("text_8080273e1c6e")}</span>
                                        <span className="report-value text-danger font-bold">{formatCurrency(balanceSheet.liabilities.total_liabilities)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Equity */}
                            <div className="sales-card">
                                <div style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "1rem", marginBottom: "1rem" }}>
                                    <h2 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                        <i className="fas fa-balance-scale text-primary"></i> {catalogMessage("text_44c108da36be")}</h2>
                                </div>
                                <div className="financial-section">
                                    <div className="financial-row">
                                        <span className="report-label">{catalogMessage("text_659bd974c93a")}</span>
                                        <span className="report-value">{formatCurrency(balanceSheet.equity.capital)}</span>
                                    </div>
                                    <div className="financial-row">
                                        <span className="report-label">{catalogMessage("text_c608c372ab22")}</span>
                                        <span className="report-value">{formatCurrency(balanceSheet.equity.retained_earnings)}</span>
                                    </div>
                                    {balanceSheet.equity.other_equity > 0 && (
                                        <div className="financial-row">
                                            <span className="report-label">{catalogMessage("text_3419515e0234")}</span>
                                            <span className="report-value">{formatCurrency(balanceSheet.equity.other_equity)}</span>
                                        </div>
                                    )}
                                    <div className="financial-row total-row" style={{ marginTop: "1rem", borderTop: "1px solid var(--border-color)", paddingTop: "0.5rem" }}>
                                        <span className="report-label font-bold">{catalogMessage("text_f70618f9ec8a")}</span>
                                        <span className="report-value text-primary font-bold">{formatCurrency(balanceSheet.equity.total_equity)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Balance Check Bar */}
                    <div className={`sales-card ${balanceSheet.is_balanced ? 'border-l-4 border-success' : 'border-l-4 border-danger'}`} style={{ marginTop: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.5rem" }}>
                        <div>
                            <h3 style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>{catalogMessage("text_5b086dc92cb6")}</h3>
                            <p style={{ color: "var(--text-secondary)" }}>{catalogMessage("text_92da02adbd1a")}</p>
                        </div>
                        <div style={{ textAlign: "left" }}>
                            <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "var(--primary-dark)" }}>
                                {formatCurrency(balanceSheet.total_liabilities_and_equity)}
                            </div>
                            <div style={{ fontSize: "0.9rem", color: balanceSheet.is_balanced ? "var(--success-color)" : "var(--danger-color)" }}>
                                {balanceSheet.is_balanced ? (
                                    <span><i className="fas fa-check-circle"></i> {catalogMessage("text_f3d73400a584")}</span>
                                ) : (
                                    <span><i className="fas fa-exclamation-triangle"></i> {catalogMessage("text_47fcb1d55897")}{formatCurrency(balanceSheet.assets.total_assets - balanceSheet.total_liabilities_and_equity)}</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <p style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)" }}>{catalogMessage("text_d812e8bbc06f")}</p>
            )}
        </div>
    );
}
