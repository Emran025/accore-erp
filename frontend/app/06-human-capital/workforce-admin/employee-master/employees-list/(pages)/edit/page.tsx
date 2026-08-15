"use client";

import { useI18n, catalogText, catalogMessage } from "@/lib/i18n";
import { MainLayout } from "@/components/layout";
import { Button, EmailInput, Label, PasswordInput, SearchableSelect, Select, TabNavigation, TextInput } from "@/components/ui";
import { fetchAPI } from "@/lib/api";
import { getStoredUser, User } from "@/lib/auth";
import { API_ENDPOINTS } from "@/lib/endpoints";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Department, Employee, Role } from "@/types";

const DocumentsTab = dynamic(() => import("../../components/DocumentsTab"), {
    loading: () => <div className="p-10 text-center text-muted">{catalogMessage("common.general.loadingDocuments")}</div>
});

function EditEmployeePageContent() {
    const { t: i18n } = useI18n();
    const searchParams = useSearchParams();
    const id = searchParams.get("id") || "";
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [activeTab, setActiveTab] = useState("info");
    const [isLoading, setIsLoading] = useState(true);
    const [roles, setRoles] = useState<Role[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [positions, setPositions] = useState<any[]>([]);

    const [nrObjectId, setNrObjectId] = useState<number | null>(null);
    const [nrGroups, setNrGroups] = useState<any[]>([]);
    const [selectedGroup, setSelectedGroup] = useState("");
    const [employee, setEmployee] = useState<Employee | null>(null);

    const [formData, setFormData] = useState({
        full_name: '',
        employee_code: '',
        email: '',
        password: '',
        phone: '',
        national_id: '',
        gosi_number: '',
        date_of_birth: '',
        gender: 'male',
        address: '',
        role_id: '',
        department_id: '',
        hire_date: '',
        base_salary: '',
        iban: '',
        bank_name: '',
        employment_status: 'active',
        contract_type: 'full_time',
        vacation_days_balance: 0,
        position_id: '',
        termination_date: '',
        manager_id: '',
    });

    const [managers, setManagers] = useState<Employee[]>([]);

    useEffect(() => {
        setUser(getStoredUser());
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            const [rolesRes, deptsRes, empRes, posRes, managersRes] = await Promise.all([
                fetchAPI(API_ENDPOINTS.ENTERPRISE_CORE.IAM.USERS.ROLES),
                fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.DEPARTMENTS),
                fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.EMPLOYEES.withId(id)),
                fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.ADMINISTRATION.POSITIONS.BASE),
                fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.EMPLOYEES.BASE) // For manager selection
            ]);

            setRoles(rolesRes.data as Role[] || (Array.isArray(rolesRes) ? rolesRes : []));
            setDepartments(deptsRes.data as Department[] || (Array.isArray(deptsRes) ? deptsRes : []));
            setPositions(posRes.data as any[] || (Array.isArray(posRes) ? posRes : []));
            setManagers(managersRes.data as Employee[] || (Array.isArray(managersRes) ? (managersRes as any).data : []) || []);

            const emp = empRes.data as any || empRes;
            setEmployee(emp);

            // Populate form
            setFormData({
                full_name: emp.full_name,
                employee_code: emp.employee_code,
                email: emp.email,
                password: '',
                phone: emp.phone || '',
                national_id: emp.national_id || '',
                gosi_number: emp.gosi_number || '',
                date_of_birth: emp.date_of_birth || '',
                gender: emp.gender || 'male',
                address: emp.address || '',
                role_id: emp.role_id || '',
                department_id: emp.department_id || '',
                hire_date: emp.hire_date,
                base_salary: emp.base_salary,
                iban: emp.iban || '',
                bank_name: emp.bank_name || '',
                employment_status: emp.employment_status,
                contract_type: emp.contract_type || 'full_time',
                vacation_days_balance: emp.vacation_days_balance || 0,
                position_id: emp.position_id || '',
                termination_date: emp.termination_date || '',
                manager_id: emp.manager_id || '',
            });
        } catch (e) {
            console.error(i18n.catalog["common.general.failedLoadData"], e);
        } finally {
            setIsLoading(false);
        }

        // Load Numbering Range Groups 
        try {
            const nrRes: any = await fetchAPI(API_ENDPOINTS.PLATFORM.NUMBER_RANGES.OBJECTS.byType("employees"));
            if (nrRes.success && (nrRes.data || nrRes.id)) {
                const data = nrRes.data || nrRes;
                setNrObjectId(data.id);
                if (data.groups && data.groups.length > 0) {
                    setNrGroups(data.groups);
                }
            }
        } catch (e) {
            console.error(i18n.catalog["common.general.failedLoadNumberRangeGroups"], e);
        }
    };

    useEffect(() => {
        const fetchNextNumber = async () => {
            if (activeTab === 'info' && selectedGroup && nrObjectId && !formData.employee_code) {
                try {
                    const numRes: any = await fetchAPI(API_ENDPOINTS.PLATFORM.NUMBER_RANGES.NEXT_NUMBER, {
                        method: 'POST',
                        body: JSON.stringify({ object_id: nrObjectId, group_id: selectedGroup })
                    });

                    const generatedNumber = numRes.number || numRes.data?.number;
                    if (numRes.success && generatedNumber) {
                        setFormData(prev => ({ ...prev, employee_code: generatedNumber }));
                    }
                } catch (error) {
                    console.error(i18n.catalog["common.general.failedGenerateNumberingCode"], error);
                }
            }
        };
        fetchNextNumber();
    }, [selectedGroup, nrObjectId, activeTab]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.EMPLOYEES.withId(id), {
                method: 'PUT',
                body: JSON.stringify(formData),
            });

            if (res.success !== false) {
                alert(i18n.catalog["common.general.employeeDataUpdatedSuccessfully"]);
            } else {
                alert(i18n.catalog["humanCapital.pages.updateFailed"] + res.message);
            }
        } catch (error) {
            console.error(error);
            alert(i18n.catalog["common.general.unexpectedErrorOccurred"]);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <div className="p-5 text-center">{i18n.catalog["common.general.loading"]}</div>;

    return (
        <MainLayout >
            <div className="settings-wrapper animate-fade">
                <TabNavigation
                    tabs={[
                        { key: "info", label: i18n.catalog["common.general.basicInformation.alternative2"], icon: "fa-user" },
                        { key: "documents", label: i18n.catalog["common.general.documents"], icon: "fa-file" },
                        { key: "financial", label: i18n.catalog["common.general.allowancesDeductions"], icon: "fa-coins" },
                    ]}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                />

                <div>
                    {activeTab === 'info' && (
                        <form onSubmit={handleSubmit}>
                            {/* Personal Information */}
                            <div className="section-card sales-card mb-4" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem', gap: '0.5rem', color: 'var(--primary-color)' }}>
                                    <i className="fas fa-user-circle fa-lg"></i>
                                    <h4 style={{ margin: 0 }}>{i18n.catalog["common.general.personalInformation"]}</h4>
                                </div>
                                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                                    <TextInput label={i18n.catalog["common.general.fullName"]} name="full_name" required value={formData.full_name} onChange={handleChange} />
                                    <TextInput label={i18n.catalog["common.general.idResidenceNumber"]} name="national_id" value={formData.national_id} onChange={handleChange} />
                                    <TextInput label={i18n.catalog["common.general.dateBirth"]} type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} />
                                    <Select
                                        label={i18n.catalog["common.general.gender"]}
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                        options={[
                                            { value: 'male', label: i18n.catalog["common.general.male"] },
                                            { value: 'female', label: i18n.catalog["common.general.female"] }
                                        ]}
                                    />
                                    <TextInput label={i18n.catalog["common.general.phoneNumber"]} name="phone" value={formData.phone} onChange={handleChange} />
                                    <TextInput label={i18n.catalog["common.general.title"]} name="address" value={formData.address} onChange={handleChange} />
                                </div>
                            </div>

                            {/* Employment Information */}
                            <div className="section-card sales-card mb-4" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem', gap: '0.5rem', color: 'var(--primary-color)' }}>
                                    <i className="fas fa-briefcase fa-lg"></i>
                                    <h4 style={{ margin: 0 }}>{i18n.catalog["common.general.employmentInformation"]}</h4>
                                </div>
                                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                                    <TextInput label={i18n.catalog["common.general.employeeNumber"]} name="employee_code" required value={formData.employee_code} onChange={handleChange} placeholder={nrGroups.length > 0 ? i18n.catalog["common.general.generatedAutomatically"] : i18n.catalog["common.general.enterNumber"]} />
                                    {nrGroups.length > 0 && !formData.employee_code && (
                                        <Select
                                            label={i18n.catalog["common.general.numberingGroup"]}
                                            name="nr_group"
                                            value={selectedGroup}
                                            onChange={(e) => setSelectedGroup(e.target.value)}
                                            options={[
                                                { value: '', label: i18n.catalog["humanCapital.pages.selectNumberingSeriesGenerateNumber"] },
                                                ...nrGroups.map(grp => ({ value: grp.id.toString(), label: grp.name }))
                                            ]}
                                        />
                                    )}
                                    <Select
                                        label={i18n.catalog["common.general.jobTitle.alternative2"]}
                                        name="position_id"
                                        value={formData.position_id}
                                        onChange={handleChange}
                                        required
                                        placeholder={i18n.catalog["humanCapital.pages.selectJobPositionOrganizationalStructure"]}
                                        options={positions.map(pos => ({
                                            value: pos.id,
                                            label: catalogText(i18n, "common.general.message.alternative7", { value0: pos.position_name_ar, value1: pos.job_title?.title_ar || i18n.catalog["common.general.untitled"] })
                                        }))}
                                    />
                                    <TextInput label={i18n.catalog["common.general.hireDate"]} type="date" name="hire_date" required value={formData.hire_date} onChange={handleChange} />
                                    <Select
                                        label={i18n.catalog["common.general.contractType"]}
                                        name="contract_type"
                                        value={formData.contract_type}
                                        onChange={handleChange}
                                        options={[
                                            { value: 'full_time', label: i18n.catalog["common.general.fullTime"] },
                                            { value: 'part_time', label: i18n.catalog["common.general.partTime"] },
                                            { value: 'contract', label: i18n.catalog["common.general.fixedTermContract"] },
                                            { value: 'freelance', label: i18n.catalog["common.general.collaborationFreelance"] }
                                        ]}
                                    />
                                    <div className="form-group">
                                        <Label>{i18n.catalog["common.general.directManager"]}</Label>
                                        <SearchableSelect
                                            name="manager_id"
                                            value={formData.manager_id}
                                            onChange={(val) => setFormData({ ...formData, manager_id: val?.toString() || '' })}
                                            options={[
                                                { value: '', label: i18n.catalog["humanCapital.pages.noManagerSeniorManagement"] },
                                                ...managers.filter(m => m.id.toString() !== id).map(m => ({
                                                    value: m.id.toString(),
                                                    label: catalogText(i18n, "common.general.message.alternative7", { value0: m.full_name, value1: m.employee_code })
                                                }))
                                            ]}
                                        />
                                    </div>
                                    <Select
                                        label={i18n.catalog["common.general.employmentStatus"]}
                                        name="employment_status"
                                        value={formData.employment_status}
                                        onChange={handleChange}
                                        options={[
                                            { value: 'active', label: i18n.catalog["common.general.active"] },
                                            { value: 'suspended', label: i18n.catalog["common.general.pending"] },
                                            { value: 'terminated', label: i18n.catalog["common.general.employmentTerminated"] }
                                        ]}
                                    />
                                    {formData.employment_status === 'terminated' && (
                                        <TextInput label={i18n.catalog["humanCapital.pages.serviceEndDate"]} type="date" name="termination_date" value={formData.termination_date} onChange={handleChange} />
                                    )}
                                </div>
                            </div>

                            {/* Financial Information */}
                            <div className="section-card sales-card mb-4" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem', gap: '0.5rem', color: 'var(--primary-color)' }}>
                                    <i className="fas fa-money-check-alt fa-lg"></i>
                                    <h4 style={{ margin: 0 }}>{i18n.catalog["common.general.financialInformation"]}</h4>
                                </div>
                                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                                    <TextInput label={i18n.catalog["common.general.basicSalary"]} type="number" name="base_salary" required value={formData.base_salary} onChange={handleChange} min="0" step="0.01" />
                                    <TextInput label={i18n.catalog["common.general.gosiNumber"]} name="gosi_number" value={formData.gosi_number} onChange={handleChange} />
                                    <TextInput label={i18n.catalog["common.general.bankName"]} name="bank_name" value={formData.bank_name} onChange={handleChange} />
                                    <TextInput label={i18n.catalog["common.general.ibanNumber"]} name="iban" value={formData.iban} onChange={handleChange} />
                                    <TextInput label={i18n.catalog["common.general.leaveBalance"]} type="number" name="vacation_days_balance" value={formData.vacation_days_balance} onChange={handleChange} />
                                </div>
                            </div>

                            {/* Portal Credentials */}
                            <div className="section-card sales-card mb-4" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem', gap: '0.5rem', color: 'var(--primary-color)' }}>
                                    <i className="fas fa-lock fa-lg"></i>
                                    <h4 style={{ margin: 0 }}>{i18n.catalog["humanCapital.pages.updateLoginDetails"]}</h4>
                                </div>
                                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                                    <EmailInput label={i18n.catalog["common.general.email"]} name="email" required value={formData.email} onChange={handleChange} />
                                    <PasswordInput label={i18n.catalog["common.general.newPassword"]} name="password" value={formData.password} onChange={handleChange} minLength={6} placeholder={i18n.catalog["humanCapital.pages.leaveBlankIfYouDoNotWishChange"]} />
                                </div>
                            </div>

                            <div className="form-actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <Button variant="secondary" onClick={() => router.push('/06-human-capital/workforce-admin/employee-master/employees-list')}>{i18n.catalog["common.general.cancel"]}</Button>
                                <Button type="submit">{i18n.catalog["common.general.saveChanges"]}</Button>
                            </div>
                        </form>
                    )}

                    {activeTab === 'documents' && employee && (
                        <DocumentsTab id={id} employee={employee} />
                    )}

                    {activeTab === 'financial' && (
                        <div className="sales-card p-4">
                            <h3>{i18n.catalog["common.general.allowancesDeductions"]}</h3>
                            <p>{i18n.catalog["humanCapital.pages.allowanceManagementWillBeActivatedSoon"]}</p>
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}


export default function EditEmployeePage() {
    const { t: i18n } = useI18n();
    return (
        <Suspense fallback={<div className="p-8 text-center">{i18n.catalog["common.general.loading"]}</div>}>
            <EditEmployeePageContent />
        </Suspense>
    );
}
