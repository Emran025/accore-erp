"use client";

import { useI18n, catalogText, catalogMessage } from "@/lib/i18n";
import { PageSubHeader } from "@/components/layout";
import { ActionButtons, Button, Column, Dialog, Label, TabNavigation, Table, showToast } from "@/components/ui";
import { TextInput } from "@/components/ui/TextInput";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/select";
import { fetchAPI } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatDate } from "@/lib/utils";
import { useAuthStore } from "@/stores/useAuthStore";
import { useEmployeeStore } from "@/stores/useEmployeeStore";
import type { Course, Employee, Enrollment } from "@/types";
import { useEffect, useState } from "react";



const deliveryLabels: Record<string, string> = { in_person: catalogMessage("text_67fbbedd7553"), virtual: catalogMessage("text_b2981dfb94c9"), elearning: catalogMessage("text_4cdd39695e5b"), blended: catalogMessage("text_28c0407f1031") };
const typeLabels: Record<string, string> = { mandatory: catalogMessage("text_0f0c206363a3"), optional: catalogMessage("text_33408684704e"), compliance: catalogMessage("text_d896b24d4ffa"), development: catalogMessage("text_5748d605667d") };
const statusLabels: Record<string, string> = { enrolled: catalogMessage("text_f6aee102d51b"), in_progress: catalogMessage("text_d761119224ab"), completed: catalogMessage("text_c2da5684d63b"), failed: catalogMessage("text_2519fef457aa"), dropped: catalogMessage("text_5723c07daa9e") };
const statusBadges: Record<string, string> = { enrolled: "badge-info", in_progress: "badge-warning", completed: "badge-success", failed: "badge-danger", dropped: "badge-secondary" };
const enrollTypeLabels: Record<string, string> = { assigned: catalogMessage("text_3469dea7856e"), self_enrolled: catalogMessage("text_2f2cf187a9ba"), mandatory: catalogMessage("text_0f0c206363a3") };

export function Learning() {
    const { t: i18n } = useI18n();
  const { canAccess } = useAuthStore();
  const [activeTab, setActiveTab] = useState("courses");
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const { allEmployees: employees, loadAllEmployees } = useEmployeeStore();
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  // Dialogs
  const [showCourseDialog, setShowCourseDialog] = useState(false);
  const [showCourseDetail, setShowCourseDetail] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showEnrollDialog, setShowEnrollDialog] = useState(false);
  const [showEnrollDetail, setShowEnrollDetail] = useState(false);
  const [selectedEnroll, setSelectedEnroll] = useState<Enrollment | null>(null);
  // Forms
  const [courseForm, setCourseForm] = useState({ course_code: "", course_name: "", description: "", delivery_method: "in_person", course_type: "optional", duration_hours: "", requires_assessment: false, passing_score: "", video_url: "", is_recurring: false, recurrence_months: "", notes: "" });
  const [enrollForm, setEnrollForm] = useState({ course_id: "", employee_id: "", enrollment_type: "assigned", due_date: "", notes: "" });

  useEffect(() => { loadAllEmployees(); }, [loadAllEmployees]);
  useEffect(() => { setCurrentPage(1); }, [activeTab]);
  useEffect(() => { activeTab === "courses" ? loadCourses() : loadEnrollments(); }, [activeTab, currentPage]);

  const loadCourses = async () => {
    setIsLoading(true);
    try {
      const res: any = await fetchAPI(`${API_ENDPOINTS.HUMAN_CAPITAL.LEARNING.COURSES.BASE}?page=${currentPage}`);
      setCourses(res.data || []); setTotalPages(Number(res.last_page) || 1);
    } catch { showToast(i18n.catalog["text_cc71e2642367"], "error"); }
    finally { setIsLoading(false); }
  };

  const loadEnrollments = async () => {
    setIsLoading(true);
    try {
      const res: any = await fetchAPI(`${API_ENDPOINTS.HUMAN_CAPITAL.LEARNING.ENROLLMENTS.BASE}?page=${currentPage}`);
      setEnrollments(res.data || []); setTotalPages(Number(res.last_page) || 1);
    } catch { showToast(i18n.catalog["text_faf281c52757"], "error"); }
    finally { setIsLoading(false); }
  };

  const handleSaveCourse = async () => {
    if (!courseForm.course_code || !courseForm.course_name) { showToast(i18n.catalog["text_7b758312f829"], "error"); return; }
    try {
      await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.LEARNING.COURSES.BASE, {
        method: "POST", body: JSON.stringify({
          course_code: courseForm.course_code, course_name: courseForm.course_name,
          description: courseForm.description || undefined, delivery_method: courseForm.delivery_method,
          course_type: courseForm.course_type, duration_hours: courseForm.duration_hours ? Number(courseForm.duration_hours) : undefined,
          requires_assessment: courseForm.requires_assessment, passing_score: courseForm.passing_score ? Number(courseForm.passing_score) : undefined,
          video_url: courseForm.video_url || undefined, is_recurring: courseForm.is_recurring,
          recurrence_months: courseForm.recurrence_months ? Number(courseForm.recurrence_months) : undefined,
        })
      });
      showToast(i18n.catalog["text_be641eb32c73"], "success"); setShowCourseDialog(false); loadCourses();
    } catch (e: any) { showToast(e.message || i18n.catalog["text_b0dbba00004b"], "error"); }
  };

  const handlePublishCourse = async (id: number, publish: boolean) => {
    try {
      await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.LEARNING.COURSES.withId(id), { method: "PUT", body: JSON.stringify({ is_published: publish }) });
      showToast(publish ? i18n.catalog["text_17e8f336845b"] : i18n.catalog["text_1b2fe6a86012"], "success"); loadCourses();
    } catch (e: any) { showToast(e.message || i18n.catalog["text_96c789857dbf"], "error"); }
  };

  const viewCourseDetail = async (id: number) => {
    try {
      const res: any = await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.LEARNING.COURSES.withId(id));
      setSelectedCourse(res.data || res); setShowCourseDetail(true);
    } catch { showToast(i18n.catalog["text_6467762a8e34"], "error"); }
  };

  const handleSaveEnrollment = async () => {
    if (!enrollForm.course_id || !enrollForm.employee_id) { showToast(i18n.catalog["text_7b758312f829"], "error"); return; }
    try {
      await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.LEARNING.ENROLLMENTS.BASE, {
        method: "POST", body: JSON.stringify({
          course_id: Number(enrollForm.course_id), employee_id: Number(enrollForm.employee_id),
          enrollment_type: enrollForm.enrollment_type, due_date: enrollForm.due_date || undefined,
          notes: enrollForm.notes || undefined,
        })
      });
      showToast(i18n.catalog["text_d290acba521a"], "success"); setShowEnrollDialog(false); loadEnrollments();
    } catch (e: any) { showToast(e.message || i18n.catalog["text_b0dbba00004b"], "error"); }
  };

  const handleUpdateEnrollment = async (id: number, data: any) => {
    try {
      await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.LEARNING.ENROLLMENTS.withId(id), { method: "PUT", body: JSON.stringify(data) });
      showToast(i18n.catalog["text_2ad65064edba"], "success"); loadEnrollments();
    } catch (e: any) { showToast(e.message || i18n.catalog["text_96c789857dbf"], "error"); }
  };

  const courseColumns: Column<Course>[] = [
    { key: "course_code", header: i18n.catalog["text_589c6420ea10"], dataLabel: i18n.catalog["text_589c6420ea10"] },
    { key: "course_name", header: i18n.catalog["text_ab2827a6e6bf"], dataLabel: i18n.catalog["text_52ab09847cf8"] },
    { key: "delivery_method", header: i18n.catalog["text_278fcbd1a490"], dataLabel: i18n.catalog["text_0572c0f0cf19"], render: (i) => deliveryLabels[i.delivery_method] || i.delivery_method },
    { key: "course_type", header: i18n.catalog["text_caa3f2bb4a36"], dataLabel: i18n.catalog["text_caa3f2bb4a36"], render: (i) => <span className={`badge ${i.course_type === "mandatory" ? "badge-warning" : "badge-info"}`}>{typeLabels[i.course_type] || i.course_type}</span> },
    { key: "duration_hours", header: i18n.catalog["text_a7947509c350"], dataLabel: i18n.catalog["text_a7947509c350"], render: (i) => catalogText(i18n, "text_555f401b505c", { value0: i.duration_hours || 0 }) },
    { key: "enrollments", header: i18n.catalog["text_0c98999d034c"], dataLabel: i18n.catalog["text_0c98999d034c"], render: (i) => i.enrollments?.length || 0 },
    { key: "is_published", header: i18n.catalog["text_c3a4749caed4"], dataLabel: i18n.catalog["text_c3a4749caed4"], render: (i) => <span className={`badge ${i.is_published ? "badge-success" : "badge-secondary"}`}>{i.is_published ? i18n.catalog["text_74f0d5710a99"] : i18n.catalog["text_552aec56f591"]}</span> },
    {
      key: "id", header: i18n.catalog["text_9f0a0f722601"], dataLabel: i18n.catalog["text_9f0a0f722601"], render: (i) => (
        <ActionButtons
          actions={[
            {
              icon: "eye",
              title: i18n.catalog["text_29f382c73779"],
              variant: "view",
              onClick: () => viewCourseDetail(i.id)
            },
            ...(canAccess("learning", "edit") ? [{
              icon: (i.is_published ? "eye-off" : "send") as any,
              title: i.is_published ? i18n.catalog["text_391ee0811948"] : i18n.catalog["text_b19234315bac"],
              variant: (i.is_published ? "delete" : "success") as any,
              onClick: () => handlePublishCourse(i.id, !i.is_published)
            }] : []),
            ...(canAccess("learning", "create") ? [{
              icon: "user-plus" as const,
              title: i18n.catalog["text_d5b4edcef3d3"],
              variant: "view" as const,
              onClick: () => { setEnrollForm({ course_id: String(i.id), employee_id: "", enrollment_type: "assigned", due_date: "", notes: "" }); setShowEnrollDialog(true); }
            }] : [])
          ]}
        />
      )
    },
  ];

  const enrollmentColumns: Column<Enrollment>[] = [
    { key: "course", header: i18n.catalog["text_41195137d9ea"], dataLabel: i18n.catalog["text_41195137d9ea"], render: (i) => <div><div>{i.course?.course_name || "-"}</div><small className="text-muted">{i.course?.course_code}</small></div> },
    { key: "employee", header: i18n.catalog["text_b71a39c832a6"], dataLabel: i18n.catalog["text_b71a39c832a6"], render: (i) => i.employee?.full_name || "-" },
    { key: "enrollment_type", header: i18n.catalog["text_caa3f2bb4a36"], dataLabel: i18n.catalog["text_caa3f2bb4a36"], render: (i) => enrollTypeLabels[i.enrollment_type] || i.enrollment_type },
    { key: "progress", header: i18n.catalog["text_562bbe85662e"], dataLabel: i18n.catalog["text_562bbe85662e"], render: (i) => <div className="progress" style={{ height: "20px" }}><div className="progress-bar" role="progressbar" style={{ width: `${i.progress_percentage}%` }}>{i.progress_percentage}%</div></div> },
    { key: "status", header: i18n.catalog["text_c3a4749caed4"], dataLabel: i18n.catalog["text_c3a4749caed4"], render: (i) => <span className={`badge ${statusBadges[i.status]}`}>{statusLabels[i.status] || i.status}</span> },
    { key: "enrollment_date", header: i18n.catalog["text_b8fcbb3f2d33"], dataLabel: i18n.catalog["text_d90c384199ac"], render: (i) => formatDate(i.enrollment_date) },
    {
      key: "id", header: i18n.catalog["text_9f0a0f722601"], dataLabel: i18n.catalog["text_9f0a0f722601"], render: (i) => (
        <ActionButtons
          actions={[
            {
              icon: "eye",
              title: i18n.catalog["text_29f382c73779"],
              variant: "view",
              onClick: () => { setSelectedEnroll(i); setShowEnrollDetail(true); }
            },
            ...(canAccess("learning", "edit") ? [{
              icon: "play" as const,
              title: i18n.catalog["text_bca1544d642e"],
              variant: "view" as const,
              onClick: () => handleUpdateEnrollment(i.id, { status: "in_progress", progress_percentage: 10 }),
              hidden: i.status !== "enrolled"
            }] : []),
            ...(canAccess("learning", "edit") ? [{
              icon: "check" as const,
              title: i18n.catalog["text_54536a96c6fc"],
              variant: "success" as const,
              onClick: () => handleUpdateEnrollment(i.id, { status: "completed" }),
              hidden: i.status !== "in_progress"
            }] : [])
          ]}
        />
      )
    },
  ];

  const tabs = [{ key: "courses", label: i18n.catalog["text_a3a98b80d74f"], icon: "book" }, { key: "enrollments", label: i18n.catalog["text_7c32d489fa12"], icon: "user-check" }]

  return (
    <div className="sales-card animate-fade">
      <PageSubHeader
        title={i18n.catalog["text_57bd13375883"]}
        titleIcon="graduation-cap"
        actions={
          <div style={{ display: "flex", gap: "1rem" }}>
            {activeTab === "courses" && canAccess("learning", "create") &&
              <Button
                onClick={() => { setCourseForm({ course_code: "", course_name: "", description: "", delivery_method: "in_person", course_type: "optional", duration_hours: "", requires_assessment: false, passing_score: "", video_url: "", is_recurring: false, recurrence_months: "", notes: "" }); setShowCourseDialog(true); }}
                variant="primary"
                icon="plus"
              >
                {i18n.catalog["text_1cb37d0008e3"]}</Button>}
            {activeTab === "enrollments" && canAccess("learning", "create") &&
              <Button
                onClick={() => { setEnrollForm({ course_id: "", employee_id: "", enrollment_type: "assigned", due_date: "", notes: "" }); setShowEnrollDialog(true); }}
                variant="primary"
                icon="plus"
              >
                {i18n.catalog["text_c2e3319378d7"]}</Button>}
          </div>
        }
      />

      <TabNavigation tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === "courses" ? (
        <Table columns={courseColumns} data={courses} keyExtractor={(i) => i.id.toString()} emptyMessage={i18n.catalog["text_b0ccfb185b1a"]} isLoading={isLoading} pagination={{ currentPage, totalPages, onPageChange: setCurrentPage }} />
      ) : (
        <Table columns={enrollmentColumns} data={enrollments} keyExtractor={(i) => i.id.toString()} emptyMessage={i18n.catalog["text_9552c2d039cc"]} isLoading={isLoading} pagination={{ currentPage, totalPages, onPageChange: setCurrentPage }} />
      )}

      {/* Create Course Dialog */}
      <Dialog isOpen={showCourseDialog} onClose={() => setShowCourseDialog(false)} title={i18n.catalog["text_1cb37d0008e3"]} maxWidth="700px">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextInput label={i18n.catalog["text_b52cce938022"]} value={courseForm.course_code} onChange={(e) => setCourseForm({ ...courseForm, course_code: e.target.value })} placeholder={i18n.catalog["text_1df1f4c20347"]} />
            <TextInput label={i18n.catalog["text_28c1ebd0b3f7"]} value={courseForm.course_name} onChange={(e) => setCourseForm({ ...courseForm, course_name: e.target.value })} />
          </div>
          <Textarea label={i18n.catalog["text_95023fc76e1b"]} value={courseForm.description} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} rows={3} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label={i18n.catalog["text_278fcbd1a490"]}
              value={courseForm.delivery_method}
              onChange={(e) => setCourseForm({ ...courseForm, delivery_method: e.target.value })}
              options={Object.entries(deliveryLabels).map(([value, label]) => ({ value, label }))}
            />
            <Select
              label={i18n.catalog["text_caa3f2bb4a36"]}
              value={courseForm.course_type}
              onChange={(e) => setCourseForm({ ...courseForm, course_type: e.target.value })}
              options={Object.entries(typeLabels).map(([value, label]) => ({ value, label }))}
            />
            <TextInput label={i18n.catalog["text_5ef4cd4a48bf"]} type="number" value={courseForm.duration_hours} onChange={(e) => setCourseForm({ ...courseForm, duration_hours: e.target.value })} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <input type="checkbox" checked={courseForm.requires_assessment} onChange={(e) => setCourseForm({ ...courseForm, requires_assessment: e.target.checked })} id="requires_assessment" />
              <Label htmlFor="requires_assessment" className="text-secondary">{i18n.catalog["text_da3cdd644aae"]}</Label>
            </div>
            {courseForm.requires_assessment && (
              <TextInput label={i18n.catalog["text_7ecd961d200a"]} type="number" min="0" max="100" value={courseForm.passing_score} onChange={(e) => setCourseForm({ ...courseForm, passing_score: e.target.value })} />
            )}
          </div>
          <TextInput label={i18n.catalog["text_b6ec0f608813"]} value={courseForm.video_url} onChange={(e) => setCourseForm({ ...courseForm, video_url: e.target.value })} placeholder={i18n.catalog["text_e98a62ef23bb"]} />
          <div className="flex justify-end gap-2" style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid var(--border-color)" }}><Button variant="secondary" onClick={() => setShowCourseDialog(false)}>{i18n.catalog["text_9a30dc2a96b8"]}</Button><Button variant="primary" onClick={handleSaveCourse} icon="save">{i18n.catalog["text_ddfcaf9d0144"]}</Button></div>
        </div>
      </Dialog>

      {/* Course Detail */}
      <Dialog isOpen={showCourseDetail} onClose={() => setShowCourseDetail(false)} title={i18n.catalog["text_e373494d9ce7"]} maxWidth="700px">
        {selectedCourse && <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><strong>{i18n.catalog["text_36d47e79a474"]}</strong> {selectedCourse.course_code}</div>
            <div><strong>{i18n.catalog["text_b0ae3c0ca9a8"]}</strong> {selectedCourse.course_name}</div>
            <div><strong>{i18n.catalog["text_1e9b22562c81"]}</strong> {deliveryLabels[selectedCourse.delivery_method]}</div>
            <div><strong>{i18n.catalog["text_0e20d829bef2"]}</strong> {typeLabels[selectedCourse.course_type]}</div>
            <div><strong>{i18n.catalog["text_96df50d930d9"]}</strong> {selectedCourse.duration_hours} {i18n.catalog["text_44c3abfb7720"]}</div>
            <div><strong>{i18n.catalog["text_02e196bdec60"]}</strong> <span className={`badge ${selectedCourse.is_published ? "badge-success" : "badge-secondary"}`}>{selectedCourse.is_published ? i18n.catalog["text_74f0d5710a99"] : i18n.catalog["text_552aec56f591"]}</span></div>
            {selectedCourse.requires_assessment && <div><strong>{i18n.catalog["text_38ac5b045d16"]}</strong> {selectedCourse.passing_score}%</div>}
          </div>
          {selectedCourse.description && <div><strong>{i18n.catalog["text_3ec7e12fb399"]}</strong><p>{selectedCourse.description}</p></div>}
          {selectedCourse.enrollments && selectedCourse.enrollments.length > 0 && <div>
            <strong>{i18n.catalog["text_0139bb588840"]}{selectedCourse.enrollments.length}):</strong>
            <div style={{ marginTop: "0.5rem" }}>
              {selectedCourse.enrollments.map(e => (
                <div key={e.id} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem", borderBottom: "1px solid var(--border-color)" }}>
                  <span>{e.employee?.full_name}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span className={`badge ${statusBadges[e.status]}`}>{statusLabels[e.status]}</span>
                    <span>{e.progress_percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>}
        </div>}
      </Dialog>

      {/* Enroll Dialog */}
      <Dialog isOpen={showEnrollDialog} onClose={() => setShowEnrollDialog(false)} title={i18n.catalog["text_d5b4edcef3d3"]} maxWidth="550px">
        <div className="space-y-4">
          <Select
            label={i18n.catalog["text_43f605a56f54"]}
            value={enrollForm.course_id}
            onChange={(e) => setEnrollForm({ ...enrollForm, course_id: e.target.value })}
            placeholder={i18n.catalog["text_9f23ce35c60c"]}
            options={courses.filter(c => c.is_published).map(c => ({ value: c.id, label: catalogText(i18n, "text_e11f55b693d8", { value0: c.course_name, value1: c.course_code }) }))}
          />
          <Select
            label={i18n.catalog["text_972803dc7d86"]}
            value={enrollForm.employee_id}
            onChange={(e) => setEnrollForm({ ...enrollForm, employee_id: e.target.value })}
            placeholder={i18n.catalog["text_dee783929dea"]}
            options={employees.map((e: Employee) => ({ value: e.id, label: e.full_name }))}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label={i18n.catalog["text_2543e22c3294"]}
              value={enrollForm.enrollment_type}
              onChange={(e) => setEnrollForm({ ...enrollForm, enrollment_type: e.target.value })}
              options={Object.entries(enrollTypeLabels).map(([value, label]) => ({ value, label }))}
            />
            <TextInput label={i18n.catalog["text_7ca684720c66"]} type="date" value={enrollForm.due_date} onChange={(e) => setEnrollForm({ ...enrollForm, due_date: e.target.value })} />
          </div>
          <Textarea label={i18n.catalog["text_d446d2dc6b81"]} value={enrollForm.notes} onChange={(e) => setEnrollForm({ ...enrollForm, notes: e.target.value })} rows={2} />
          <div className="flex justify-end gap-2" style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid var(--border-color)" }}><Button variant="secondary" onClick={() => setShowEnrollDialog(false)}>{i18n.catalog["text_9a30dc2a96b8"]}</Button><Button variant="primary" onClick={handleSaveEnrollment} icon="save">{i18n.catalog["text_dcf52d4105c1"]}</Button></div>
        </div>
      </Dialog>

      {/* Enrollment Detail */}
      <Dialog isOpen={showEnrollDetail} onClose={() => setShowEnrollDetail(false)} title={i18n.catalog["text_25dddf990a47"]} maxWidth="550px">
        {selectedEnroll && <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><strong>{i18n.catalog["text_7c779444c174"]}</strong> {selectedEnroll.course?.course_name}</div>
            <div><strong>{i18n.catalog["text_b6293eeef8b9"]}</strong> {selectedEnroll.employee?.full_name}</div>
            <div><strong>{i18n.catalog["text_0e20d829bef2"]}</strong> {enrollTypeLabels[selectedEnroll.enrollment_type]}</div>
            <div><strong>{i18n.catalog["text_02e196bdec60"]}</strong> <span className={`badge ${statusBadges[selectedEnroll.status]}`}>{statusLabels[selectedEnroll.status]}</span></div>
            <div><strong>{i18n.catalog["text_d6384709d2fd"]}</strong> {selectedEnroll.progress_percentage}%</div>
            <div><strong>{i18n.catalog["text_d25578b3361b"]}</strong> {formatDate(selectedEnroll.enrollment_date)}</div>
            {selectedEnroll.due_date && <div><strong>{i18n.catalog["text_98415eee74cb"]}</strong> {formatDate(selectedEnroll.due_date)}</div>}
            {selectedEnroll.completion_date && <div><strong>{i18n.catalog["text_56460d73b966"]}</strong> {formatDate(selectedEnroll.completion_date)}</div>}
            {selectedEnroll.score !== undefined && selectedEnroll.score !== null && <div><strong>{i18n.catalog["text_349c31a9ce64"]}</strong> {selectedEnroll.score}%</div>}
            {selectedEnroll.is_passed !== undefined && selectedEnroll.is_passed !== null && <div><strong>{i18n.catalog["text_9ebd6a4c542a"]}</strong> <span className={`badge ${selectedEnroll.is_passed ? "badge-success" : "badge-danger"}`}>{selectedEnroll.is_passed ? i18n.catalog["text_049e74f99b5a"] : i18n.catalog["text_97c63ea625c4"]}</span></div>}
          </div>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {selectedEnroll.status === "enrolled" && <Button variant="primary" onClick={() => { handleUpdateEnrollment(selectedEnroll.id, { status: "in_progress", progress_percentage: 10 }); setShowEnrollDetail(false); }}>{i18n.catalog["text_12621a140256"]}</Button>}
            {selectedEnroll.status === "in_progress" && <Button variant="primary" onClick={() => { handleUpdateEnrollment(selectedEnroll.id, { status: "completed" }); setShowEnrollDetail(false); }}>{i18n.catalog["text_54536a96c6fc"]}</Button>}
          </div>
        </div>}
      </Dialog>
    </div>
  );
}
