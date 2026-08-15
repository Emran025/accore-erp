"use client";

import { useI18n, catalogText, catalogMessage } from "@/lib/i18n";
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
import { Employee, Workflow } from "@/types";
import { useEffect, useState } from "react";

const workflowTypeLabels: Record<string, string> = { onboarding: catalogMessage("common.general.recruitment"), offboarding: catalogMessage("common.general.terminateService") };
const statusLabels: Record<string, string> = { not_started: catalogMessage("common.general.notStarted"), in_progress: catalogMessage("common.general.progress.alternative3"), completed: catalogMessage("common.general.completed"), cancelled: catalogMessage("common.general.canceled"), pending: catalogMessage("common.general.pending.alternative2"), blocked: catalogMessage("humanCapital.onboarding.blocked") };
const statusBadges: Record<string, string> = { not_started: "badge-secondary", in_progress: "badge-warning", completed: "badge-success", cancelled: "badge-danger", pending: "badge-info", blocked: "badge-danger" };
const taskTypeLabels: Record<string, string> = { system_id: catalogMessage("humanCapital.onboarding.systemId"), it_provisioning: catalogMessage("humanCapital.onboarding.itEquipment"), badge_access: catalogMessage("humanCapital.onboarding.accessCard"), document: catalogMessage("humanCapital.onboarding.documents"), training: catalogMessage("common.general.training"), other: catalogMessage("common.general.other") };
const deptLabels: Record<string, string> = { it: catalogMessage("common.general.informationTechnology"), security: catalogMessage("humanCapital.onboarding.security"), hr: catalogMessage("common.general.humanResources"), facilities: catalogMessage("humanCapital.onboarding.facilities") };

export function Onboarding() {
    const { t: i18n } = useI18n();
  const { canAccess } = useAuthStore();
  const [activeTab, setActiveTab] = useState("onboarding");
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const { allEmployees: employees, loadAllEmployees } = useEmployeeStore();
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  // Dialogs
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  // Form
  const [form, setForm] = useState({ employee_id: "", start_date: "", target_completion_date: "", notes: "" });

  useEffect(() => { loadAllEmployees(); }, [loadAllEmployees]);
  useEffect(() => { setCurrentPage(1); }, [activeTab]);
  useEffect(() => { loadWorkflows(); }, [activeTab, currentPage]);

  const loadWorkflows = async () => {
    setIsLoading(true);
    try {
      const q = new URLSearchParams({ page: currentPage.toString(), workflow_type: activeTab });
      const res: any = await fetchAPI(`${API_ENDPOINTS.HUMAN_CAPITAL.ONBOARDING.BASE}?${q}`);
      setWorkflows(res.data || []); setTotalPages(Number(res.last_page) || 1);
    } catch { showToast(i18n.catalog["humanCapital.onboarding.failedLoadData"], "error"); }
    finally { setIsLoading(false); }
  };

  const handleCreate = async () => {
    if (!form.employee_id || !form.start_date) { showToast(i18n.catalog["common.general.pleaseFillRequiredFields.alternative2"], "error"); return; }
    try {
      await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.ONBOARDING.BASE, {
        method: "POST", body: JSON.stringify({
          employee_id: Number(form.employee_id), workflow_type: activeTab,
          start_date: form.start_date, target_completion_date: form.target_completion_date || undefined,
          notes: form.notes || undefined,
        })
      });
      showToast(catalogText(i18n, "humanCapital.onboarding.processCreated", { value0: workflowTypeLabels[activeTab] }), "success"); setShowCreateDialog(false); loadWorkflows();
    } catch (e: any) { showToast(e.message || i18n.catalog["common.general.failedSave"], "error"); }
  };

  const viewDetail = async (id: number) => {
    try {
      const res: any = await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.ONBOARDING.withId(id));
      setSelectedWorkflow(res.data || res); setShowDetailDialog(true);
    } catch { showToast(i18n.catalog["common.general.failedLoadDetails"], "error"); }
  };

  const handleUpdateTask = async (workflowId: number, taskId: number, status: string) => {
    try {
      await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.ONBOARDING.TASK(workflowId, taskId), { method: "PUT", body: JSON.stringify({ status }) });
      showToast(i18n.catalog["humanCapital.onboarding.taskUpdated"], "success");
      // Reload detail
      const res: any = await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.ONBOARDING.withId(workflowId));
      setSelectedWorkflow(res.data || res);
      loadWorkflows();
    } catch (e: any) { showToast(e.message || i18n.catalog["common.general.updateFailed"], "error"); }
  };

  const columns: Column<Workflow>[] = [
    {
      key: "employee", header: i18n.catalog["common.general.employee.alternative3"], dataLabel: i18n.catalog["common.general.employee.alternative3"], render: (i) => (
        <div><div>{i.employee?.full_name || "-"}</div><small className="text-muted">{i.employee?.employee_code || ""}</small></div>
      )
    },
    { key: "workflow_type", header: i18n.catalog["common.general.type.alternative3"], dataLabel: i18n.catalog["common.general.type.alternative3"], render: (i) => workflowTypeLabels[i.workflow_type] || i.workflow_type },
    { key: "status", header: i18n.catalog["common.general.status.alternative2"], dataLabel: i18n.catalog["common.general.status.alternative2"], render: (i) => <span className={`badge ${statusBadges[i.status]}`}>{statusLabels[i.status] || i.status}</span> },
    {
      key: "completion_percentage", header: i18n.catalog["common.general.completion"], dataLabel: i18n.catalog["common.general.completion"], render: (i) => (
        <div className="progress" style={{ height: "20px" }}><div className="progress-bar" role="progressbar" style={{ width: `${i.completion_percentage}%` }}>{i.completion_percentage}%</div></div>
      )
    },
    { key: "start_date", header: i18n.catalog["common.general.startDate.alternative2"], dataLabel: i18n.catalog["common.general.start.alternative4"], render: (i) => formatDate(i.start_date) },
    { key: "target_completion_date", header: i18n.catalog["common.general.targetCompletion"], dataLabel: i18n.catalog["common.general.target"], render: (i) => i.target_completion_date ? formatDate(i.target_completion_date) : "-" },
    {
      key: "id", header: i18n.catalog["common.general.actions.alternative2"], dataLabel: i18n.catalog["common.general.actions.alternative2"], render: (i) => (
        <ActionButtons
          actions={[
            {
              icon: "eye",
              title: i18n.catalog["common.general.details"],
              variant: "view",
              onClick: () => viewDetail(i.id)
            }
          ]}
        />
      )
    },
  ];

  const tabs = [{ key: "onboarding", label: i18n.catalog["humanCapital.onboarding.recruitment"], icon: "user-plus" }, { key: "offboarding", label: i18n.catalog["humanCapital.onboarding.serviceTermination"], icon: "user-minus" }]

  return (
    <div className="sales-card animate-fade">
      <PageSubHeader
        title={i18n.catalog["humanCapital.onboarding.hiringTermination"]}
        titleIcon="user-check"
        actions={
          canAccess("onboarding", "create") && (
            <Button
              variant="primary"
              icon="plus"
              onClick={() => { setForm({ employee_id: "", start_date: new Date().toISOString().split("T")[0], target_completion_date: "", notes: "" }); setShowCreateDialog(true); }}
            >
              {i18n.catalog["humanCapital.onboarding.addNewOperation"]}</Button>
          )
        }
      />

      <TabNavigation tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      <Table columns={columns} data={workflows} keyExtractor={(i) => i.id.toString()} emptyMessage={catalogText(i18n, "humanCapital.onboarding.noOperations", { value0: workflowTypeLabels[activeTab] })} isLoading={isLoading} pagination={{ currentPage, totalPages, onPageChange: setCurrentPage }} />

      {/* Create Dialog */}
      <Dialog isOpen={showCreateDialog} onClose={() => setShowCreateDialog(false)} title={catalogText(i18n, "humanCapital.onboarding.addTransaction", { value0: workflowTypeLabels[activeTab] })} maxWidth="550px">
        <div className="space-y-4">
          <Select label={i18n.catalog["common.general.employee"]} value={form.employee_id} onChange={(e) => setForm({ ...form, employee_id: e.target.value })} placeholder={i18n.catalog["common.general.selectEmployee"]} options={employees.map((emp: Employee) => ({ value: emp.id.toString(), label: catalogText(i18n, "common.general.message.alternative7", { value0: emp.full_name, value1: emp.employee_code }) }))} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextInput label={i18n.catalog["common.general.startDate.alternative3"]} type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
            <TextInput label={i18n.catalog["common.general.targetCompletion"]} type="date" value={form.target_completion_date} onChange={(e) => setForm({ ...form, target_completion_date: e.target.value })} />
          </div>
          <Textarea label={i18n.catalog["common.general.notes.alternative2"]} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
          <div className="flex justify-end gap-2" style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid var(--border-color)" }}><Button variant="secondary" onClick={() => setShowCreateDialog(false)}>{i18n.catalog["common.general.cancel"]}</Button><Button variant="primary" onClick={handleCreate} icon="save">{i18n.catalog["common.general.create"]}</Button></div>
        </div>
      </Dialog>

      {/* Detail Dialog with Tasks */}
      <Dialog isOpen={showDetailDialog} onClose={() => setShowDetailDialog(false)} title={i18n.catalog["humanCapital.onboarding.transactionDetails"]} maxWidth="750px">
        {selectedWorkflow && <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><strong>{i18n.catalog["common.general.employee.alternative2"]}</strong> {selectedWorkflow.employee?.full_name}</div>
            <div><strong>{i18n.catalog["common.general.type"]}</strong> {workflowTypeLabels[selectedWorkflow.workflow_type]}</div>
            <div><strong>{i18n.catalog["common.general.status"]}</strong> <span className={`badge ${statusBadges[selectedWorkflow.status]}`}>{statusLabels[selectedWorkflow.status]}</span></div>
            <div><strong>{i18n.catalog["humanCapital.onboarding.completion"]}</strong> {selectedWorkflow.completion_percentage}%</div>
            <div><strong>{i18n.catalog["common.general.startDate"]}</strong> {formatDate(selectedWorkflow.start_date)}</div>
            {selectedWorkflow.target_completion_date && <div><strong>{i18n.catalog["humanCapital.onboarding.target"]}</strong> {formatDate(selectedWorkflow.target_completion_date)}</div>}
          </div>
          {selectedWorkflow.notes && <div><strong>{i18n.catalog["common.general.notes"]}</strong> {selectedWorkflow.notes}</div>}

          {/* Tasks */}
          <div style={{ marginTop: "1rem" }}>
            <h4 style={{ marginBottom: "0.75rem" }}>{i18n.catalog["common.general.tasks"]}</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {selectedWorkflow.tasks?.sort((a, b) => a.sequence_order - b.sequence_order).map((task) => (
                <div key={task.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem", background: "var(--bg-secondary)", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{task.task_name}</div>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                      {taskTypeLabels[task.task_type] || task.task_type} · {deptLabels[task.department] || task.department}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <span className={`badge ${statusBadges[task.status]}`}>{statusLabels[task.status] || task.status}</span>
                    {canAccess("onboarding", "edit") && task.status === "pending" && <button className="icon-btn" onClick={() => handleUpdateTask(selectedWorkflow.id, task.id, "in_progress")} title={i18n.catalog["common.general.start.alternative2"]} style={{ color: "var(--warning-color)" }}>{getIcon("play")}</button>}
                    {canAccess("onboarding", "edit") && task.status === "in_progress" && <button className="icon-btn" onClick={() => handleUpdateTask(selectedWorkflow.id, task.id, "completed")} title={i18n.catalog["humanCapital.onboarding.complete"]} style={{ color: "var(--success-color)" }}>{getIcon("check")}</button>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Documents */}
          {selectedWorkflow.documents && selectedWorkflow.documents.length > 0 && <div style={{ marginTop: "1rem" }}>
            <h4 style={{ marginBottom: "0.5rem" }}>{i18n.catalog["common.general.documents"]}</h4>
            {selectedWorkflow.documents.map(d => (
              <div key={d.id} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem", borderBottom: "1px solid var(--border-color)" }}>
                <span>{d.document_name}</span>
                <span className={`badge ${statusBadges[d.status]}`}>{statusLabels[d.status] || d.status}</span>
              </div>
            ))}
          </div>}
        </div>}
      </Dialog>
    </div>
  );
}
