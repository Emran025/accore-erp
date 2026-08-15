"use client";

import { useI18n, catalogMessage } from "@/lib/i18n";
import { PageSubHeader } from "@/components/layout";
import { ActionButtons, Button, Column, Dialog, Label, SearchableSelect, showToast, Table, TabNavigation } from "@/components/ui";
import { TextInput } from "@/components/ui/TextInput";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/select";
import { fetchAPI } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatDate } from "@/lib/utils";
import { useAuthStore } from "@/stores/useAuthStore";
import { useEmployeeStore } from "@/stores/useEmployeeStore";
import { useEffect, useState } from "react";

import type { Employee, WellnessParticipation, WellnessProgram } from "@/types";

const programTypeLabels: Record<string, string> = { steps_challenge: catalogMessage("text_e437d1b71188"), health_challenge: catalogMessage("text_3d68e9f3cab9"), fitness: catalogMessage("text_443246e8e481"), nutrition: catalogMessage("text_8e1bc2fc6aaf"), mental_health: catalogMessage("text_a503a9308bfd"), other: catalogMessage("text_17a9f38e22b6") };
const participationStatusLabels: Record<string, string> = { enrolled: catalogMessage("text_f6aee102d51b"), active: catalogMessage("text_629e90b3af3d"), completed: catalogMessage("text_c2da5684d63b"), dropped: catalogMessage("text_5723c07daa9e") };
const participationStatusBadges: Record<string, string> = { enrolled: "badge-info", active: "badge-success", completed: "badge-secondary", dropped: "badge-danger" };

export function WellnessModule() {
    const { t: i18n } = useI18n();
    const { canAccess } = useAuthStore();
    const [activeTab, setActiveTab] = useState("programs");
    const { allEmployees: employees, loadAllEmployees } = useEmployeeStore();
    const [programs, setPrograms] = useState<WellnessProgram[]>([]);
    const [progLoading, setProgLoading] = useState(false);
    const [progPage, setProgPage] = useState(1);
    const [progTotal, setProgTotal] = useState(1);
    const [showProgDialog, setShowProgDialog] = useState(false);
    const [showProgDetails, setShowProgDetails] = useState(false);
    const [selectedProgram, setSelectedProgram] = useState<WellnessProgram | null>(null);
    const [progForm, setProgForm] = useState({ program_name: "", description: "", program_type: "fitness", start_date: new Date().toISOString().split("T")[0], end_date: "", notes: "" });

    const [participations, setParticipations] = useState<WellnessParticipation[]>([]);
    const [partLoading, setPartLoading] = useState(false);
    const [partPage, setPartPage] = useState(1);
    const [partTotal, setPartTotal] = useState(1);
    const [showPartDialog, setShowPartDialog] = useState(false);
    const [partForm, setPartForm] = useState({ program_id: "", employee_id: "", notes: "" });

    useEffect(() => { loadAllEmployees(); }, [loadAllEmployees]);
    useEffect(() => { loadPrograms(); }, [progPage]);
    useEffect(() => { loadParticipations(); }, [partPage]);

    const loadPrograms = async () => {
        setProgLoading(true);
        try { const r: any = await fetchAPI(`${API_ENDPOINTS.HUMAN_CAPITAL.WELLNESS.PROGRAMS.BASE}?page=${progPage}`); const d = r.data || (Array.isArray(r) ? r : []); setPrograms(d); setProgTotal(Number(r.last_page) || 1); }
        catch { showToast(i18n.catalog["text_9e40277e80ae"], "error"); } finally { setProgLoading(false); }
    };

    const loadParticipations = async () => {
        setPartLoading(true);
        try { const r: any = await fetchAPI(`${API_ENDPOINTS.HUMAN_CAPITAL.WELLNESS.PARTICIPATIONS.BASE}?page=${partPage}`); const d = r.data || (Array.isArray(r) ? r : []); setParticipations(d); setPartTotal(Number(r.last_page) || 1); }
        catch { showToast(i18n.catalog["text_7dbae24b0212"], "error"); } finally { setPartLoading(false); }
    };

    const handleSaveProgram = async () => {
        if (!progForm.program_name || !progForm.end_date) { showToast(i18n.catalog["text_7b758312f829"], "error"); return; }
        try {
            await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.WELLNESS.PROGRAMS.BASE, { method: "POST", body: JSON.stringify(progForm) });
            showToast(i18n.catalog["text_9cb689946ea7"], "success"); setShowProgDialog(false); loadPrograms();
        } catch (e: any) { showToast(e.message || i18n.catalog["text_b0dbba00004b"], "error"); }
    };

    const handleEnroll = async () => {
        if (!partForm.program_id || !partForm.employee_id) { showToast(i18n.catalog["text_f86de97a15c7"], "error"); return; }
        try {
            await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.WELLNESS.PARTICIPATIONS.BASE, { method: "POST", body: JSON.stringify({ program_id: Number(partForm.program_id), employee_id: Number(partForm.employee_id), notes: partForm.notes || undefined }) });
            showToast(i18n.catalog["text_64a61c30b1a6"], "success"); setShowPartDialog(false); loadParticipations();
        } catch (e: any) { showToast(e.message || i18n.catalog["text_860b088d3a72"], "error"); }
    };

    const handleUpdateParticipation = async (id: number, status: string) => {
        try {
            await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.WELLNESS.PARTICIPATIONS.withId(id), { method: "PUT", body: JSON.stringify({ status }) });
            showToast(i18n.catalog["text_1ef1739d24e2"], "success"); loadParticipations();
        } catch (e: any) { showToast(e.message || i18n.catalog["text_96c789857dbf"], "error"); }
    };

    const progColumns: Column<WellnessProgram>[] = [
        { key: "program_name", header: i18n.catalog["text_7c1a6f124eb1"], dataLabel: i18n.catalog["text_52ab09847cf8"] },
        { key: "program_type", header: i18n.catalog["text_caa3f2bb4a36"], dataLabel: i18n.catalog["text_caa3f2bb4a36"], render: (i) => programTypeLabels[i.program_type] || i.program_type },
        { key: "start_date", header: i18n.catalog["text_c9364e4fe281"], dataLabel: i18n.catalog["text_c9364e4fe281"], render: (i) => formatDate(i.start_date) },
        { key: "end_date", header: i18n.catalog["text_43a6b0417696"], dataLabel: i18n.catalog["text_43a6b0417696"], render: (i) => formatDate(i.end_date) },
        { key: "is_active", header: i18n.catalog["text_629e90b3af3d"], dataLabel: i18n.catalog["text_629e90b3af3d"], render: (i) => <span className={`badge ${i.is_active ? "badge-success" : "badge-secondary"}`}>{i.is_active ? i18n.catalog["text_4b2d2c65d365"] : i18n.catalog["text_2bd073516a87"]}</span> },
        { key: "participations", header: i18n.catalog["text_364bc0534cb7"], dataLabel: i18n.catalog["text_364bc0534cb7"], render: (i) => i.participations?.length || 0 },
        {
            key: "id", header: i18n.catalog["text_9f0a0f722601"], dataLabel: i18n.catalog["text_9f0a0f722601"], render: (i) => (
                <ActionButtons
                    actions={[
                        {
                            icon: "eye",
                            title: i18n.catalog["text_29f382c73779"],
                            variant: "view",
                            onClick: () => { setSelectedProgram(i); setShowProgDetails(true); }
                        }
                    ]}
                />
            )
        },
    ];

    const partColumns: Column<WellnessParticipation>[] = [
        { key: "employee", header: i18n.catalog["text_b71a39c832a6"], dataLabel: i18n.catalog["text_b71a39c832a6"], render: (i) => i.employee?.full_name || "-" },
        { key: "program", header: i18n.catalog["text_907a3d449735"], dataLabel: i18n.catalog["text_907a3d449735"], render: (i) => i.program?.program_name || "-" },
        { key: "enrollment_date", header: i18n.catalog["text_b8fcbb3f2d33"], dataLabel: i18n.catalog["text_7dd297215d19"], render: (i) => formatDate(i.enrollment_date) },
        { key: "points", header: i18n.catalog["text_4cf48886fd0e"], dataLabel: i18n.catalog["text_4cf48886fd0e"] },
        { key: "status", header: i18n.catalog["text_c3a4749caed4"], dataLabel: i18n.catalog["text_c3a4749caed4"], render: (i) => <span className={`badge ${participationStatusBadges[i.status]}`}>{participationStatusLabels[i.status]}</span> },
        {
            key: "id", header: i18n.catalog["text_9f0a0f722601"], dataLabel: i18n.catalog["text_9f0a0f722601"], render: (i) => (
                <ActionButtons
                    actions={[
                        ...(canAccess("wellness", "edit") ? [{
                            icon: "play" as const,
                            title: i18n.catalog["text_c3c09fe13363"],
                            variant: "success" as const,
                            onClick: () => handleUpdateParticipation(i.id, "active"),
                            hidden: i.status !== "enrolled"
                        }] : []),
                        ...(canAccess("wellness", "edit") ? [{
                            icon: "check" as const,
                            title: i18n.catalog["text_54536a96c6fc"],
                            variant: "view" as const,
                            onClick: () => handleUpdateParticipation(i.id, "completed"),
                            hidden: i.status !== "active"
                        }] : [])
                    ]}
                />
            )
        },
    ];

    const tabs = [{ key: "programs", label: i18n.catalog["text_aa779d2f84ad"], icon: "heartbeat" }, { key: "participations", label: i18n.catalog["text_67ddeb0f0dc3"], icon: "users" }];

    return (
        <div className="sales-card animate-fade">
            <PageSubHeader
                title={i18n.catalog["text_d6c742e832a0"]}
                titleIcon="heart"
            />
            <TabNavigation tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

            {activeTab === "programs" && <>
                <div style={{ display: "flex", justifyContent: "flex-end", margin: "1rem 0" }}>
                    {canAccess("wellness", "create") && (
                        <Button
                            onClick={() => { setProgForm({ program_name: "", description: "", program_type: "fitness", start_date: new Date().toISOString().split("T")[0], end_date: "", notes: "" }); setShowProgDialog(true); }}
                            variant="primary"
                            icon="plus"
                        >
                            {i18n.catalog["text_0ce33d628575"]}</Button>
                    )}
                </div>
                <Table columns={progColumns} data={programs} keyExtractor={(i) => i.id.toString()} emptyMessage={i18n.catalog["text_128ddb4db829"]} isLoading={progLoading} pagination={{ currentPage: progPage, totalPages: progTotal, onPageChange: setProgPage }} />
            </>}

            {activeTab === "participations" && <>
                <div style={{ display: "flex", justifyContent: "flex-end", margin: "1rem 0" }}>
                    {canAccess("wellness", "create") && (
                        <Button
                            onClick={() => { setPartForm({ program_id: "", employee_id: "", notes: "" }); setShowPartDialog(true); }}
                            variant="primary"
                            icon="plus"
                        >
                            {i18n.catalog["text_0dda4d6cde08"]}</Button>
                    )}
                </div>
                <Table columns={partColumns} data={participations} keyExtractor={(i) => i.id.toString()} emptyMessage={i18n.catalog["text_bd8b80b0617b"]} isLoading={partLoading} pagination={{ currentPage: partPage, totalPages: partTotal, onPageChange: setPartPage }} />
            </>}

            {/* Create Program Dialog */}
            <Dialog isOpen={showProgDialog} onClose={() => setShowProgDialog(false)} title={i18n.catalog["text_b20b9390d455"]} maxWidth="600px">
                <div className="space-y-4">
                    <TextInput label={i18n.catalog["text_99ae024920fb"]} value={progForm.program_name} onChange={(e) => setProgForm({ ...progForm, program_name: e.target.value })} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select label={i18n.catalog["text_caa3f2bb4a36"]} value={progForm.program_type} onChange={(e) => setProgForm({ ...progForm, program_type: e.target.value })} options={Object.entries(programTypeLabels).map(([value, label]) => ({ value, label }))} />
                        <TextInput label={i18n.catalog["text_c9364e4fe281"]} type="date" value={progForm.start_date} onChange={(e) => setProgForm({ ...progForm, start_date: e.target.value })} />
                    </div>
                    <TextInput label={i18n.catalog["text_004e50125d66"]} type="date" value={progForm.end_date} onChange={(e) => setProgForm({ ...progForm, end_date: e.target.value })} />
                    <Textarea label={i18n.catalog["text_95023fc76e1b"]} value={progForm.description} onChange={(e) => setProgForm({ ...progForm, description: e.target.value })} rows={3} />
                    <div className="flex justify-end gap-2" style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid var(--border-color)" }}><Button variant="secondary" onClick={() => setShowProgDialog(false)}>{i18n.catalog["text_9a30dc2a96b8"]}</Button><Button variant="primary" onClick={handleSaveProgram} icon="save">{i18n.catalog["text_ddfcaf9d0144"]}</Button></div>
                </div>
            </Dialog>

            {/* Program Details */}
            <Dialog isOpen={showProgDetails} onClose={() => setShowProgDetails(false)} title={i18n.catalog["text_f2539a2bcf79"]} maxWidth="700px">
                {selectedProgram && <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><strong>{i18n.catalog["text_b0ae3c0ca9a8"]}</strong> {selectedProgram.program_name}</div>
                        <div><strong>{i18n.catalog["text_0e20d829bef2"]}</strong> {programTypeLabels[selectedProgram.program_type]}</div>
                        <div><strong>{i18n.catalog["text_389190a30041"]}</strong> {formatDate(selectedProgram.start_date)}</div>
                        <div><strong>{i18n.catalog["text_defe7b237e9d"]}</strong> {formatDate(selectedProgram.end_date)}</div>
                        <div><strong>{i18n.catalog["text_e51dbd6a615c"]}</strong> {selectedProgram.is_active ? i18n.catalog["text_4b2d2c65d365"] : i18n.catalog["text_2bd073516a87"]}</div>
                        <div><strong>{i18n.catalog["text_ada2d86c8dc1"]}</strong> {selectedProgram.participations?.length || 0}</div>
                    </div>
                    {selectedProgram.description && <div><strong>{i18n.catalog["text_3ec7e12fb399"]}</strong><p>{selectedProgram.description}</p></div>}
                </div>}
            </Dialog>

            {/* Enroll Dialog */}
            <Dialog isOpen={showPartDialog} onClose={() => setShowPartDialog(false)} title={i18n.catalog["text_0dda4d6cde08"]} maxWidth="500px">
                <div className="space-y-4">
                    <Select label={i18n.catalog["text_ba071c8abb4f"]} value={partForm.program_id} onChange={(e) => setPartForm({ ...partForm, program_id: e.target.value })} placeholder={i18n.catalog["text_95a8de6cb083"]} options={programs.filter(p => p.is_active).map(p => ({ value: p.id.toString(), label: p.program_name }))} />
                    <div className="flex flex-col gap-1">
                        <Label className="text-secondary mb-1">{i18n.catalog["text_972803dc7d86"]}</Label>
                        <SearchableSelect options={employees.map((e: Employee) => ({ value: e.id.toString(), label: e.full_name }))} value={partForm.employee_id} onChange={(v) => setPartForm(p => ({ ...p, employee_id: v?.toString() || "" }))} placeholder={i18n.catalog["text_dee783929dea"]} />
                    </div>
                    <Textarea label={i18n.catalog["text_d446d2dc6b81"]} value={partForm.notes} onChange={(e) => setPartForm({ ...partForm, notes: e.target.value })} rows={2} />
                    <div className="flex justify-end gap-2" style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid var(--border-color)" }}><Button variant="secondary" onClick={() => setShowPartDialog(false)}>{i18n.catalog["text_9a30dc2a96b8"]}</Button><Button variant="primary" onClick={handleEnroll} icon="save">{i18n.catalog["text_dcf52d4105c1"]}</Button></div>
                </div>
            </Dialog>
        </div>
    );
}
