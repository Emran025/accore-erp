"use client";

import { MainLayout } from "@/components/layout";
import { Button, EmailInput, Label, PasswordInput, SearchableSelect, Select, TabNavigation, TextInput } from "@/components/ui";
import { fetchAPI } from "@/lib/api";
import { getStoredUser, User } from "@/lib/auth";
import { API_ENDPOINTS } from "@/lib/endpoints";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { Department, Employee, Role } from "@/types";

const DocumentsTab = dynamic(() => import("../../../components/DocumentsTab"), {
    loading: () => <div className="p-10 text-center text-muted">جاري تحميل المستندات...</div>
});

export default function EditEmployeePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
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
                fetchAPI(API_ENDPOINTS.SYSTEM.USERS.ROLES),
                fetchAPI(API_ENDPOINTS.HR.DEPARTMENTS),
                fetchAPI(API_ENDPOINTS.HR.EMPLOYEES.withId(id)),
                fetchAPI(API_ENDPOINTS.HR.ADMINISTRATION.POSITIONS.BASE),
                fetchAPI(API_ENDPOINTS.HR.EMPLOYEES.BASE) // For manager selection
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
            console.error("Failed to load data", e);
        } finally {
            setIsLoading(false);
        }

        // Load Numbering Range Groups 
        try {
            const nrRes: any = await fetchAPI(API_ENDPOINTS.NUMBER_RANGES.OBJECTS.byType("employees"));
            if (nrRes.success && (nrRes.data || nrRes.id)) {
                const data = nrRes.data || nrRes;
                setNrObjectId(data.id);
                if (data.groups && data.groups.length > 0) {
                    setNrGroups(data.groups);
                }
            }
        } catch (e) {
            console.error("Failed to load number range groups", e);
        }
    };

    useEffect(() => {
        const fetchNextNumber = async () => {
            if (activeTab === 'info' && selectedGroup && nrObjectId && !formData.employee_code) {
                try {
                    const numRes: any = await fetchAPI(API_ENDPOINTS.NUMBER_RANGES.NEXT_NUMBER, {
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
    }, [selectedGroup, nrObjectId, activeTab]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await fetchAPI(API_ENDPOINTS.HR.EMPLOYEES.withId(id), {
                method: 'PUT',
                body: JSON.stringify(formData),
            });

            if (res.success !== false) {
                alert('تم تحديث بيانات الموظف بنجاح');
            } else {
                alert('فشل التحديث: ' + res.message);
            }
        } catch (error) {
            console.error(error);
            alert('حدث خطأ غير متوقع');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <div className="p-5 text-center">جاري التحميل...</div>;

    return (
        <MainLayout >
            <div className="settings-wrapper animate-fade">
                <TabNavigation
                    tabs={[
                        { key: "info", label: "البيانات الأساسية", icon: "fa-user" },
                        { key: "documents", label: "المستندات", icon: "fa-file" },
                        { key: "financial", label: "البدلات والاستقطاعات", icon: "fa-coins" },
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
                                    <h4 style={{ margin: 0 }}>المعلومات الشخصية</h4>
                                </div>
                                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                                    <TextInput label="الاسم الكامل" name="full_name" required value={formData.full_name} onChange={handleChange} />
                                    <TextInput label="رقم الهوية / الإقامة" name="national_id" value={formData.national_id} onChange={handleChange} />
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
                                    <TextInput label="رقم الهاتف" name="phone" value={formData.phone} onChange={handleChange} />
                                    <TextInput label="العنوان" name="address" value={formData.address} onChange={handleChange} />
                                </div>
                            </div>

                            {/* Employment Information */}
                            <div className="section-card sales-card mb-4" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem', gap: '0.5rem', color: 'var(--primary-color)' }}>
                                    <i className="fas fa-briefcase fa-lg"></i>
                                    <h4 style={{ margin: 0 }}>معلومات التوظيف</h4>
                                </div>
                                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                                    <TextInput label="الرقم الوظيفي" name="employee_code" required value={formData.employee_code} onChange={handleChange} placeholder={nrGroups.length > 0 ? "يتم التوليد تلقائيا..." : "أدخل الرقم"} />
                                    {nrGroups.length > 0 && !formData.employee_code && (
                                        <Select
                                            label="مجموعة الترقيم"
                                            name="nr_group"
                                            value={selectedGroup}
                                            onChange={(e) => setSelectedGroup(e.target.value)}
                                            options={[
                                                { value: '', label: 'اختر مجموعة الترقيم لتوليد رقم' },
                                                ...nrGroups.map(grp => ({ value: grp.id.toString(), label: grp.name }))
                                            ]}
                                        />
                                    )}
                                    <Select
                                        label="المنصب الوظيفي"
                                        name="position_id"
                                        value={formData.position_id}
                                        onChange={handleChange}
                                        required
                                        placeholder="اختر المنصب الوظيفي (الهيكل التنظيمي)"
                                        options={positions.map(pos => ({
                                            value: pos.id,
                                            label: `${pos.position_name_ar} (${pos.job_title?.title_ar || 'بدون مسمى'})`
                                        }))}
                                    />
                                    <TextInput label="تاريخ التعيين" type="date" name="hire_date" required value={formData.hire_date} onChange={handleChange} />
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
                                    <div className="form-group">
                                        <Label>المدير المباشر</Label>
                                        <SearchableSelect
                                            name="manager_id"
                                            value={formData.manager_id}
                                            onChange={(val) => setFormData({ ...formData, manager_id: val?.toString() || '' })}
                                            options={[
                                                { value: '', label: 'بدون مدير (إدارة عليا)' },
                                                ...managers.filter(m => m.id.toString() !== id).map(m => ({
                                                    value: m.id.toString(),
                                                    label: `${m.full_name} (${m.employee_code})`
                                                }))
                                            ]}
                                        />
                                    </div>
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
                                    {formData.employment_status === 'terminated' && (
                                        <TextInput label="تاريخ إنهاء الخدمة" type="date" name="termination_date" value={formData.termination_date} onChange={handleChange} />
                                    )}
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
                                    <TextInput label="رقم التأمينات (GOSI)" name="gosi_number" value={formData.gosi_number} onChange={handleChange} />
                                    <TextInput label="اسم البنك" name="bank_name" value={formData.bank_name} onChange={handleChange} />
                                    <TextInput label="رقم الآيبان (IBAN)" name="iban" value={formData.iban} onChange={handleChange} />
                                    <TextInput label="رصيد الإجازات" type="number" name="vacation_days_balance" value={formData.vacation_days_balance} onChange={handleChange} />
                                </div>
                            </div>

                            {/* Portal Credentials */}
                            <div className="section-card sales-card mb-4" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem', gap: '0.5rem', color: 'var(--primary-color)' }}>
                                    <i className="fas fa-lock fa-lg"></i>
                                    <h4 style={{ margin: 0 }}>تحديث بيانات الدخول</h4>
                                </div>
                                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                                    <EmailInput label="البريد الإلكتروني" name="email" required value={formData.email} onChange={handleChange} />
                                    <PasswordInput label="كلمة المرور الجديدة" name="password" value={formData.password} onChange={handleChange} minLength={6} placeholder="اتركه فارغاً إذا لم ترغب بالتغيير" />
                                </div>
                            </div>

                            <div className="form-actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <Button variant="secondary" onClick={() => router.push('/06-human-capital/workforce-admin/employee-master/employees-list')}>إلغاء</Button>
                                <Button type="submit">حفظ التعديلات</Button>
                            </div>
                        </form>
                    )}

                    {activeTab === 'documents' && employee && (
                        <DocumentsTab id={id} employee={employee} />
                    )}

                    {activeTab === 'financial' && (
                        <div className="sales-card p-4">
                            <h3>البدلات والاستقطاعات</h3>
                            <p>سيتم تفعيل إدارة البدلات قريباً.</p>
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}
