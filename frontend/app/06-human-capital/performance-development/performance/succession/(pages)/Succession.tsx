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

const readinessLabels: Record<string, string> = { ready_now: catalogMessage("text_09ec8dda5bec"), ready_1_2_years: catalogMessage("text_2c9bea33eb49"), ready_3_5_years: catalogMessage("text_1ca694ce2033"), not_ready: catalogMessage("text_9c352a11e2f8") };
const readinessBadges: Record<string, string> = { ready_now: "badge-success", ready_1_2_years: "badge-info", ready_3_5_years: "badge-warning", not_ready: "badge-danger" };
const statusLabels: Record<string, string> = { active: catalogMessage("text_629e90b3af3d"), inactive: catalogMessage("text_b719ac8add4e"), filled: catalogMessage("text_c2da5684d63b") };
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
    } catch { showToast(i18n.catalog["text_02d26aa7a499"], "error"); }
    finally { setIsLoading(false); }
  };

  const handleSavePlan = async () => {
    if (!planForm.position_title) { showToast(i18n.catalog["text_69f149aba782"], "error"); return; }
    try {
      await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.SUCCESSION.BASE, {
        method: "POST", body: JSON.stringify({
          position_title: planForm.position_title, incumbent_id: planForm.incumbent_id ? Number(planForm.incumbent_id) : undefined,
          readiness_level: planForm.readiness_level, notes: planForm.notes || undefined,
        })
      });
      showToast(i18n.catalog["text_f12a28575e6c"], "success"); setShowPlanDialog(false); loadPlans();
    } catch (e: any) { showToast(e.message || i18n.catalog["text_b0dbba00004b"], "error"); }
  };

  const handleUpdatePlanStatus = async (id: number, status: string) => {
    try {
      await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.SUCCESSION.withId(id), { method: "PUT", body: JSON.stringify({ status }) });
      showToast(i18n.catalog["text_5b8139e25125"], "success"); loadPlans();
    } catch (e: any) { showToast(e.message || i18n.catalog["text_96c789857dbf"], "error"); }
  };

  const viewDetail = async (id: number) => {
    try {
      const res: any = await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.SUCCESSION.withId(id));
      setSelectedPlan(res.data || res); setShowDetailDialog(true);
    } catch { showToast(i18n.catalog["text_6467762a8e34"], "error"); }
  };

  const handleAddCandidate = async () => {
    if (!selectedPlan || !candForm.employee_id) { showToast(i18n.catalog["text_8c0019b7fcee"], "error"); return; }
    try {
      await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.SUCCESSION.CANDIDATES(selectedPlan.id), {
        method: "POST", body: JSON.stringify({
          employee_id: Number(candForm.employee_id), readiness_level: candForm.readiness_level,
          performance_rating: candForm.performance_rating ? Number(candForm.performance_rating) : undefined,
          potential_rating: candForm.potential_rating ? Number(candForm.potential_rating) : undefined,
          development_plan: candForm.development_plan || undefined, notes: candForm.notes || undefined,
        })
      });
      showToast(i18n.catalog["text_32172fb179f1"], "success"); setShowCandidateDialog(false);
      const res: any = await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.SUCCESSION.withId(selectedPlan.id));
      setSelectedPlan(res.data || res); loadPlans();
    } catch (e: any) { showToast(e.message || i18n.catalog["text_b0dbba00004b"], "error"); }
  };

  const columns: Column<SuccessionPlan>[] = [
    { key: "position_title", header: i18n.catalog["text_de98bd734462"], dataLabel: i18n.catalog["text_39adfb54212e"] },
    { key: "incumbent", header: i18n.catalog["text_6fe6300a7a3a"], dataLabel: i18n.catalog["text_1e177c80cb13"], render: (i) => i.incumbent?.full_name || "-" },
    { key: "readiness_level", header: i18n.catalog["text_0e77e94b4559"], dataLabel: i18n.catalog["text_0e77e94b4559"], render: (i) => <span className={`badge ${readinessBadges[i.readiness_level]}`}>{readinessLabels[i.readiness_level] || i.readiness_level}</span> },
    { key: "candidates", header: i18n.catalog["text_d30908a0b6c6"], dataLabel: i18n.catalog["text_d30908a0b6c6"], render: (i) => <span style={{ fontWeight: 600 }}>{i.candidates?.length || 0}</span> },
    { key: "status", header: i18n.catalog["text_c3a4749caed4"], dataLabel: i18n.catalog["text_c3a4749caed4"], render: (i) => <span className={`badge ${statusBadges[i.status]}`}>{statusLabels[i.status] || i.status}</span> },
    {
      key: "id", header: i18n.catalog["text_9f0a0f722601"], dataLabel: i18n.catalog["text_9f0a0f722601"], render: (i) => (
        <ActionButtons
          actions={[
            {
              icon: "eye",
              title: i18n.catalog["text_29f382c73779"],
              variant: "view",
              onClick: () => viewDetail(i.id)
            },
            ...(canAccess("succession", "edit") ? [{
              icon: "pause" as const,
              title: i18n.catalog["text_6d0a1e214b60"],
              variant: "edit" as const,
              onClick: () => handleUpdatePlanStatus(i.id, "inactive"),
              hidden: i.status !== "active"
            }] : []),
            ...(canAccess("succession", "edit") ? [{
              icon: "play" as const,
              title: i18n.catalog["text_c3c09fe13363"],
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
        title={i18n.catalog["text_e789ea97a5d1"]}
        titleIcon="sitemap"
        actions={
          canAccess("succession", "create") && (
            <Button
              onClick={() => { setPlanForm({ position_title: "", incumbent_id: "", readiness_level: "not_ready", notes: "" }); setShowPlanDialog(true); }}
              variant="primary"
              icon="plus"
            >
              {i18n.catalog["text_65482bbdfde3"]}</Button>
          )
        }
      />

      <Table columns={columns} data={plans} keyExtractor={(i) => i.id.toString()} emptyMessage={i18n.catalog["text_d5d90a34055f"]} isLoading={isLoading} pagination={{ currentPage, totalPages, onPageChange: setCurrentPage }} />

      {/* Create Plan Dialog */}
      <Dialog isOpen={showPlanDialog} onClose={() => setShowPlanDialog(false)} title={i18n.catalog["text_65482bbdfde3"]} maxWidth="550px">
        <div className="space-y-4">
          <div><Label className="block mb-1" style={{ color: "var(--text-secondary)" }}>{i18n.catalog["text_a360f80290e8"]}</Label><TextInput value={planForm.position_title} onChange={(e) => setPlanForm({ ...planForm, position_title: e.target.value })} /></div>
          <div><Label className="block mb-1" style={{ color: "var(--text-secondary)" }}>{i18n.catalog["text_62d363d1e859"]}</Label>
            <Select
              value={planForm.incumbent_id}
              onChange={(e) => setPlanForm({ ...planForm, incumbent_id: e.target.value })}
              placeholder={i18n.catalog["text_d6b8d3e4d508"]}
              options={employees.map((e: Employee) => ({ value: e.id.toString(), label: e.full_name }))}
            /></div>
          <div><Label className="block mb-1" style={{ color: "var(--text-secondary)" }}>{i18n.catalog["text_550e4bb431c6"]}</Label>
            <Select
              value={planForm.readiness_level}
              onChange={(e) => setPlanForm({ ...planForm, readiness_level: e.target.value })}
              options={Object.entries(readinessLabels).map(([value, label]) => ({ value, label }))}
            /></div>
          <div><Label className="block mb-1" style={{ color: "var(--text-secondary)" }}>{i18n.catalog["text_d446d2dc6b81"]}</Label><Textarea value={planForm.notes} onChange={(e) => setPlanForm({ ...planForm, notes: e.target.value })} rows={2} /></div>
          <div className="flex justify-end gap-2" style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid var(--border-color)" }}><Button variant="secondary" onClick={() => setShowPlanDialog(false)}>{i18n.catalog["text_9a30dc2a96b8"]}</Button><Button variant="primary" onClick={handleSavePlan} icon="save">{i18n.catalog["text_ddfcaf9d0144"]}</Button></div>
        </div>
      </Dialog>

      {/* Detail Dialog with Candidates */}
      <Dialog isOpen={showDetailDialog} onClose={() => setShowDetailDialog(false)} title={i18n.catalog["text_cdd701c3524c"]} maxWidth="750px">
        {selectedPlan && <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><strong>{i18n.catalog["text_651da673b258"]}</strong> {selectedPlan.position_title}</div>
            <div><strong>{i18n.catalog["text_b14c407160ba"]}</strong> {selectedPlan.incumbent?.full_name || "-"}</div>
            <div><strong>{i18n.catalog["text_2fb3eb37fc76"]}</strong> <span className={`badge ${readinessBadges[selectedPlan.readiness_level]}`}>{readinessLabels[selectedPlan.readiness_level]}</span></div>
            <div><strong>{i18n.catalog["text_02e196bdec60"]}</strong> <span className={`badge ${statusBadges[selectedPlan.status]}`}>{statusLabels[selectedPlan.status]}</span></div>
          </div>
          {selectedPlan.notes && <div><strong>{i18n.catalog["text_8c9d1b5aec34"]}</strong> {selectedPlan.notes}</div>}

          <div style={{ marginTop: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
              <h4 style={{ margin: 0 }}>{i18n.catalog["text_264f6f17f513"]}{selectedPlan.candidates?.length || 0})</h4>
              {canAccess("succession", "edit") && (
                <Button
                  onClick={() => { setCandForm({ employee_id: "", readiness_level: "not_ready", performance_rating: "", potential_rating: "", development_plan: "", notes: "" }); setShowCandidateDialog(true); }}
                  variant="primary"
                  icon="plus"
                >
                  {i18n.catalog["text_72052973b127"]}</Button>
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
                      <div><span style={{ color: "var(--text-secondary)" }}>{i18n.catalog["text_bdb2296cf4ac"]}</span> {renderRatingStars(c.performance_rating)}</div>
                      <div><span style={{ color: "var(--text-secondary)" }}>{i18n.catalog["text_b009f513e642"]}</span> {renderRatingStars(c.potential_rating)}</div>
                    </div>
                    {c.development_plan && <div style={{ marginTop: "0.5rem", fontSize: "0.85rem" }}><span style={{ color: "var(--text-secondary)" }}>{i18n.catalog["text_f16ca777c217"]}</span> {c.development_plan}</div>}
                  </div>
                ))}
              </div>
            ) : <p style={{ color: "var(--text-secondary)" }}>{i18n.catalog["text_c6b037c12bf4"]}</p>}
          </div>
        </div>}
      </Dialog>

      {/* Add Candidate Dialog */}
      <Dialog isOpen={showCandidateDialog} onClose={() => setShowCandidateDialog(false)} title={i18n.catalog["text_0d90e878de9b"]} maxWidth="550px">
        <div className="space-y-4">
          <div><Label className="block mb-1" style={{ color: "var(--text-secondary)" }}>{i18n.catalog["text_972803dc7d86"]}</Label>
            <Select
              value={candForm.employee_id}
              onChange={(e) => setCandForm({ ...candForm, employee_id: e.target.value })}
              placeholder={i18n.catalog["text_d6b8d3e4d508"]}
              options={employees.map((e: Employee) => ({ value: e.id.toString(), label: e.full_name }))}
            /></div>
          <div><Label className="block mb-1" style={{ color: "var(--text-secondary)" }}>{i18n.catalog["text_550e4bb431c6"]}</Label>
            <Select
              value={candForm.readiness_level}
              onChange={(e) => setCandForm({ ...candForm, readiness_level: e.target.value })}
              options={Object.entries(readinessLabels).map(([value, label]) => ({ value, label }))}
            /></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label className="block mb-1" style={{ color: "var(--text-secondary)" }}>{i18n.catalog["text_47e0270956cb"]}</Label><TextInput type="number" min="1" max="5" value={candForm.performance_rating} onChange={(e) => setCandForm({ ...candForm, performance_rating: e.target.value })} /></div>
            <div><Label className="block mb-1" style={{ color: "var(--text-secondary)" }}>{i18n.catalog["text_0ad8351f6b4e"]}</Label><TextInput type="number" min="1" max="5" value={candForm.potential_rating} onChange={(e) => setCandForm({ ...candForm, potential_rating: e.target.value })} /></div>
          </div>
          <div><Label className="block mb-1" style={{ color: "var(--text-secondary)" }}>{i18n.catalog["text_ee21cac52e25"]}</Label><Textarea value={candForm.development_plan} onChange={(e) => setCandForm({ ...candForm, development_plan: e.target.value })} rows={3} /></div>
          <div><Label className="block mb-1" style={{ color: "var(--text-secondary)" }}>{i18n.catalog["text_d446d2dc6b81"]}</Label><Textarea value={candForm.notes} onChange={(e) => setCandForm({ ...candForm, notes: e.target.value })} rows={2} /></div>
          <div className="flex justify-end gap-2" style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid var(--border-color)" }}><Button variant="secondary" onClick={() => setShowCandidateDialog(false)}>{i18n.catalog["text_9a30dc2a96b8"]}</Button><Button variant="primary" onClick={handleAddCandidate} icon="save">{i18n.catalog["text_d52453ac627d"]}</Button></div>
        </div>
      </Dialog>
    </div>
  );
}
