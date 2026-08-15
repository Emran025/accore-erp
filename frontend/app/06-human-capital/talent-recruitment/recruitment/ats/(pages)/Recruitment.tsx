"use client";

import { useI18n, catalogText, catalogMessage } from "@/lib/i18n";
import { PageSubHeader } from "@/components/layout";
import { ActionButtons, Button, Column, Dialog, Label, Select, TabNavigation, Table, showToast } from "@/components/ui";
import { TextInput } from "@/components/ui/TextInput";
import { Textarea } from "@/components/ui/Textarea";
import { fetchAPI } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useAuthStore } from "@/stores/useAuthStore";
import { useEffect, useState } from "react";

interface Requisition {
  id: number; requisition_number: string; job_title: string; job_description?: string;
  department_id?: number; department?: { name_ar: string }; role_id?: number; role?: { role_name_ar: string };
  number_of_positions: number; employment_type: string; status: string;
  target_start_date?: string; budgeted_salary_min?: number; budgeted_salary_max?: number;
  required_qualifications?: string; preferred_qualifications?: string; notes?: string; is_published: boolean;
  applicants?: Applicant[];
}

interface Applicant {
  id: number; requisition_id: number; requisition?: { job_title: string };
  first_name: string; last_name: string; email: string; phone?: string;
  status: string; application_date: string; match_score?: number;
  screening_notes?: string; interview_notes?: string;
}

const statusLabels: Record<string, string> = { draft: catalogMessage("common.general.draft"), pending_approval: catalogMessage("common.general.pendingApproval"), approved: catalogMessage("common.general.approved"), rejected: catalogMessage("common.general.rejected"), closed: catalogMessage("common.general.closed.alternative2"), filled: catalogMessage("common.general.completed"), applied: catalogMessage("common.general.submitted"), screened: catalogMessage("humanCapital.recruitment.verified"), assessment: catalogMessage("common.general.evaluation"), interview: catalogMessage("common.general.interview"), offer: catalogMessage("common.general.view"), hired: catalogMessage("common.general.hired"), withdrawn: catalogMessage("humanCapital.recruitment.withdrawn") };
const statusBadges: Record<string, string> = { draft: "badge-secondary", pending_approval: "badge-warning", approved: "badge-success", rejected: "badge-danger", closed: "badge-secondary", filled: "badge-info", applied: "badge-info", screened: "badge-warning", assessment: "badge-warning", interview: "badge-primary", offer: "badge-success", hired: "badge-success", withdrawn: "badge-secondary" };
const empTypeLabels: Record<string, string> = { full_time: catalogMessage("common.general.fullTime"), part_time: catalogMessage("common.general.partTime"), contract: catalogMessage("common.general.contract"), temporary: catalogMessage("humanCapital.recruitment.temporary") };

export function Recruitment() {
    const { t: i18n } = useI18n();
  const { canAccess } = useAuthStore();
  const [activeTab, setActiveTab] = useState("requisitions");
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  // Dialogs
  const [showReqDialog, setShowReqDialog] = useState(false);
  const [showReqDetail, setShowReqDetail] = useState(false);
  const [selectedReq, setSelectedReq] = useState<Requisition | null>(null);
  const [showAppDialog, setShowAppDialog] = useState(false);
  const [showAppDetail, setShowAppDetail] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Applicant | null>(null);
  // Forms
  const [reqForm, setReqForm] = useState({ job_title: "", job_description: "", department_id: "", number_of_positions: "1", employment_type: "full_time", budgeted_salary_min: "", budgeted_salary_max: "", target_start_date: "", required_qualifications: "", preferred_qualifications: "", notes: "" });
  const [appForm, setAppForm] = useState({ requisition_id: "", first_name: "", last_name: "", email: "", phone: "", notes: "" });

  useEffect(() => { loadDepartments(); }, []);
  useEffect(() => { setCurrentPage(1); }, [activeTab]);
  useEffect(() => { activeTab === "requisitions" ? loadRequisitions() : loadApplicants(); }, [activeTab, currentPage, statusFilter]);

  const loadDepartments = async () => { try { const r: any = await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.DEPARTMENTS); setDepartments(r.data || (Array.isArray(r) ? r : [])); } catch { } };

  const loadRequisitions = async () => {
    setIsLoading(true);
    try {
      const q = new URLSearchParams({ page: currentPage.toString(), ...(statusFilter && { status: statusFilter }) });
      const res: any = await fetchAPI(`${API_ENDPOINTS.HUMAN_CAPITAL.RECRUITMENT.REQUISITIONS.BASE}?${q}`);
      const data = res.data || (Array.isArray(res) ? res : []);
      setRequisitions(data); setTotalPages(Number(res.last_page) || 1);
    } catch { showToast(i18n.catalog["humanCapital.recruitment.failedLoadRecruitmentRequests"], "error"); }
    finally { setIsLoading(false); }
  };

  const loadApplicants = async () => {
    setIsLoading(true);
    try {
      const q = new URLSearchParams({ page: currentPage.toString(), ...(statusFilter && { status: statusFilter }) });
      const res: any = await fetchAPI(`${API_ENDPOINTS.HUMAN_CAPITAL.RECRUITMENT.APPLICANTS.BASE}?${q}`);
      const data = res.data || (Array.isArray(res) ? res : []);
      setApplicants(data); setTotalPages(Number(res.last_page) || 1);
    } catch { showToast(i18n.catalog["humanCapital.recruitment.failedLoadCandidates"], "error"); }
    finally { setIsLoading(false); }
  };

  const handleSaveRequisition = async () => {
    if (!reqForm.job_title || !reqForm.number_of_positions) { showToast(i18n.catalog["common.general.pleaseFillRequiredFields.alternative2"], "error"); return; }
    try {
      await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.RECRUITMENT.REQUISITIONS.BASE, {
        method: "POST", body: JSON.stringify({
          job_title: reqForm.job_title, job_description: reqForm.job_description || undefined,
          department_id: reqForm.department_id ? Number(reqForm.department_id) : undefined,
          number_of_positions: Number(reqForm.number_of_positions), employment_type: reqForm.employment_type,
          budgeted_salary_min: reqForm.budgeted_salary_min ? Number(reqForm.budgeted_salary_min) : undefined,
          budgeted_salary_max: reqForm.budgeted_salary_max ? Number(reqForm.budgeted_salary_max) : undefined,
          target_start_date: reqForm.target_start_date || undefined,
          required_qualifications: reqForm.required_qualifications || undefined,
          preferred_qualifications: reqForm.preferred_qualifications || undefined,
          notes: reqForm.notes || undefined,
        })
      });
      showToast(i18n.catalog["humanCapital.recruitment.hiringRequestCreated"], "success"); setShowReqDialog(false); loadRequisitions();
    } catch (e: any) { showToast(e.message || i18n.catalog["common.general.failedSave"], "error"); }
  };

  const handleUpdateReqStatus = async (id: number, status: string) => {
    try {
      await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.RECRUITMENT.REQUISITIONS.withId(id), { method: "PUT", body: JSON.stringify({ status }) });
      showToast(i18n.catalog["common.general.statusUpdated"], "success"); loadRequisitions();
    } catch (e: any) { showToast(e.message || i18n.catalog["common.general.updateFailed"], "error"); }
  };

  const handleSaveApplicant = async () => {
    if (!appForm.requisition_id || !appForm.first_name || !appForm.last_name || !appForm.email) { showToast(i18n.catalog["common.general.pleaseFillRequiredFields.alternative2"], "error"); return; }
    try {
      await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.RECRUITMENT.APPLICANTS.BASE, {
        method: "POST", body: JSON.stringify({
          requisition_id: Number(appForm.requisition_id), first_name: appForm.first_name,
          last_name: appForm.last_name, email: appForm.email, phone: appForm.phone || undefined,
          notes: appForm.notes || undefined,
        })
      });
      showToast(i18n.catalog["common.general.candidateAdded"], "success"); setShowAppDialog(false); loadApplicants();
    } catch (e: any) { showToast(e.message || i18n.catalog["common.general.failedSave"], "error"); }
  };

  const handleUpdateAppStatus = async (id: number, status: string) => {
    try {
      await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.RECRUITMENT.APPLICANTS.STATUS(id), { method: "PUT", body: JSON.stringify({ status }) });
      showToast(i18n.catalog["humanCapital.recruitment.candidateStatusUpdated"], "success"); loadApplicants();
    } catch (e: any) { showToast(e.message || i18n.catalog["common.general.updateFailed"], "error"); }
  };

  const viewReqDetail = async (id: number) => {
    try {
      const res: any = await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.RECRUITMENT.REQUISITIONS.withId(id));
      setSelectedReq(res.data || res); setShowReqDetail(true);
    } catch { showToast(i18n.catalog["common.general.failedLoadDetails"], "error"); }
  };

  const requisitionColumns: Column<Requisition>[] = [
    { key: "requisition_number", header: i18n.catalog["common.general.orderNumber"], dataLabel: i18n.catalog["common.general.orderNumber"] },
    { key: "job_title", header: i18n.catalog["common.general.jobTitle.alternative3"], dataLabel: i18n.catalog["common.general.title.alternative2"] },
    { key: "department", header: i18n.catalog["common.general.section"], dataLabel: i18n.catalog["common.general.section"], render: (i) => i.department?.name_ar || "-" },
    { key: "number_of_positions", header: i18n.catalog["humanCapital.recruitment.numberJobs"], dataLabel: i18n.catalog["humanCapital.recruitment.quantity"] },
    { key: "employment_type", header: i18n.catalog["common.general.employmentType"], dataLabel: i18n.catalog["common.general.type.alternative3"], render: (i) => empTypeLabels[i.employment_type] || i.employment_type },
    { key: "status", header: i18n.catalog["common.general.status.alternative2"], dataLabel: i18n.catalog["common.general.status.alternative2"], render: (i) => <span className={`badge ${statusBadges[i.status]}`}>{statusLabels[i.status] || i.status}</span> },
    { key: "target_start_date", header: i18n.catalog["common.general.startDate.alternative2"], dataLabel: i18n.catalog["common.general.start.alternative4"], render: (i) => i.target_start_date ? formatDate(i.target_start_date) : "-" },
    {
      key: "id", header: i18n.catalog["common.general.actions.alternative2"], dataLabel: i18n.catalog["common.general.actions.alternative2"], render: (i) => (
        <ActionButtons
          actions={[
            {
              icon: "eye",
              title: i18n.catalog["common.general.details"],
              variant: "view",
              onClick: () => viewReqDetail(i.id)
            },
            ...(canAccess("recruitment", "edit") ? [{
              icon: "send" as const,
              title: i18n.catalog["common.general.submitApproval"],
              variant: "view" as const,
              onClick: () => handleUpdateReqStatus(i.id, "pending_approval"),
              hidden: i.status !== "draft"
            }] : []),
            ...(canAccess("recruitment", "edit") ? [{
              icon: "check" as const,
              title: i18n.catalog["common.general.approval"],
              variant: "success" as const,
              onClick: () => handleUpdateReqStatus(i.id, "approved"),
              hidden: i.status !== "pending_approval"
            }] : [])
          ]}
        />
      )
    },
  ];

  const applicantColumns: Column<Applicant>[] = [
    { key: "name", header: i18n.catalog["common.general.name"], dataLabel: i18n.catalog["common.general.name"], render: (i) => catalogText(i18n, "common.general.notAvailable.alternative3", { value0: i.first_name, value1: i.last_name }) },
    { key: "email", header: i18n.catalog["common.general.email"], dataLabel: i18n.catalog["humanCapital.recruitment.mail"] },
    { key: "requisition", header: i18n.catalog["common.general.position"], dataLabel: i18n.catalog["common.general.position"], render: (i) => i.requisition?.job_title || "-" },
    { key: "status", header: i18n.catalog["common.general.status.alternative2"], dataLabel: i18n.catalog["common.general.status.alternative2"], render: (i) => <span className={`badge ${statusBadges[i.status]}`}>{statusLabels[i.status] || i.status}</span> },
    { key: "application_date", header: i18n.catalog["humanCapital.recruitment.submissionDate.alternative2"], dataLabel: i18n.catalog["common.general.date.alternative7"], render: (i) => formatDate(i.application_date) },
    { key: "match_score", header: i18n.catalog["common.general.matching.alternative2"], dataLabel: i18n.catalog["common.general.matching.alternative2"], render: (i) => i.match_score ? catalogText(i18n, "common.general.message.alternative4", { value0: i.match_score }) : "-" },
    {
      key: "id", header: i18n.catalog["common.general.actions.alternative2"], dataLabel: i18n.catalog["common.general.actions.alternative2"], render: (i) => (
        <ActionButtons
          actions={[
            {
              icon: "eye",
              title: i18n.catalog["common.general.details"],
              variant: "view",
              onClick: () => { setSelectedApp(i); setShowAppDetail(true); }
            },
            ...(canAccess("recruitment", "edit") ? [{
              icon: "filter" as const,
              title: i18n.catalog["common.general.check"],
              variant: "view" as const,
              onClick: () => handleUpdateAppStatus(i.id, "screened"),
              hidden: i.status !== "applied"
            }] : []),
            ...(canAccess("recruitment", "edit") ? [{
              icon: "user-check" as const,
              title: i18n.catalog["common.general.interview"],
              variant: "view" as const,
              onClick: () => handleUpdateAppStatus(i.id, "interview"),
              hidden: i.status !== "screened"
            }] : []),
            ...(canAccess("recruitment", "edit") ? [{
              icon: "handshake" as const,
              title: i18n.catalog["common.general.view"],
              variant: "success" as const,
              onClick: () => handleUpdateAppStatus(i.id, "offer"),
              hidden: i.status !== "interview"
            }] : []),
            ...(canAccess("recruitment", "edit") ? [{
              icon: "check-check" as const,
              title: i18n.catalog["common.general.recruitment"],
              variant: "success" as const,
              onClick: () => handleUpdateAppStatus(i.id, "hired"),
              hidden: i.status !== "offer"
            }] : [])
          ]}
        />
      )
    },
  ];

  const tabs = [{ key: "requisitions", label: i18n.catalog["humanCapital.recruitment.jobApplications"], icon: "file-alt" }, { key: "applicants", label: i18n.catalog["common.general.candidates.alternative2"], icon: "users" }];

  return (
    <div className="sales-card animate-fade">
      <PageSubHeader
        title={i18n.catalog["common.general.recruitmentCandidates"]}
        titleIcon="user-plus"
        actions={
          <>
            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              style={{ minWidth: "140px" }}
              placeholder={i18n.catalog["common.general.allStatuses"]}
              options={activeTab === "requisitions"
                ? [
                  { value: "draft", label: i18n.catalog["common.general.draft"] },
                  { value: "pending_approval", label: i18n.catalog["common.general.pendingApproval"] },
                  { value: "approved", label: i18n.catalog["humanCapital.recruitment.approved"] },
                  { value: "filled", label: i18n.catalog["common.general.completed"] }
                ]
                : [
                  { value: "applied", label: i18n.catalog["common.general.submitted"] },
                  { value: "screened", label: i18n.catalog["common.general.check"] },
                  { value: "interview", label: i18n.catalog["common.general.interview"] },
                  { value: "hired", label: i18n.catalog["common.general.hired"] }
                ]
              }
            />
            {activeTab === "requisitions" ? (
              canAccess("recruitment", "create") && (
                <Button
                  onClick={() => { setReqForm({ job_title: "", job_description: "", department_id: "", number_of_positions: "1", employment_type: "full_time", budgeted_salary_min: "", budgeted_salary_max: "", target_start_date: "", required_qualifications: "", preferred_qualifications: "", notes: "" }); setShowReqDialog(true); }}
                  variant="primary"
                  icon="plus"
                >
                  {i18n.catalog["common.general.newHiringRequest"]}</Button>
              )
            ) : (
              canAccess("recruitment", "create") && (
                <Button
                  onClick={() => { setAppForm({ requisition_id: "", first_name: "", last_name: "", email: "", phone: "", notes: "" }); setShowAppDialog(true); }}
                  variant="primary"
                  icon="plus"
                >
                  {i18n.catalog["common.general.addFilter"]}</Button>
              )
            )}
          </>
        }
      />

      <TabNavigation tabs={tabs} activeTab={activeTab} onTabChange={(t) => { setActiveTab(t); setStatusFilter(""); }} />

      {activeTab === "requisitions" ? (
        <Table columns={requisitionColumns} data={requisitions} keyExtractor={(i) => i.id.toString()} emptyMessage={i18n.catalog["humanCapital.recruitment.noRecruitmentRequests"]} isLoading={isLoading} pagination={{ currentPage, totalPages, onPageChange: setCurrentPage }} />
      ) : (
        <Table columns={applicantColumns} data={applicants} keyExtractor={(i) => i.id.toString()} emptyMessage={i18n.catalog["humanCapital.recruitment.noCandidates"]} isLoading={isLoading} pagination={{ currentPage, totalPages, onPageChange: setCurrentPage }} />
      )}

      {/* Create Requisition Dialog */}
      <Dialog isOpen={showReqDialog} onClose={() => setShowReqDialog(false)} title={i18n.catalog["common.general.newHiringRequest"]} maxWidth="750px">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label className="block mb-1" style={{ color: "var(--text-secondary)" }}>{i18n.catalog["common.general.jobTitle"]}</Label><TextInput value={reqForm.job_title} onChange={(e) => setReqForm({ ...reqForm, job_title: e.target.value })} /></div>
            <div><Label className="block mb-1" style={{ color: "var(--text-secondary)" }}>{i18n.catalog["common.general.section"]}</Label><Select value={reqForm.department_id} onChange={(e) => setReqForm({ ...reqForm, department_id: e.target.value })} placeholder={i18n.catalog["common.general.select"]} options={departments.map((d: any) => ({ value: d.id.toString(), label: d.name_ar || d.name }))} /></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><Label className="block mb-1" style={{ color: "var(--text-secondary)" }}>{i18n.catalog["humanCapital.recruitment.numberPositions"]}</Label><TextInput type="number" min="1" value={reqForm.number_of_positions} onChange={(e) => setReqForm({ ...reqForm, number_of_positions: e.target.value })} /></div>
            <div><Label className="block mb-1" style={{ color: "var(--text-secondary)" }}>{i18n.catalog["common.general.employmentType"]}</Label><Select value={reqForm.employment_type} onChange={(e) => setReqForm({ ...reqForm, employment_type: e.target.value })} options={Object.entries(empTypeLabels).map(([value, label]) => ({ value, label }))} /></div>
            <div><Label className="block mb-1" style={{ color: "var(--text-secondary)" }}>{i18n.catalog["common.general.startDate.alternative2"]}</Label><TextInput type="date" value={reqForm.target_start_date} onChange={(e) => setReqForm({ ...reqForm, target_start_date: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label className="block mb-1" style={{ color: "var(--text-secondary)" }}>{i18n.catalog["common.general.minimumSalary"]}</Label><TextInput type="number" value={reqForm.budgeted_salary_min} onChange={(e) => setReqForm({ ...reqForm, budgeted_salary_min: e.target.value })} /></div>
            <div><Label className="block mb-1" style={{ color: "var(--text-secondary)" }}>{i18n.catalog["common.general.maximumSalary"]}</Label><TextInput type="number" value={reqForm.budgeted_salary_max} onChange={(e) => setReqForm({ ...reqForm, budgeted_salary_max: e.target.value })} /></div>
          </div>
          <div><Label className="block mb-1" style={{ color: "var(--text-secondary)" }}>{i18n.catalog["humanCapital.recruitment.jobDescription"]}</Label><Textarea value={reqForm.job_description} onChange={(e) => setReqForm({ ...reqForm, job_description: e.target.value })} rows={3} /></div>
          <div><Label className="block mb-1" style={{ color: "var(--text-secondary)" }}>{i18n.catalog["humanCapital.recruitment.requiredQualifications.alternative2"]}</Label><Textarea value={reqForm.required_qualifications} onChange={(e) => setReqForm({ ...reqForm, required_qualifications: e.target.value })} rows={2} /></div>
          <div className="flex justify-end gap-2" style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid var(--border-color)" }}><Button variant="secondary" onClick={() => setShowReqDialog(false)}>{i18n.catalog["common.general.cancel"]}</Button><Button variant="primary" onClick={handleSaveRequisition} icon="save">{i18n.catalog["common.general.save"]}</Button></div>
        </div>
      </Dialog>

      {/* Requisition Detail Dialog */}
      <Dialog isOpen={showReqDetail} onClose={() => setShowReqDetail(false)} title={i18n.catalog["humanCapital.recruitment.employmentRequestDetails"]} maxWidth="750px">
        {selectedReq && <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><strong>{i18n.catalog["common.general.orderNumber.alternative2"]}</strong> {selectedReq.requisition_number}</div>
            <div><strong>{i18n.catalog["common.general.title.alternative3"]}</strong> {selectedReq.job_title}</div>
            <div><strong>{i18n.catalog["humanCapital.recruitment.section"]}</strong> {selectedReq.department?.name_ar || "-"}</div>
            <div><strong>{i18n.catalog["humanCapital.recruitment.employmentType"]}</strong> {empTypeLabels[selectedReq.employment_type] || selectedReq.employment_type}</div>
            <div><strong>{i18n.catalog["humanCapital.recruitment.numberPositions.alternative2"]}</strong> {selectedReq.number_of_positions}</div>
            <div><strong>{i18n.catalog["common.general.status"]}</strong> <span className={`badge ${statusBadges[selectedReq.status]}`}>{statusLabels[selectedReq.status]}</span></div>
            {selectedReq.budgeted_salary_min && <div><strong>{i18n.catalog["humanCapital.recruitment.salaryRange"]}</strong> {formatCurrency(selectedReq.budgeted_salary_min)} - {formatCurrency(selectedReq.budgeted_salary_max || 0)}</div>}
            {selectedReq.target_start_date && <div><strong>{i18n.catalog["common.general.startDate"]}</strong> {formatDate(selectedReq.target_start_date)}</div>}
          </div>
          {selectedReq.job_description && <div><strong>{i18n.catalog["common.general.description"]}</strong><p>{selectedReq.job_description}</p></div>}
          {selectedReq.required_qualifications && <div><strong>{i18n.catalog["humanCapital.recruitment.requiredQualifications"]}</strong><p>{selectedReq.required_qualifications}</p></div>}
          {selectedReq.applicants && selectedReq.applicants.length > 0 && <div>
            <strong>{i18n.catalog["common.general.candidates"]}{selectedReq.applicants.length}):</strong>
            <div style={{ marginTop: "0.5rem" }}>{selectedReq.applicants.map(a => (
              <div key={a.id} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem", borderBottom: "1px solid var(--border-color)" }}>
                <span>{a.first_name} {a.last_name}</span>
                <span className={`badge ${statusBadges[a.status]}`}>{statusLabels[a.status]}</span>
              </div>
            ))}</div>
          </div>}
        </div>}
      </Dialog>

      {/* Add Applicant Dialog */}
      <Dialog isOpen={showAppDialog} onClose={() => setShowAppDialog(false)} title={i18n.catalog["common.general.addFilter"]} maxWidth="600px">
        <div className="space-y-4">
          <div><Label className="block mb-1" style={{ color: "var(--text-secondary)" }}>{i18n.catalog["humanCapital.recruitment.position.alternative2"]}</Label>
            <Select
              value={appForm.requisition_id}
              onChange={(e) => setAppForm({ ...appForm, requisition_id: e.target.value })}
              placeholder={i18n.catalog["humanCapital.recruitment.selectRole"]}
              options={requisitions.filter(r => r.status === "approved").map(r => ({ value: r.id.toString(), label: r.job_title }))}
            /></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label className="block mb-1" style={{ color: "var(--text-secondary)" }}>{i18n.catalog["humanCapital.recruitment.firstName"]}</Label><TextInput value={appForm.first_name} onChange={(e) => setAppForm({ ...appForm, first_name: e.target.value })} /></div>
            <div><Label className="block mb-1" style={{ color: "var(--text-secondary)" }}>{i18n.catalog["humanCapital.recruitment.familyName"]}</Label><TextInput value={appForm.last_name} onChange={(e) => setAppForm({ ...appForm, last_name: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label className="block mb-1" style={{ color: "var(--text-secondary)" }}>{i18n.catalog["humanCapital.recruitment.email"]}</Label><TextInput type="email" value={appForm.email} onChange={(e) => setAppForm({ ...appForm, email: e.target.value })} /></div>
            <div><Label className="block mb-1" style={{ color: "var(--text-secondary)" }}>{i18n.catalog["common.general.phone"]}</Label><TextInput value={appForm.phone} onChange={(e) => setAppForm({ ...appForm, phone: e.target.value })} /></div>
          </div>
          <div><Label className="block mb-1" style={{ color: "var(--text-secondary)" }}>{i18n.catalog["common.general.notes.alternative2"]}</Label><Textarea value={appForm.notes} onChange={(e) => setAppForm({ ...appForm, notes: e.target.value })} rows={2} /></div>
          <div className="flex justify-end gap-2" style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid var(--border-color)" }}><Button variant="secondary" onClick={() => setShowAppDialog(false)}>{i18n.catalog["common.general.cancel"]}</Button><Button variant="primary" onClick={handleSaveApplicant} icon="save">{i18n.catalog["common.general.save"]}</Button></div>
        </div>
      </Dialog>

      {/* Applicant Detail Dialog */}
      <Dialog isOpen={showAppDetail} onClose={() => setShowAppDetail(false)} title={i18n.catalog["humanCapital.recruitment.candidateDetails"]} maxWidth="600px">
        {selectedApp && <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><strong>{i18n.catalog["common.general.name.alternative2"]}</strong> {selectedApp.first_name} {selectedApp.last_name}</div>
            <div><strong>{i18n.catalog["humanCapital.recruitment.email.alternative2"]}</strong> {selectedApp.email}</div>
            {selectedApp.phone && <div><strong>{i18n.catalog["humanCapital.recruitment.phone"]}</strong> {selectedApp.phone}</div>}
            <div><strong>{i18n.catalog["humanCapital.recruitment.position"]}</strong> {selectedApp.requisition?.job_title || "-"}</div>
            <div><strong>{i18n.catalog["humanCapital.recruitment.submissionDate"]}</strong> {formatDate(selectedApp.application_date)}</div>
            <div><strong>{i18n.catalog["common.general.status"]}</strong> <span className={`badge ${statusBadges[selectedApp.status]}`}>{statusLabels[selectedApp.status]}</span></div>
            {selectedApp.match_score && <div><strong>{i18n.catalog["humanCapital.recruitment.matching"]}</strong> {selectedApp.match_score}%</div>}
          </div>
          {selectedApp.screening_notes && <div><strong>{i18n.catalog["humanCapital.recruitment.inspectionNotes"]}</strong><p>{selectedApp.screening_notes}</p></div>}
          {selectedApp.interview_notes && <div><strong>{i18n.catalog["humanCapital.recruitment.interviewNotes"]}</strong><p>{selectedApp.interview_notes}</p></div>}
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {canAccess("recruitment", "edit") && (
              <>
                {selectedApp.status === "applied" && <Button variant="primary" onClick={() => { handleUpdateAppStatus(selectedApp.id, "screened"); setShowAppDetail(false); }}>{i18n.catalog["common.general.check"]}</Button>}
                {selectedApp.status === "screened" && <Button variant="primary" onClick={() => { handleUpdateAppStatus(selectedApp.id, "interview"); setShowAppDetail(false); }}>{i18n.catalog["humanCapital.recruitment.scheduleInterview"]}</Button>}
                {selectedApp.status === "interview" && <Button variant="primary" onClick={() => { handleUpdateAppStatus(selectedApp.id, "offer"); setShowAppDetail(false); }}>{i18n.catalog["humanCapital.recruitment.submitOffer"]}</Button>}
                {selectedApp.status === "offer" && <Button variant="primary" onClick={() => { handleUpdateAppStatus(selectedApp.id, "hired"); setShowAppDetail(false); }}>{i18n.catalog["humanCapital.recruitment.employmentConfirmation"]}</Button>}
                {!["hired", "rejected", "withdrawn"].includes(selectedApp.status) && <Button variant="danger" onClick={() => { handleUpdateAppStatus(selectedApp.id, "rejected"); setShowAppDetail(false); }}>{i18n.catalog["common.general.rejected.alternative2"]}</Button>}
              </>
            )}
          </div>
        </div>}
      </Dialog>
    </div>
  );
}
