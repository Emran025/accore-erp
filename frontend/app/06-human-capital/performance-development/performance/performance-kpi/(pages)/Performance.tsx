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

const goalTypeLabels: Record<string, string> = { okr: "OKR", kpi: "KPI", personal: catalogMessage("text_41e29a2a2a56"), team: catalogMessage("text_359d44305a28"), corporate: catalogMessage("text_7545fd6e2cbf") };
const statusLabels: Record<string, string> = { not_started: catalogMessage("text_ad3e6bb12ee8"), in_progress: catalogMessage("text_d761119224ab"), on_track: catalogMessage("text_676b64db751f"), at_risk: catalogMessage("text_d1c465111a80"), completed: catalogMessage("text_c2da5684d63b"), cancelled: catalogMessage("text_616d302cb016"), draft: catalogMessage("text_552aec56f591"), self_review: catalogMessage("text_289ee5b0b144"), manager_review: catalogMessage("text_ee96105d0b16"), calibration: catalogMessage("text_01bf0e0ec557") };
const statusBadges: Record<string, string> = { not_started: "badge-secondary", in_progress: "badge-warning", on_track: "badge-success", at_risk: "badge-danger", completed: "badge-success", cancelled: "badge-secondary", draft: "badge-secondary", self_review: "badge-info", manager_review: "badge-warning", calibration: "badge-primary" };
const appraisalTypeLabels: Record<string, string> = { self: catalogMessage("text_2f2cf187a9ba"), manager: catalogMessage("text_49a777dda9cf"), peer: catalogMessage("text_0c0967be7b5b"), "360": catalogMessage("text_4abb1d7fb653"), annual: catalogMessage("text_1beeff0b0fec"), mid_year: catalogMessage("text_5db22470ee3c") };

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
    } catch { showToast(i18n.catalog["text_d55b740fff10"], "error"); }
    finally { setIsLoading(false); }
  };

  const loadAppraisals = async () => {
    setIsLoading(true);
    try {
      const res: any = await fetchAPI(`${API_ENDPOINTS.HUMAN_CAPITAL.PERFORMANCE.APPRAISALS.BASE}?page=${currentPage}`);
      setAppraisals(res.data || []); setTotalPages(Number(res.last_page) || 1);
    } catch { showToast(i18n.catalog["text_dd16ab56c7d7"], "error"); }
    finally { setIsLoading(false); }
  };

  const handleSaveGoal = async () => {
    if (!goalForm.employee_id || !goalForm.goal_title || !goalForm.goal_description || !goalForm.start_date || !goalForm.target_date) { showToast(i18n.catalog["text_7b758312f829"], "error"); return; }
    try {
      await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.PERFORMANCE.GOALS.BASE, {
        method: "POST", body: JSON.stringify({
          employee_id: Number(goalForm.employee_id), goal_title: goalForm.goal_title, goal_description: goalForm.goal_description,
          goal_type: goalForm.goal_type, target_value: goalForm.target_value ? Number(goalForm.target_value) : undefined,
          current_value: goalForm.current_value ? Number(goalForm.current_value) : 0, unit: goalForm.unit || undefined,
          start_date: goalForm.start_date, target_date: goalForm.target_date, notes: goalForm.notes || undefined,
        })
      });
      showToast(i18n.catalog["text_d534919a3b44"], "success"); setShowGoalDialog(false); loadGoals();
    } catch (e: any) { showToast(e.message || i18n.catalog["text_b0dbba00004b"], "error"); }
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
      showToast(i18n.catalog["text_11a926df8a13"], "success"); setShowUpdateGoal(false); loadGoals();
    } catch (e: any) { showToast(e.message || i18n.catalog["text_96c789857dbf"], "error"); }
  };

  const handleSaveAppraisal = async () => {
    if (!appForm.employee_id || !appForm.appraisal_period || !appForm.appraisal_date) { showToast(i18n.catalog["text_7b758312f829"], "error"); return; }
    try {
      await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.PERFORMANCE.APPRAISALS.BASE, {
        method: "POST", body: JSON.stringify({
          employee_id: Number(appForm.employee_id), appraisal_type: appForm.appraisal_type,
          appraisal_period: appForm.appraisal_period, appraisal_date: appForm.appraisal_date,
          notes: appForm.notes || undefined,
        })
      });
      showToast(i18n.catalog["text_25c371a59e6a"], "success"); setShowAppDialog(false); loadAppraisals();
    } catch (e: any) { showToast(e.message || i18n.catalog["text_b0dbba00004b"], "error"); }
  };

  const handleUpdateAppraisalStatus = async (id: number, status: string) => {
    try {
      await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.PERFORMANCE.APPRAISALS.withId(id), { method: "PUT", body: JSON.stringify({ status }) });
      showToast(i18n.catalog["text_89a6dfe6abe8"], "success"); loadAppraisals();
    } catch (e: any) { showToast(e.message || i18n.catalog["text_96c789857dbf"], "error"); }
  };

  const goalColumns: Column<Goal>[] = [
    { key: "goal_title", header: i18n.catalog["text_2d110e56d5f5"], dataLabel: i18n.catalog["text_2d110e56d5f5"] },
    { key: "employee", header: i18n.catalog["text_b71a39c832a6"], dataLabel: i18n.catalog["text_b71a39c832a6"], render: (i) => i.employee?.full_name || "-" },
    { key: "goal_type", header: i18n.catalog["text_caa3f2bb4a36"], dataLabel: i18n.catalog["text_caa3f2bb4a36"], render: (i) => goalTypeLabels[i.goal_type] || i.goal_type },
    {
      key: "progress", header: i18n.catalog["text_562bbe85662e"], dataLabel: i18n.catalog["text_562bbe85662e"], render: (i) => (
        <div>
          <div className="progress" style={{ height: "20px", marginBottom: "5px" }}><div className="progress-bar" role="progressbar" style={{ width: `${i.progress_percentage}%` }}>{i.progress_percentage}%</div></div>
          {i.target_value && <small>{i.current_value || 0} / {i.target_value} {i.unit || ""}</small>}
        </div>
      )
    },
    { key: "status", header: i18n.catalog["text_c3a4749caed4"], dataLabel: i18n.catalog["text_c3a4749caed4"], render: (i) => <span className={`badge ${statusBadges[i.status]}`}>{statusLabels[i.status] || i.status}</span> },
    { key: "target_date", header: i18n.catalog["text_c8cb5defbec2"], dataLabel: i18n.catalog["text_acd37606a532"], render: (i) => formatDate(i.target_date) },
    {
      key: "id", header: i18n.catalog["text_9f0a0f722601"], dataLabel: i18n.catalog["text_9f0a0f722601"], render: (i) => (
        <ActionButtons
          actions={[
            {
              icon: "eye",
              title: i18n.catalog["text_29f382c73779"],
              variant: "view",
              onClick: () => { setSelectedGoal(i); setShowGoalDetail(true); }
            },
            ...(canAccess("performance", "edit") ? [{
              icon: "edit" as const,
              title: i18n.catalog["text_00eab31f95b7"],
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
    { key: "appraisal_number", header: i18n.catalog["text_e24b67491657"], dataLabel: i18n.catalog["text_e24b67491657"] },
    { key: "employee", header: i18n.catalog["text_b71a39c832a6"], dataLabel: i18n.catalog["text_b71a39c832a6"], render: (i) => i.employee?.full_name || "-" },
    { key: "appraisal_period", header: i18n.catalog["text_0335edfeb5f3"], dataLabel: i18n.catalog["text_0335edfeb5f3"] },
    { key: "appraisal_type", header: i18n.catalog["text_caa3f2bb4a36"], dataLabel: i18n.catalog["text_caa3f2bb4a36"], render: (i) => appraisalTypeLabels[i.appraisal_type] || i.appraisal_type },
    {
      key: "overall_rating", header: i18n.catalog["text_800984180746"], dataLabel: i18n.catalog["text_800984180746"], render: (i) => i.overall_rating ? (
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
    { key: "status", header: i18n.catalog["text_c3a4749caed4"], dataLabel: i18n.catalog["text_c3a4749caed4"], render: (i) => <span className={`badge ${statusBadges[i.status]}`}>{statusLabels[i.status] || i.status}</span> },
    {
      key: "id", header: i18n.catalog["text_9f0a0f722601"], dataLabel: i18n.catalog["text_9f0a0f722601"], render: (i) => (
        <ActionButtons
          actions={[
            {
              icon: "eye",
              title: i18n.catalog["text_29f382c73779"],
              variant: "view",
              onClick: () => { setSelectedApp(i); setShowAppDetail(true); }
            },
            ...(canAccess("performance", "edit") ? [{
              icon: "play" as const,
              title: i18n.catalog["text_62be06df53c0"],
              variant: "view" as const,
              onClick: () => handleUpdateAppraisalStatus(i.id, "self_review"),
              hidden: i.status !== "draft"
            }] : []),
            ...(canAccess("performance", "edit") ? [{
              icon: "send" as const,
              title: i18n.catalog["text_31ceb7ed90d3"],
              variant: "view" as const,
              onClick: () => handleUpdateAppraisalStatus(i.id, "manager_review"),
              hidden: i.status !== "self_review"
            }] : []),
            ...(canAccess("performance", "edit") ? [{
              icon: "check" as const,
              title: i18n.catalog["text_54536a96c6fc"],
              variant: "success" as const,
              onClick: () => handleUpdateAppraisalStatus(i.id, "completed"),
              hidden: i.status !== "manager_review"
            }] : [])
          ]}
        />
      )
    },
  ];
  const tabs = [{ key: "goals", label: i18n.catalog["text_e339d721a0f7"], icon: "target" }, { key: "appraisals", label: i18n.catalog["text_aea9a89d0733"], icon: "clipboard-check" }]

  return (
    <div className="sales-card animate-fade">
      <PageSubHeader
        title={i18n.catalog["text_8b02a7309aba"]}
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
                  {i18n.catalog["text_307c011d7c9d"]}</Button>
              )
            ) : (
              canAccess("performance", "create") && (
                <Button
                  onClick={() => { setAppForm({ employee_id: "", appraisal_type: "annual", appraisal_period: "", appraisal_date: new Date().toISOString().split("T")[0], notes: "" }); setShowAppDialog(true); }}
                  variant="primary"
                  icon="plus"
                >
                  {i18n.catalog["text_197ac1a4b9c6"]}</Button>
              )
            )}
          </div>
        }
      />

      <TabNavigation tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === "goals" ? (
        <Table columns={goalColumns} data={goals} keyExtractor={(i) => i.id.toString()} emptyMessage={i18n.catalog["text_394d93f44eb2"]} isLoading={isLoading} pagination={{ currentPage, totalPages, onPageChange: setCurrentPage }} />
      ) : (
        <Table columns={appraisalColumns} data={appraisals} keyExtractor={(i) => i.id.toString()} emptyMessage={i18n.catalog["text_901c42bd6df9"]} isLoading={isLoading} pagination={{ currentPage, totalPages, onPageChange: setCurrentPage }} />
      )}

      {/* Create Goal Dialog */}
      <Dialog isOpen={showGoalDialog} onClose={() => setShowGoalDialog(false)} title={i18n.catalog["text_307c011d7c9d"]} maxWidth="700px">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select label={i18n.catalog["text_972803dc7d86"]} value={goalForm.employee_id} onChange={(e) => setGoalForm({ ...goalForm, employee_id: e.target.value })} placeholder={i18n.catalog["text_d6b8d3e4d508"]} options={employees.map((e: Employee) => ({ value: e.id.toString(), label: e.full_name }))} />
            <Select label={i18n.catalog["text_caa3f2bb4a36"]} value={goalForm.goal_type} onChange={(e) => setGoalForm({ ...goalForm, goal_type: e.target.value })} options={Object.entries(goalTypeLabels).map(([value, label]) => ({ value, label }))} />
          </div>
          <TextInput label={i18n.catalog["text_bf04b1353ece"]} value={goalForm.goal_title} onChange={(e) => setGoalForm({ ...goalForm, goal_title: e.target.value })} />
          <Textarea label={i18n.catalog["text_f3bbf02e943d"]} value={goalForm.goal_description} onChange={(e) => setGoalForm({ ...goalForm, goal_description: e.target.value })} rows={3} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <TextInput label={i18n.catalog["text_059424d1684b"]} type="number" value={goalForm.target_value} onChange={(e) => setGoalForm({ ...goalForm, target_value: e.target.value })} />
            <TextInput label={i18n.catalog["text_9a08d7d4bf73"]} value={goalForm.unit} onChange={(e) => setGoalForm({ ...goalForm, unit: e.target.value })} placeholder={i18n.catalog["text_223e0893566e"]} />
            <TextInput label={i18n.catalog["text_0746031c0fef"]} type="number" value={goalForm.current_value} onChange={(e) => setGoalForm({ ...goalForm, current_value: e.target.value })} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextInput label={i18n.catalog["text_aeadcb6d908e"]} type="date" value={goalForm.start_date} onChange={(e) => setGoalForm({ ...goalForm, start_date: e.target.value })} />
            <TextInput label={i18n.catalog["text_09767ec6efa9"]} type="date" value={goalForm.target_date} onChange={(e) => setGoalForm({ ...goalForm, target_date: e.target.value })} />
          </div>
          <div className="flex justify-end gap-2" style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid var(--border-color)" }}><Button variant="secondary" onClick={() => setShowGoalDialog(false)}>{i18n.catalog["text_9a30dc2a96b8"]}</Button><Button variant="primary" onClick={handleSaveGoal} icon="save">{i18n.catalog["text_ddfcaf9d0144"]}</Button></div>
        </div>
      </Dialog>

      {/* Goal Detail */}
      <Dialog isOpen={showGoalDetail} onClose={() => setShowGoalDetail(false)} title={i18n.catalog["text_1c19634cb399"]} maxWidth="600px">
        {selectedGoal && <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><strong>{i18n.catalog["text_378b712d4000"]}</strong> {selectedGoal.goal_title}</div>
            <div><strong>{i18n.catalog["text_b6293eeef8b9"]}</strong> {selectedGoal.employee?.full_name}</div>
            <div><strong>{i18n.catalog["text_0e20d829bef2"]}</strong> {goalTypeLabels[selectedGoal.goal_type]}</div>
            <div><strong>{i18n.catalog["text_02e196bdec60"]}</strong> <span className={`badge ${statusBadges[selectedGoal.status]}`}>{statusLabels[selectedGoal.status]}</span></div>
            <div><strong>{i18n.catalog["text_d6384709d2fd"]}</strong> {selectedGoal.progress_percentage}%</div>
            {selectedGoal.target_value && <div><strong>{i18n.catalog["text_af1ec6d9fe09"]}</strong> {selectedGoal.current_value || 0} / {selectedGoal.target_value} {selectedGoal.unit || ""}</div>}
            <div><strong>{i18n.catalog["text_5fa4cbf66c91"]}</strong> {formatDate(selectedGoal.target_date)}</div>
          </div>
          {selectedGoal.goal_description && <div><strong>{i18n.catalog["text_3ec7e12fb399"]}</strong><p>{selectedGoal.goal_description}</p></div>}
        </div>}
      </Dialog>

      {/* Update Goal Dialog */}
      <Dialog isOpen={showUpdateGoal} onClose={() => setShowUpdateGoal(false)} title={i18n.catalog["text_f430b1239bab"]} maxWidth="500px">
        <div className="space-y-4">
          <Select label={i18n.catalog["text_c3a4749caed4"]} value={updateForm.status} onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value })} options={Object.entries(statusLabels).map(([value, label]) => ({ value, label })).filter(o => ["not_started", "in_progress", "on_track", "at_risk", "completed", "cancelled"].includes(o.value))} />
          {selectedGoal?.target_value && <TextInput label={i18n.catalog["text_0746031c0fef"]} type="number" value={updateForm.current_value} onChange={(e) => setUpdateForm({ ...updateForm, current_value: e.target.value })} />}
          <TextInput label={i18n.catalog["text_c80392f6bb60"]} type="number" min="0" max="100" value={updateForm.progress_percentage} onChange={(e) => setUpdateForm({ ...updateForm, progress_percentage: e.target.value })} />
          <Textarea label={i18n.catalog["text_d446d2dc6b81"]} value={updateForm.notes} onChange={(e) => setUpdateForm({ ...updateForm, notes: e.target.value })} rows={2} />
          <div className="flex justify-end gap-2" style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid var(--border-color)" }}><Button variant="secondary" onClick={() => setShowUpdateGoal(false)}>{i18n.catalog["text_9a30dc2a96b8"]}</Button><Button variant="primary" onClick={handleUpdateGoal} icon="save">{i18n.catalog["text_00eab31f95b7"]}</Button></div>
        </div>
      </Dialog>

      {/* Create Appraisal Dialog */}
      <Dialog isOpen={showAppDialog} onClose={() => setShowAppDialog(false)} title={i18n.catalog["text_197ac1a4b9c6"]} maxWidth="600px">
        <div className="space-y-4">
          <Select label={i18n.catalog["text_972803dc7d86"]} value={appForm.employee_id} onChange={(e) => setAppForm({ ...appForm, employee_id: e.target.value })} placeholder={i18n.catalog["text_d6b8d3e4d508"]} options={employees.map((e: Employee) => ({ value: e.id.toString(), label: e.full_name }))} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select label={i18n.catalog["text_caa3f2bb4a36"]} value={appForm.appraisal_type} onChange={(e) => setAppForm({ ...appForm, appraisal_type: e.target.value })} options={Object.entries(appraisalTypeLabels).map(([value, label]) => ({ value, label }))} />
            <TextInput label={i18n.catalog["text_6e6dff061820"]} value={appForm.appraisal_period} onChange={(e) => setAppForm({ ...appForm, appraisal_period: e.target.value })} placeholder={i18n.catalog["text_5b7b2930bf58"]} />
          </div>
          <TextInput label={i18n.catalog["text_e1954194cffb"]} type="date" value={appForm.appraisal_date} onChange={(e) => setAppForm({ ...appForm, appraisal_date: e.target.value })} />
          <Textarea label={i18n.catalog["text_d446d2dc6b81"]} value={appForm.notes} onChange={(e) => setAppForm({ ...appForm, notes: e.target.value })} rows={2} />
          <div className="flex justify-end gap-2" style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid var(--border-color)" }}><Button variant="secondary" onClick={() => setShowAppDialog(false)}>{i18n.catalog["text_9a30dc2a96b8"]}</Button><Button variant="primary" onClick={handleSaveAppraisal} icon="save">{i18n.catalog["text_ddfcaf9d0144"]}</Button></div>
        </div>
      </Dialog>

      {/* Appraisal Detail */}
      <Dialog isOpen={showAppDetail} onClose={() => setShowAppDetail(false)} title={i18n.catalog["text_86f2be446aa3"]} maxWidth="600px">
        {selectedApp && <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><strong>{i18n.catalog["text_27995c183603"]}</strong> {selectedApp.appraisal_number}</div>
            <div><strong>{i18n.catalog["text_b6293eeef8b9"]}</strong> {selectedApp.employee?.full_name}</div>
            <div><strong>{i18n.catalog["text_0e20d829bef2"]}</strong> {appraisalTypeLabels[selectedApp.appraisal_type]}</div>
            <div><strong>{i18n.catalog["text_0559a988b3be"]}</strong> {selectedApp.appraisal_period}</div>
            <div><strong>{i18n.catalog["text_02e196bdec60"]}</strong> <span className={`badge ${statusBadges[selectedApp.status]}`}>{statusLabels[selectedApp.status]}</span></div>
            {selectedApp.overall_rating && <div><strong>{i18n.catalog["text_0d1423e47673"]}</strong> {selectedApp.overall_rating}/5</div>}
          </div>
          {selectedApp.self_assessment && <div><strong>{i18n.catalog["text_06beef726048"]}</strong><p>{selectedApp.self_assessment}</p></div>}
          {selectedApp.manager_feedback && <div><strong>{i18n.catalog["text_74f0f171b6ce"]}</strong><p>{selectedApp.manager_feedback}</p></div>}
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {selectedApp.status === "draft" && <Button variant="primary" onClick={() => { handleUpdateAppraisalStatus(selectedApp.id, "self_review"); setShowAppDetail(false); }}>{i18n.catalog["text_cc42a47cfce8"]}</Button>}
            {selectedApp.status === "self_review" && <Button variant="primary" onClick={() => { handleUpdateAppraisalStatus(selectedApp.id, "manager_review"); setShowAppDetail(false); }}>{i18n.catalog["text_1bf5ec8f1308"]}</Button>}
            {selectedApp.status === "manager_review" && <Button variant="primary" onClick={() => { handleUpdateAppraisalStatus(selectedApp.id, "completed"); setShowAppDetail(false); }}>{i18n.catalog["text_26896455a247"]}</Button>}
          </div>
        </div>}
      </Dialog>
    </div>
  );
}
