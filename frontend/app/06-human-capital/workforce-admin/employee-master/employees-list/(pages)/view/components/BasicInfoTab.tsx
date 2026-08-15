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
                    title={i18n.catalog["humanCapital.basicinfo.employeeBasicData"]}
                    titleIcon="user-circle"
                    actions={
                        <div className="flex gap-2">
                            {canAccess("employees", "edit") && (
                                <Button variant="primary" icon="edit" onClick={() => router.push(`/06-human-capital/workforce-admin/employee-master/employees-list/edit/${employee.id}`)}> {i18n.catalog["common.general.editData"]}</Button>
                            )}
                        </div>
                    }
                />

                {/* Personal Info */}
                <div className="section-card sales-card mb-4" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem', gap: '0.5rem', color: 'var(--primary-color)' }}>
                        <i className="fas fa-user-circle fa-lg"></i>
                        <h4 style={{ margin: 0 }}>{i18n.catalog["common.general.personalInformation"]}</h4>
                    </div>
                    <div className="info-grid">
                        <div>
                            <Label className="text-muted">{i18n.catalog["common.general.fullName"]}</Label>
                            <div className="fw-bold">{employee.full_name}</div>
                        </div>
                        <div>
                            <Label className="text-muted">{i18n.catalog["common.general.email"]}</Label>
                            <div>{employee.email}</div>
                        </div>
                        <div>
                            <Label className="text-muted">{i18n.catalog["humanCapital.basicinfo.idResidency"]}</Label>
                            <div>{employee.national_id || '-'}</div>
                        </div>
                        <div>
                            <Label className="text-muted">{i18n.catalog["common.general.dateBirth"]}</Label>
                            <div>{employee.date_of_birth || '-'}</div>
                        </div>
                        <div>
                            <Label className="text-muted">{i18n.catalog["common.general.gender"]}</Label>
                            <div>{employee.gender === 'male' ? i18n.catalog["common.general.male"] : employee.gender === 'female' ? i18n.catalog["common.general.female"] : '-'}</div>
                        </div>
                        <div>
                            <Label className="text-muted">{i18n.catalog["common.general.phoneNumber"]}</Label>
                            <div dir="ltr" style={{ textAlign: 'right' }}>{employee.phone || '-'}</div>
                        </div>
                        <div>
                            <Label className="text-muted">{i18n.catalog["common.general.title"]}</Label>
                            <div>{employee.address || '-'}</div>
                        </div>
                    </div>
                </div>

                {/* Employment Info */}
                <div className="section-card sales-card mb-4" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem', gap: '0.5rem', color: 'var(--primary-color)' }}>
                        <i className="fas fa-briefcase fa-lg"></i>
                        <h4 style={{ margin: 0 }}>{i18n.catalog["common.general.employmentInformation"]}</h4>
                    </div>
                    <div className="info-grid">
                        <div>
                            <Label className="text-muted">{i18n.catalog["common.general.employeeNumber"]}</Label>
                            <div className="fw-bold">{employee.employee_code}</div>
                        </div>
                        <div>
                            <Label className="text-muted">{i18n.catalog["common.general.jobTitle.alternative3"]}</Label>
                            <div>{employee.role?.role_name_ar || '-'}</div>
                        </div>
                        <div>
                            <Label className="text-muted">{i18n.catalog["common.general.section"]}</Label>
                            <div>{employee.department?.name_ar || '-'}</div>
                        </div>
                        <div>
                            <Label className="text-muted">{i18n.catalog["common.general.hireDate"]}</Label>
                            <div>{employee.hire_date}</div>
                        </div>
                        <div>
                            <Label className="text-muted">{i18n.catalog["common.general.contractType"]}</Label>
                            <div>{employee.contract_type === 'full_time' ? i18n.catalog["common.general.fullTime"] : employee.contract_type === 'part_time' ? i18n.catalog["common.general.partTime"] : employee.contract_type === 'contract' ? i18n.catalog["humanCapital.basicinfo.fixedTermContract"] : i18n.catalog["common.general.freelance"]}</div>
                        </div>
                        <div>
                            <Label className="text-muted">{i18n.catalog["common.general.status.alternative2"]}</Label>
                            <div>
                                <span className={`badge ${employee.employment_status === 'active' ? 'badge-success' : employee.employment_status === 'suspended' ? 'badge-warning' : 'badge-danger'}`}>
                                    {employee.employment_status === 'active' ? i18n.catalog["common.general.active"] : employee.employment_status === 'suspended' ? i18n.catalog["common.general.pending"] : i18n.catalog["common.general.employmentTerminated"]}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Financial Info */}
                <div className="section-card sales-card mb-4" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem', gap: '0.5rem', color: 'var(--primary-color)' }}>
                        <i className="fas fa-money-check-alt fa-lg"></i>
                        <h4 style={{ margin: 0 }}>{i18n.catalog["common.general.financialInformation"]}</h4>
                    </div>
                    <div className="info-grid">
                        <div>
                            <Label className="text-muted">{i18n.catalog["common.general.basicSalary"]}</Label>
                            <div className="fw-bold text-success">{formatCurrency(employee.base_salary)}</div>
                        </div>
                        <div>
                            <Label className="text-muted">{i18n.catalog["common.general.gosiNumber"]}</Label>
                            <div>{employee.gosi_number || '-'}</div>
                        </div>
                        <div>
                            <Label className="text-muted">{i18n.catalog["common.general.bankName"]}</Label>
                            <div>{employee.bank_name || '-'}</div>
                        </div>
                        <div>
                            <Label className="text-muted">{i18n.catalog["humanCapital.basicinfo.ibanIban"]}</Label>
                            <div style={{ fontFamily: 'monospace' }}>{employee.iban || '-'}</div>
                        </div>
                        <div>
                            <Label className="text-muted">{i18n.catalog["common.general.leaveBalance"]}</Label>
                            <div>{employee.vacation_days_balance} {i18n.catalog["common.general.day"]}</div>
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
