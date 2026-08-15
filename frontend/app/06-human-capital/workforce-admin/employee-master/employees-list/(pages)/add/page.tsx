"use client";

import { useI18n, catalogText } from "@/lib/i18n";
import { MainLayout } from "@/components/layout";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { EmailInput, Label, PasswordInput, SearchableSelect, Select, Step, StepNavigation, TextInput } from "@/components/ui";
import { fetchAPI } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { Department, Employee, Role } from "@/types";
import DocumentsTab from "../../components/DocumentsTab";

/**
 * Add Employee Page Component.
 * Comprehensive form for creating new employee records with:
 * - Personal information (name, ID, contact details)
 * - Employment details (role, department, contract type, manager)
 * - Financial information (salary, GOSI, bank details, vacation balance)
 * - Portal credentials for self-service access
 * 
 * Integrates with EmployeesController API for employee creation.
 * 
 * @returns The AddEmployeePage component
 */
export default function AddEmployeePage() {
    const { t: i18n } = useI18n();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("general");
    const [completedSteps, setCompletedSteps] = useState<string[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [positions, setPositions] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [pendingFiles, setPendingFiles] = useState<any[]>([]);

    const [nrObjectId, setNrObjectId] = useState<number | null>(null);
    const [nrGroups, setNrGroups] = useState<any[]>([]);
    const [selectedGroup, setSelectedGroup] = useState("");

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
        vacation_days_balance: '0',
        manager_id: '',
        position_id: '',
    });

    useEffect(() => {
        fetchOptions();
    }, []);

    const fetchOptions = async () => {
        try {
            const [rolesRes, deptsRes, empsRes, posRes] = await Promise.all([
                fetchAPI(API_ENDPOINTS.ENTERPRISE_CORE.IAM.USERS.ROLES),
                fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.DEPARTMENTS),
                fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.EMPLOYEES.BASE), // Fetch potential managers
                fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.ADMINISTRATION.POSITIONS.BASE)
            ]);
            setRoles(rolesRes.data as Role[] || (Array.isArray(rolesRes) ? rolesRes : []));
            setDepartments(deptsRes.data as Department[] || (Array.isArray(deptsRes) ? deptsRes : []));
            setEmployees(empsRes.data as any[] || (Array.isArray(empsRes) ? empsRes : []));
            setPositions(posRes.data as any[] || (Array.isArray(posRes) ? posRes : []));
        } catch (e) {
            console.error(i18n.catalog["text_ff693ee1579c"], e);
        }

        try {
            const nrRes: any = await fetchAPI(API_ENDPOINTS.PLATFORM.NUMBER_RANGES.OBJECTS.byType("employees"));
            if (nrRes.success && (nrRes.data || nrRes.id)) {
                const data = nrRes.data || nrRes;
                setNrObjectId(data.id);
                if (data.groups && data.groups.length > 0) {
                    setNrGroups(data.groups);
                    setSelectedGroup(data.groups[0].id.toString());
                }
            }
        } catch (e) {
            console.error(i18n.catalog["text_8863d50a501e"], e);
        }
    };

    useEffect(() => {
        const fetchNextNumber = async () => {
            if (selectedGroup && nrObjectId && !formData.employee_code) {
                try {
                    const numRes: any = await fetchAPI(API_ENDPOINTS.PLATFORM.NUMBER_RANGES.PREVIEW_NUMBER, {
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
    }, [selectedGroup, nrObjectId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const nextStep = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setCompletedSteps(prev => {
            if (!prev.includes("general")) return [...prev, "general"];
            return prev;
        });
        setActiveTab("documents");
    };

    const handleFinalSubmit = async () => {
        setIsLoading(true);
        try {
            // Prepare submission data
            const submissionData = { ...formData };

            // If using auto-numbering, we send the intent to the backend
            // to generate it during the transaction.
            if (nrObjectId && selectedGroup) {
                // We send the object/group IDs so the backend can generate
                (submissionData as any).nr_object_id = nrObjectId;
                (submissionData as any).nr_group_id = selectedGroup;

                // We optionally clear the employee_code to force fresh generation
                // ONLY if the user didn't manually edit it (optional logic)
                // For now, let's keep it simple: if group is selected, backend generates.
                (submissionData as any).employee_code = '';
            }

            const res = await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.EMPLOYEES.BASE, {
                method: 'POST',
                body: JSON.stringify(submissionData),
            });

            if (!res.success && res.message) {
                alert(i18n.catalog["text_4802a9cb43d5"] + res.message);
                setIsLoading(false);
                return;
            }

            const newEmp = (res.data as Employee) || (res as unknown as Employee);
            const employeeId = newEmp.id;

            if (pendingFiles.length > 0) {
                const token = typeof window !== "undefined" ? localStorage.getItem("sessionToken") : null;
                const uploadHeaders: Record<string, string> = { Accept: "application/json" };
                if (token) uploadHeaders["X-Session-Token"] = token;

                const uploadPromises = pendingFiles.map(pf => {
                    const fd = new FormData();
                    fd.append("document", pf.file);
                    fd.append("document_name", pf.name);
                    fd.append("document_type", pf.type);
                    if (pf.document_number) fd.append("document_number", pf.document_number);
                    if (pf.issue_date) fd.append("issue_date", pf.issue_date);
                    if (pf.expiration_date) fd.append("expiration_date", pf.expiration_date);

                    const envBase = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000/api";
                    const url = catalogText(i18n, "text_0907f4dfb304", { value0: envBase, value1: API_ENDPOINTS.HUMAN_CAPITAL.EMPLOYEE_FILES.UPLOAD(employeeId.toString()).replace(/^\//, "") });

                    return fetch(url, {
                        method: "POST",
                        headers: uploadHeaders,
                        credentials: "include",
                        body: fd,
                    });
                });
                await Promise.all(uploadPromises);
            }

            alert(i18n.catalog["text_c191283fae13"]);
            router.push(`/06-human-capital/workforce-admin/employee-master/employees-list/view/${employeeId}`);
        } catch (error) {
            console.error(error);
            alert(i18n.catalog["text_cf2d1e6d077e"]);
        } finally {
            setIsLoading(false);
        }
    };

    const steps: Step[] = [
        {
            key: "general", label: i18n.catalog["text_a50e5beef8e3"], icon: "fa-user", description: i18n.catalog["text_e6dd6e0995d2"], isRequired: true,
            checks: [
                { id: "c1", label: i18n.catalog["text_aae49ad17873"], isCompleted: !!formData.full_name, isRequired: true }
            ]
        },
        {
            key: "documents", label: i18n.catalog["text_9d66d0084b75"], icon: "fa-folder-open", description: i18n.catalog["text_c1a1d1d79101"], isRequired: false,
            checks: []
        },
    ];

    return (
        <MainLayout >
            <div className="settings-wrapper animate-fade">
                <StepNavigation
                    steps={steps}
                    activeStep={activeTab}
                    completedSteps={completedSteps}
                    onStepChange={setActiveTab}
                    showActions={true}
                    onCancel={() => router.back()}
                    onPrevious={activeTab === 'documents' ? () => setActiveTab('general') : undefined}
                    onSave={activeTab === 'documents' ? handleFinalSubmit : undefined}
                    formId={activeTab === 'general' ? 'general-form' : undefined}
                    isLoading={isLoading}
                >
                    {activeTab === 'general' && (
                        <form id="general-form" onSubmit={nextStep}>
                            {/* Personal Information */}
                            <div className="section-card sales-card mb-4" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem', gap: '0.5rem', color: 'var(--primary-color)' }}>
                                    <i className="fas fa-user-circle fa-lg"></i>
                                    <h4 style={{ margin: 0 }}>{i18n.catalog["text_27a850003581"]}</h4>
                                </div>
                                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                                    <TextInput label={i18n.catalog["text_6c2ab9bdeb2c"]} name="full_name" required value={formData.full_name} onChange={handleChange} placeholder={i18n.catalog["text_a85a3faf88d1"]} />
                                    <TextInput label={i18n.catalog["text_216ef8eca6ac"]} name="national_id" value={formData.national_id} onChange={handleChange} placeholder={i18n.catalog["text_64ef4b2de271"]} />
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
                                    <TextInput label={i18n.catalog["text_42095a7a6c15"]} name="phone" value={formData.phone} onChange={handleChange} placeholder={i18n.catalog["text_149fd7bb26b1"]} />
                                    <TextInput label={i18n.catalog["text_2d110e56d5f5"]} name="address" value={formData.address} onChange={handleChange} placeholder={i18n.catalog["text_a4dc90abb6f6"]} />
                                </div>
                            </div>

                            {/* Employment Information */}
                            <div className="section-card sales-card mb-4" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem', gap: '0.5rem', color: 'var(--primary-color)' }}>
                                    <i className="fas fa-briefcase fa-lg"></i>
                                    <h4 style={{ margin: 0 }}>{i18n.catalog["text_374aa726c036"]}</h4>
                                </div>
                                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                                    <TextInput
                                        label={i18n.catalog["text_092f08fd75ac"]}
                                        name="employee_code"
                                        value={formData.employee_code}
                                        onChange={handleChange}
                                        placeholder={nrGroups.length > 0 ? i18n.catalog["text_3bebb10295e4"] : i18n.catalog["text_d353b8b69191"]}
                                    />
                                    {nrGroups.length > 0 && (
                                        <div className="form-group" style={{ flex: 1 }}>
                                            <Label>{i18n.catalog["text_30b23b8e5db8"]}</Label>
                                            <SearchableSelect
                                                options={nrGroups.map(grp => ({ value: grp.id.toString(), label: grp.name }))}
                                                value={selectedGroup}
                                                onChange={(val) => setSelectedGroup(val ? val.toString() : "")}
                                                placeholder={i18n.catalog["text_3aa5f4fbc295"]}
                                            />
                                        </div>
                                    )}
                                    <Select
                                        label={i18n.catalog["text_c612bab8abc0"]}
                                        name="position_id"
                                        value={formData.position_id}
                                        onChange={handleChange}
                                        required
                                        placeholder={i18n.catalog["text_69c8437589e7"]}
                                        options={positions.map(pos => ({
                                            value: pos.id,
                                            label: catalogText(i18n, "text_e11f55b693d8", { value0: pos.position_name_ar, value1: pos.job_title?.title_ar || i18n.catalog["text_1b8b7c9f8038"] })
                                        }))}
                                    />
                                    <TextInput label={i18n.catalog["text_38f85d2e88af"]} type="date" name="hire_date" required value={formData.hire_date} onChange={handleChange} />
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
                                    <TextInput label={i18n.catalog["text_9e2a0925b5c8"]} name="gosi_number" value={formData.gosi_number} onChange={handleChange} />
                                    <TextInput label={i18n.catalog["text_c6d5a7b17fc0"]} name="bank_name" value={formData.bank_name} onChange={handleChange} />
                                    <TextInput label={i18n.catalog["text_2f6a9a7e78ee"]} name="iban" value={formData.iban} onChange={handleChange} placeholder={i18n.catalog["text_1de06acdd5ec"]} />
                                    <TextInput label={i18n.catalog["text_07429d01eb23"]} type="number" name="vacation_days_balance" value={formData.vacation_days_balance} onChange={handleChange} min="0" step="0.5" />
                                </div>

                                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                                    <div className="form-group" style={{ flex: 1 }}>
                                        <Label>{i18n.catalog["text_35a54fa24d99"]}</Label>
                                        <SearchableSelect
                                            options={employees.map(emp => ({ value: emp.id.toString(), label: emp.full_name }))}
                                            value={formData.manager_id}
                                            onChange={(val) => setFormData(prev => ({ ...prev, manager_id: val ? val.toString() : "" }))}
                                            placeholder={i18n.catalog["text_ad1ac06a0018"]}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Account Credentials */}
                            <div className="section-card sales-card mb-4" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem', gap: '0.5rem', color: 'var(--primary-color)' }}>
                                    <i className="fas fa-lock fa-lg"></i>
                                    <h4 style={{ margin: 0 }}>{i18n.catalog["text_750e8c3cb086"]}</h4>
                                </div>
                                <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>{i18n.catalog["text_7386ec8c56ac"]}</p>
                                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                                    <EmailInput label={i18n.catalog["text_ddf0fca39a4f"]} name="email" required value={formData.email} onChange={handleChange} />
                                    <PasswordInput label={i18n.catalog["text_b05d306b5591"]} name="password" required value={formData.password} onChange={handleChange} minLength={6} placeholder={i18n.catalog["text_07ab59f4731b"]} />
                                </div>
                            </div>

                        </form>
                    )}

                    {activeTab === 'documents' && (
                        <DocumentsTab
                            mode="wizard"
                            pendingFiles={pendingFiles}
                            onPendingFilesChange={setPendingFiles}
                        />
                    )}
                </StepNavigation>
            </div>
        </MainLayout>
    );
}
