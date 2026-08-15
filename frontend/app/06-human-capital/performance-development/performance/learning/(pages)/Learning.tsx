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



const deliveryLabels: Record<string, string> = { in_person: catalogMessage("humanCapital.learning.person"), virtual: catalogMessage("humanCapital.learning.default"), elearning: catalogMessage("humanCapital.learning.eLearning"), blended: catalogMessage("humanCapital.learning.mixed") };
const typeLabels: Record<string, string> = { mandatory: catalogMessage("common.general.required"), optional: catalogMessage("common.general.optional"), compliance: catalogMessage("humanCapital.learning.compliance"), development: catalogMessage("humanCapital.learning.development") };
const statusLabels: Record<string, string> = { enrolled: catalogMessage("common.general.registered"), in_progress: catalogMessage("common.general.progress.alternative3"), completed: catalogMessage("common.general.completed"), failed: catalogMessage("common.general.failed.alternative2"), dropped: catalogMessage("common.general.withdraw") };
const statusBadges: Record<string, string> = { enrolled: "badge-info", in_progress: "badge-warning", completed: "badge-success", failed: "badge-danger", dropped: "badge-secondary" };
const enrollTypeLabels: Record<string, string> = { assigned: catalogMessage("humanCapital.learning.assigned"), self_enrolled: catalogMessage("common.general.personal"), mandatory: catalogMessage("common.general.required") };

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
    } catch { showToast(i18n.catalog["humanCapital.learning.failedLoadCourses"], "error"); }
    finally { setIsLoading(false); }
  };

  const loadEnrollments = async () => {
    setIsLoading(true);
    try {
      const res: any = await fetchAPI(`${API_ENDPOINTS.HUMAN_CAPITAL.LEARNING.ENROLLMENTS.BASE}?page=${currentPage}`);
      setEnrollments(res.data || []); setTotalPages(Number(res.last_page) || 1);
    } catch { showToast(i18n.catalog["humanCapital.learning.failedLoadRecords"], "error"); }
    finally { setIsLoading(false); }
  };

  const handleSaveCourse = async () => {
    if (!courseForm.course_code || !courseForm.course_name) { showToast(i18n.catalog["common.general.pleaseFillRequiredFields.alternative2"], "error"); return; }
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
      showToast(i18n.catalog["humanCapital.learning.courseCreated"], "success"); setShowCourseDialog(false); loadCourses();
    } catch (e: any) { showToast(e.message || i18n.catalog["common.general.failedSave"], "error"); }
  };

  const handlePublishCourse = async (id: number, publish: boolean) => {
    try {
      await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.LEARNING.COURSES.withId(id), { method: "PUT", body: JSON.stringify({ is_published: publish }) });
      showToast(publish ? i18n.catalog["humanCapital.learning.coursePublished"] : i18n.catalog["humanCapital.learning.courseUnpublished"], "success"); loadCourses();
    } catch (e: any) { showToast(e.message || i18n.catalog["common.general.updateFailed"], "error"); }
  };

  const viewCourseDetail = async (id: number) => {
    try {
      const res: any = await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.LEARNING.COURSES.withId(id));
      setSelectedCourse(res.data || res); setShowCourseDetail(true);
    } catch { showToast(i18n.catalog["common.general.failedLoadDetails"], "error"); }
  };

  const handleSaveEnrollment = async () => {
    if (!enrollForm.course_id || !enrollForm.employee_id) { showToast(i18n.catalog["common.general.pleaseFillRequiredFields.alternative2"], "error"); return; }
    try {
      await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.LEARNING.ENROLLMENTS.BASE, {
        method: "POST", body: JSON.stringify({
          course_id: Number(enrollForm.course_id), employee_id: Number(enrollForm.employee_id),
          enrollment_type: enrollForm.enrollment_type, due_date: enrollForm.due_date || undefined,
          notes: enrollForm.notes || undefined,
        })
      });
      showToast(i18n.catalog["humanCapital.learning.employeeRegistered"], "success"); setShowEnrollDialog(false); loadEnrollments();
    } catch (e: any) { showToast(e.message || i18n.catalog["common.general.failedSave"], "error"); }
  };

  const handleUpdateEnrollment = async (id: number, data: any) => {
    try {
      await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.LEARNING.ENROLLMENTS.withId(id), { method: "PUT", body: JSON.stringify(data) });
      showToast(i18n.catalog["humanCapital.learning.registrationUpdated"], "success"); loadEnrollments();
    } catch (e: any) { showToast(e.message || i18n.catalog["common.general.updateFailed"], "error"); }
  };

  const courseColumns: Column<Course>[] = [
    { key: "course_code", header: i18n.catalog["common.general.code"], dataLabel: i18n.catalog["common.general.code"] },
    { key: "course_name", header: i18n.catalog["humanCapital.learning.courseName"], dataLabel: i18n.catalog["common.general.name"] },
    { key: "delivery_method", header: i18n.catalog["common.general.deliveryMethod"], dataLabel: i18n.catalog["humanCapital.learning.method"], render: (i) => deliveryLabels[i.delivery_method] || i.delivery_method },
    { key: "course_type", header: i18n.catalog["common.general.type.alternative3"], dataLabel: i18n.catalog["common.general.type.alternative3"], render: (i) => <span className={`badge ${i.course_type === "mandatory" ? "badge-warning" : "badge-info"}`}>{typeLabels[i.course_type] || i.course_type}</span> },
    { key: "duration_hours", header: i18n.catalog["common.general.duration"], dataLabel: i18n.catalog["common.general.duration"], render: (i) => catalogText(i18n, "common.general.hour.alternative2", { value0: i.duration_hours || 0 }) },
    { key: "enrollments", header: i18n.catalog["common.general.registrants"], dataLabel: i18n.catalog["common.general.registrants"], render: (i) => i.enrollments?.length || 0 },
    { key: "is_published", header: i18n.catalog["common.general.status.alternative2"], dataLabel: i18n.catalog["common.general.status.alternative2"], render: (i) => <span className={`badge ${i.is_published ? "badge-success" : "badge-secondary"}`}>{i.is_published ? i18n.catalog["common.general.published"] : i18n.catalog["common.general.draft"]}</span> },
    {
      key: "id", header: i18n.catalog["common.general.actions.alternative2"], dataLabel: i18n.catalog["common.general.actions.alternative2"], render: (i) => (
        <ActionButtons
          actions={[
            {
              icon: "eye",
              title: i18n.catalog["common.general.details"],
              variant: "view",
              onClick: () => viewCourseDetail(i.id)
            },
            ...(canAccess("learning", "edit") ? [{
              icon: (i.is_published ? "eye-off" : "send") as any,
              title: i.is_published ? i18n.catalog["common.general.unpublish"] : i18n.catalog["common.general.publish"],
              variant: (i.is_published ? "delete" : "success") as any,
              onClick: () => handlePublishCourse(i.id, !i.is_published)
            }] : []),
            ...(canAccess("learning", "create") ? [{
              icon: "user-plus" as const,
              title: i18n.catalog["common.general.registerEmployee"],
              variant: "view" as const,
              onClick: () => { setEnrollForm({ course_id: String(i.id), employee_id: "", enrollment_type: "assigned", due_date: "", notes: "" }); setShowEnrollDialog(true); }
            }] : [])
          ]}
        />
      )
    },
  ];

  const enrollmentColumns: Column<Enrollment>[] = [
    { key: "course", header: i18n.catalog["common.general.cycle"], dataLabel: i18n.catalog["common.general.cycle"], render: (i) => <div><div>{i.course?.course_name || "-"}</div><small className="text-muted">{i.course?.course_code}</small></div> },
    { key: "employee", header: i18n.catalog["common.general.employee.alternative3"], dataLabel: i18n.catalog["common.general.employee.alternative3"], render: (i) => i.employee?.full_name || "-" },
    { key: "enrollment_type", header: i18n.catalog["common.general.type.alternative3"], dataLabel: i18n.catalog["common.general.type.alternative3"], render: (i) => enrollTypeLabels[i.enrollment_type] || i.enrollment_type },
    { key: "progress", header: i18n.catalog["common.general.progress"], dataLabel: i18n.catalog["common.general.progress"], render: (i) => <div className="progress" style={{ height: "20px" }}><div className="progress-bar" role="progressbar" style={{ width: `${i.progress_percentage}%` }}>{i.progress_percentage}%</div></div> },
    { key: "status", header: i18n.catalog["common.general.status.alternative2"], dataLabel: i18n.catalog["common.general.status.alternative2"], render: (i) => <span className={`badge ${statusBadges[i.status]}`}>{statusLabels[i.status] || i.status}</span> },
    { key: "enrollment_date", header: i18n.catalog["common.general.registrationDate"], dataLabel: i18n.catalog["common.general.date.alternative7"], render: (i) => formatDate(i.enrollment_date) },
    {
      key: "id", header: i18n.catalog["common.general.actions.alternative2"], dataLabel: i18n.catalog["common.general.actions.alternative2"], render: (i) => (
        <ActionButtons
          actions={[
            {
              icon: "eye",
              title: i18n.catalog["common.general.details"],
              variant: "view",
              onClick: () => { setSelectedEnroll(i); setShowEnrollDetail(true); }
            },
            ...(canAccess("learning", "edit") ? [{
              icon: "play" as const,
              title: i18n.catalog["common.general.start.alternative2"],
              variant: "view" as const,
              onClick: () => handleUpdateEnrollment(i.id, { status: "in_progress", progress_percentage: 10 }),
              hidden: i.status !== "enrolled"
            }] : []),
            ...(canAccess("learning", "edit") ? [{
              icon: "check" as const,
              title: i18n.catalog["common.general.complete"],
              variant: "success" as const,
              onClick: () => handleUpdateEnrollment(i.id, { status: "completed" }),
              hidden: i.status !== "in_progress"
            }] : [])
          ]}
        />
      )
    },
  ];

  const tabs = [{ key: "courses", label: i18n.catalog["humanCapital.learning.courses"], icon: "book" }, { key: "enrollments", label: i18n.catalog["common.general.records.alternative2"], icon: "user-check" }]

  return (
    <div className="sales-card animate-fade">
      <PageSubHeader
        title={i18n.catalog["common.general.trainingLearning"]}
        titleIcon="graduation-cap"
        actions={
          <div style={{ display: "flex", gap: "1rem" }}>
            {activeTab === "courses" && canAccess("learning", "create") &&
              <Button
                onClick={() => { setCourseForm({ course_code: "", course_name: "", description: "", delivery_method: "in_person", course_type: "optional", duration_hours: "", requires_assessment: false, passing_score: "", video_url: "", is_recurring: false, recurrence_months: "", notes: "" }); setShowCourseDialog(true); }}
                variant="primary"
                icon="plus"
              >
                {i18n.catalog["common.general.addNewCycle"]}</Button>}
            {activeTab === "enrollments" && canAccess("learning", "create") &&
              <Button
                onClick={() => { setEnrollForm({ course_id: "", employee_id: "", enrollment_type: "assigned", due_date: "", notes: "" }); setShowEnrollDialog(true); }}
                variant="primary"
                icon="plus"
              >
                {i18n.catalog["common.general.newRegistration"]}</Button>}
          </div>
        }
      />

      <TabNavigation tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === "courses" ? (
        <Table columns={courseColumns} data={courses} keyExtractor={(i) => i.id.toString()} emptyMessage={i18n.catalog["humanCapital.learning.noCycles"]} isLoading={isLoading} pagination={{ currentPage, totalPages, onPageChange: setCurrentPage }} />
      ) : (
        <Table columns={enrollmentColumns} data={enrollments} keyExtractor={(i) => i.id.toString()} emptyMessage={i18n.catalog["common.general.noRecords.alternative2"]} isLoading={isLoading} pagination={{ currentPage, totalPages, onPageChange: setCurrentPage }} />
      )}

      {/* Create Course Dialog */}
      <Dialog isOpen={showCourseDialog} onClose={() => setShowCourseDialog(false)} title={i18n.catalog["common.general.addNewCycle"]} maxWidth="700px">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextInput label={i18n.catalog["humanCapital.learning.cycleCode"]} value={courseForm.course_code} onChange={(e) => setCourseForm({ ...courseForm, course_code: e.target.value })} placeholder={i18n.catalog["humanCapital.learning.crs001"]} />
            <TextInput label={i18n.catalog["humanCapital.learning.cycleName"]} value={courseForm.course_name} onChange={(e) => setCourseForm({ ...courseForm, course_name: e.target.value })} />
          </div>
          <Textarea label={i18n.catalog["common.general.description.alternative2"]} value={courseForm.description} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} rows={3} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label={i18n.catalog["common.general.deliveryMethod"]}
              value={courseForm.delivery_method}
              onChange={(e) => setCourseForm({ ...courseForm, delivery_method: e.target.value })}
              options={Object.entries(deliveryLabels).map(([value, label]) => ({ value, label }))}
            />
            <Select
              label={i18n.catalog["common.general.type.alternative3"]}
              value={courseForm.course_type}
              onChange={(e) => setCourseForm({ ...courseForm, course_type: e.target.value })}
              options={Object.entries(typeLabels).map(([value, label]) => ({ value, label }))}
            />
            <TextInput label={i18n.catalog["humanCapital.learning.durationHour"]} type="number" value={courseForm.duration_hours} onChange={(e) => setCourseForm({ ...courseForm, duration_hours: e.target.value })} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <input type="checkbox" checked={courseForm.requires_assessment} onChange={(e) => setCourseForm({ ...courseForm, requires_assessment: e.target.checked })} id="requires_assessment" />
              <Label htmlFor="requires_assessment" className="text-secondary">{i18n.catalog["humanCapital.learning.requiresTesting"]}</Label>
            </div>
            {courseForm.requires_assessment && (
              <TextInput label={i18n.catalog["humanCapital.learning.passingGrade"]} type="number" min="0" max="100" value={courseForm.passing_score} onChange={(e) => setCourseForm({ ...courseForm, passing_score: e.target.value })} />
            )}
          </div>
          <TextInput label={i18n.catalog["humanCapital.learning.videoLink"]} value={courseForm.video_url} onChange={(e) => setCourseForm({ ...courseForm, video_url: e.target.value })} placeholder={"https://..."} />
          <div className="flex justify-end gap-2" style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid var(--border-color)" }}><Button variant="secondary" onClick={() => setShowCourseDialog(false)}>{i18n.catalog["common.general.cancel"]}</Button><Button variant="primary" onClick={handleSaveCourse} icon="save">{i18n.catalog["common.general.save"]}</Button></div>
        </div>
      </Dialog>

      {/* Course Detail */}
      <Dialog isOpen={showCourseDetail} onClose={() => setShowCourseDetail(false)} title={i18n.catalog["humanCapital.learning.cycleDetails"]} maxWidth="700px">
        {selectedCourse && <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><strong>{i18n.catalog["humanCapital.learning.code"]}</strong> {selectedCourse.course_code}</div>
            <div><strong>{i18n.catalog["common.general.name.alternative2"]}</strong> {selectedCourse.course_name}</div>
            <div><strong>{i18n.catalog["humanCapital.learning.method.alternative2"]}</strong> {deliveryLabels[selectedCourse.delivery_method]}</div>
            <div><strong>{i18n.catalog["common.general.type"]}</strong> {typeLabels[selectedCourse.course_type]}</div>
            <div><strong>{i18n.catalog["humanCapital.learning.duration"]}</strong> {selectedCourse.duration_hours} {i18n.catalog["common.general.hour"]}</div>
            <div><strong>{i18n.catalog["common.general.status"]}</strong> <span className={`badge ${selectedCourse.is_published ? "badge-success" : "badge-secondary"}`}>{selectedCourse.is_published ? i18n.catalog["common.general.published"] : i18n.catalog["common.general.draft"]}</span></div>
            {selectedCourse.requires_assessment && <div><strong>{i18n.catalog["humanCapital.learning.successRate"]}</strong> {selectedCourse.passing_score}%</div>}
          </div>
          {selectedCourse.description && <div><strong>{i18n.catalog["common.general.description"]}</strong><p>{selectedCourse.description}</p></div>}
          {selectedCourse.enrollments && selectedCourse.enrollments.length > 0 && <div>
            <strong>{i18n.catalog["humanCapital.learning.registrants"]}{selectedCourse.enrollments.length}):</strong>
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
      <Dialog isOpen={showEnrollDialog} onClose={() => setShowEnrollDialog(false)} title={i18n.catalog["common.general.registerEmployee"]} maxWidth="550px">
        <div className="space-y-4">
          <Select
            label={i18n.catalog["humanCapital.learning.cycle"]}
            value={enrollForm.course_id}
            onChange={(e) => setEnrollForm({ ...enrollForm, course_id: e.target.value })}
            placeholder={i18n.catalog["common.general.selectPeriod"]}
            options={courses.filter(c => c.is_published).map(c => ({ value: c.id, label: catalogText(i18n, "common.general.message.alternative7", { value0: c.course_name, value1: c.course_code }) }))}
          />
          <Select
            label={i18n.catalog["common.general.employee"]}
            value={enrollForm.employee_id}
            onChange={(e) => setEnrollForm({ ...enrollForm, employee_id: e.target.value })}
            placeholder={i18n.catalog["common.general.selectEmployee"]}
            options={employees.map((e: Employee) => ({ value: e.id, label: e.full_name }))}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label={i18n.catalog["common.general.registrationType"]}
              value={enrollForm.enrollment_type}
              onChange={(e) => setEnrollForm({ ...enrollForm, enrollment_type: e.target.value })}
              options={Object.entries(enrollTypeLabels).map(([value, label]) => ({ value, label }))}
            />
            <TextInput label={i18n.catalog["humanCapital.learning.deadline"]} type="date" value={enrollForm.due_date} onChange={(e) => setEnrollForm({ ...enrollForm, due_date: e.target.value })} />
          </div>
          <Textarea label={i18n.catalog["common.general.notes.alternative2"]} value={enrollForm.notes} onChange={(e) => setEnrollForm({ ...enrollForm, notes: e.target.value })} rows={2} />
          <div className="flex justify-end gap-2" style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid var(--border-color)" }}><Button variant="secondary" onClick={() => setShowEnrollDialog(false)}>{i18n.catalog["common.general.cancel"]}</Button><Button variant="primary" onClick={handleSaveEnrollment} icon="save">{i18n.catalog["common.general.register"]}</Button></div>
        </div>
      </Dialog>

      {/* Enrollment Detail */}
      <Dialog isOpen={showEnrollDetail} onClose={() => setShowEnrollDetail(false)} title={i18n.catalog["humanCapital.learning.registrationDetails"]} maxWidth="550px">
        {selectedEnroll && <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><strong>{i18n.catalog["humanCapital.learning.cycle.alternative2"]}</strong> {selectedEnroll.course?.course_name}</div>
            <div><strong>{i18n.catalog["common.general.employee.alternative2"]}</strong> {selectedEnroll.employee?.full_name}</div>
            <div><strong>{i18n.catalog["common.general.type"]}</strong> {enrollTypeLabels[selectedEnroll.enrollment_type]}</div>
            <div><strong>{i18n.catalog["common.general.status"]}</strong> <span className={`badge ${statusBadges[selectedEnroll.status]}`}>{statusLabels[selectedEnroll.status]}</span></div>
            <div><strong>{i18n.catalog["common.general.progress.alternative2"]}</strong> {selectedEnroll.progress_percentage}%</div>
            <div><strong>{i18n.catalog["humanCapital.learning.registrationDate"]}</strong> {formatDate(selectedEnroll.enrollment_date)}</div>
            {selectedEnroll.due_date && <div><strong>{i18n.catalog["humanCapital.learning.deadline.alternative2"]}</strong> {formatDate(selectedEnroll.due_date)}</div>}
            {selectedEnroll.completion_date && <div><strong>{i18n.catalog["humanCapital.learning.completionDate"]}</strong> {formatDate(selectedEnroll.completion_date)}</div>}
            {selectedEnroll.score !== undefined && selectedEnroll.score !== null && <div><strong>{i18n.catalog["humanCapital.learning.grade"]}</strong> {selectedEnroll.score}%</div>}
            {selectedEnroll.is_passed !== undefined && selectedEnroll.is_passed !== null && <div><strong>{i18n.catalog["humanCapital.learning.result"]}</strong> <span className={`badge ${selectedEnroll.is_passed ? "badge-success" : "badge-danger"}`}>{selectedEnroll.is_passed ? i18n.catalog["humanCapital.learning.successful"] : i18n.catalog["humanCapital.learning.failed"]}</span></div>}
          </div>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {selectedEnroll.status === "enrolled" && <Button variant="primary" onClick={() => { handleUpdateEnrollment(selectedEnroll.id, { status: "in_progress", progress_percentage: 10 }); setShowEnrollDetail(false); }}>{i18n.catalog["humanCapital.learning.startCourse"]}</Button>}
            {selectedEnroll.status === "in_progress" && <Button variant="primary" onClick={() => { handleUpdateEnrollment(selectedEnroll.id, { status: "completed" }); setShowEnrollDetail(false); }}>{i18n.catalog["common.general.complete"]}</Button>}
          </div>
        </div>}
      </Dialog>
    </div>
  );
}
