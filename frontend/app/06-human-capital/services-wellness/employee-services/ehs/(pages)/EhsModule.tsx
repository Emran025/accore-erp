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
import type { EhsIncident, Employee, EmployeeHealthRecord, PpeRecord } from "@/types";
import { useEffect, useState } from "react";

const incidentTypeLabels: Record<string, string> = { accident: catalogMessage("humanCapital.ehs.incident"), near_miss: catalogMessage("humanCapital.ehs.nearMiss"), injury: catalogMessage("humanCapital.ehs.injury"), illness: catalogMessage("humanCapital.ehs.illness"), property_damage: catalogMessage("humanCapital.ehs.propertyDamage"), environmental: catalogMessage("humanCapital.ehs.environmental"), other: catalogMessage("common.general.other") };
const severityLabels: Record<string, string> = { minor: catalogMessage("humanCapital.ehs.minor"), moderate: catalogMessage("common.general.average"), serious: catalogMessage("humanCapital.ehs.critical"), critical: catalogMessage("common.general.critical"), fatal: catalogMessage("humanCapital.ehs.killer") };
const severityBadges: Record<string, string> = { minor: "badge-secondary", moderate: "badge-warning", serious: "badge-danger", critical: "badge-danger", fatal: "badge-danger" };
const incidentStatusLabels: Record<string, string> = { reported: catalogMessage("humanCapital.ehs.reportedAmount"), under_investigation: catalogMessage("common.general.underInvestigation"), resolved: catalogMessage("common.general.resolved"), closed: catalogMessage("common.general.closed.alternative2") };
const incidentStatusBadges: Record<string, string> = { reported: "badge-warning", under_investigation: "badge-info", resolved: "badge-success", closed: "badge-secondary" };
const healthRecordTypeLabels: Record<string, string> = { vaccination: catalogMessage("humanCapital.ehs.vaccination"), medical_exam: catalogMessage("humanCapital.ehs.medicalExamination"), drug_test: catalogMessage("humanCapital.ehs.drugTest"), health_screening: catalogMessage("humanCapital.ehs.healthCheck"), other: catalogMessage("common.general.other") };
const ppeTypeLabels: Record<string, string> = { helmet: catalogMessage("humanCapital.ehs.helmet"), safety_shoes: catalogMessage("humanCapital.ehs.safetyShoe"), gloves: catalogMessage("humanCapital.ehs.gloves"), goggles: catalogMessage("humanCapital.ehs.protectiveEyewear"), vest: catalogMessage("humanCapital.ehs.jacket"), mask: catalogMessage("humanCapital.ehs.mask"), other: catalogMessage("common.general.other") };

export function EhsModule() {
    const { t: i18n } = useI18n();
    const [activeTab, setActiveTab] = useState("incidents");
    const { allEmployees: employees, loadAllEmployees } = useEmployeeStore();
    const { canAccess } = useAuthStore();
    // Incidents
    const [incidents, setIncidents] = useState<EhsIncident[]>([]);
    const [incLoading, setIncLoading] = useState(false);
    const [incPage, setIncPage] = useState(1);
    const [incTotal, setIncTotal] = useState(1);
    const [showIncDialog, setShowIncDialog] = useState(false);
    const [showIncDetails, setShowIncDetails] = useState(false);
    const [selectedIncident, setSelectedIncident] = useState<EhsIncident | null>(null);
    const [incForm, setIncForm] = useState({ employee_id: "", incident_type: "accident", incident_date: new Date().toISOString().split("T")[0], incident_time: "", location: "", description: "", severity: "minor", immediate_action_taken: "", osha_reportable: false, notes: "" });
    // Health Records
    const [healthRecords, setHealthRecords] = useState<EmployeeHealthRecord[]>([]);
    const [hrLoading, setHrLoading] = useState(false);
    const [hrPage, setHrPage] = useState(1);
    const [hrTotal, setHrTotal] = useState(1);
    const [showHrDialog, setShowHrDialog] = useState(false);
    const [hrForm, setHrForm] = useState({ employee_id: "", record_type: "medical_exam", record_date: new Date().toISOString().split("T")[0], expiry_date: "", provider_name: "", results: "", notes: "" });
    // PPE
    const [ppeRecords, setPpeRecords] = useState<PpeRecord[]>([]);
    const [ppeLoading, setPpeLoading] = useState(false);
    const [ppePage, setPpePage] = useState(1);
    const [ppeTotal, setPpeTotal] = useState(1);
    const [showPpeDialog, setShowPpeDialog] = useState(false);
    const [ppeForm, setPpeForm] = useState({ employee_id: "", ppe_item: "", ppe_type: "helmet", issue_date: new Date().toISOString().split("T")[0], expiry_date: "", notes: "" });

    useEffect(() => { loadAllEmployees(); }, [loadAllEmployees]);
    useEffect(() => { loadIncidents(); }, [incPage]);
    useEffect(() => { loadHealthRecords(); }, [hrPage]);
    useEffect(() => { loadPpeRecords(); }, [ppePage]);

    const loadIncidents = async () => {
        setIncLoading(true);
        try { const r: any = await fetchAPI(`${API_ENDPOINTS.HUMAN_CAPITAL.EHS.INCIDENTS.BASE}?page=${incPage}`); const d = r.data || (Array.isArray(r) ? r : []); setIncidents(d); setIncTotal(Number(r.last_page) || 1); }
        catch { showToast(i18n.catalog["humanCapital.ehs.failedLoadIncidents"], "error"); } finally { setIncLoading(false); }
    };
    const loadHealthRecords = async () => {
        setHrLoading(true);
        try { const r: any = await fetchAPI(`${API_ENDPOINTS.HUMAN_CAPITAL.EHS.HEALTH_RECORDS.BASE}?page=${hrPage}`); const d = r.data || (Array.isArray(r) ? r : []); setHealthRecords(d); setHrTotal(Number(r.last_page) || 1); }
        catch { showToast(i18n.catalog["humanCapital.ehs.failedLoadRecords"], "error"); } finally { setHrLoading(false); }
    };
    const loadPpeRecords = async () => {
        setPpeLoading(true);
        try { const r: any = await fetchAPI(`${API_ENDPOINTS.HUMAN_CAPITAL.EHS.PPE.BASE}?page=${ppePage}`); const d = r.data || (Array.isArray(r) ? r : []); setPpeRecords(d); setPpeTotal(Number(r.last_page) || 1); }
        catch { showToast(i18n.catalog["humanCapital.ehs.failedLoadProtectiveEquipment"], "error"); } finally { setPpeLoading(false); }
    };

    const handleSaveIncident = async () => {
        if (!incForm.description || !incForm.incident_date) { showToast(i18n.catalog["common.general.pleaseFillRequiredFields.alternative2"], "error"); return; }
        try {
            await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.EHS.INCIDENTS.BASE, { method: "POST", body: JSON.stringify({ ...incForm, employee_id: incForm.employee_id ? Number(incForm.employee_id) : undefined }) });
            showToast(i18n.catalog["humanCapital.ehs.incidentRecordedSuccessfully"], "success"); setShowIncDialog(false); loadIncidents();
        } catch (e: any) { showToast(e.message || i18n.catalog["common.general.registrationFailed"], "error"); }
    };

    const handleUpdateIncident = async (id: number, data: any) => {
        try { await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.EHS.INCIDENTS.withId(id), { method: "PUT", body: JSON.stringify(data) }); showToast(i18n.catalog["common.general.updated"], "success"); loadIncidents(); }
        catch (e: any) { showToast(e.message || i18n.catalog["common.general.updateFailed"], "error"); }
    };

    const handleSaveHealthRecord = async () => {
        if (!hrForm.employee_id) { showToast(i18n.catalog["common.general.pleaseSelectEmployee"], "error"); return; }
        try {
            await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.EHS.HEALTH_RECORDS.BASE, { method: "POST", body: JSON.stringify({ ...hrForm, employee_id: Number(hrForm.employee_id) }) });
            showToast(i18n.catalog["humanCapital.ehs.recordAdded"], "success"); setShowHrDialog(false); loadHealthRecords();
        } catch (e: any) { showToast(e.message || i18n.catalog["common.general.failedSave"], "error"); }
    };

    const handleSavePpe = async () => {
        if (!ppeForm.employee_id || !ppeForm.ppe_item) { showToast(i18n.catalog["common.general.pleaseFillRequiredFields.alternative2"], "error"); return; }
        try {
            await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.EHS.PPE.BASE, { method: "POST", body: JSON.stringify({ ...ppeForm, employee_id: Number(ppeForm.employee_id) }) });
            showToast(i18n.catalog["humanCapital.ehs.equipmentRegistered"], "success"); setShowPpeDialog(false); loadPpeRecords();
        } catch (e: any) { showToast(e.message || i18n.catalog["common.general.failedSave"], "error"); }
    };

    const incColumns: Column<EhsIncident>[] = [
        { key: "incident_number", header: i18n.catalog["humanCapital.ehs.incidentNumber"], dataLabel: i18n.catalog["humanCapital.ehs.number"] },
        { key: "incident_type", header: i18n.catalog["common.general.type.alternative3"], dataLabel: i18n.catalog["common.general.type.alternative3"], render: (i) => incidentTypeLabels[i.incident_type] || i.incident_type },
        { key: "employee", header: i18n.catalog["common.general.employee.alternative3"], dataLabel: i18n.catalog["common.general.employee.alternative3"], render: (i) => i.employee?.full_name || "-" },
        { key: "incident_date", header: i18n.catalog["common.general.date.alternative7"], dataLabel: i18n.catalog["common.general.date.alternative7"], render: (i) => formatDate(i.incident_date) },
        { key: "severity", header: i18n.catalog["common.general.severity"], dataLabel: i18n.catalog["common.general.severity"], render: (i) => <span className={`badge ${severityBadges[i.severity]}`}>{severityLabels[i.severity]}</span> },
        { key: "status", header: i18n.catalog["common.general.status.alternative2"], dataLabel: i18n.catalog["common.general.status.alternative2"], render: (i) => <span className={`badge ${incidentStatusBadges[i.status]}`}>{incidentStatusLabels[i.status]}</span> },
        {
            key: "id", header: i18n.catalog["common.general.actions.alternative2"], dataLabel: i18n.catalog["common.general.actions.alternative2"], render: (i) => (
                <ActionButtons
                    actions={[
                        {
                            icon: "eye",
                            title: i18n.catalog["common.general.details"],
                            variant: "view",
                            onClick: () => { setSelectedIncident(i); setShowIncDetails(true); }
                        },
                        ...(canAccess("ehs", "edit") ? [{
                            icon: "search" as const,
                            title: i18n.catalog["humanCapital.ehs.startInvestigation"],
                            variant: "primary" as const,
                            onClick: () => handleUpdateIncident(i.id, { status: "under_investigation" }),
                            hidden: i.status !== "reported"
                        }] : []),
                        ...(canAccess("ehs", "edit") ? [{
                            icon: "check" as const,
                            title: i18n.catalog["common.general.resolved"],
                            variant: "success" as const,
                            onClick: () => handleUpdateIncident(i.id, { status: "resolved" }),
                            hidden: i.status !== "under_investigation"
                        }] : [])
                    ]}
                />
            )
        },
    ];

    const hrColumns: Column<EmployeeHealthRecord>[] = [
        { key: "employee", header: i18n.catalog["common.general.employee.alternative3"], dataLabel: i18n.catalog["common.general.employee.alternative3"], render: (i) => i.employee?.full_name || "-" },
        { key: "record_type", header: i18n.catalog["common.general.type.alternative3"], dataLabel: i18n.catalog["common.general.type.alternative3"], render: (i) => healthRecordTypeLabels[i.record_type] || i.record_type },
        { key: "record_date", header: i18n.catalog["common.general.date.alternative7"], dataLabel: i18n.catalog["common.general.date.alternative7"], render: (i) => formatDate(i.record_date) },
        { key: "expiry_date", header: i18n.catalog["common.general.expiration"], dataLabel: i18n.catalog["common.general.end.alternative4"], render: (i) => i.expiry_date ? formatDate(i.expiry_date) : "-" },
        { key: "provider_name", header: i18n.catalog["common.general.serviceProvider"], dataLabel: i18n.catalog["common.general.submitted.alternative2"], render: (i) => i.provider_name || "-" },
    ];

    const ppeColumns: Column<PpeRecord>[] = [
        { key: "employee", header: i18n.catalog["common.general.employee.alternative3"], dataLabel: i18n.catalog["common.general.employee.alternative3"], render: (i) => i.employee?.full_name || "-" },
        { key: "ppe_item", header: i18n.catalog["common.general.equipment.alternative2"], dataLabel: i18n.catalog["common.general.equipment.alternative2"] },
        { key: "ppe_type", header: i18n.catalog["common.general.type.alternative3"], dataLabel: i18n.catalog["common.general.type.alternative3"], render: (i) => ppeTypeLabels[i.ppe_type] || i.ppe_type },
        { key: "issue_date", header: i18n.catalog["common.general.issueDate"], dataLabel: i18n.catalog["humanCapital.ehs.version"], render: (i) => formatDate(i.issue_date) },
        { key: "expiry_date", header: i18n.catalog["common.general.end.alternative4"], dataLabel: i18n.catalog["common.general.end.alternative4"], render: (i) => i.expiry_date ? formatDate(i.expiry_date) : "-" },
        { key: "status", header: i18n.catalog["common.general.status.alternative2"], dataLabel: i18n.catalog["common.general.status.alternative2"], render: (i) => <span className={`badge ${i.status === "issued" ? "badge-success" : "badge-secondary"}`}>{i.status === "issued" ? i18n.catalog["humanCapital.ehs.issued"] : i.status}</span> },
    ];

    const tabs = [{ key: "incidents", label: i18n.catalog["humanCapital.ehs.incidents"], icon: "alert" }, { key: "health", label: i18n.catalog["humanCapital.ehs.healthRecords"], icon: "activity" }, { key: "ppe", label: i18n.catalog["humanCapital.ehs.protectiveEquipment"], icon: "hard-hat" }];

    return (
        <div className="sales-card animate-fade">
            <PageSubHeader
                title={i18n.catalog["humanCapital.ehs.environmentHealthSafety"]}
                titleIcon="shield-check"
            />
            <TabNavigation tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

            {activeTab === "incidents" && <>
                <div style={{ display: "flex", justifyContent: "flex-end", margin: "1rem 0" }}>
                    {canAccess("ehs", "create") && (
                        <Button onClick={() => { setIncForm({ employee_id: "", incident_type: "accident", incident_date: new Date().toISOString().split("T")[0], incident_time: "", location: "", description: "", severity: "minor", immediate_action_taken: "", osha_reportable: false, notes: "" }); setShowIncDialog(true); }} variant="primary" icon="plus">{i18n.catalog["common.general.logIncident"]}</Button>
                    )}
                </div>
                <Table columns={incColumns} data={incidents} keyExtractor={(i) => i.id.toString()} emptyMessage={i18n.catalog["humanCapital.ehs.noIncidents"]} isLoading={incLoading} pagination={{ currentPage: incPage, totalPages: incTotal, onPageChange: setIncPage }} />
            </>}

            {activeTab === "health" && <>
                <div style={{ display: "flex", justifyContent: "flex-end", margin: "1rem 0" }}>
                    {canAccess("ehs", "create") && (
                        <Button onClick={() => { setHrForm({ employee_id: "", record_type: "medical_exam", record_date: new Date().toISOString().split("T")[0], expiry_date: "", provider_name: "", results: "", notes: "" }); setShowHrDialog(true); }} variant="primary" icon="plus">{i18n.catalog["common.general.addRecord"]}</Button>
                    )}
                </div>
                <Table columns={hrColumns} data={healthRecords} keyExtractor={(i) => i.id.toString()} emptyMessage={i18n.catalog["common.general.noRecords"]} isLoading={hrLoading} pagination={{ currentPage: hrPage, totalPages: hrTotal, onPageChange: setHrPage }} />
            </>}

            {activeTab === "ppe" && <>
                <div style={{ display: "flex", justifyContent: "flex-end", margin: "1rem 0" }}>
                    {canAccess("ehs", "create") && (
                        <Button onClick={() => { setPpeForm({ employee_id: "", ppe_item: "", ppe_type: "helmet", issue_date: new Date().toISOString().split("T")[0], expiry_date: "", notes: "" }); setShowPpeDialog(true); }} variant="primary" icon="plus">{i18n.catalog["humanCapital.ehs.registerEquipment"]}</Button>
                    )}
                </div>
                <Table columns={ppeColumns} data={ppeRecords} keyExtractor={(i) => i.id.toString()} emptyMessage={i18n.catalog["humanCapital.ehs.noEquipment"]} isLoading={ppeLoading} pagination={{ currentPage: ppePage, totalPages: ppeTotal, onPageChange: setPpePage }} />
            </>}

            {/* Incident Dialog */}
            <Dialog isOpen={showIncDialog} onClose={() => setShowIncDialog(false)} title={i18n.catalog["common.general.logIncident"]} maxWidth="700px">
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <Label className="text-secondary mb-1">{i18n.catalog["common.general.employee.alternative3"]}</Label>
                            <SearchableSelect options={employees.map((e: Employee) => ({ value: e.id.toString(), label: e.full_name }))} value={incForm.employee_id} onChange={(v) => setIncForm(p => ({ ...p, employee_id: v?.toString() || "" }))} placeholder={i18n.catalog["common.general.optional"]} />
                        </div>
                        <Select
                            label={i18n.catalog["humanCapital.ehs.incidentType"]}
                            value={incForm.incident_type}
                            onChange={(e) => setIncForm({ ...incForm, incident_type: e.target.value })}
                            options={Object.entries(incidentTypeLabels).map(([value, label]) => ({ value, label }))}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <TextInput label={i18n.catalog["common.general.date.alternative3"]} type="date" value={incForm.incident_date} onChange={(e) => setIncForm({ ...incForm, incident_date: e.target.value })} />
                        <Select
                            label={i18n.catalog["common.general.severity"]}
                            value={incForm.severity}
                            onChange={(e) => setIncForm({ ...incForm, severity: e.target.value })}
                            options={Object.entries(severityLabels).map(([value, label]) => ({ value, label }))}
                        />
                        <TextInput label={i18n.catalog["common.general.location"]} value={incForm.location} onChange={(e) => setIncForm({ ...incForm, location: e.target.value })} />
                    </div>
                    <Textarea label={i18n.catalog["common.general.description.alternative3"]} value={incForm.description} onChange={(e) => setIncForm({ ...incForm, description: e.target.value })} rows={3} />
                    <Textarea label={i18n.catalog["humanCapital.ehs.immediateAction.alternative2"]} value={incForm.immediate_action_taken} onChange={(e) => setIncForm({ ...incForm, immediate_action_taken: e.target.value })} rows={2} />
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <input type="checkbox" checked={incForm.osha_reportable} onChange={(e) => setIncForm({ ...incForm, osha_reportable: e.target.checked })} id="osha" />
                        <Label htmlFor="osha" className="text-secondary">{i18n.catalog["humanCapital.ehs.oshaReportRequired"]}</Label>
                    </div>
                    <div className="flex justify-end gap-2" style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid var(--border-color)" }}><Button variant="secondary" onClick={() => setShowIncDialog(false)}>{i18n.catalog["common.general.cancel"]}</Button><Button variant="primary" onClick={handleSaveIncident} icon="save">{i18n.catalog["common.general.save"]}</Button></div>
                </div>
            </Dialog>

            {/* Incident Details */}
            <Dialog isOpen={showIncDetails} onClose={() => setShowIncDetails(false)} title={i18n.catalog["humanCapital.ehs.incidentDetails"]} maxWidth="700px">
                {selectedIncident && <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><strong>{i18n.catalog["humanCapital.ehs.incidentNumber.alternative2"]}</strong> {selectedIncident.incident_number}</div>
                        <div><strong>{i18n.catalog["common.general.type"]}</strong> {incidentTypeLabels[selectedIncident.incident_type]}</div>
                        <div><strong>{i18n.catalog["common.general.employee.alternative2"]}</strong> {selectedIncident.employee?.full_name || "-"}</div>
                        <div><strong>{i18n.catalog["common.general.date"]}</strong> {formatDate(selectedIncident.incident_date)}</div>
                        <div><strong>{i18n.catalog["humanCapital.ehs.severity"]}</strong> <span className={`badge ${severityBadges[selectedIncident.severity]}`}>{severityLabels[selectedIncident.severity]}</span></div>
                        <div><strong>{i18n.catalog["common.general.status"]}</strong> <span className={`badge ${incidentStatusBadges[selectedIncident.status]}`}>{incidentStatusLabels[selectedIncident.status]}</span></div>
                        {selectedIncident.location && <div><strong>{i18n.catalog["humanCapital.ehs.location"]}</strong> {selectedIncident.location}</div>}
                    </div>
                    <div><strong>{i18n.catalog["common.general.description"]}</strong><p>{selectedIncident.description}</p></div>
                    {selectedIncident.immediate_action_taken && <div><strong>{i18n.catalog["humanCapital.ehs.immediateAction"]}</strong><p>{selectedIncident.immediate_action_taken}</p></div>}
                    {selectedIncident.root_cause && <div><strong>{i18n.catalog["humanCapital.ehs.rootCause"]}</strong><p>{selectedIncident.root_cause}</p></div>}
                    {selectedIncident.preventive_measures && <div><strong>{i18n.catalog["humanCapital.ehs.preventiveMeasures"]}</strong><p>{selectedIncident.preventive_measures}</p></div>}
                </div>}
            </Dialog>

            {/* Health Record Dialog */}
            <Dialog isOpen={showHrDialog} onClose={() => setShowHrDialog(false)} title={i18n.catalog["humanCapital.ehs.addHealthRecord"]} maxWidth="600px">
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <Label className="text-secondary mb-1">{i18n.catalog["common.general.employee"]}</Label>
                            <SearchableSelect options={employees.map((e: Employee) => ({ value: e.id.toString(), label: e.full_name }))} value={hrForm.employee_id} onChange={(v) => setHrForm(p => ({ ...p, employee_id: v?.toString() || "" }))} placeholder={i18n.catalog["common.general.select"]} />
                        </div>
                        <Select
                            label={i18n.catalog["common.general.type.alternative3"]}
                            value={hrForm.record_type}
                            onChange={(e) => setHrForm({ ...hrForm, record_type: e.target.value })}
                            options={Object.entries(healthRecordTypeLabels).map(([value, label]) => ({ value, label }))}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <TextInput label={i18n.catalog["common.general.date.alternative7"]} type="date" value={hrForm.record_date} onChange={(e) => setHrForm({ ...hrForm, record_date: e.target.value })} />
                        <TextInput label={i18n.catalog["common.general.expiration"]} type="date" value={hrForm.expiry_date} onChange={(e) => setHrForm({ ...hrForm, expiry_date: e.target.value })} />
                    </div>
                    <TextInput label={i18n.catalog["common.general.serviceProvider"]} value={hrForm.provider_name} onChange={(e) => setHrForm({ ...hrForm, provider_name: e.target.value })} />
                    <Textarea label={i18n.catalog["humanCapital.ehs.results"]} value={hrForm.results} onChange={(e) => setHrForm({ ...hrForm, results: e.target.value })} rows={2} />
                    <div className="flex justify-end gap-2" style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid var(--border-color)" }}><Button variant="secondary" onClick={() => setShowHrDialog(false)}>{i18n.catalog["common.general.cancel"]}</Button><Button variant="primary" onClick={handleSaveHealthRecord} icon="save">{i18n.catalog["common.general.save"]}</Button></div>
                </div>
            </Dialog>

            {/* PPE Dialog */}
            <Dialog isOpen={showPpeDialog} onClose={() => setShowPpeDialog(false)} title={i18n.catalog["humanCapital.ehs.registerProtectiveEquipment"]} maxWidth="600px">
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <Label className="text-secondary mb-1">{i18n.catalog["common.general.employee"]}</Label>
                            <SearchableSelect options={employees.map((e: Employee) => ({ value: e.id.toString(), label: e.full_name }))} value={ppeForm.employee_id} onChange={(v) => setPpeForm(p => ({ ...p, employee_id: v?.toString() || "" }))} placeholder={i18n.catalog["common.general.select"]} />
                        </div>
                        <Select
                            label={i18n.catalog["common.general.type.alternative3"]}
                            value={ppeForm.ppe_type}
                            onChange={(e) => setPpeForm({ ...ppeForm, ppe_type: e.target.value })}
                            options={Object.entries(ppeTypeLabels).map(([value, label]) => ({ value, label }))}
                        />
                    </div>
                    <TextInput label={i18n.catalog["humanCapital.ehs.equipmentName"]} value={ppeForm.ppe_item} onChange={(e) => setPpeForm({ ...ppeForm, ppe_item: e.target.value })} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <TextInput label={i18n.catalog["common.general.issueDate"]} type="date" value={ppeForm.issue_date} onChange={(e) => setPpeForm({ ...ppeForm, issue_date: e.target.value })} />
                        <TextInput label={i18n.catalog["common.general.endDate.alternative2"]} type="date" value={ppeForm.expiry_date} onChange={(e) => setPpeForm({ ...ppeForm, expiry_date: e.target.value })} />
                    </div>
                    <div className="flex justify-end gap-2" style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid var(--border-color)" }}><Button variant="secondary" onClick={() => setShowPpeDialog(false)}>{i18n.catalog["common.general.cancel"]}</Button><Button variant="primary" onClick={handleSavePpe} icon="save">{i18n.catalog["common.general.save"]}</Button></div>
                </div>
            </Dialog>
        </div>
    );
}
