"use client";

import { useI18n, catalogMessage } from "@/lib/i18n";
import { Column, Label, Table } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import { Employee, EmployeeAllowance, EmployeeDeduction } from "@/types";

interface FinancialTabProps {
    employee: Employee;
}

const FREQ_MAP: Record<string, string> = {
    monthly: catalogMessage("common.general.monthly"),
    quarterly: catalogMessage("common.general.quarterly"),
    annual: catalogMessage("common.general.annual"),
    one_time: catalogMessage("humanCapital.financial.once"),
};

function SectionHeader({ icon, title }: { icon: string; title: string }) {
    return (
        <div className="section-card-header">
            <i className={`fas ${icon} fa-lg`}></i>
            <h4 style={{ margin: 0 }}>{title}</h4>
        </div>
    );
}

export default function FinancialTab({ employee }: FinancialTabProps) {
    const { t: i18n } = useI18n();
    const allowanceCols: Column<EmployeeAllowance>[] = [
        { key: "allowance_name", header: i18n.catalog["common.general.allowanceName"], dataLabel: i18n.catalog["common.general.allowanceName"] },
        { key: "amount", header: i18n.catalog["common.general.amount"], dataLabel: i18n.catalog["common.general.amount"], render: (item) => formatCurrency(item.amount) },
        { key: "frequency", header: i18n.catalog["common.general.recurrence"], dataLabel: i18n.catalog["common.general.recurrence"], render: (item) => FREQ_MAP[item.frequency] || item.frequency },
        { key: "start_date", header: i18n.catalog["common.general.date.alternative6"], dataLabel: i18n.catalog["common.general.date.alternative6"] },
        { key: "end_date", header: i18n.catalog["common.general.date.alternative2"], dataLabel: i18n.catalog["common.general.date.alternative2"], render: (item) => item.end_date || i18n.catalog["common.general.ongoing"] },
        {
            key: "is_active", header: i18n.catalog["common.general.status.alternative2"], dataLabel: i18n.catalog["common.general.status.alternative2"], render: (item) => (
                <span className={`badge ${item.is_active ? 'badge-success' : 'badge-danger'}`}>
                    {item.is_active ? i18n.catalog["common.general.active.alternative4"] : i18n.catalog["common.general.stopped"]}
                </span>
            )
        },
    ];

    const deductionCols: Column<EmployeeDeduction>[] = [
        { key: "deduction_name", header: i18n.catalog["common.general.deductionName"], dataLabel: i18n.catalog["common.general.deductionName"] },
        { key: "amount", header: i18n.catalog["common.general.amount"], dataLabel: i18n.catalog["common.general.amount"], render: (item) => formatCurrency(item.amount) },
        { key: "frequency", header: i18n.catalog["common.general.recurrence"], dataLabel: i18n.catalog["common.general.recurrence"], render: (item) => FREQ_MAP[item.frequency] || item.frequency },
        { key: "start_date", header: i18n.catalog["common.general.date.alternative6"], dataLabel: i18n.catalog["common.general.date.alternative6"] },
        { key: "end_date", header: i18n.catalog["common.general.date.alternative2"], dataLabel: i18n.catalog["common.general.date.alternative2"], render: (item) => item.end_date || i18n.catalog["common.general.ongoing"] },
        {
            key: "is_active", header: i18n.catalog["common.general.status.alternative2"], dataLabel: i18n.catalog["common.general.status.alternative2"], render: (item) => (
                <span className={`badge ${item.is_active ? 'badge-success' : 'badge-danger'}`}>
                    {item.is_active ? i18n.catalog["common.general.active.alternative4"] : i18n.catalog["common.general.stopped"]}
                </span>
            )
        },
    ];

    return (
        <div className="employee-financial-tab animate-fade">
            {/* Salary Summary */}
            <div className="financial-summary-grid">
                <div className="financial-summary-card section-card sales-card">
                    <div className="financial-card-icon" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                        <i className="fas fa-money-bill-wave"></i>
                    </div>
                    <div>
                        <Label className="text-muted" style={{ fontSize: '0.8rem' }}>{i18n.catalog["common.general.basicSalary"]}</Label>
                        <div className="fw-bold" style={{ fontSize: '1.25rem', color: '#10b981' }}>{formatCurrency(employee.base_salary)}</div>
                    </div>
                </div>
                <div className="financial-summary-card section-card sales-card">
                    <div className="financial-card-icon" style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}>
                        <i className="fas fa-plus-circle"></i>
                    </div>
                    <div>
                        <Label className="text-muted" style={{ fontSize: '0.8rem' }}>{i18n.catalog["humanCapital.financial.totalAllowances"]}</Label>
                        <div className="fw-bold" style={{ fontSize: '1.25rem', color: '#6366f1' }}>
                            {formatCurrency(
                                (employee.allowances || []).filter(a => a.is_active).reduce((sum, a) => sum + a.amount, 0)
                            )}
                        </div>
                    </div>
                </div>
                <div className="financial-summary-card section-card sales-card">
                    <div className="financial-card-icon" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
                        <i className="fas fa-minus-circle"></i>
                    </div>
                    <div>
                        <Label className="text-muted" style={{ fontSize: '0.8rem' }}>{i18n.catalog["common.general.totalDeductions"]}</Label>
                        <div className="fw-bold" style={{ fontSize: '1.25rem', color: '#ef4444' }}>
                            {formatCurrency(
                                (employee.deductions || []).filter(d => d.is_active).reduce((sum, d) => sum + d.amount, 0)
                            )}
                        </div>
                    </div>
                </div>
                <div className="financial-summary-card section-card sales-card">
                    <div className="financial-card-icon" style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)' }}>
                        <i className="fas fa-calculator"></i>
                    </div>
                    <div>
                        <Label className="text-muted" style={{ fontSize: '0.8rem' }}>{i18n.catalog["humanCapital.financial.estimatedNetSalary"]}</Label>
                        <div className="fw-bold" style={{ fontSize: '1.25rem', color: '#0ea5e9' }}>
                            {formatCurrency(
                                employee.base_salary
                                + (employee.allowances || []).filter(a => a.is_active && a.frequency === 'monthly').reduce((s, a) => s + a.amount, 0)
                                - (employee.deductions || []).filter(d => d.is_active && d.frequency === 'monthly').reduce((s, d) => s + d.amount, 0)
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Allowances Table */}
            <div className="settings-wrapper animate-fade">

                <div className="section-card sales-card mb-4" style={{ padding: '1.5rem' }}>
                    <SectionHeader icon="fa-hand-holding-usd" title={i18n.catalog["common.general.allowances"]} />
                    {(employee.allowances || []).length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                            <i className="fas fa-inbox fa-2x" style={{ opacity: 0.3, marginBottom: '0.5rem' }}></i>
                            <p>{i18n.catalog["humanCapital.financial.noAllowancesRecordedThisEmployee"]}</p>
                        </div>
                    ) : (
                        <Table
                            columns={allowanceCols}
                            data={employee.allowances || []}
                            keyExtractor={(item) => item.id}
                            emptyMessage={i18n.catalog["humanCapital.financial.noAllowances"]}
                        />
                    )}
                </div>

                {/* Deductions Table */}
                <div className="section-card sales-card mb-4" style={{ padding: '1.5rem' }}>
                    <SectionHeader icon="fa-file-invoice-dollar" title={i18n.catalog["humanCapital.financial.deductions"]} />
                    {(employee.deductions || []).length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                            <i className="fas fa-inbox fa-2x" style={{ opacity: 0.3, marginBottom: '0.5rem' }}></i>
                            <p>{i18n.catalog["humanCapital.financial.noDeductionsRecordedThisEmployee"]}</p>
                        </div>
                    ) : (
                        <Table
                            columns={deductionCols}
                            data={employee.deductions || []}
                            keyExtractor={(item) => item.id}
                            emptyMessage={i18n.catalog["humanCapital.financial.noDeductions"]}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
