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
    loading: () => <div className="p-10 text-center text-muted">{catalogMessage("text_60e8ca919572")}</div>
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
            console.error(i18n.catalog["text_afa69443bb93"], e);
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
            console.error(i18n.catalog["text_8863d50a501e"], e);
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
                    console.error(i18n.catalog["text_5c64142f4a76"], error);
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
                alert(i18n.catalog["text_86fba7a2c048"]);
            } else {
                alert(i18n.catalog["text_95da6b41256f"] + res.message);
            }
        } catch (error) {
            console.error(error);
            alert(i18n.catalog["text_cdd288620509"]);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <div className="p-5 text-center">{i18n.catalog["text_ceac78d7f5d3"]}</div>;

    return (
        <MainLayout >
            <div className="settings-wrapper animate-fade">
                <TabNavigation
                    tabs={[
                        { key: "info", label: i18n.catalog["text_a50e5beef8e3"], icon: "fa-user" },
                        { key: "documents", label: i18n.catalog["text_9d66d0084b75"], icon: "fa-file" },
                        { key: "financial", label: i18n.catalog["text_70b40aa1312b"], icon: "fa-coins" },
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
                                    <h4 style={{ margin: 0 }}>{i18n.catalog["text_27a850003581"]}</h4>
                                </div>
                                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                                    <TextInput label={i18n.catalog["text_6c2ab9bdeb2c"]} name="full_name" required value={formData.full_name} onChange={handleChange} />
                                    <TextInput label={i18n.catalog["text_216ef8eca6ac"]} name="national_id" value={formData.national_id} onChange={handleChange} />
                                    <TextInput label={i18n.catalog["text_3364645354dd"]} type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} />
                                    <Select
                                        label={i18n.catalog["text_a79dffdd2070"]}
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                        options={[
                                            { value: 'male', label: i18n.catalog["text_2f13379bf81e"] },
                                            { value: 'female', label: i18n.catalog["text_d2ee47ec7d05"] }
                                        ]}
                                    />
                                    <TextInput label={i18n.catalog["text_42095a7a6c15"]} name="phone" value={formData.phone} onChange={handleChange} />
                                    <TextInput label={i18n.catalog["text_2d110e56d5f5"]} name="address" value={formData.address} onChange={handleChange} />
                                </div>
                            </div>

                            {/* Employment Information */}
                            <div className="section-card sales-card mb-4" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem', gap: '0.5rem', color: 'var(--primary-color)' }}>
                                    <i className="fas fa-briefcase fa-lg"></i>
                                    <h4 style={{ margin: 0 }}>{i18n.catalog["text_374aa726c036"]}</h4>
                                </div>
                                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                                    <TextInput label={i18n.catalog["text_092f08fd75ac"]} name="employee_code" required value={formData.employee_code} onChange={handleChange} placeholder={nrGroups.length > 0 ? i18n.catalog["text_3bebb10295e4"] : i18n.catalog["text_d353b8b69191"]} />
                                    {nrGroups.length > 0 && !formData.employee_code && (
                                        <Select
                                            label={i18n.catalog["text_30b23b8e5db8"]}
                                            name="nr_group"
                                            value={selectedGroup}
                                            onChange={(e) => setSelectedGroup(e.target.value)}
                                            options={[
                                                { value: '', label: i18n.catalog["text_fdeaa0f5c478"] },
                                                ...nrGroups.map(grp => ({ value: grp.id.toString(), label: grp.name }))
                                            ]}
                                        />
                                    )}
                                    <Select
                                        label={i18n.catalog["text_c612bab8abc0"]}
                                        name="position_id"
                                        value={formData.position_id}
                                        onChange={handleChange}
                                        required
                                        placeholder={i18n.catalog["text_c3a8cfdd082f"]}
                                        options={positions.map(pos => ({
                                            value: pos.id,
                                            label: catalogText(i18n, "text_e11f55b693d8", { value0: pos.position_name_ar, value1: pos.job_title?.title_ar || i18n.catalog["text_1b8b7c9f8038"] })
                                        }))}
                                    />
                                    <TextInput label={i18n.catalog["text_057fc55c3df6"]} type="date" name="hire_date" required value={formData.hire_date} onChange={handleChange} />
                                    <Select
                                        label={i18n.catalog["text_2b9fa3db572a"]}
                                        name="contract_type"
                                        value={formData.contract_type}
                                        onChange={handleChange}
                                        options={[
                                            { value: 'full_time', label: i18n.catalog["text_ae607c34c510"] },
                                            { value: 'part_time', label: i18n.catalog["text_68b482db7711"] },
                                            { value: 'contract', label: i18n.catalog["text_e2e8af908ce5"] },
                                            { value: 'freelance', label: i18n.catalog["text_826a0eb2ee68"] }
                                        ]}
                                    />
                                    <div className="form-group">
                                        <Label>{i18n.catalog["text_35a54fa24d99"]}</Label>
                                        <SearchableSelect
                                            name="manager_id"
                                            value={formData.manager_id}
                                            onChange={(val) => setFormData({ ...formData, manager_id: val?.toString() || '' })}
                                            options={[
                                                { value: '', label: i18n.catalog["text_15f6796f46e5"] },
                                                ...managers.filter(m => m.id.toString() !== id).map(m => ({
                                                    value: m.id.toString(),
                                                    label: catalogText(i18n, "text_e11f55b693d8", { value0: m.full_name, value1: m.employee_code })
                                                }))
                                            ]}
                                        />
                                    </div>
                                    <Select
                                        label={i18n.catalog["text_b9fae6c6b12f"]}
                                        name="employment_status"
                                        value={formData.employment_status}
                                        onChange={handleChange}
                                        options={[
                                            { value: 'active', label: i18n.catalog["text_629e90b3af3d"] },
                                            { value: 'suspended', label: i18n.catalog["text_701d5d7a86f9"] },
                                            { value: 'terminated', label: i18n.catalog["text_ec0852e29a7e"] }
                                        ]}
                                    />
                                    {formData.employment_status === 'terminated' && (
                                        <TextInput label={i18n.catalog["text_89e5dd6e919b"]} type="date" name="termination_date" value={formData.termination_date} onChange={handleChange} />
                                    )}
                                </div>
                            </div>

                            {/* Financial Information */}
                            <div className="section-card sales-card mb-4" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem', gap: '0.5rem', color: 'var(--primary-color)' }}>
                                    <i className="fas fa-money-check-alt fa-lg"></i>
                                    <h4 style={{ margin: 0 }}>{i18n.catalog["text_6b7790de11d3"]}</h4>
                                </div>
                                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                                    <TextInput label={i18n.catalog["text_73ad6b20ceb7"]} type="number" name="base_salary" required value={formData.base_salary} onChange={handleChange} min="0" step="0.01" />
                                    <TextInput label={i18n.catalog["text_79cc07b91844"]} name="gosi_number" value={formData.gosi_number} onChange={handleChange} />
                                    <TextInput label={i18n.catalog["text_c6d5a7b17fc0"]} name="bank_name" value={formData.bank_name} onChange={handleChange} />
                                    <TextInput label={i18n.catalog["text_2f6a9a7e78ee"]} name="iban" value={formData.iban} onChange={handleChange} />
                                    <TextInput label={i18n.catalog["text_65c7b5f96855"]} type="number" name="vacation_days_balance" value={formData.vacation_days_balance} onChange={handleChange} />
                                </div>
                            </div>

                            {/* Portal Credentials */}
                            <div className="section-card sales-card mb-4" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem', gap: '0.5rem', color: 'var(--primary-color)' }}>
                                    <i className="fas fa-lock fa-lg"></i>
                                    <h4 style={{ margin: 0 }}>{i18n.catalog["text_5e1aafd958cf"]}</h4>
                                </div>
                                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                                    <EmailInput label={i18n.catalog["text_ddf0fca39a4f"]} name="email" required value={formData.email} onChange={handleChange} />
                                    <PasswordInput label={i18n.catalog["text_202b9814ea8b"]} name="password" value={formData.password} onChange={handleChange} minLength={6} placeholder={i18n.catalog["text_f80743fc4075"]} />
                                </div>
                            </div>

                            <div className="form-actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <Button variant="secondary" onClick={() => router.push('/06-human-capital/workforce-admin/employee-master/employees-list')}>{i18n.catalog["text_9a30dc2a96b8"]}</Button>
                                <Button type="submit">{i18n.catalog["text_6c03d6737c2f"]}</Button>
                            </div>
                        </form>
                    )}

                    {activeTab === 'documents' && employee && (
                        <DocumentsTab id={id} employee={employee} />
                    )}

                    {activeTab === 'financial' && (
                        <div className="sales-card p-4">
                            <h3>{i18n.catalog["text_70b40aa1312b"]}</h3>
                            <p>{i18n.catalog["text_f0e5718c8a5b"]}</p>
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
        <Suspense fallback={<div className="p-8 text-center">{i18n.catalog["text_ceac78d7f5d3"]}</div>}>
            <EditEmployeePageContent />
        </Suspense>
    );
}
