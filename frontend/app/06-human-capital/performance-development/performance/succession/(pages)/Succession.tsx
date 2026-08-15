"use client";

import { useI18n, catalogMessage } from "@/lib/i18n";
import { Employee } from "@/types";
import { PageSubHeader } from "@/components/layout";
import { ActionButtons, Button, Column, Dialog, Label, Select, showToast, Table } from "@/components/ui";
import { TextInput } from "@/components/ui/TextInput";
import { Textarea } from "@/components/ui/Textarea";
import { fetchAPI } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { getIcon } from "@/lib/icons";
import { useAuthStore } from "@/stores/useAuthStore";
import { useEmployeeStore } from "@/stores/useEmployeeStore";
import { useEffect, useState } from "react";

interface SuccessionPlan {
  id: number; position_title: string; incumbent_id?: number;
  incumbent?: { full_name: string }; readiness_level: string;
  status: string; notes?: string;
  candidates?: Candidate[];
}

interface Candidate {
  id: number; employee_id: number; employee?: { full_name: string };
  readiness_level: string; performance_rating?: number; potential_rating?: number;
  development_plan?: string; notes?: string;
}

const readinessLabels: Record<string, string> = { ready_now: catalogMessage("humanCapital.succession.readyNow"), ready_1_2_years: catalogMessage("humanCapital.succession.within12Years"), ready_3_5_years: catalogMessage("humanCapital.succession.within35Years"), not_ready: catalogMessage("humanCapital.succession.notReady") };
const readinessBadges: Record<string, string> = { ready_now: "badge-success", ready_1_2_years: "badge-info", ready_3_5_years: "badge-warning", not_ready: "badge-danger" };
const statusLabels: Record<string, string> = { active: catalogMessage("common.general.active"), inactive: catalogMessage("common.general.inactive"), filled: catalogMessage("common.general.completed") };
const statusBadges: Record<string, string> = { active: "badge-success", inactive: "badge-secondary", filled: "badge-info" };

export function Succession() {
    const { t: i18n } = useI18n();
  const { canAccess } = useAuthStore();
  const [plans, setPlans] = useState<SuccessionPlan[]>([]);
  const { allEmployees: employees, loadAllEmployees } = useEmployeeStore();
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  // Dialogs
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SuccessionPlan | null>(null);
  const [showCandidateDialog, setShowCandidateDialog] = useState(false);
  // Forms
  const [planForm, setPlanForm] = useState({ position_title: "", incumbent_id: "", readiness_level: "not_ready", notes: "" });
  const [candForm, setCandForm] = useState({ employee_id: "", readiness_level: "not_ready", performance_rating: "", potential_rating: "", development_plan: "", notes: "" });

  useEffect(() => { loadAllEmployees(); }, [loadAllEmployees]);
  useEffect(() => { loadPlans(); }, [currentPage]);

  const loadPlans = async () => {
    setIsLoading(true);
    try {
      const res: any = await fetchAPI(`${API_ENDPOINTS.HUMAN_CAPITAL.SUCCESSION.BASE}?page=${currentPage}`);
      setPlans(res.data || []); setTotalPages(Number(res.last_page) || 1);
    } catch { showToast(i18n.catalog["humanCapital.succession.failedLoadSuccessionPlans"], "error"); }
    finally { setIsLoading(false); }
  };

  const handleSavePlan = async () => {
    if (!planForm.position_title) { showToast(i18n.catalog["humanCapital.succession.pleaseEnterJobTitle"], "error"); return; }
    try {
      await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.SUCCESSION.BASE, {
        method: "POST", body: JSON.stringify({
          position_title: planForm.position_title, incumbent_id: planForm.incumbent_id ? Number(planForm.incumbent_id) : undefined,
          readiness_level: planForm.readiness_level, notes: planForm.notes || undefined,
        })
      });
      showToast(i18n.catalog["humanCapital.succession.successionPlanCreated"], "success"); setShowPlanDialog(false); loadPlans();
    } catch (e: any) { showToast(e.message || i18n.catalog["common.general.failedSave"], "error"); }
  };

  const handleUpdatePlanStatus = async (id: number, status: string) => {
    try {
      await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.SUCCESSION.withId(id), { method: "PUT", body: JSON.stringify({ status }) });
      showToast(i18n.catalog["common.general.statusUpdated"], "success"); loadPlans();
    } catch (e: any) { showToast(e.message || i18n.catalog["common.general.updateFailed"], "error"); }
  };

  const viewDetail = async (id: number) => {
    try {
      const res: any = await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.SUCCESSION.withId(id));
      setSelectedPlan(res.data || res); setShowDetailDialog(true);
    } catch { showToast(i18n.catalog["common.general.failedLoadDetails"], "error"); }
  };

  const handleAddCandidate = async () => {
    if (!selectedPlan || !candForm.employee_id) { showToast(i18n.catalog["common.general.pleaseSelectEmployee"], "error"); return; }
    try {
      await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.SUCCESSION.CANDIDATES(selectedPlan.id), {
        method: "POST", body: JSON.stringify({
          employee_id: Number(candForm.employee_id), readiness_level: candForm.readiness_level,
          performance_rating: candForm.performance_rating ? Number(candForm.performance_rating) : undefined,
          potential_rating: candForm.potential_rating ? Number(candForm.potential_rating) : undefined,
          development_plan: candForm.development_plan || undefined, notes: candForm.notes || undefined,
        })
      });
      showToast(i18n.catalog["common.general.candidateAdded"], "success"); setShowCandidateDialog(false);
      const res: any = await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.SUCCESSION.withId(selectedPlan.id));
      setSelectedPlan(res.data || res); loadPlans();
    } catch (e: any) { showToast(e.message || i18n.catalog["common.general.failedSave"], "error"); }
  };

  const columns: Column<SuccessionPlan>[] = [
    { key: "position_title", header: i18n.catalog["common.general.jobTitle.alternative3"], dataLabel: i18n.catalog["common.general.title.alternative2"] },
    { key: "incumbent", header: i18n.catalog["humanCapital.succession.positionHolder"], dataLabel: i18n.catalog["humanCapital.succession.incumbent"], render: (i) => i.incumbent?.full_name || "-" },
    { key: "readiness_level", header: i18n.catalog["common.general.readiness"], dataLabel: i18n.catalog["common.general.readiness"], render: (i) => <span className={`badge ${readinessBadges[i.readiness_level]}`}>{readinessLabels[i.readiness_level] || i.readiness_level}</span> },
    { key: "candidates", header: i18n.catalog["common.general.candidates.alternative2"], dataLabel: i18n.catalog["common.general.candidates.alternative2"], render: (i) => <span style={{ fontWeight: 600 }}>{i.candidates?.length || 0}</span> },
    { key: "status", header: i18n.catalog["common.general.status.alternative2"], dataLabel: i18n.catalog["common.general.status.alternative2"], render: (i) => <span className={`badge ${statusBadges[i.status]}`}>{statusLabels[i.status] || i.status}</span> },
    {
      key: "id", header: i18n.catalog["common.general.actions.alternative2"], dataLabel: i18n.catalog["common.general.actions.alternative2"], render: (i) => (
        <ActionButtons
          actions={[
            {
              icon: "eye",
              title: i18n.catalog["common.general.details"],
              variant: "view",
              onClick: () => viewDetail(i.id)
            },
            ...(canAccess("succession", "edit") ? [{
              icon: "pause" as const,
              title: i18n.catalog["humanCapital.succession.disable"],
              variant: "edit" as const,
              onClick: () => handleUpdatePlanStatus(i.id, "inactive"),
              hidden: i.status !== "active"
            }] : []),
            ...(canAccess("succession", "edit") ? [{
              icon: "play" as const,
              title: i18n.catalog["common.general.activate"],
              variant: "success" as const,
              onClick: () => handleUpdatePlanStatus(i.id, "active"),
              hidden: i.status !== "inactive"
            }] : [])
          ]}
        />
      )
    },
  ];

  const renderRatingStars = (rating?: number) => {
    if (!rating) return "-";
    return <div style={{ display: "flex", gap: "2px" }}>{[1, 2, 3, 4, 5].map(s => <span key={s} style={{ color: s <= rating ? "#f59e0b" : "#e5e7eb" }}>{getIcon("star", "", 13)}</span>)}</div>;
  };

  return (
    <div className="sales-card animate-fade">
      <PageSubHeader
        title={i18n.catalog["common.general.successionPlanning"]}
        titleIcon="sitemap"
        actions={
          canAccess("succession", "create") && (
            <Button
              onClick={() => { setPlanForm({ position_title: "", incumbent_id: "", readiness_level: "not_ready", notes: "" }); setShowPlanDialog(true); }}
              variant="primary"
              icon="plus"
            >
              {i18n.catalog["common.general.newSuccessionPlan"]}</Button>
          )
        }
      />

      <Table columns={columns} data={plans} keyExtractor={(i) => i.id.toString()} emptyMessage={i18n.catalog["humanCapital.succession.noSuccessionPlans"]} isLoading={isLoading} pagination={{ currentPage, totalPages, onPageChange: setCurrentPage }} />

      {/* Create Plan Dialog */}
      <Dialog isOpen={showPlanDialog} onClose={() => setShowPlanDialog(false)} title={i18n.catalog["common.general.newSuccessionPlan"]} maxWidth="550px">
        <div className="space-y-4">
          <div><Label className="block mb-1" style={{ color: "var(--text-secondary)" }}>{i18n.catalog["common.general.jobTitle"]}</Label><TextInput value={planForm.position_title} onChange={(e) => setPlanForm({ ...planForm, position_title: e.target.value })} /></div>
          <div><Label className="block mb-1" style={{ color: "var(--text-secondary)" }}>{i18n.catalog["humanCapital.succession.currentPositionHolder"]}</Label>
            <Select
              value={planForm.incumbent_id}
              onChange={(e) => setPlanForm({ ...planForm, incumbent_id: e.target.value })}
              placeholder={i18n.catalog["common.general.select"]}
              options={employees.map((e: Employee) => ({ value: e.id.toString(), label: e.full_name }))}
            /></div>
          <div><Label className="block mb-1" style={{ color: "var(--text-secondary)" }}>{i18n.catalog["common.general.readinessLevel"]}</Label>
            <Select
              value={planForm.readiness_level}
              onChange={(e) => setPlanForm({ ...planForm, readiness_level: e.target.value })}
              options={Object.entries(readinessLabels).map(([value, label]) => ({ value, label }))}
            /></div>
          <div><Label className="block mb-1" style={{ color: "var(--text-secondary)" }}>{i18n.catalog["common.general.notes.alternative2"]}</Label><Textarea value={planForm.notes} onChange={(e) => setPlanForm({ ...planForm, notes: e.target.value })} rows={2} /></div>
          <div className="flex justify-end gap-2" style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid var(--border-color)" }}><Button variant="secondary" onClick={() => setShowPlanDialog(false)}>{i18n.catalog["common.general.cancel"]}</Button><Button variant="primary" onClick={handleSavePlan} icon="save">{i18n.catalog["common.general.save"]}</Button></div>
        </div>
      </Dialog>

      {/* Detail Dialog with Candidates */}
      <Dialog isOpen={showDetailDialog} onClose={() => setShowDetailDialog(false)} title={i18n.catalog["humanCapital.succession.successionPlanDetails"]} maxWidth="750px">
        {selectedPlan && <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><strong>{i18n.catalog["common.general.title.alternative3"]}</strong> {selectedPlan.position_title}</div>
            <div><strong>{i18n.catalog["humanCapital.succession.operator"]}</strong> {selectedPlan.incumbent?.full_name || "-"}</div>
            <div><strong>{i18n.catalog["humanCapital.succession.readiness"]}</strong> <span className={`badge ${readinessBadges[selectedPlan.readiness_level]}`}>{readinessLabels[selectedPlan.readiness_level]}</span></div>
            <div><strong>{i18n.catalog["common.general.status"]}</strong> <span className={`badge ${statusBadges[selectedPlan.status]}`}>{statusLabels[selectedPlan.status]}</span></div>
          </div>
          {selectedPlan.notes && <div><strong>{i18n.catalog["common.general.notes"]}</strong> {selectedPlan.notes}</div>}

          <div style={{ marginTop: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
              <h4 style={{ margin: 0 }}>{i18n.catalog["common.general.candidates"]}{selectedPlan.candidates?.length || 0})</h4>
              {canAccess("succession", "edit") && (
                <Button
                  onClick={() => { setCandForm({ employee_id: "", readiness_level: "not_ready", performance_rating: "", potential_rating: "", development_plan: "", notes: "" }); setShowCandidateDialog(true); }}
                  variant="primary"
                  icon="plus"
                >
                  {i18n.catalog["common.general.addFilter"]}</Button>
              )}
            </div>
            {selectedPlan.candidates && selectedPlan.candidates.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {selectedPlan.candidates.map(c => (
                  <div key={c.id} style={{ padding: "0.75rem", background: "var(--bg-secondary)", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                      <strong>{c.employee?.full_name}</strong>
                      <span className={`badge ${readinessBadges[c.readiness_level]}`}>{readinessLabels[c.readiness_level]}</span>
                    </div>
                    <div style={{ display: "flex", gap: "1.5rem", fontSize: "0.85rem" }}>
                      <div><span style={{ color: "var(--text-secondary)" }}>{i18n.catalog["humanCapital.succession.performance"]}</span> {renderRatingStars(c.performance_rating)}</div>
                      <div><span style={{ color: "var(--text-secondary)" }}>{i18n.catalog["humanCapital.succession.capabilities"]}</span> {renderRatingStars(c.potential_rating)}</div>
                    </div>
                    {c.development_plan && <div style={{ marginTop: "0.5rem", fontSize: "0.85rem" }}><span style={{ color: "var(--text-secondary)" }}>{i18n.catalog["humanCapital.succession.developmentPlan.alternative2"]}</span> {c.development_plan}</div>}
                  </div>
                ))}
              </div>
            ) : <p style={{ color: "var(--text-secondary)" }}>{i18n.catalog["humanCapital.succession.noCandidatesYet"]}</p>}
          </div>
        </div>}
      </Dialog>

      {/* Add Candidate Dialog */}
      <Dialog isOpen={showCandidateDialog} onClose={() => setShowCandidateDialog(false)} title={i18n.catalog["humanCapital.succession.addSuccessionCandidate"]} maxWidth="550px">
        <div className="space-y-4">
          <div><Label className="block mb-1" style={{ color: "var(--text-secondary)" }}>{i18n.catalog["common.general.employee"]}</Label>
            <Select
              value={candForm.employee_id}
              onChange={(e) => setCandForm({ ...candForm, employee_id: e.target.value })}
              placeholder={i18n.catalog["common.general.select"]}
              options={employees.map((e: Employee) => ({ value: e.id.toString(), label: e.full_name }))}
            /></div>
          <div><Label className="block mb-1" style={{ color: "var(--text-secondary)" }}>{i18n.catalog["common.general.readinessLevel"]}</Label>
            <Select
              value={candForm.readiness_level}
              onChange={(e) => setCandForm({ ...candForm, readiness_level: e.target.value })}
              options={Object.entries(readinessLabels).map(([value, label]) => ({ value, label }))}
            /></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label className="block mb-1" style={{ color: "var(--text-secondary)" }}>{i18n.catalog["humanCapital.succession.performanceRating15"]}</Label><TextInput type="number" min="1" max="5" value={candForm.performance_rating} onChange={(e) => setCandForm({ ...candForm, performance_rating: e.target.value })} /></div>
            <div><Label className="block mb-1" style={{ color: "var(--text-secondary)" }}>{i18n.catalog["humanCapital.succession.capabilityRating15"]}</Label><TextInput type="number" min="1" max="5" value={candForm.potential_rating} onChange={(e) => setCandForm({ ...candForm, potential_rating: e.target.value })} /></div>
          </div>
          <div><Label className="block mb-1" style={{ color: "var(--text-secondary)" }}>{i18n.catalog["humanCapital.succession.developmentPlan"]}</Label><Textarea value={candForm.development_plan} onChange={(e) => setCandForm({ ...candForm, development_plan: e.target.value })} rows={3} /></div>
          <div><Label className="block mb-1" style={{ color: "var(--text-secondary)" }}>{i18n.catalog["common.general.notes.alternative2"]}</Label><Textarea value={candForm.notes} onChange={(e) => setCandForm({ ...candForm, notes: e.target.value })} rows={2} /></div>
          <div className="flex justify-end gap-2" style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid var(--border-color)" }}><Button variant="secondary" onClick={() => setShowCandidateDialog(false)}>{i18n.catalog["common.general.cancel"]}</Button><Button variant="primary" onClick={handleAddCandidate} icon="save">{i18n.catalog["common.general.add"]}</Button></div>
        </div>
      </Dialog>
    </div>
  );
}
