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

const programTypeLabels: Record<string, string> = { steps_challenge: catalogMessage("humanCapital.wellness.stepChallenge"), health_challenge: catalogMessage("humanCapital.wellness.healthChallenge"), fitness: catalogMessage("humanCapital.wellness.fitness"), nutrition: catalogMessage("humanCapital.wellness.feed"), mental_health: catalogMessage("humanCapital.wellness.mentalHealth"), other: catalogMessage("common.general.other") };
const participationStatusLabels: Record<string, string> = { enrolled: catalogMessage("common.general.registered"), active: catalogMessage("common.general.active"), completed: catalogMessage("common.general.completed"), dropped: catalogMessage("common.general.withdraw") };
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
        catch { showToast(i18n.catalog["humanCapital.wellness.failedLoadPrograms"], "error"); } finally { setProgLoading(false); }
    };

    const loadParticipations = async () => {
        setPartLoading(true);
        try { const r: any = await fetchAPI(`${API_ENDPOINTS.HUMAN_CAPITAL.WELLNESS.PARTICIPATIONS.BASE}?page=${partPage}`); const d = r.data || (Array.isArray(r) ? r : []); setParticipations(d); setPartTotal(Number(r.last_page) || 1); }
        catch { showToast(i18n.catalog["humanCapital.wellness.failedLoadPosts"], "error"); } finally { setPartLoading(false); }
    };

    const handleSaveProgram = async () => {
        if (!progForm.program_name || !progForm.end_date) { showToast(i18n.catalog["common.general.pleaseFillRequiredFields.alternative2"], "error"); return; }
        try {
            await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.WELLNESS.PROGRAMS.BASE, { method: "POST", body: JSON.stringify(progForm) });
            showToast(i18n.catalog["humanCapital.wellness.programCreated"], "success"); setShowProgDialog(false); loadPrograms();
        } catch (e: any) { showToast(e.message || i18n.catalog["common.general.failedSave"], "error"); }
    };

    const handleEnroll = async () => {
        if (!partForm.program_id || !partForm.employee_id) { showToast(i18n.catalog["humanCapital.wellness.pleaseSelectProgramEmployee"], "error"); return; }
        try {
            await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.WELLNESS.PARTICIPATIONS.BASE, { method: "POST", body: JSON.stringify({ program_id: Number(partForm.program_id), employee_id: Number(partForm.employee_id), notes: partForm.notes || undefined }) });
            showToast(i18n.catalog["humanCapital.wellness.registeredSuccessfully"], "success"); setShowPartDialog(false); loadParticipations();
        } catch (e: any) { showToast(e.message || i18n.catalog["common.general.registrationFailed"], "error"); }
    };

    const handleUpdateParticipation = async (id: number, status: string) => {
        try {
            await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.WELLNESS.PARTICIPATIONS.withId(id), { method: "PUT", body: JSON.stringify({ status }) });
            showToast(i18n.catalog["common.general.updated"], "success"); loadParticipations();
        } catch (e: any) { showToast(e.message || i18n.catalog["common.general.updateFailed"], "error"); }
    };

    const progColumns: Column<WellnessProgram>[] = [
        { key: "program_name", header: i18n.catalog["humanCapital.wellness.programName"], dataLabel: i18n.catalog["common.general.name"] },
        { key: "program_type", header: i18n.catalog["common.general.type.alternative3"], dataLabel: i18n.catalog["common.general.type.alternative3"], render: (i) => programTypeLabels[i.program_type] || i.program_type },
        { key: "start_date", header: i18n.catalog["common.general.start.alternative3"], dataLabel: i18n.catalog["common.general.start.alternative3"], render: (i) => formatDate(i.start_date) },
        { key: "end_date", header: i18n.catalog["common.general.end.alternative3"], dataLabel: i18n.catalog["common.general.end.alternative3"], render: (i) => formatDate(i.end_date) },
        { key: "is_active", header: i18n.catalog["common.general.active"], dataLabel: i18n.catalog["common.general.active"], render: (i) => <span className={`badge ${i.is_active ? "badge-success" : "badge-secondary"}`}>{i.is_active ? i18n.catalog["common.general.yes"] : i18n.catalog["common.general.no"]}</span> },
        { key: "participations", header: i18n.catalog["common.general.participants"], dataLabel: i18n.catalog["common.general.participants"], render: (i) => i.participations?.length || 0 },
        {
            key: "id", header: i18n.catalog["common.general.actions.alternative2"], dataLabel: i18n.catalog["common.general.actions.alternative2"], render: (i) => (
                <ActionButtons
                    actions={[
                        {
                            icon: "eye",
                            title: i18n.catalog["common.general.details"],
                            variant: "view",
                            onClick: () => { setSelectedProgram(i); setShowProgDetails(true); }
                        }
                    ]}
                />
            )
        },
    ];

    const partColumns: Column<WellnessParticipation>[] = [
        { key: "employee", header: i18n.catalog["common.general.employee.alternative3"], dataLabel: i18n.catalog["common.general.employee.alternative3"], render: (i) => i.employee?.full_name || "-" },
        { key: "program", header: i18n.catalog["common.general.program"], dataLabel: i18n.catalog["common.general.program"], render: (i) => i.program?.program_name || "-" },
        { key: "enrollment_date", header: i18n.catalog["common.general.registrationDate"], dataLabel: i18n.catalog["humanCapital.wellness.registration"], render: (i) => formatDate(i.enrollment_date) },
        { key: "points", header: i18n.catalog["common.general.points"], dataLabel: i18n.catalog["common.general.points"] },
        { key: "status", header: i18n.catalog["common.general.status.alternative2"], dataLabel: i18n.catalog["common.general.status.alternative2"], render: (i) => <span className={`badge ${participationStatusBadges[i.status]}`}>{participationStatusLabels[i.status]}</span> },
        {
            key: "id", header: i18n.catalog["common.general.actions.alternative2"], dataLabel: i18n.catalog["common.general.actions.alternative2"], render: (i) => (
                <ActionButtons
                    actions={[
                        ...(canAccess("wellness", "edit") ? [{
                            icon: "play" as const,
                            title: i18n.catalog["common.general.activate"],
                            variant: "success" as const,
                            onClick: () => handleUpdateParticipation(i.id, "active"),
                            hidden: i.status !== "enrolled"
                        }] : []),
                        ...(canAccess("wellness", "edit") ? [{
                            icon: "check" as const,
                            title: i18n.catalog["common.general.complete"],
                            variant: "view" as const,
                            onClick: () => handleUpdateParticipation(i.id, "completed"),
                            hidden: i.status !== "active"
                        }] : [])
                    ]}
                />
            )
        },
    ];

    const tabs = [{ key: "programs", label: i18n.catalog["humanCapital.wellness.programs"], icon: "heartbeat" }, { key: "participations", label: i18n.catalog["humanCapital.wellness.posts"], icon: "users" }];

    return (
        <div className="sales-card animate-fade">
            <PageSubHeader
                title={i18n.catalog["humanCapital.wellness.wellnessPrograms"]}
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
                            {i18n.catalog["humanCapital.wellness.newProgram"]}</Button>
                    )}
                </div>
                <Table columns={progColumns} data={programs} keyExtractor={(i) => i.id.toString()} emptyMessage={i18n.catalog["humanCapital.wellness.noPrograms"]} isLoading={progLoading} pagination={{ currentPage: progPage, totalPages: progTotal, onPageChange: setProgPage }} />
            </>}

            {activeTab === "participations" && <>
                <div style={{ display: "flex", justifyContent: "flex-end", margin: "1rem 0" }}>
                    {canAccess("wellness", "create") && (
                        <Button
                            onClick={() => { setPartForm({ program_id: "", employee_id: "", notes: "" }); setShowPartDialog(true); }}
                            variant="primary"
                            icon="plus"
                        >
                            {i18n.catalog["common.general.registerParticipant"]}</Button>
                    )}
                </div>
                <Table columns={partColumns} data={participations} keyExtractor={(i) => i.id.toString()} emptyMessage={i18n.catalog["humanCapital.wellness.noEntries"]} isLoading={partLoading} pagination={{ currentPage: partPage, totalPages: partTotal, onPageChange: setPartPage }} />
            </>}

            {/* Create Program Dialog */}
            <Dialog isOpen={showProgDialog} onClose={() => setShowProgDialog(false)} title={i18n.catalog["humanCapital.wellness.newAfiaProgram"]} maxWidth="600px">
                <div className="space-y-4">
                    <TextInput label={i18n.catalog["humanCapital.wellness.programName.alternative2"]} value={progForm.program_name} onChange={(e) => setProgForm({ ...progForm, program_name: e.target.value })} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select label={i18n.catalog["common.general.type.alternative3"]} value={progForm.program_type} onChange={(e) => setProgForm({ ...progForm, program_type: e.target.value })} options={Object.entries(programTypeLabels).map(([value, label]) => ({ value, label }))} />
                        <TextInput label={i18n.catalog["common.general.start.alternative3"]} type="date" value={progForm.start_date} onChange={(e) => setProgForm({ ...progForm, start_date: e.target.value })} />
                    </div>
                    <TextInput label={i18n.catalog["common.general.end"]} type="date" value={progForm.end_date} onChange={(e) => setProgForm({ ...progForm, end_date: e.target.value })} />
                    <Textarea label={i18n.catalog["common.general.description.alternative2"]} value={progForm.description} onChange={(e) => setProgForm({ ...progForm, description: e.target.value })} rows={3} />
                    <div className="flex justify-end gap-2" style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid var(--border-color)" }}><Button variant="secondary" onClick={() => setShowProgDialog(false)}>{i18n.catalog["common.general.cancel"]}</Button><Button variant="primary" onClick={handleSaveProgram} icon="save">{i18n.catalog["common.general.save"]}</Button></div>
                </div>
            </Dialog>

            {/* Program Details */}
            <Dialog isOpen={showProgDetails} onClose={() => setShowProgDetails(false)} title={i18n.catalog["humanCapital.wellness.programDetails"]} maxWidth="700px">
                {selectedProgram && <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><strong>{i18n.catalog["common.general.name.alternative2"]}</strong> {selectedProgram.program_name}</div>
                        <div><strong>{i18n.catalog["common.general.type"]}</strong> {programTypeLabels[selectedProgram.program_type]}</div>
                        <div><strong>{i18n.catalog["common.general.start"]}</strong> {formatDate(selectedProgram.start_date)}</div>
                        <div><strong>{i18n.catalog["common.general.end.alternative5"]}</strong> {formatDate(selectedProgram.end_date)}</div>
                        <div><strong>{i18n.catalog["common.general.active.alternative5"]}</strong> {selectedProgram.is_active ? i18n.catalog["common.general.yes"] : i18n.catalog["common.general.no"]}</div>
                        <div><strong>{i18n.catalog["humanCapital.wellness.participants"]}</strong> {selectedProgram.participations?.length || 0}</div>
                    </div>
                    {selectedProgram.description && <div><strong>{i18n.catalog["common.general.description"]}</strong><p>{selectedProgram.description}</p></div>}
                </div>}
            </Dialog>

            {/* Enroll Dialog */}
            <Dialog isOpen={showPartDialog} onClose={() => setShowPartDialog(false)} title={i18n.catalog["common.general.registerParticipant"]} maxWidth="500px">
                <div className="space-y-4">
                    <Select label={i18n.catalog["humanCapital.wellness.program"]} value={partForm.program_id} onChange={(e) => setPartForm({ ...partForm, program_id: e.target.value })} placeholder={i18n.catalog["humanCapital.wellness.selectProgram"]} options={programs.filter(p => p.is_active).map(p => ({ value: p.id.toString(), label: p.program_name }))} />
                    <div className="flex flex-col gap-1">
                        <Label className="text-secondary mb-1">{i18n.catalog["common.general.employee"]}</Label>
                        <SearchableSelect options={employees.map((e: Employee) => ({ value: e.id.toString(), label: e.full_name }))} value={partForm.employee_id} onChange={(v) => setPartForm(p => ({ ...p, employee_id: v?.toString() || "" }))} placeholder={i18n.catalog["common.general.selectEmployee"]} />
                    </div>
                    <Textarea label={i18n.catalog["common.general.notes.alternative2"]} value={partForm.notes} onChange={(e) => setPartForm({ ...partForm, notes: e.target.value })} rows={2} />
                    <div className="flex justify-end gap-2" style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid var(--border-color)" }}><Button variant="secondary" onClick={() => setShowPartDialog(false)}>{i18n.catalog["common.general.cancel"]}</Button><Button variant="primary" onClick={handleEnroll} icon="save">{i18n.catalog["common.general.register"]}</Button></div>
                </div>
            </Dialog>
        </div>
    );
}
