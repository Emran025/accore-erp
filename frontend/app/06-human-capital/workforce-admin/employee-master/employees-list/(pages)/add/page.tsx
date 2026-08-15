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
            console.error(i18n.catalog["humanCapital.pages.failedLoadOptions"], e);
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
            console.error(i18n.catalog["common.general.failedLoadNumberRangeGroups"], e);
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
                    console.error(i18n.catalog["common.general.failedGenerateNumberingCode"], error);
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
                alert(i18n.catalog["humanCapital.pages.failedAddEmployee"] + res.message);
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
                    const url = catalogText(i18n, "common.general.message", { value0: envBase, value1: API_ENDPOINTS.HUMAN_CAPITAL.EMPLOYEE_FILES.UPLOAD(employeeId.toString()).replace(/^\//, "") });

                    return fetch(url, {
                        method: "POST",
                        headers: uploadHeaders,
                        credentials: "include",
                        body: fd,
                    });
                });
                await Promise.all(uploadPromises);
            }

            alert(i18n.catalog["humanCapital.pages.employeeAllDocumentsAddedSuccessfully"]);
            router.push(`/06-human-capital/workforce-admin/employee-master/employees-list/view/${employeeId}`);
        } catch (error) {
            console.error(error);
            alert(i18n.catalog["humanCapital.pages.unexpectedErrorOccurredDuringFinalSave"]);
        } finally {
            setIsLoading(false);
        }
    };

    const steps: Step[] = [
        {
            key: "general", label: i18n.catalog["common.general.basicInformation.alternative2"], icon: "fa-user", description: i18n.catalog["humanCapital.pages.identityEmploymentInformation"], isRequired: true,
            checks: [
                { id: "c1", label: i18n.catalog["humanCapital.pages.enterBasicInformation"], isCompleted: !!formData.full_name, isRequired: true }
            ]
        },
        {
            key: "documents", label: i18n.catalog["common.general.documents"], icon: "fa-folder-open", description: i18n.catalog["humanCapital.pages.uploadFilesAttachments"], isRequired: false,
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
                                    <h4 style={{ margin: 0 }}>{i18n.catalog["common.general.personalInformation"]}</h4>
                                </div>
                                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                                    <TextInput label={i18n.catalog["common.general.fullName"]} name="full_name" required value={formData.full_name} onChange={handleChange} placeholder={i18n.catalog["humanCapital.pages.fullName"]} />
                                    <TextInput label={i18n.catalog["common.general.idResidenceNumber"]} name="national_id" value={formData.national_id} onChange={handleChange} placeholder={i18n.catalog["humanCapital.pages.message10xxxxxxxxx"]} />
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
                                    <TextInput label={i18n.catalog["common.general.phoneNumber"]} name="phone" value={formData.phone} onChange={handleChange} placeholder={i18n.catalog["humanCapital.pages.message05xxxxxxxx"]} />
                                    <TextInput label={i18n.catalog["common.general.title"]} name="address" value={formData.address} onChange={handleChange} placeholder={i18n.catalog["humanCapital.pages.cityNeighborhoodStreet"]} />
                                </div>
                            </div>

                            {/* Employment Information */}
                            <div className="section-card sales-card mb-4" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem', gap: '0.5rem', color: 'var(--primary-color)' }}>
                                    <i className="fas fa-briefcase fa-lg"></i>
                                    <h4 style={{ margin: 0 }}>{i18n.catalog["common.general.employmentInformation"]}</h4>
                                </div>
                                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                                    <TextInput
                                        label={i18n.catalog["common.general.employeeNumber"]}
                                        name="employee_code"
                                        value={formData.employee_code}
                                        onChange={handleChange}
                                        placeholder={nrGroups.length > 0 ? i18n.catalog["common.general.generatedAutomatically"] : i18n.catalog["common.general.enterNumber"]}
                                    />
                                    {nrGroups.length > 0 && (
                                        <div className="form-group" style={{ flex: 1 }}>
                                            <Label>{i18n.catalog["common.general.numberingGroup"]}</Label>
                                            <SearchableSelect
                                                options={nrGroups.map(grp => ({ value: grp.id.toString(), label: grp.name }))}
                                                value={selectedGroup}
                                                onChange={(val) => setSelectedGroup(val ? val.toString() : "")}
                                                placeholder={i18n.catalog["humanCapital.pages.selectNumberingSeries"]}
                                            />
                                        </div>
                                    )}
                                    <Select
                                        label={i18n.catalog["common.general.jobTitle.alternative2"]}
                                        name="position_id"
                                        value={formData.position_id}
                                        onChange={handleChange}
                                        required
                                        placeholder={i18n.catalog["humanCapital.pages.selectJobPosition"]}
                                        options={positions.map(pos => ({
                                            value: pos.id,
                                            label: catalogText(i18n, "common.general.message.alternative7", { value0: pos.position_name_ar, value1: pos.job_title?.title_ar || i18n.catalog["common.general.untitled"] })
                                        }))}
                                    />
                                    <TextInput label={i18n.catalog["humanCapital.pages.startDate"]} type="date" name="hire_date" required value={formData.hire_date} onChange={handleChange} />
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
                                    <TextInput label={i18n.catalog["humanCapital.pages.socialInsuranceNumberGosi"]} name="gosi_number" value={formData.gosi_number} onChange={handleChange} />
                                    <TextInput label={i18n.catalog["common.general.bankName"]} name="bank_name" value={formData.bank_name} onChange={handleChange} />
                                    <TextInput label={i18n.catalog["common.general.ibanNumber"]} name="iban" value={formData.iban} onChange={handleChange} placeholder={i18n.catalog["humanCapital.pages.saxxxxxxxxxxxxxxxxxxxxxx"]} />
                                    <TextInput label={i18n.catalog["humanCapital.pages.openingLeaveBalanceDays"]} type="number" name="vacation_days_balance" value={formData.vacation_days_balance} onChange={handleChange} min="0" step="0.5" />
                                </div>

                                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                                    <div className="form-group" style={{ flex: 1 }}>
                                        <Label>{i18n.catalog["common.general.directManager"]}</Label>
                                        <SearchableSelect
                                            options={employees.map(emp => ({ value: emp.id.toString(), label: emp.full_name }))}
                                            value={formData.manager_id}
                                            onChange={(val) => setFormData(prev => ({ ...prev, manager_id: val ? val.toString() : "" }))}
                                            placeholder={i18n.catalog["humanCapital.pages.selectDirectManager"]}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Account Credentials */}
                            <div className="section-card sales-card mb-4" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem', gap: '0.5rem', color: 'var(--primary-color)' }}>
                                    <i className="fas fa-lock fa-lg"></i>
                                    <h4 style={{ margin: 0 }}>{i18n.catalog["humanCapital.pages.portalLoginCredentials"]}</h4>
                                </div>
                                <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>{i18n.catalog["humanCapital.pages.theseCredentialsAreUsedEmployeeAccessSelfServicePortal"]}</p>
                                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                                    <EmailInput label={i18n.catalog["common.general.email"]} name="email" required value={formData.email} onChange={handleChange} />
                                    <PasswordInput label={i18n.catalog["common.general.password"]} name="password" required value={formData.password} onChange={handleChange} minLength={6} placeholder={i18n.catalog["humanCapital.pages.message"]} />
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
