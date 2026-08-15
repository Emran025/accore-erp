"use client";

import { useI18n } from "@/lib/i18n";
import { PageSubHeader } from "@/components/layout";
import { Button, Label } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import { useAuthStore } from "@/stores/useAuthStore";
import { useRouter } from "next/navigation";
import { Employee } from "@/types";

interface BasicInfoTabProps {
    employee: Employee;
}

export default function BasicInfoTab({ employee }: BasicInfoTabProps) {
    const { t: i18n } = useI18n();
    const router = useRouter();
    const { canAccess } = useAuthStore();

    return (
        <div className="sales-card animate-fade">
            <div className="settings-wrapper animate-fade">
                <PageSubHeader
                    title={i18n.catalog["text_acce4e6869c7"]}
                    titleIcon="user-circle"
                    actions={
                        <div className="flex gap-2">
                            {canAccess("employees", "edit") && (
                                <Button variant="primary" icon="edit" onClick={() => router.push(`/06-human-capital/workforce-admin/employee-master/employees-list/edit/${employee.id}`)}> {i18n.catalog["text_69eaa2fbae93"]}</Button>
                            )}
                        </div>
                    }
                />

                {/* Personal Info */}
                <div className="section-card sales-card mb-4" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem', gap: '0.5rem', color: 'var(--primary-color)' }}>
                        <i className="fas fa-user-circle fa-lg"></i>
                        <h4 style={{ margin: 0 }}>{i18n.catalog["text_27a850003581"]}</h4>
                    </div>
                    <div className="info-grid">
                        <div>
                            <Label className="text-muted">{i18n.catalog["text_6c2ab9bdeb2c"]}</Label>
                            <div className="fw-bold">{employee.full_name}</div>
                        </div>
                        <div>
                            <Label className="text-muted">{i18n.catalog["text_ddf0fca39a4f"]}</Label>
                            <div>{employee.email}</div>
                        </div>
                        <div>
                            <Label className="text-muted">{i18n.catalog["text_f83a8d749bfe"]}</Label>
                            <div>{employee.national_id || '-'}</div>
                        </div>
                        <div>
                            <Label className="text-muted">{i18n.catalog["text_3364645354dd"]}</Label>
                            <div>{employee.date_of_birth || '-'}</div>
                        </div>
                        <div>
                            <Label className="text-muted">{i18n.catalog["text_a79dffdd2070"]}</Label>
                            <div>{employee.gender === 'male' ? i18n.catalog["text_2f13379bf81e"] : employee.gender === 'female' ? i18n.catalog["text_d2ee47ec7d05"] : '-'}</div>
                        </div>
                        <div>
                            <Label className="text-muted">{i18n.catalog["text_42095a7a6c15"]}</Label>
                            <div dir="ltr" style={{ textAlign: 'right' }}>{employee.phone || '-'}</div>
                        </div>
                        <div>
                            <Label className="text-muted">{i18n.catalog["text_2d110e56d5f5"]}</Label>
                            <div>{employee.address || '-'}</div>
                        </div>
                    </div>
                </div>

                {/* Employment Info */}
                <div className="section-card sales-card mb-4" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem', gap: '0.5rem', color: 'var(--primary-color)' }}>
                        <i className="fas fa-briefcase fa-lg"></i>
                        <h4 style={{ margin: 0 }}>{i18n.catalog["text_374aa726c036"]}</h4>
                    </div>
                    <div className="info-grid">
                        <div>
                            <Label className="text-muted">{i18n.catalog["text_092f08fd75ac"]}</Label>
                            <div className="fw-bold">{employee.employee_code}</div>
                        </div>
                        <div>
                            <Label className="text-muted">{i18n.catalog["text_de98bd734462"]}</Label>
                            <div>{employee.role?.role_name_ar || '-'}</div>
                        </div>
                        <div>
                            <Label className="text-muted">{i18n.catalog["text_0771c3ff9336"]}</Label>
                            <div>{employee.department?.name_ar || '-'}</div>
                        </div>
                        <div>
                            <Label className="text-muted">{i18n.catalog["text_057fc55c3df6"]}</Label>
                            <div>{employee.hire_date}</div>
                        </div>
                        <div>
                            <Label className="text-muted">{i18n.catalog["text_2b9fa3db572a"]}</Label>
                            <div>{employee.contract_type === 'full_time' ? i18n.catalog["text_ae607c34c510"] : employee.contract_type === 'part_time' ? i18n.catalog["text_68b482db7711"] : employee.contract_type === 'contract' ? i18n.catalog["text_3a37e27594c0"] : i18n.catalog["text_7d6bc53d4745"]}</div>
                        </div>
                        <div>
                            <Label className="text-muted">{i18n.catalog["text_c3a4749caed4"]}</Label>
                            <div>
                                <span className={`badge ${employee.employment_status === 'active' ? 'badge-success' : employee.employment_status === 'suspended' ? 'badge-warning' : 'badge-danger'}`}>
                                    {employee.employment_status === 'active' ? i18n.catalog["text_629e90b3af3d"] : employee.employment_status === 'suspended' ? i18n.catalog["text_701d5d7a86f9"] : i18n.catalog["text_ec0852e29a7e"]}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Financial Info */}
                <div className="section-card sales-card mb-4" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem', gap: '0.5rem', color: 'var(--primary-color)' }}>
                        <i className="fas fa-money-check-alt fa-lg"></i>
                        <h4 style={{ margin: 0 }}>{i18n.catalog["text_6b7790de11d3"]}</h4>
                    </div>
                    <div className="info-grid">
                        <div>
                            <Label className="text-muted">{i18n.catalog["text_73ad6b20ceb7"]}</Label>
                            <div className="fw-bold text-success">{formatCurrency(employee.base_salary)}</div>
                        </div>
                        <div>
                            <Label className="text-muted">{i18n.catalog["text_79cc07b91844"]}</Label>
                            <div>{employee.gosi_number || '-'}</div>
                        </div>
                        <div>
                            <Label className="text-muted">{i18n.catalog["text_c6d5a7b17fc0"]}</Label>
                            <div>{employee.bank_name || '-'}</div>
                        </div>
                        <div>
                            <Label className="text-muted">{i18n.catalog["text_02344ad8279d"]}</Label>
                            <div style={{ fontFamily: 'monospace' }}>{employee.iban || '-'}</div>
                        </div>
                        <div>
                            <Label className="text-muted">{i18n.catalog["text_65c7b5f96855"]}</Label>
                            <div>{employee.vacation_days_balance} {i18n.catalog["text_eb07f635d883"]}</div>
                        </div>
                    </div>
                </div>
            </div>
            <style jsx>{`
                .info-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1rem;
                }
            `}</style>
        </div>
    );
}
