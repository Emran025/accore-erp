"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout";

import { fetchAPI } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { Role, Department, Employee } from "../../types";
import { Label, Select, TextInput, EmailInput, PasswordInput, Button, SearchableSelect, StepNavigation, Step } from "@/components/ui";
import DocumentsTab from "../components/DocumentsTab";

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
                fetchAPI(API_ENDPOINTS.SYSTEM.USERS.ROLES),
                fetchAPI(API_ENDPOINTS.HR.DEPARTMENTS),
                fetchAPI(API_ENDPOINTS.HR.EMPLOYEES.BASE), // Fetch potential managers
                fetchAPI(API_ENDPOINTS.HR.ADMINISTRATION.POSITIONS.BASE)
            ]);
            setRoles(rolesRes.data as Role[] || (Array.isArray(rolesRes) ? rolesRes : []));
            setDepartments(deptsRes.data as Department[] || (Array.isArray(deptsRes) ? deptsRes : []));
            setEmployees(empsRes.data as any[] || (Array.isArray(empsRes) ? empsRes : []));
            setPositions(posRes.data as any[] || (Array.isArray(posRes) ? posRes : []));
        } catch (e) {
            console.error("Failed to load options", e);
        }

        try {
            const nrRes: any = await fetchAPI(API_ENDPOINTS.NUMBER_RANGES.OBJECTS.byType("employees"));
            if (nrRes.success && (nrRes.data || nrRes.id)) {
                const data = nrRes.data || nrRes;
                setNrObjectId(data.id);
                if (data.groups && data.groups.length > 0) {
                    setNrGroups(data.groups);
                    setSelectedGroup(data.groups[0].id.toString());
                }
            }
        } catch (e) {
            console.error("Failed to load number range groups", e);
        }
    };

    useEffect(() => {
        const fetchNextNumber = async () => {
            if (selectedGroup && nrObjectId && !formData.employee_code) {
                try {
                    const numRes: any = await fetchAPI(API_ENDPOINTS.NUMBER_RANGES.PREVIEW_NUMBER, {
                        method: 'POST',
                        body: JSON.stringify({ object_id: nrObjectId, group_id: selectedGroup })
                    });

                    const generatedNumber = numRes.number || numRes.data?.number;
                    if (numRes.success && generatedNumber) {
                        setFormData(prev => ({ ...prev, employee_code: generatedNumber }));
                    }
                } catch (error) {
                    console.error("Failed to generate numbering code", error);
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

            const res = await fetchAPI(API_ENDPOINTS.HR.EMPLOYEES.BASE, {
                method: 'POST',
                body: JSON.stringify(submissionData),
            });

            if (!res.success && res.message) {
                alert('فشل إضافة الموظف: ' + res.message);
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
                    const url = `${envBase}/${API_ENDPOINTS.HR.EMPLOYEE_FILES.UPLOAD(employeeId.toString()).replace(/^\//, "")}`;

                    return fetch(url, {
                        method: "POST",
                        headers: uploadHeaders,
                        credentials: "include",
                        body: fd,
                    });
                });
                await Promise.all(uploadPromises);
            }

            alert('تم إضافة الموظف وكافة المستندات بنجاح.');
            router.push(`/hr/employees/view/${employeeId}`);
        } catch (error) {
            console.error(error);
            alert('حدث خطأ غير متوقع أثناء الحفظ النهائي');
        } finally {
            setIsLoading(false);
        }
    };

    const steps: Step[] = [
        {
            key: "general", label: "البيانات الأساسية", icon: "fa-user", description: "معلومات الهوية والتوظيف", isRequired: true,
            checks: [
                { id: "c1", label: "إدخال المعلومات الأساسية", isCompleted: !!formData.full_name, isRequired: true }
            ]
        },
        {
            key: "documents", label: "المستندات", icon: "fa-folder-open", description: "رفع الملفات والمرفقات", isRequired: false,
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
                                    <h4 style={{ margin: 0 }}>المعلومات الشخصية</h4>
                                </div>
                                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                                    <TextInput label="الاسم الكامل" name="full_name" required value={formData.full_name} onChange={handleChange} placeholder="الاسم رباعي" />
                                    <TextInput label="رقم الهوية / الإقامة" name="national_id" value={formData.national_id} onChange={handleChange} placeholder="10xxxxxxxxx" />
                                    <TextInput label="تاريخ الميلاد" type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} />
                                    <Select
                                        label="الجنس"
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                        options={[
                                            { value: 'male', label: 'ذكر' },
                                            { value: 'female', label: 'أنثى' }
                                        ]}
                                    />
                                    <TextInput label="رقم الهاتف" name="phone" value={formData.phone} onChange={handleChange} placeholder="05xxxxxxxx" />
                                    <TextInput label="العنوان" name="address" value={formData.address} onChange={handleChange} placeholder="المدينة، الحي، الشارع" />
                                </div>
                            </div>

                            {/* Employment Information */}
                            <div className="section-card sales-card mb-4" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem', gap: '0.5rem', color: 'var(--primary-color)' }}>
                                    <i className="fas fa-briefcase fa-lg"></i>
                                    <h4 style={{ margin: 0 }}>معلومات التوظيف</h4>
                                </div>
                                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                                    <TextInput
                                        label="الرقم الوظيفي"
                                        name="employee_code"
                                        value={formData.employee_code}
                                        onChange={handleChange}
                                        placeholder={nrGroups.length > 0 ? "يتم التوليد تلقائيا..." : "أدخل الرقم"}
                                    />
                                    {nrGroups.length > 0 && (
                                        <div className="form-group" style={{ flex: 1 }}>
                                            <Label>مجموعة الترقيم</Label>
                                            <SearchableSelect
                                                options={nrGroups.map(grp => ({ value: grp.id.toString(), label: grp.name }))}
                                                value={selectedGroup}
                                                onChange={(val) => setSelectedGroup(val ? val.toString() : "")}
                                                placeholder="اختر مجموعة الترقيم"
                                            />
                                        </div>
                                    )}
                                    <Select
                                        label="المنصب الوظيفي"
                                        name="position_id"
                                        value={formData.position_id}
                                        onChange={handleChange}
                                        required
                                        placeholder="اختر المنصب الوظيفي"
                                        options={positions.map(pos => ({
                                            value: pos.id,
                                            label: `${pos.position_name_ar} (${pos.job_title?.title_ar || 'بدون مسمى'})`
                                        }))}
                                    />
                                    <TextInput label="تاريخ المباشرة" type="date" name="hire_date" required value={formData.hire_date} onChange={handleChange} />
                                    <Select
                                        label="نوع العقد"
                                        name="contract_type"
                                        value={formData.contract_type}
                                        onChange={handleChange}
                                        options={[
                                            { value: 'full_time', label: 'دوام كامل' },
                                            { value: 'part_time', label: 'دوام جزئي' },
                                            { value: 'contract', label: 'عقد محدد المدة' },
                                            { value: 'freelance', label: 'تعاون / عمل حر' }
                                        ]}
                                    />
                                    <Select
                                        label="حالة التوظيف"
                                        name="employment_status"
                                        value={formData.employment_status}
                                        onChange={handleChange}
                                        options={[
                                            { value: 'active', label: 'نشط' },
                                            { value: 'suspended', label: 'معلق' },
                                            { value: 'terminated', label: 'منهي خدماته' }
                                        ]}
                                    />
                                </div>
                            </div>

                            {/* Financial Information */}
                            <div className="section-card sales-card mb-4" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem', gap: '0.5rem', color: 'var(--primary-color)' }}>
                                    <i className="fas fa-money-check-alt fa-lg"></i>
                                    <h4 style={{ margin: 0 }}>المعلومات المالية</h4>
                                </div>
                                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                                    <TextInput label="الراتب الأساسي" type="number" name="base_salary" required value={formData.base_salary} onChange={handleChange} min="0" step="0.01" />
                                    <TextInput label="رقم التأمينات الاجتماعية (GOSI)" name="gosi_number" value={formData.gosi_number} onChange={handleChange} />
                                    <TextInput label="اسم البنك" name="bank_name" value={formData.bank_name} onChange={handleChange} />
                                    <TextInput label="رقم الآيبان (IBAN)" name="iban" value={formData.iban} onChange={handleChange} placeholder="SAxxxxxxxxxxxxxxxxxxxxxx" />
                                    <TextInput label="رصيد الإجازات الافتتاحي (أيام)" type="number" name="vacation_days_balance" value={formData.vacation_days_balance} onChange={handleChange} min="0" step="0.5" />
                                </div>

                                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                                    <div className="form-group" style={{ flex: 1 }}>
                                        <Label>المدير المباشر</Label>
                                        <SearchableSelect
                                            options={employees.map(emp => ({ value: emp.id.toString(), label: emp.full_name }))}
                                            value={formData.manager_id}
                                            onChange={(val) => setFormData(prev => ({ ...prev, manager_id: val ? val.toString() : "" }))}
                                            placeholder="اختر المدير المباشر"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Account Credentials */}
                            <div className="section-card sales-card mb-4" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem', gap: '0.5rem', color: 'var(--primary-color)' }}>
                                    <i className="fas fa-lock fa-lg"></i>
                                    <h4 style={{ margin: 0 }}>بيانات الدخول للبوابة</h4>
                                </div>
                                <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>تستخدم هذه البيانات لدخول الموظف إلى بوابة الخدمات الذاتية.</p>
                                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                                    <EmailInput label="البريد الإلكتروني" name="email" required value={formData.email} onChange={handleChange} />
                                    <PasswordInput label="كلمة المرور" name="password" required value={formData.password} onChange={handleChange} minLength={6} placeholder="********" />
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
