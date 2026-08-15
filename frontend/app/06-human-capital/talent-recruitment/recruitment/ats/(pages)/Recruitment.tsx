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

const statusLabels: Record<string, string> = { draft: catalogMessage("text_552aec56f591"), pending_approval: catalogMessage("text_38c10ba741b1"), approved: catalogMessage("text_a98d8a418ba0"), rejected: catalogMessage("text_5d969a71dad3"), closed: catalogMessage("text_e655261f9c96"), filled: catalogMessage("text_c2da5684d63b"), applied: catalogMessage("text_110a2899d9c2"), screened: catalogMessage("text_7f2d89b1c1e6"), assessment: catalogMessage("text_800984180746"), interview: catalogMessage("text_9580379f88a0"), offer: catalogMessage("text_3824e18ca83b"), hired: catalogMessage("text_123f04cbad88"), withdrawn: catalogMessage("text_fdc44d1298ad") };
const statusBadges: Record<string, string> = { draft: "badge-secondary", pending_approval: "badge-warning", approved: "badge-success", rejected: "badge-danger", closed: "badge-secondary", filled: "badge-info", applied: "badge-info", screened: "badge-warning", assessment: "badge-warning", interview: "badge-primary", offer: "badge-success", hired: "badge-success", withdrawn: "badge-secondary" };
const empTypeLabels: Record<string, string> = { full_time: catalogMessage("text_ae607c34c510"), part_time: catalogMessage("text_68b482db7711"), contract: catalogMessage("text_eef75f5b33a4"), temporary: catalogMessage("text_743a3373265e") };

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
    } catch { showToast(i18n.catalog["text_a75c1adc97fa"], "error"); }
    finally { setIsLoading(false); }
  };

  const loadApplicants = async () => {
    setIsLoading(true);
    try {
      const q = new URLSearchParams({ page: currentPage.toString(), ...(statusFilter && { status: statusFilter }) });
      const res: any = await fetchAPI(`${API_ENDPOINTS.HUMAN_CAPITAL.RECRUITMENT.APPLICANTS.BASE}?${q}`);
      const data = res.data || (Array.isArray(res) ? res : []);
      setApplicants(data); setTotalPages(Number(res.last_page) || 1);
    } catch { showToast(i18n.catalog["text_0b320198ffd6"], "error"); }
    finally { setIsLoading(false); }
  };

  const handleSaveRequisition = async () => {
    if (!reqForm.job_title || !reqForm.number_of_positions) { showToast(i18n.catalog["text_7b758312f829"], "error"); return; }
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
      showToast(i18n.catalog["text_f255ff482e31"], "success"); setShowReqDialog(false); loadRequisitions();
    } catch (e: any) { showToast(e.message || i18n.catalog["text_b0dbba00004b"], "error"); }
  };

  const handleUpdateReqStatus = async (id: number, status: string) => {
    try {
      await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.RECRUITMENT.REQUISITIONS.withId(id), { method: "PUT", body: JSON.stringify({ status }) });
      showToast(i18n.catalog["text_5b8139e25125"], "success"); loadRequisitions();
    } catch (e: any) { showToast(e.message || i18n.catalog["text_96c789857dbf"], "error"); }
  };

  const handleSaveApplicant = async () => {
    if (!appForm.requisition_id || !appForm.first_name || !appForm.last_name || !appForm.email) { showToast(i18n.catalog["text_7b758312f829"], "error"); return; }
    try {
      await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.RECRUITMENT.APPLICANTS.BASE, {
        method: "POST", body: JSON.stringify({
          requisition_id: Number(appForm.requisition_id), first_name: appForm.first_name,
          last_name: appForm.last_name, email: appForm.email, phone: appForm.phone || undefined,
          notes: appForm.notes || undefined,
        })
      });
      showToast(i18n.catalog["text_32172fb179f1"], "success"); setShowAppDialog(false); loadApplicants();
    } catch (e: any) { showToast(e.message || i18n.catalog["text_b0dbba00004b"], "error"); }
  };

  const handleUpdateAppStatus = async (id: number, status: string) => {
    try {
      await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.RECRUITMENT.APPLICANTS.STATUS(id), { method: "PUT", body: JSON.stringify({ status }) });
      showToast(i18n.catalog["text_5301cbe2d314"], "success"); loadApplicants();
    } catch (e: any) { showToast(e.message || i18n.catalog["text_96c789857dbf"], "error"); }
  };

  const viewReqDetail = async (id: number) => {
    try {
      const res: any = await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.RECRUITMENT.REQUISITIONS.withId(id));
      setSelectedReq(res.data || res); setShowReqDetail(true);
    } catch { showToast(i18n.catalog["text_6467762a8e34"], "error"); }
  };

  const requisitionColumns: Column<Requisition>[] = [
    { key: "requisition_number", header: i18n.catalog["text_9916d665a946"], dataLabel: i18n.catalog["text_9916d665a946"] },
    { key: "job_title", header: i18n.catalog["text_de98bd734462"], dataLabel: i18n.catalog["text_39adfb54212e"] },
    { key: "department", header: i18n.catalog["text_0771c3ff9336"], dataLabel: i18n.catalog["text_0771c3ff9336"], render: (i) => i.department?.name_ar || "-" },
    { key: "number_of_positions", header: i18n.catalog["text_2bf8a6cdf6a0"], dataLabel: i18n.catalog["text_92085a8f598e"] },
    { key: "employment_type", header: i18n.catalog["text_30f46340df88"], dataLabel: i18n.catalog["text_caa3f2bb4a36"], render: (i) => empTypeLabels[i.employment_type] || i.employment_type },
    { key: "status", header: i18n.catalog["text_c3a4749caed4"], dataLabel: i18n.catalog["text_c3a4749caed4"], render: (i) => <span className={`badge ${statusBadges[i.status]}`}>{statusLabels[i.status] || i.status}</span> },
    { key: "target_start_date", header: i18n.catalog["text_90f719b91522"], dataLabel: i18n.catalog["text_e2725062bf37"], render: (i) => i.target_start_date ? formatDate(i.target_start_date) : "-" },
    {
      key: "id", header: i18n.catalog["text_9f0a0f722601"], dataLabel: i18n.catalog["text_9f0a0f722601"], render: (i) => (
        <ActionButtons
          actions={[
            {
              icon: "eye",
              title: i18n.catalog["text_29f382c73779"],
              variant: "view",
              onClick: () => viewReqDetail(i.id)
            },
            ...(canAccess("recruitment", "edit") ? [{
              icon: "send" as const,
              title: i18n.catalog["text_f94d2b528730"],
              variant: "view" as const,
              onClick: () => handleUpdateReqStatus(i.id, "pending_approval"),
              hidden: i.status !== "draft"
            }] : []),
            ...(canAccess("recruitment", "edit") ? [{
              icon: "check" as const,
              title: i18n.catalog["text_f4e17def8c1b"],
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
    { key: "name", header: i18n.catalog["text_52ab09847cf8"], dataLabel: i18n.catalog["text_52ab09847cf8"], render: (i) => catalogText(i18n, "text_54ef3bb1085e", { value0: i.first_name, value1: i.last_name }) },
    { key: "email", header: i18n.catalog["text_ddf0fca39a4f"], dataLabel: i18n.catalog["text_cb572218fea7"] },
    { key: "requisition", header: i18n.catalog["text_204f27f89b6b"], dataLabel: i18n.catalog["text_204f27f89b6b"], render: (i) => i.requisition?.job_title || "-" },
    { key: "status", header: i18n.catalog["text_c3a4749caed4"], dataLabel: i18n.catalog["text_c3a4749caed4"], render: (i) => <span className={`badge ${statusBadges[i.status]}`}>{statusLabels[i.status] || i.status}</span> },
    { key: "application_date", header: i18n.catalog["text_ba6e3584d603"], dataLabel: i18n.catalog["text_d90c384199ac"], render: (i) => formatDate(i.application_date) },
    { key: "match_score", header: i18n.catalog["text_ec7f4caadcfa"], dataLabel: i18n.catalog["text_ec7f4caadcfa"], render: (i) => i.match_score ? catalogText(i18n, "text_518ef1823474", { value0: i.match_score }) : "-" },
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
            ...(canAccess("recruitment", "edit") ? [{
              icon: "filter" as const,
              title: i18n.catalog["text_eee0654092ac"],
              variant: "view" as const,
              onClick: () => handleUpdateAppStatus(i.id, "screened"),
              hidden: i.status !== "applied"
            }] : []),
            ...(canAccess("recruitment", "edit") ? [{
              icon: "user-check" as const,
              title: i18n.catalog["text_9580379f88a0"],
              variant: "view" as const,
              onClick: () => handleUpdateAppStatus(i.id, "interview"),
              hidden: i.status !== "screened"
            }] : []),
            ...(canAccess("recruitment", "edit") ? [{
              icon: "handshake" as const,
              title: i18n.catalog["text_3824e18ca83b"],
              variant: "success" as const,
              onClick: () => handleUpdateAppStatus(i.id, "offer"),
              hidden: i.status !== "interview"
            }] : []),
            ...(canAccess("recruitment", "edit") ? [{
              icon: "check-check" as const,
              title: i18n.catalog["text_23a253930749"],
              variant: "success" as const,
              onClick: () => handleUpdateAppStatus(i.id, "hired"),
              hidden: i.status !== "offer"
            }] : [])
          ]}
        />
      )
    },
  ];

  const tabs = [{ key: "requisitions", label: i18n.catalog["text_6df1b372ee1e"], icon: "file-alt" }, { key: "applicants", label: i18n.catalog["text_d30908a0b6c6"], icon: "users" }];

  return (
    <div className="sales-card animate-fade">
      <PageSubHeader
        title={i18n.catalog["text_a6ff66f0a31c"]}
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
              placeholder={i18n.catalog["text_1ef213109d57"]}
              options={activeTab === "requisitions"
                ? [
                  { value: "draft", label: i18n.catalog["text_552aec56f591"] },
                  { value: "pending_approval", label: i18n.catalog["text_38c10ba741b1"] },
                  { value: "approved", label: i18n.catalog["text_16d1cf933ffc"] },
                  { value: "filled", label: i18n.catalog["text_c2da5684d63b"] }
                ]
                : [
                  { value: "applied", label: i18n.catalog["text_110a2899d9c2"] },
                  { value: "screened", label: i18n.catalog["text_eee0654092ac"] },
                  { value: "interview", label: i18n.catalog["text_9580379f88a0"] },
                  { value: "hired", label: i18n.catalog["text_123f04cbad88"] }
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
                  {i18n.catalog["text_1bf6cf46b69e"]}</Button>
              )
            ) : (
              canAccess("recruitment", "create") && (
                <Button
                  onClick={() => { setAppForm({ requisition_id: "", first_name: "", last_name: "", email: "", phone: "", notes: "" }); setShowAppDialog(true); }}
                  variant="primary"
                  icon="plus"
                >
                  {i18n.catalog["text_72052973b127"]}</Button>
              )
            )}
          </>
        }
      />

      <TabNavigation tabs={tabs} activeTab={activeTab} onTabChange={(t) => { setActiveTab(t); setStatusFilter(""); }} />

      {activeTab === "requisitions" ? (
        <Table columns={requisitionColumns} data={requisitions} keyExtractor={(i) => i.id.toString()} emptyMessage={i18n.catalog["text_efac76511420"]} isLoading={isLoading} pagination={{ currentPage, totalPages, onPageChange: setCurrentPage }} />
      ) : (
        <Table columns={applicantColumns} data={applicants} keyExtractor={(i) => i.id.toString()} emptyMessage={i18n.catalog["text_4801dc06cea9"]} isLoading={isLoading} pagination={{ currentPage, totalPages, onPageChange: setCurrentPage }} />
      )}

      {/* Create Requisition Dialog */}
      <Dialog isOpen={showReqDialog} onClose={() => setShowReqDialog(false)} title={i18n.catalog["text_1bf6cf46b69e"]} maxWidth="750px">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label className="block mb-1" style={{ color: "var(--text-secondary)" }}>{i18n.catalog["text_a360f80290e8"]}</Label><TextInput value={reqForm.job_title} onChange={(e) => setReqForm({ ...reqForm, job_title: e.target.value })} /></div>
            <div><Label className="block mb-1" style={{ color: "var(--text-secondary)" }}>{i18n.catalog["text_0771c3ff9336"]}</Label><Select value={reqForm.department_id} onChange={(e) => setReqForm({ ...reqForm, department_id: e.target.value })} placeholder={i18n.catalog["text_d6b8d3e4d508"]} options={departments.map((d: any) => ({ value: d.id.toString(), label: d.name_ar || d.name }))} /></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><Label className="block mb-1" style={{ color: "var(--text-secondary)" }}>{i18n.catalog["text_3f35d015f383"]}</Label><TextInput type="number" min="1" value={reqForm.number_of_positions} onChange={(e) => setReqForm({ ...reqForm, number_of_positions: e.target.value })} /></div>
            <div><Label className="block mb-1" style={{ color: "var(--text-secondary)" }}>{i18n.catalog["text_30f46340df88"]}</Label><Select value={reqForm.employment_type} onChange={(e) => setReqForm({ ...reqForm, employment_type: e.target.value })} options={Object.entries(empTypeLabels).map(([value, label]) => ({ value, label }))} /></div>
            <div><Label className="block mb-1" style={{ color: "var(--text-secondary)" }}>{i18n.catalog["text_90f719b91522"]}</Label><TextInput type="date" value={reqForm.target_start_date} onChange={(e) => setReqForm({ ...reqForm, target_start_date: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label className="block mb-1" style={{ color: "var(--text-secondary)" }}>{i18n.catalog["text_bf32b2e6c77c"]}</Label><TextInput type="number" value={reqForm.budgeted_salary_min} onChange={(e) => setReqForm({ ...reqForm, budgeted_salary_min: e.target.value })} /></div>
            <div><Label className="block mb-1" style={{ color: "var(--text-secondary)" }}>{i18n.catalog["text_1dd7e6760687"]}</Label><TextInput type="number" value={reqForm.budgeted_salary_max} onChange={(e) => setReqForm({ ...reqForm, budgeted_salary_max: e.target.value })} /></div>
          </div>
          <div><Label className="block mb-1" style={{ color: "var(--text-secondary)" }}>{i18n.catalog["text_564db504b95d"]}</Label><Textarea value={reqForm.job_description} onChange={(e) => setReqForm({ ...reqForm, job_description: e.target.value })} rows={3} /></div>
          <div><Label className="block mb-1" style={{ color: "var(--text-secondary)" }}>{i18n.catalog["text_d2790df09d67"]}</Label><Textarea value={reqForm.required_qualifications} onChange={(e) => setReqForm({ ...reqForm, required_qualifications: e.target.value })} rows={2} /></div>
          <div className="flex justify-end gap-2" style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid var(--border-color)" }}><Button variant="secondary" onClick={() => setShowReqDialog(false)}>{i18n.catalog["text_9a30dc2a96b8"]}</Button><Button variant="primary" onClick={handleSaveRequisition} icon="save">{i18n.catalog["text_ddfcaf9d0144"]}</Button></div>
        </div>
      </Dialog>

      {/* Requisition Detail Dialog */}
      <Dialog isOpen={showReqDetail} onClose={() => setShowReqDetail(false)} title={i18n.catalog["text_5e09141e3b4b"]} maxWidth="750px">
        {selectedReq && <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><strong>{i18n.catalog["text_e818dcdaed37"]}</strong> {selectedReq.requisition_number}</div>
            <div><strong>{i18n.catalog["text_651da673b258"]}</strong> {selectedReq.job_title}</div>
            <div><strong>{i18n.catalog["text_7a4353c8677d"]}</strong> {selectedReq.department?.name_ar || "-"}</div>
            <div><strong>{i18n.catalog["text_6326194a8a7b"]}</strong> {empTypeLabels[selectedReq.employment_type] || selectedReq.employment_type}</div>
            <div><strong>{i18n.catalog["text_e0990df52617"]}</strong> {selectedReq.number_of_positions}</div>
            <div><strong>{i18n.catalog["text_02e196bdec60"]}</strong> <span className={`badge ${statusBadges[selectedReq.status]}`}>{statusLabels[selectedReq.status]}</span></div>
            {selectedReq.budgeted_salary_min && <div><strong>{i18n.catalog["text_0cab1a998ab3"]}</strong> {formatCurrency(selectedReq.budgeted_salary_min)} - {formatCurrency(selectedReq.budgeted_salary_max || 0)}</div>}
            {selectedReq.target_start_date && <div><strong>{i18n.catalog["text_0420ca4a0aa9"]}</strong> {formatDate(selectedReq.target_start_date)}</div>}
          </div>
          {selectedReq.job_description && <div><strong>{i18n.catalog["text_3ec7e12fb399"]}</strong><p>{selectedReq.job_description}</p></div>}
          {selectedReq.required_qualifications && <div><strong>{i18n.catalog["text_8f48d00d3523"]}</strong><p>{selectedReq.required_qualifications}</p></div>}
          {selectedReq.applicants && selectedReq.applicants.length > 0 && <div>
            <strong>{i18n.catalog["text_264f6f17f513"]}{selectedReq.applicants.length}):</strong>
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
      <Dialog isOpen={showAppDialog} onClose={() => setShowAppDialog(false)} title={i18n.catalog["text_72052973b127"]} maxWidth="600px">
        <div className="space-y-4">
          <div><Label className="block mb-1" style={{ color: "var(--text-secondary)" }}>{i18n.catalog["text_a7f952a1d6d2"]}</Label>
            <Select
              value={appForm.requisition_id}
              onChange={(e) => setAppForm({ ...appForm, requisition_id: e.target.value })}
              placeholder={i18n.catalog["text_fc4625d4a2fa"]}
              options={requisitions.filter(r => r.status === "approved").map(r => ({ value: r.id.toString(), label: r.job_title }))}
            /></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label className="block mb-1" style={{ color: "var(--text-secondary)" }}>{i18n.catalog["text_304c6f42e8a2"]}</Label><TextInput value={appForm.first_name} onChange={(e) => setAppForm({ ...appForm, first_name: e.target.value })} /></div>
            <div><Label className="block mb-1" style={{ color: "var(--text-secondary)" }}>{i18n.catalog["text_d1c5016eff98"]}</Label><TextInput value={appForm.last_name} onChange={(e) => setAppForm({ ...appForm, last_name: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label className="block mb-1" style={{ color: "var(--text-secondary)" }}>{i18n.catalog["text_0c768b140fba"]}</Label><TextInput type="email" value={appForm.email} onChange={(e) => setAppForm({ ...appForm, email: e.target.value })} /></div>
            <div><Label className="block mb-1" style={{ color: "var(--text-secondary)" }}>{i18n.catalog["text_94b59a5125fb"]}</Label><TextInput value={appForm.phone} onChange={(e) => setAppForm({ ...appForm, phone: e.target.value })} /></div>
          </div>
          <div><Label className="block mb-1" style={{ color: "var(--text-secondary)" }}>{i18n.catalog["text_d446d2dc6b81"]}</Label><Textarea value={appForm.notes} onChange={(e) => setAppForm({ ...appForm, notes: e.target.value })} rows={2} /></div>
          <div className="flex justify-end gap-2" style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid var(--border-color)" }}><Button variant="secondary" onClick={() => setShowAppDialog(false)}>{i18n.catalog["text_9a30dc2a96b8"]}</Button><Button variant="primary" onClick={handleSaveApplicant} icon="save">{i18n.catalog["text_ddfcaf9d0144"]}</Button></div>
        </div>
      </Dialog>

      {/* Applicant Detail Dialog */}
      <Dialog isOpen={showAppDetail} onClose={() => setShowAppDetail(false)} title={i18n.catalog["text_be503f848759"]} maxWidth="600px">
        {selectedApp && <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><strong>{i18n.catalog["text_b0ae3c0ca9a8"]}</strong> {selectedApp.first_name} {selectedApp.last_name}</div>
            <div><strong>{i18n.catalog["text_bf69c1cf3cdb"]}</strong> {selectedApp.email}</div>
            {selectedApp.phone && <div><strong>{i18n.catalog["text_235bf085d7d5"]}</strong> {selectedApp.phone}</div>}
            <div><strong>{i18n.catalog["text_93b4f6b975cf"]}</strong> {selectedApp.requisition?.job_title || "-"}</div>
            <div><strong>{i18n.catalog["text_76b9bf624542"]}</strong> {formatDate(selectedApp.application_date)}</div>
            <div><strong>{i18n.catalog["text_02e196bdec60"]}</strong> <span className={`badge ${statusBadges[selectedApp.status]}`}>{statusLabels[selectedApp.status]}</span></div>
            {selectedApp.match_score && <div><strong>{i18n.catalog["text_4e08ab395aec"]}</strong> {selectedApp.match_score}%</div>}
          </div>
          {selectedApp.screening_notes && <div><strong>{i18n.catalog["text_f0d43ade2b38"]}</strong><p>{selectedApp.screening_notes}</p></div>}
          {selectedApp.interview_notes && <div><strong>{i18n.catalog["text_260443c145c6"]}</strong><p>{selectedApp.interview_notes}</p></div>}
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {canAccess("recruitment", "edit") && (
              <>
                {selectedApp.status === "applied" && <Button variant="primary" onClick={() => { handleUpdateAppStatus(selectedApp.id, "screened"); setShowAppDetail(false); }}>{i18n.catalog["text_eee0654092ac"]}</Button>}
                {selectedApp.status === "screened" && <Button variant="primary" onClick={() => { handleUpdateAppStatus(selectedApp.id, "interview"); setShowAppDetail(false); }}>{i18n.catalog["text_535ed3a7fb8b"]}</Button>}
                {selectedApp.status === "interview" && <Button variant="primary" onClick={() => { handleUpdateAppStatus(selectedApp.id, "offer"); setShowAppDetail(false); }}>{i18n.catalog["text_5002e04d2776"]}</Button>}
                {selectedApp.status === "offer" && <Button variant="primary" onClick={() => { handleUpdateAppStatus(selectedApp.id, "hired"); setShowAppDetail(false); }}>{i18n.catalog["text_169f0341afce"]}</Button>}
                {!["hired", "rejected", "withdrawn"].includes(selectedApp.status) && <Button variant="danger" onClick={() => { handleUpdateAppStatus(selectedApp.id, "rejected"); setShowAppDetail(false); }}>{i18n.catalog["text_eb3b1bcc04e5"]}</Button>}
              </>
            )}
          </div>
        </div>}
      </Dialog>
    </div>
  );
}
