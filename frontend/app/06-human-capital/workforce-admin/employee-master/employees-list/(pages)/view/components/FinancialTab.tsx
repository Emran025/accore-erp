"use client";

import { useI18n, catalogMessage } from "@/lib/i18n";
import { Column, Label, Table } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import { Employee, EmployeeAllowance, EmployeeDeduction } from "@/types";

interface FinancialTabProps {
    employee: Employee;
}

const FREQ_MAP: Record<string, string> = {
    monthly: catalogMessage("text_9c677bb93912"),
    quarterly: catalogMessage("text_eb380eddf1ec"),
    annual: catalogMessage("text_1beeff0b0fec"),
    one_time: catalogMessage("text_630ffdfa5ebf"),
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
        { key: "allowance_name", header: i18n.catalog["text_9d082b94fbf7"], dataLabel: i18n.catalog["text_9d082b94fbf7"] },
        { key: "amount", header: i18n.catalog["text_1cd480f91b24"], dataLabel: i18n.catalog["text_1cd480f91b24"], render: (item) => formatCurrency(item.amount) },
        { key: "frequency", header: i18n.catalog["text_b308d640bc25"], dataLabel: i18n.catalog["text_b308d640bc25"], render: (item) => FREQ_MAP[item.frequency] || item.frequency },
        { key: "start_date", header: i18n.catalog["text_996988dbc52e"], dataLabel: i18n.catalog["text_996988dbc52e"] },
        { key: "end_date", header: i18n.catalog["text_217caed1c04f"], dataLabel: i18n.catalog["text_217caed1c04f"], render: (item) => item.end_date || i18n.catalog["text_4a954b8fc807"] },
        {
            key: "is_active", header: i18n.catalog["text_c3a4749caed4"], dataLabel: i18n.catalog["text_c3a4749caed4"], render: (item) => (
                <span className={`badge ${item.is_active ? 'badge-success' : 'badge-danger'}`}>
                    {item.is_active ? i18n.catalog["text_d9987da5d3f5"] : i18n.catalog["text_0494e50b7138"]}
                </span>
            )
        },
    ];

    const deductionCols: Column<EmployeeDeduction>[] = [
        { key: "deduction_name", header: i18n.catalog["text_4365babe7fb7"], dataLabel: i18n.catalog["text_4365babe7fb7"] },
        { key: "amount", header: i18n.catalog["text_1cd480f91b24"], dataLabel: i18n.catalog["text_1cd480f91b24"], render: (item) => formatCurrency(item.amount) },
        { key: "frequency", header: i18n.catalog["text_b308d640bc25"], dataLabel: i18n.catalog["text_b308d640bc25"], render: (item) => FREQ_MAP[item.frequency] || item.frequency },
        { key: "start_date", header: i18n.catalog["text_996988dbc52e"], dataLabel: i18n.catalog["text_996988dbc52e"] },
        { key: "end_date", header: i18n.catalog["text_217caed1c04f"], dataLabel: i18n.catalog["text_217caed1c04f"], render: (item) => item.end_date || i18n.catalog["text_4a954b8fc807"] },
        {
            key: "is_active", header: i18n.catalog["text_c3a4749caed4"], dataLabel: i18n.catalog["text_c3a4749caed4"], render: (item) => (
                <span className={`badge ${item.is_active ? 'badge-success' : 'badge-danger'}`}>
                    {item.is_active ? i18n.catalog["text_d9987da5d3f5"] : i18n.catalog["text_0494e50b7138"]}
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
                        <Label className="text-muted" style={{ fontSize: '0.8rem' }}>{i18n.catalog["text_73ad6b20ceb7"]}</Label>
                        <div className="fw-bold" style={{ fontSize: '1.25rem', color: '#10b981' }}>{formatCurrency(employee.base_salary)}</div>
                    </div>
                </div>
                <div className="financial-summary-card section-card sales-card">
                    <div className="financial-card-icon" style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}>
                        <i className="fas fa-plus-circle"></i>
                    </div>
                    <div>
                        <Label className="text-muted" style={{ fontSize: '0.8rem' }}>{i18n.catalog["text_8979019a1ec4"]}</Label>
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
                        <Label className="text-muted" style={{ fontSize: '0.8rem' }}>{i18n.catalog["text_496117914733"]}</Label>
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
                        <Label className="text-muted" style={{ fontSize: '0.8rem' }}>{i18n.catalog["text_62a97b6457c5"]}</Label>
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
                    <SectionHeader icon="fa-hand-holding-usd" title={i18n.catalog["text_47ad42ce3bd0"]} />
                    {(employee.allowances || []).length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                            <i className="fas fa-inbox fa-2x" style={{ opacity: 0.3, marginBottom: '0.5rem' }}></i>
                            <p>{i18n.catalog["text_d74d1817d302"]}</p>
                        </div>
                    ) : (
                        <Table
                            columns={allowanceCols}
                            data={employee.allowances || []}
                            keyExtractor={(item) => item.id}
                            emptyMessage={i18n.catalog["text_99d610b2bbc8"]}
                        />
                    )}
                </div>

                {/* Deductions Table */}
                <div className="section-card sales-card mb-4" style={{ padding: '1.5rem' }}>
                    <SectionHeader icon="fa-file-invoice-dollar" title={i18n.catalog["text_0e0b6ba3a2a1"]} />
                    {(employee.deductions || []).length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                            <i className="fas fa-inbox fa-2x" style={{ opacity: 0.3, marginBottom: '0.5rem' }}></i>
                            <p>{i18n.catalog["text_05f7ff6c7db9"]}</p>
                        </div>
                    ) : (
                        <Table
                            columns={deductionCols}
                            data={employee.deductions || []}
                            keyExtractor={(item) => item.id}
                            emptyMessage={i18n.catalog["text_a14e8d0f48d4"]}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
