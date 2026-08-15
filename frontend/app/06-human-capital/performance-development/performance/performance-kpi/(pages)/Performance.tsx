"use client";

import { useI18n, catalogMessage } from "@/lib/i18n";
import { PageSubHeader } from "@/components/layout";
import { ActionButtons, Button, Column, Dialog, TabNavigation, Table, showToast } from "@/components/ui";
import { TextInput } from "@/components/ui/TextInput";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/select";
import { fetchAPI } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { getIcon } from "@/lib/icons";
import { formatDate } from "@/lib/utils";
import { useAuthStore } from "@/stores/useAuthStore";
import { useEmployeeStore } from "@/stores/useEmployeeStore";
import { Employee } from "@/types";
import { useEffect, useState } from "react";

interface Goal {
  id: number; employee_id: number; employee?: { full_name: string };
  goal_title: string; goal_description?: string; goal_type: string; status: string;
  target_value?: number; current_value?: number; progress_percentage: number;
  start_date?: string; target_date: string; completed_date?: string; unit?: string; notes?: string;
}

interface Appraisal {
  id: number; appraisal_number: string; employee_id: number; employee?: { full_name: string };
  appraisal_type: string; appraisal_period: string; appraisal_date?: string;
  status: string; overall_rating?: number; self_assessment?: string;
  manager_feedback?: string; notes?: string;
}

const goalTypeLabels: Record<string, string> = { okr: "OKR", kpi: "KPI", personal: catalogMessage("humanCapital.performance.personal"), team: catalogMessage("humanCapital.performance.team"), corporate: catalogMessage("humanCapital.performance.founders") };
const statusLabels: Record<string, string> = { not_started: catalogMessage("common.general.notStarted"), in_progress: catalogMessage("common.general.progress.alternative3"), on_track: catalogMessage("humanCapital.performance.track"), at_risk: catalogMessage("humanCapital.performance.risk"), completed: catalogMessage("common.general.completed"), cancelled: catalogMessage("common.general.canceled"), draft: catalogMessage("common.general.draft"), self_review: catalogMessage("humanCapital.performance.selfReview"), manager_review: catalogMessage("humanCapital.performance.managerReview"), calibration: catalogMessage("humanCapital.performance.calibration") };
const statusBadges: Record<string, string> = { not_started: "badge-secondary", in_progress: "badge-warning", on_track: "badge-success", at_risk: "badge-danger", completed: "badge-success", cancelled: "badge-secondary", draft: "badge-secondary", self_review: "badge-info", manager_review: "badge-warning", calibration: "badge-primary" };
const appraisalTypeLabels: Record<string, string> = { self: catalogMessage("common.general.personal"), manager: catalogMessage("humanCapital.performance.manager"), peer: catalogMessage("humanCapital.performance.peers"), "360": catalogMessage("humanCapital.performance.message360Degree"), annual: catalogMessage("common.general.annual"), mid_year: catalogMessage("humanCapital.performance.semiAnnual") };

export function Performance() {
    const { t: i18n } = useI18n();
  const { canAccess } = useAuthStore();
  const [activeTab, setActiveTab] = useState("goals");
  const [goals, setGoals] = useState<Goal[]>([]);
  const [appraisals, setAppraisals] = useState<Appraisal[]>([]);
  const { allEmployees: employees, loadAllEmployees } = useEmployeeStore();
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  // Dialogs
  const [showGoalDialog, setShowGoalDialog] = useState(false);
  const [showGoalDetail, setShowGoalDetail] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [showAppDialog, setShowAppDialog] = useState(false);
  const [showAppDetail, setShowAppDetail] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Appraisal | null>(null);
  const [showUpdateGoal, setShowUpdateGoal] = useState(false);
  // Forms
  const [goalForm, setGoalForm] = useState({ employee_id: "", goal_title: "", goal_description: "", goal_type: "kpi", target_value: "", current_value: "0", unit: "", start_date: "", target_date: "", notes: "" });
  const [appForm, setAppForm] = useState({ employee_id: "", appraisal_type: "annual", appraisal_period: "", appraisal_date: "", notes: "" });
  const [updateForm, setUpdateForm] = useState({ current_value: "", progress_percentage: "", status: "", notes: "" });

  useEffect(() => { loadAllEmployees(); }, [loadAllEmployees]);
  useEffect(() => { setCurrentPage(1); }, [activeTab]);
  useEffect(() => { activeTab === "goals" ? loadGoals() : loadAppraisals(); }, [activeTab, currentPage]);

  const loadGoals = async () => {
    setIsLoading(true);
    try {
      const res: any = await fetchAPI(`${API_ENDPOINTS.HUMAN_CAPITAL.PERFORMANCE.GOALS.BASE}?page=${currentPage}`);
      setGoals(res.data || []); setTotalPages(Number(res.last_page) || 1);
    } catch { showToast(i18n.catalog["humanCapital.performance.failedLoadTargets"], "error"); }
    finally { setIsLoading(false); }
  };

  const loadAppraisals = async () => {
    setIsLoading(true);
    try {
      const res: any = await fetchAPI(`${API_ENDPOINTS.HUMAN_CAPITAL.PERFORMANCE.APPRAISALS.BASE}?page=${currentPage}`);
      setAppraisals(res.data || []); setTotalPages(Number(res.last_page) || 1);
    } catch { showToast(i18n.catalog["humanCapital.performance.failedLoadEvaluations"], "error"); }
    finally { setIsLoading(false); }
  };

  const handleSaveGoal = async () => {
    if (!goalForm.employee_id || !goalForm.goal_title || !goalForm.goal_description || !goalForm.start_date || !goalForm.target_date) { showToast(i18n.catalog["common.general.pleaseFillRequiredFields.alternative2"], "error"); return; }
    try {
      await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.PERFORMANCE.GOALS.BASE, {
        method: "POST", body: JSON.stringify({
          employee_id: Number(goalForm.employee_id), goal_title: goalForm.goal_title, goal_description: goalForm.goal_description,
          goal_type: goalForm.goal_type, target_value: goalForm.target_value ? Number(goalForm.target_value) : undefined,
          current_value: goalForm.current_value ? Number(goalForm.current_value) : 0, unit: goalForm.unit || undefined,
          start_date: goalForm.start_date, target_date: goalForm.target_date, notes: goalForm.notes || undefined,
        })
      });
      showToast(i18n.catalog["humanCapital.performance.targetCreated"], "success"); setShowGoalDialog(false); loadGoals();
    } catch (e: any) { showToast(e.message || i18n.catalog["common.general.failedSave"], "error"); }
  };

  const handleUpdateGoal = async () => {
    if (!selectedGoal) return;
    try {
      const body: any = {};
      if (updateForm.current_value) body.current_value = Number(updateForm.current_value);
      if (updateForm.progress_percentage) body.progress_percentage = Number(updateForm.progress_percentage);
      if (updateForm.status) body.status = updateForm.status;
      if (updateForm.notes) body.notes = updateForm.notes;
      if (selectedGoal.target_value) body.target_value = selectedGoal.target_value;
      await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.PERFORMANCE.GOALS.withId(selectedGoal.id), { method: "PUT", body: JSON.stringify(body) });
      showToast(i18n.catalog["humanCapital.performance.targetUpdated"], "success"); setShowUpdateGoal(false); loadGoals();
    } catch (e: any) { showToast(e.message || i18n.catalog["common.general.updateFailed"], "error"); }
  };

  const handleSaveAppraisal = async () => {
    if (!appForm.employee_id || !appForm.appraisal_period || !appForm.appraisal_date) { showToast(i18n.catalog["common.general.pleaseFillRequiredFields.alternative2"], "error"); return; }
    try {
      await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.PERFORMANCE.APPRAISALS.BASE, {
        method: "POST", body: JSON.stringify({
          employee_id: Number(appForm.employee_id), appraisal_type: appForm.appraisal_type,
          appraisal_period: appForm.appraisal_period, appraisal_date: appForm.appraisal_date,
          notes: appForm.notes || undefined,
        })
      });
      showToast(i18n.catalog["humanCapital.performance.assessmentCreated"], "success"); setShowAppDialog(false); loadAppraisals();
    } catch (e: any) { showToast(e.message || i18n.catalog["common.general.failedSave"], "error"); }
  };

  const handleUpdateAppraisalStatus = async (id: number, status: string) => {
    try {
      await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.PERFORMANCE.APPRAISALS.withId(id), { method: "PUT", body: JSON.stringify({ status }) });
      showToast(i18n.catalog["humanCapital.performance.evaluationStatusUpdated"], "success"); loadAppraisals();
    } catch (e: any) { showToast(e.message || i18n.catalog["common.general.updateFailed"], "error"); }
  };

  const goalColumns: Column<Goal>[] = [
    { key: "goal_title", header: i18n.catalog["common.general.title"], dataLabel: i18n.catalog["common.general.title"] },
    { key: "employee", header: i18n.catalog["common.general.employee.alternative3"], dataLabel: i18n.catalog["common.general.employee.alternative3"], render: (i) => i.employee?.full_name || "-" },
    { key: "goal_type", header: i18n.catalog["common.general.type.alternative3"], dataLabel: i18n.catalog["common.general.type.alternative3"], render: (i) => goalTypeLabels[i.goal_type] || i.goal_type },
    {
      key: "progress", header: i18n.catalog["common.general.progress"], dataLabel: i18n.catalog["common.general.progress"], render: (i) => (
        <div>
          <div className="progress" style={{ height: "20px", marginBottom: "5px" }}><div className="progress-bar" role="progressbar" style={{ width: `${i.progress_percentage}%` }}>{i.progress_percentage}%</div></div>
          {i.target_value && <small>{i.current_value || 0} / {i.target_value} {i.unit || ""}</small>}
        </div>
      )
    },
    { key: "status", header: i18n.catalog["common.general.status.alternative2"], dataLabel: i18n.catalog["common.general.status.alternative2"], render: (i) => <span className={`badge ${statusBadges[i.status]}`}>{statusLabels[i.status] || i.status}</span> },
    { key: "target_date", header: i18n.catalog["humanCapital.performance.targetDate.alternative3"], dataLabel: i18n.catalog["common.general.target"], render: (i) => formatDate(i.target_date) },
    {
      key: "id", header: i18n.catalog["common.general.actions.alternative2"], dataLabel: i18n.catalog["common.general.actions.alternative2"], render: (i) => (
        <ActionButtons
          actions={[
            {
              icon: "eye",
              title: i18n.catalog["common.general.details"],
              variant: "view",
              onClick: () => { setSelectedGoal(i); setShowGoalDetail(true); }
            },
            ...(canAccess("performance", "edit") ? [{
              icon: "edit" as const,
              title: i18n.catalog["common.general.update"],
              variant: "edit" as const,
              onClick: () => { setSelectedGoal(i); setUpdateForm({ current_value: String(i.current_value || 0), progress_percentage: String(i.progress_percentage), status: i.status, notes: "" }); setShowUpdateGoal(true); },
              hidden: ["completed", "cancelled"].includes(i.status)
            }] : [])
          ]}
        />
      )
    },
  ];

  const appraisalColumns: Column<Appraisal>[] = [
    { key: "appraisal_number", header: i18n.catalog["common.general.number"], dataLabel: i18n.catalog["common.general.number"] },
    { key: "employee", header: i18n.catalog["common.general.employee.alternative3"], dataLabel: i18n.catalog["common.general.employee.alternative3"], render: (i) => i.employee?.full_name || "-" },
    { key: "appraisal_period", header: i18n.catalog["common.general.period"], dataLabel: i18n.catalog["common.general.period"] },
    { key: "appraisal_type", header: i18n.catalog["common.general.type.alternative3"], dataLabel: i18n.catalog["common.general.type.alternative3"], render: (i) => appraisalTypeLabels[i.appraisal_type] || i.appraisal_type },
    {
      key: "overall_rating", header: i18n.catalog["common.general.evaluation"], dataLabel: i18n.catalog["common.general.evaluation"], render: (i) => i.overall_rating ? (
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          {[1, 2, 3, 4, 5].map(s => (
            <span key={s} style={{ color: s <= (i.overall_rating || 0) ? "#f59e0b" : "#e5e7eb" }}>
              {getIcon("star", "", 14)}
            </span>
          ))}
          <span style={{ marginRight: "4px" }}>{i.overall_rating}/5</span>
        </div>
      ) : "-"
    },
    { key: "status", header: i18n.catalog["common.general.status.alternative2"], dataLabel: i18n.catalog["common.general.status.alternative2"], render: (i) => <span className={`badge ${statusBadges[i.status]}`}>{statusLabels[i.status] || i.status}</span> },
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
            ...(canAccess("performance", "edit") ? [{
              icon: "play" as const,
              title: i18n.catalog["humanCapital.performance.startReview"],
              variant: "view" as const,
              onClick: () => handleUpdateAppraisalStatus(i.id, "self_review"),
              hidden: i.status !== "draft"
            }] : []),
            ...(canAccess("performance", "edit") ? [{
              icon: "send" as const,
              title: i18n.catalog["humanCapital.performance.sendManager"],
              variant: "view" as const,
              onClick: () => handleUpdateAppraisalStatus(i.id, "manager_review"),
              hidden: i.status !== "self_review"
            }] : []),
            ...(canAccess("performance", "edit") ? [{
              icon: "check" as const,
              title: i18n.catalog["common.general.complete"],
              variant: "success" as const,
              onClick: () => handleUpdateAppraisalStatus(i.id, "completed"),
              hidden: i.status !== "manager_review"
            }] : [])
          ]}
        />
      )
    },
  ];
  const tabs = [{ key: "goals", label: i18n.catalog["humanCapital.performance.objectives"], icon: "target" }, { key: "appraisals", label: i18n.catalog["humanCapital.performance.evaluations"], icon: "clipboard-check" }]

  return (
    <div className="sales-card animate-fade">
      <PageSubHeader
        title={i18n.catalog["common.general.performanceGoals"]}
        titleIcon="chart-line"
        actions={
          <div style={{ display: "flex", gap: "1rem" }}>
            {activeTab === "goals" ? (
              canAccess("performance", "create") && (
                <Button
                  onClick={() => { setGoalForm({ employee_id: "", goal_title: "", goal_description: "", goal_type: "kpi", target_value: "", current_value: "0", unit: "", start_date: new Date().toISOString().split("T")[0], target_date: "", notes: "" }); setShowGoalDialog(true); }}
                  variant="primary"
                  icon="plus"
                >
                  {i18n.catalog["common.general.addNewGoal"]}</Button>
              )
            ) : (
              canAccess("performance", "create") && (
                <Button
                  onClick={() => { setAppForm({ employee_id: "", appraisal_type: "annual", appraisal_period: "", appraisal_date: new Date().toISOString().split("T")[0], notes: "" }); setShowAppDialog(true); }}
                  variant="primary"
                  icon="plus"
                >
                  {i18n.catalog["common.general.newEvaluation"]}</Button>
              )
            )}
          </div>
        }
      />

      <TabNavigation tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === "goals" ? (
        <Table columns={goalColumns} data={goals} keyExtractor={(i) => i.id.toString()} emptyMessage={i18n.catalog["humanCapital.performance.noGoals"]} isLoading={isLoading} pagination={{ currentPage, totalPages, onPageChange: setCurrentPage }} />
      ) : (
        <Table columns={appraisalColumns} data={appraisals} keyExtractor={(i) => i.id.toString()} emptyMessage={i18n.catalog["humanCapital.performance.noRatings"]} isLoading={isLoading} pagination={{ currentPage, totalPages, onPageChange: setCurrentPage }} />
      )}

      {/* Create Goal Dialog */}
      <Dialog isOpen={showGoalDialog} onClose={() => setShowGoalDialog(false)} title={i18n.catalog["common.general.addNewGoal"]} maxWidth="700px">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select label={i18n.catalog["common.general.employee"]} value={goalForm.employee_id} onChange={(e) => setGoalForm({ ...goalForm, employee_id: e.target.value })} placeholder={i18n.catalog["common.general.select"]} options={employees.map((e: Employee) => ({ value: e.id.toString(), label: e.full_name }))} />
            <Select label={i18n.catalog["common.general.type.alternative3"]} value={goalForm.goal_type} onChange={(e) => setGoalForm({ ...goalForm, goal_type: e.target.value })} options={Object.entries(goalTypeLabels).map(([value, label]) => ({ value, label }))} />
          </div>
          <TextInput label={i18n.catalog["humanCapital.performance.targetAddress"]} value={goalForm.goal_title} onChange={(e) => setGoalForm({ ...goalForm, goal_title: e.target.value })} />
          <Textarea label={i18n.catalog["humanCapital.performance.goalDescription"]} value={goalForm.goal_description} onChange={(e) => setGoalForm({ ...goalForm, goal_description: e.target.value })} rows={3} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <TextInput label={i18n.catalog["humanCapital.performance.targetValue"]} type="number" value={goalForm.target_value} onChange={(e) => setGoalForm({ ...goalForm, target_value: e.target.value })} />
            <TextInput label={i18n.catalog["common.general.unit.alternative2"]} value={goalForm.unit} onChange={(e) => setGoalForm({ ...goalForm, unit: e.target.value })} placeholder={i18n.catalog["humanCapital.performance.example"]} />
            <TextInput label={i18n.catalog["common.general.currentValue"]} type="number" value={goalForm.current_value} onChange={(e) => setGoalForm({ ...goalForm, current_value: e.target.value })} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextInput label={i18n.catalog["common.general.startDate.alternative3"]} type="date" value={goalForm.start_date} onChange={(e) => setGoalForm({ ...goalForm, start_date: e.target.value })} />
            <TextInput label={i18n.catalog["humanCapital.performance.targetDate"]} type="date" value={goalForm.target_date} onChange={(e) => setGoalForm({ ...goalForm, target_date: e.target.value })} />
          </div>
          <div className="flex justify-end gap-2" style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid var(--border-color)" }}><Button variant="secondary" onClick={() => setShowGoalDialog(false)}>{i18n.catalog["common.general.cancel"]}</Button><Button variant="primary" onClick={handleSaveGoal} icon="save">{i18n.catalog["common.general.save"]}</Button></div>
        </div>
      </Dialog>

      {/* Goal Detail */}
      <Dialog isOpen={showGoalDetail} onClose={() => setShowGoalDetail(false)} title={i18n.catalog["humanCapital.performance.targetDetails"]} maxWidth="600px">
        {selectedGoal && <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><strong>{i18n.catalog["humanCapital.performance.address"]}</strong> {selectedGoal.goal_title}</div>
            <div><strong>{i18n.catalog["common.general.employee.alternative2"]}</strong> {selectedGoal.employee?.full_name}</div>
            <div><strong>{i18n.catalog["common.general.type"]}</strong> {goalTypeLabels[selectedGoal.goal_type]}</div>
            <div><strong>{i18n.catalog["common.general.status"]}</strong> <span className={`badge ${statusBadges[selectedGoal.status]}`}>{statusLabels[selectedGoal.status]}</span></div>
            <div><strong>{i18n.catalog["common.general.progress.alternative2"]}</strong> {selectedGoal.progress_percentage}%</div>
            {selectedGoal.target_value && <div><strong>{i18n.catalog["humanCapital.performance.value"]}</strong> {selectedGoal.current_value || 0} / {selectedGoal.target_value} {selectedGoal.unit || ""}</div>}
            <div><strong>{i18n.catalog["humanCapital.performance.targetDate.alternative2"]}</strong> {formatDate(selectedGoal.target_date)}</div>
          </div>
          {selectedGoal.goal_description && <div><strong>{i18n.catalog["common.general.description"]}</strong><p>{selectedGoal.goal_description}</p></div>}
        </div>}
      </Dialog>

      {/* Update Goal Dialog */}
      <Dialog isOpen={showUpdateGoal} onClose={() => setShowUpdateGoal(false)} title={i18n.catalog["humanCapital.performance.updateGoal"]} maxWidth="500px">
        <div className="space-y-4">
          <Select label={i18n.catalog["common.general.status.alternative2"]} value={updateForm.status} onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value })} options={Object.entries(statusLabels).map(([value, label]) => ({ value, label })).filter(o => ["not_started", "in_progress", "on_track", "at_risk", "completed", "cancelled"].includes(o.value))} />
          {selectedGoal?.target_value && <TextInput label={i18n.catalog["common.general.currentValue"]} type="number" value={updateForm.current_value} onChange={(e) => setUpdateForm({ ...updateForm, current_value: e.target.value })} />}
          <TextInput label={i18n.catalog["humanCapital.performance.completion"]} type="number" min="0" max="100" value={updateForm.progress_percentage} onChange={(e) => setUpdateForm({ ...updateForm, progress_percentage: e.target.value })} />
          <Textarea label={i18n.catalog["common.general.notes.alternative2"]} value={updateForm.notes} onChange={(e) => setUpdateForm({ ...updateForm, notes: e.target.value })} rows={2} />
          <div className="flex justify-end gap-2" style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid var(--border-color)" }}><Button variant="secondary" onClick={() => setShowUpdateGoal(false)}>{i18n.catalog["common.general.cancel"]}</Button><Button variant="primary" onClick={handleUpdateGoal} icon="save">{i18n.catalog["common.general.update"]}</Button></div>
        </div>
      </Dialog>

      {/* Create Appraisal Dialog */}
      <Dialog isOpen={showAppDialog} onClose={() => setShowAppDialog(false)} title={i18n.catalog["common.general.newEvaluation"]} maxWidth="600px">
        <div className="space-y-4">
          <Select label={i18n.catalog["common.general.employee"]} value={appForm.employee_id} onChange={(e) => setAppForm({ ...appForm, employee_id: e.target.value })} placeholder={i18n.catalog["common.general.select"]} options={employees.map((e: Employee) => ({ value: e.id.toString(), label: e.full_name }))} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select label={i18n.catalog["common.general.type.alternative3"]} value={appForm.appraisal_type} onChange={(e) => setAppForm({ ...appForm, appraisal_type: e.target.value })} options={Object.entries(appraisalTypeLabels).map(([value, label]) => ({ value, label }))} />
            <TextInput label={i18n.catalog["humanCapital.performance.period.alternative2"]} value={appForm.appraisal_period} onChange={(e) => setAppForm({ ...appForm, appraisal_period: e.target.value })} placeholder={i18n.catalog["humanCapital.performance.exampleQ12026"]} />
          </div>
          <TextInput label={i18n.catalog["humanCapital.performance.assessmentDate"]} type="date" value={appForm.appraisal_date} onChange={(e) => setAppForm({ ...appForm, appraisal_date: e.target.value })} />
          <Textarea label={i18n.catalog["common.general.notes.alternative2"]} value={appForm.notes} onChange={(e) => setAppForm({ ...appForm, notes: e.target.value })} rows={2} />
          <div className="flex justify-end gap-2" style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid var(--border-color)" }}><Button variant="secondary" onClick={() => setShowAppDialog(false)}>{i18n.catalog["common.general.cancel"]}</Button><Button variant="primary" onClick={handleSaveAppraisal} icon="save">{i18n.catalog["common.general.save"]}</Button></div>
        </div>
      </Dialog>

      {/* Appraisal Detail */}
      <Dialog isOpen={showAppDetail} onClose={() => setShowAppDetail(false)} title={i18n.catalog["humanCapital.performance.evaluationDetails"]} maxWidth="600px">
        {selectedApp && <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><strong>{i18n.catalog["humanCapital.performance.number"]}</strong> {selectedApp.appraisal_number}</div>
            <div><strong>{i18n.catalog["common.general.employee.alternative2"]}</strong> {selectedApp.employee?.full_name}</div>
            <div><strong>{i18n.catalog["common.general.type"]}</strong> {appraisalTypeLabels[selectedApp.appraisal_type]}</div>
            <div><strong>{i18n.catalog["humanCapital.performance.period"]}</strong> {selectedApp.appraisal_period}</div>
            <div><strong>{i18n.catalog["common.general.status"]}</strong> <span className={`badge ${statusBadges[selectedApp.status]}`}>{statusLabels[selectedApp.status]}</span></div>
            {selectedApp.overall_rating && <div><strong>{i18n.catalog["humanCapital.performance.evaluation"]}</strong> {selectedApp.overall_rating}/5</div>}
          </div>
          {selectedApp.self_assessment && <div><strong>{i18n.catalog["humanCapital.performance.selfAssessment"]}</strong><p>{selectedApp.self_assessment}</p></div>}
          {selectedApp.manager_feedback && <div><strong>{i18n.catalog["humanCapital.performance.managerNotes"]}</strong><p>{selectedApp.manager_feedback}</p></div>}
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {selectedApp.status === "draft" && <Button variant="primary" onClick={() => { handleUpdateAppraisalStatus(selectedApp.id, "self_review"); setShowAppDetail(false); }}>{i18n.catalog["humanCapital.performance.startSelfReview"]}</Button>}
            {selectedApp.status === "self_review" && <Button variant="primary" onClick={() => { handleUpdateAppraisalStatus(selectedApp.id, "manager_review"); setShowAppDetail(false); }}>{i18n.catalog["humanCapital.performance.sendManagerReview"]}</Button>}
            {selectedApp.status === "manager_review" && <Button variant="primary" onClick={() => { handleUpdateAppraisalStatus(selectedApp.id, "completed"); setShowAppDetail(false); }}>{i18n.catalog["humanCapital.performance.completeAssessment"]}</Button>}
          </div>
        </div>}
      </Dialog>
    </div>
  );
}
