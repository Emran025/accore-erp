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

const incidentTypeLabels: Record<string, string> = { accident: catalogMessage("text_e1e505f7e7b1"), near_miss: catalogMessage("text_12ef8ee7fc92"), injury: catalogMessage("text_0d1f41d410a7"), illness: catalogMessage("text_d1f9f814bf79"), property_damage: catalogMessage("text_324cc3881b77"), environmental: catalogMessage("text_f006a305555d"), other: catalogMessage("text_17a9f38e22b6") };
const severityLabels: Record<string, string> = { minor: catalogMessage("text_4ef5fd8371fa"), moderate: catalogMessage("text_42a5dadf6e45"), serious: catalogMessage("text_5c444f50d373"), critical: catalogMessage("text_4e275d7c60ec"), fatal: catalogMessage("text_15856d6d2062") };
const severityBadges: Record<string, string> = { minor: "badge-secondary", moderate: "badge-warning", serious: "badge-danger", critical: "badge-danger", fatal: "badge-danger" };
const incidentStatusLabels: Record<string, string> = { reported: catalogMessage("text_1c18e516d8a9"), under_investigation: catalogMessage("text_8264d0f28e97"), resolved: catalogMessage("text_55cacc133a92"), closed: catalogMessage("text_e655261f9c96") };
const incidentStatusBadges: Record<string, string> = { reported: "badge-warning", under_investigation: "badge-info", resolved: "badge-success", closed: "badge-secondary" };
const healthRecordTypeLabels: Record<string, string> = { vaccination: catalogMessage("text_6bee456d8e40"), medical_exam: catalogMessage("text_cb55376863f7"), drug_test: catalogMessage("text_7c2dc57be032"), health_screening: catalogMessage("text_b4dfdcc04d15"), other: catalogMessage("text_17a9f38e22b6") };
const ppeTypeLabels: Record<string, string> = { helmet: catalogMessage("text_0485d870ae86"), safety_shoes: catalogMessage("text_cef187d818f8"), gloves: catalogMessage("text_a4bb7f7f7082"), goggles: catalogMessage("text_6cb454ab7e13"), vest: catalogMessage("text_db5f014f84d3"), mask: catalogMessage("text_64779c0016fa"), other: catalogMessage("text_17a9f38e22b6") };

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
        catch { showToast(i18n.catalog["text_0da45c9919be"], "error"); } finally { setIncLoading(false); }
    };
    const loadHealthRecords = async () => {
        setHrLoading(true);
        try { const r: any = await fetchAPI(`${API_ENDPOINTS.HUMAN_CAPITAL.EHS.HEALTH_RECORDS.BASE}?page=${hrPage}`); const d = r.data || (Array.isArray(r) ? r : []); setHealthRecords(d); setHrTotal(Number(r.last_page) || 1); }
        catch { showToast(i18n.catalog["text_917e84e57f1b"], "error"); } finally { setHrLoading(false); }
    };
    const loadPpeRecords = async () => {
        setPpeLoading(true);
        try { const r: any = await fetchAPI(`${API_ENDPOINTS.HUMAN_CAPITAL.EHS.PPE.BASE}?page=${ppePage}`); const d = r.data || (Array.isArray(r) ? r : []); setPpeRecords(d); setPpeTotal(Number(r.last_page) || 1); }
        catch { showToast(i18n.catalog["text_246e4780e4c0"], "error"); } finally { setPpeLoading(false); }
    };

    const handleSaveIncident = async () => {
        if (!incForm.description || !incForm.incident_date) { showToast(i18n.catalog["text_7b758312f829"], "error"); return; }
        try {
            await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.EHS.INCIDENTS.BASE, { method: "POST", body: JSON.stringify({ ...incForm, employee_id: incForm.employee_id ? Number(incForm.employee_id) : undefined }) });
            showToast(i18n.catalog["text_f74a5bcc181c"], "success"); setShowIncDialog(false); loadIncidents();
        } catch (e: any) { showToast(e.message || i18n.catalog["text_860b088d3a72"], "error"); }
    };

    const handleUpdateIncident = async (id: number, data: any) => {
        try { await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.EHS.INCIDENTS.withId(id), { method: "PUT", body: JSON.stringify(data) }); showToast(i18n.catalog["text_1ef1739d24e2"], "success"); loadIncidents(); }
        catch (e: any) { showToast(e.message || i18n.catalog["text_96c789857dbf"], "error"); }
    };

    const handleSaveHealthRecord = async () => {
        if (!hrForm.employee_id) { showToast(i18n.catalog["text_8c0019b7fcee"], "error"); return; }
        try {
            await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.EHS.HEALTH_RECORDS.BASE, { method: "POST", body: JSON.stringify({ ...hrForm, employee_id: Number(hrForm.employee_id) }) });
            showToast(i18n.catalog["text_21fe5a24cad0"], "success"); setShowHrDialog(false); loadHealthRecords();
        } catch (e: any) { showToast(e.message || i18n.catalog["text_b0dbba00004b"], "error"); }
    };

    const handleSavePpe = async () => {
        if (!ppeForm.employee_id || !ppeForm.ppe_item) { showToast(i18n.catalog["text_7b758312f829"], "error"); return; }
        try {
            await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.EHS.PPE.BASE, { method: "POST", body: JSON.stringify({ ...ppeForm, employee_id: Number(ppeForm.employee_id) }) });
            showToast(i18n.catalog["text_ab5242cf6148"], "success"); setShowPpeDialog(false); loadPpeRecords();
        } catch (e: any) { showToast(e.message || i18n.catalog["text_b0dbba00004b"], "error"); }
    };

    const incColumns: Column<EhsIncident>[] = [
        { key: "incident_number", header: i18n.catalog["text_cbe88e981192"], dataLabel: i18n.catalog["text_4b2a9dd803ac"] },
        { key: "incident_type", header: i18n.catalog["text_caa3f2bb4a36"], dataLabel: i18n.catalog["text_caa3f2bb4a36"], render: (i) => incidentTypeLabels[i.incident_type] || i.incident_type },
        { key: "employee", header: i18n.catalog["text_b71a39c832a6"], dataLabel: i18n.catalog["text_b71a39c832a6"], render: (i) => i.employee?.full_name || "-" },
        { key: "incident_date", header: i18n.catalog["text_d90c384199ac"], dataLabel: i18n.catalog["text_d90c384199ac"], render: (i) => formatDate(i.incident_date) },
        { key: "severity", header: i18n.catalog["text_28b722c4c4be"], dataLabel: i18n.catalog["text_28b722c4c4be"], render: (i) => <span className={`badge ${severityBadges[i.severity]}`}>{severityLabels[i.severity]}</span> },
        { key: "status", header: i18n.catalog["text_c3a4749caed4"], dataLabel: i18n.catalog["text_c3a4749caed4"], render: (i) => <span className={`badge ${incidentStatusBadges[i.status]}`}>{incidentStatusLabels[i.status]}</span> },
        {
            key: "id", header: i18n.catalog["text_9f0a0f722601"], dataLabel: i18n.catalog["text_9f0a0f722601"], render: (i) => (
                <ActionButtons
                    actions={[
                        {
                            icon: "eye",
                            title: i18n.catalog["text_29f382c73779"],
                            variant: "view",
                            onClick: () => { setSelectedIncident(i); setShowIncDetails(true); }
                        },
                        ...(canAccess("ehs", "edit") ? [{
                            icon: "search" as const,
                            title: i18n.catalog["text_e0459f711bbc"],
                            variant: "primary" as const,
                            onClick: () => handleUpdateIncident(i.id, { status: "under_investigation" }),
                            hidden: i.status !== "reported"
                        }] : []),
                        ...(canAccess("ehs", "edit") ? [{
                            icon: "check" as const,
                            title: i18n.catalog["text_55cacc133a92"],
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
        { key: "employee", header: i18n.catalog["text_b71a39c832a6"], dataLabel: i18n.catalog["text_b71a39c832a6"], render: (i) => i.employee?.full_name || "-" },
        { key: "record_type", header: i18n.catalog["text_caa3f2bb4a36"], dataLabel: i18n.catalog["text_caa3f2bb4a36"], render: (i) => healthRecordTypeLabels[i.record_type] || i.record_type },
        { key: "record_date", header: i18n.catalog["text_d90c384199ac"], dataLabel: i18n.catalog["text_d90c384199ac"], render: (i) => formatDate(i.record_date) },
        { key: "expiry_date", header: i18n.catalog["text_0f87d67c49f1"], dataLabel: i18n.catalog["text_b7463e893610"], render: (i) => i.expiry_date ? formatDate(i.expiry_date) : "-" },
        { key: "provider_name", header: i18n.catalog["text_c95a2de92371"], dataLabel: i18n.catalog["text_311f340e77c5"], render: (i) => i.provider_name || "-" },
    ];

    const ppeColumns: Column<PpeRecord>[] = [
        { key: "employee", header: i18n.catalog["text_b71a39c832a6"], dataLabel: i18n.catalog["text_b71a39c832a6"], render: (i) => i.employee?.full_name || "-" },
        { key: "ppe_item", header: i18n.catalog["text_e4cd51a88568"], dataLabel: i18n.catalog["text_e4cd51a88568"] },
        { key: "ppe_type", header: i18n.catalog["text_caa3f2bb4a36"], dataLabel: i18n.catalog["text_caa3f2bb4a36"], render: (i) => ppeTypeLabels[i.ppe_type] || i.ppe_type },
        { key: "issue_date", header: i18n.catalog["text_4e5892a34a06"], dataLabel: i18n.catalog["text_f14158b9c061"], render: (i) => formatDate(i.issue_date) },
        { key: "expiry_date", header: i18n.catalog["text_b7463e893610"], dataLabel: i18n.catalog["text_b7463e893610"], render: (i) => i.expiry_date ? formatDate(i.expiry_date) : "-" },
        { key: "status", header: i18n.catalog["text_c3a4749caed4"], dataLabel: i18n.catalog["text_c3a4749caed4"], render: (i) => <span className={`badge ${i.status === "issued" ? "badge-success" : "badge-secondary"}`}>{i.status === "issued" ? i18n.catalog["text_6a1b94970cc1"] : i.status}</span> },
    ];

    const tabs = [{ key: "incidents", label: i18n.catalog["text_3caffe9d79ec"], icon: "alert" }, { key: "health", label: i18n.catalog["text_2f2ea5db042b"], icon: "activity" }, { key: "ppe", label: i18n.catalog["text_c8870fecaded"], icon: "hard-hat" }];

    return (
        <div className="sales-card animate-fade">
            <PageSubHeader
                title={i18n.catalog["text_009c398f07d5"]}
                titleIcon="shield-check"
            />
            <TabNavigation tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

            {activeTab === "incidents" && <>
                <div style={{ display: "flex", justifyContent: "flex-end", margin: "1rem 0" }}>
                    {canAccess("ehs", "create") && (
                        <Button onClick={() => { setIncForm({ employee_id: "", incident_type: "accident", incident_date: new Date().toISOString().split("T")[0], incident_time: "", location: "", description: "", severity: "minor", immediate_action_taken: "", osha_reportable: false, notes: "" }); setShowIncDialog(true); }} variant="primary" icon="plus">{i18n.catalog["text_7f9f1edfe4fe"]}</Button>
                    )}
                </div>
                <Table columns={incColumns} data={incidents} keyExtractor={(i) => i.id.toString()} emptyMessage={i18n.catalog["text_670e3a27c173"]} isLoading={incLoading} pagination={{ currentPage: incPage, totalPages: incTotal, onPageChange: setIncPage }} />
            </>}

            {activeTab === "health" && <>
                <div style={{ display: "flex", justifyContent: "flex-end", margin: "1rem 0" }}>
                    {canAccess("ehs", "create") && (
                        <Button onClick={() => { setHrForm({ employee_id: "", record_type: "medical_exam", record_date: new Date().toISOString().split("T")[0], expiry_date: "", provider_name: "", results: "", notes: "" }); setShowHrDialog(true); }} variant="primary" icon="plus">{i18n.catalog["text_3377170df665"]}</Button>
                    )}
                </div>
                <Table columns={hrColumns} data={healthRecords} keyExtractor={(i) => i.id.toString()} emptyMessage={i18n.catalog["text_6db2fc201fed"]} isLoading={hrLoading} pagination={{ currentPage: hrPage, totalPages: hrTotal, onPageChange: setHrPage }} />
            </>}

            {activeTab === "ppe" && <>
                <div style={{ display: "flex", justifyContent: "flex-end", margin: "1rem 0" }}>
                    {canAccess("ehs", "create") && (
                        <Button onClick={() => { setPpeForm({ employee_id: "", ppe_item: "", ppe_type: "helmet", issue_date: new Date().toISOString().split("T")[0], expiry_date: "", notes: "" }); setShowPpeDialog(true); }} variant="primary" icon="plus">{i18n.catalog["text_855ea845f6eb"]}</Button>
                    )}
                </div>
                <Table columns={ppeColumns} data={ppeRecords} keyExtractor={(i) => i.id.toString()} emptyMessage={i18n.catalog["text_411242bbf2ca"]} isLoading={ppeLoading} pagination={{ currentPage: ppePage, totalPages: ppeTotal, onPageChange: setPpePage }} />
            </>}

            {/* Incident Dialog */}
            <Dialog isOpen={showIncDialog} onClose={() => setShowIncDialog(false)} title={i18n.catalog["text_7f9f1edfe4fe"]} maxWidth="700px">
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <Label className="text-secondary mb-1">{i18n.catalog["text_b71a39c832a6"]}</Label>
                            <SearchableSelect options={employees.map((e: Employee) => ({ value: e.id.toString(), label: e.full_name }))} value={incForm.employee_id} onChange={(v) => setIncForm(p => ({ ...p, employee_id: v?.toString() || "" }))} placeholder={i18n.catalog["text_33408684704e"]} />
                        </div>
                        <Select
                            label={i18n.catalog["text_85f194174674"]}
                            value={incForm.incident_type}
                            onChange={(e) => setIncForm({ ...incForm, incident_type: e.target.value })}
                            options={Object.entries(incidentTypeLabels).map(([value, label]) => ({ value, label }))}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <TextInput label={i18n.catalog["text_24ab9ad4f30d"]} type="date" value={incForm.incident_date} onChange={(e) => setIncForm({ ...incForm, incident_date: e.target.value })} />
                        <Select
                            label={i18n.catalog["text_28b722c4c4be"]}
                            value={incForm.severity}
                            onChange={(e) => setIncForm({ ...incForm, severity: e.target.value })}
                            options={Object.entries(severityLabels).map(([value, label]) => ({ value, label }))}
                        />
                        <TextInput label={i18n.catalog["text_8937faa1e41f"]} value={incForm.location} onChange={(e) => setIncForm({ ...incForm, location: e.target.value })} />
                    </div>
                    <Textarea label={i18n.catalog["text_c5293e340faa"]} value={incForm.description} onChange={(e) => setIncForm({ ...incForm, description: e.target.value })} rows={3} />
                    <Textarea label={i18n.catalog["text_f753cb15ff3a"]} value={incForm.immediate_action_taken} onChange={(e) => setIncForm({ ...incForm, immediate_action_taken: e.target.value })} rows={2} />
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <input type="checkbox" checked={incForm.osha_reportable} onChange={(e) => setIncForm({ ...incForm, osha_reportable: e.target.checked })} id="osha" />
                        <Label htmlFor="osha" className="text-secondary">{i18n.catalog["text_183896a75613"]}</Label>
                    </div>
                    <div className="flex justify-end gap-2" style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid var(--border-color)" }}><Button variant="secondary" onClick={() => setShowIncDialog(false)}>{i18n.catalog["text_9a30dc2a96b8"]}</Button><Button variant="primary" onClick={handleSaveIncident} icon="save">{i18n.catalog["text_ddfcaf9d0144"]}</Button></div>
                </div>
            </Dialog>

            {/* Incident Details */}
            <Dialog isOpen={showIncDetails} onClose={() => setShowIncDetails(false)} title={i18n.catalog["text_8819f5a69897"]} maxWidth="700px">
                {selectedIncident && <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><strong>{i18n.catalog["text_cd4bc91c9ce9"]}</strong> {selectedIncident.incident_number}</div>
                        <div><strong>{i18n.catalog["text_0e20d829bef2"]}</strong> {incidentTypeLabels[selectedIncident.incident_type]}</div>
                        <div><strong>{i18n.catalog["text_b6293eeef8b9"]}</strong> {selectedIncident.employee?.full_name || "-"}</div>
                        <div><strong>{i18n.catalog["text_174200101521"]}</strong> {formatDate(selectedIncident.incident_date)}</div>
                        <div><strong>{i18n.catalog["text_f0d9d52b4d27"]}</strong> <span className={`badge ${severityBadges[selectedIncident.severity]}`}>{severityLabels[selectedIncident.severity]}</span></div>
                        <div><strong>{i18n.catalog["text_02e196bdec60"]}</strong> <span className={`badge ${incidentStatusBadges[selectedIncident.status]}`}>{incidentStatusLabels[selectedIncident.status]}</span></div>
                        {selectedIncident.location && <div><strong>{i18n.catalog["text_cbeb0d2c959f"]}</strong> {selectedIncident.location}</div>}
                    </div>
                    <div><strong>{i18n.catalog["text_3ec7e12fb399"]}</strong><p>{selectedIncident.description}</p></div>
                    {selectedIncident.immediate_action_taken && <div><strong>{i18n.catalog["text_a5f23fd51f1b"]}</strong><p>{selectedIncident.immediate_action_taken}</p></div>}
                    {selectedIncident.root_cause && <div><strong>{i18n.catalog["text_2a84082f366d"]}</strong><p>{selectedIncident.root_cause}</p></div>}
                    {selectedIncident.preventive_measures && <div><strong>{i18n.catalog["text_302a039c196c"]}</strong><p>{selectedIncident.preventive_measures}</p></div>}
                </div>}
            </Dialog>

            {/* Health Record Dialog */}
            <Dialog isOpen={showHrDialog} onClose={() => setShowHrDialog(false)} title={i18n.catalog["text_7159d8431332"]} maxWidth="600px">
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <Label className="text-secondary mb-1">{i18n.catalog["text_972803dc7d86"]}</Label>
                            <SearchableSelect options={employees.map((e: Employee) => ({ value: e.id.toString(), label: e.full_name }))} value={hrForm.employee_id} onChange={(v) => setHrForm(p => ({ ...p, employee_id: v?.toString() || "" }))} placeholder={i18n.catalog["text_d6b8d3e4d508"]} />
                        </div>
                        <Select
                            label={i18n.catalog["text_caa3f2bb4a36"]}
                            value={hrForm.record_type}
                            onChange={(e) => setHrForm({ ...hrForm, record_type: e.target.value })}
                            options={Object.entries(healthRecordTypeLabels).map(([value, label]) => ({ value, label }))}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <TextInput label={i18n.catalog["text_d90c384199ac"]} type="date" value={hrForm.record_date} onChange={(e) => setHrForm({ ...hrForm, record_date: e.target.value })} />
                        <TextInput label={i18n.catalog["text_0f87d67c49f1"]} type="date" value={hrForm.expiry_date} onChange={(e) => setHrForm({ ...hrForm, expiry_date: e.target.value })} />
                    </div>
                    <TextInput label={i18n.catalog["text_c95a2de92371"]} value={hrForm.provider_name} onChange={(e) => setHrForm({ ...hrForm, provider_name: e.target.value })} />
                    <Textarea label={i18n.catalog["text_939b4ec9e3fc"]} value={hrForm.results} onChange={(e) => setHrForm({ ...hrForm, results: e.target.value })} rows={2} />
                    <div className="flex justify-end gap-2" style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid var(--border-color)" }}><Button variant="secondary" onClick={() => setShowHrDialog(false)}>{i18n.catalog["text_9a30dc2a96b8"]}</Button><Button variant="primary" onClick={handleSaveHealthRecord} icon="save">{i18n.catalog["text_ddfcaf9d0144"]}</Button></div>
                </div>
            </Dialog>

            {/* PPE Dialog */}
            <Dialog isOpen={showPpeDialog} onClose={() => setShowPpeDialog(false)} title={i18n.catalog["text_8b0326c29230"]} maxWidth="600px">
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <Label className="text-secondary mb-1">{i18n.catalog["text_972803dc7d86"]}</Label>
                            <SearchableSelect options={employees.map((e: Employee) => ({ value: e.id.toString(), label: e.full_name }))} value={ppeForm.employee_id} onChange={(v) => setPpeForm(p => ({ ...p, employee_id: v?.toString() || "" }))} placeholder={i18n.catalog["text_d6b8d3e4d508"]} />
                        </div>
                        <Select
                            label={i18n.catalog["text_caa3f2bb4a36"]}
                            value={ppeForm.ppe_type}
                            onChange={(e) => setPpeForm({ ...ppeForm, ppe_type: e.target.value })}
                            options={Object.entries(ppeTypeLabels).map(([value, label]) => ({ value, label }))}
                        />
                    </div>
                    <TextInput label={i18n.catalog["text_9ad26a613b45"]} value={ppeForm.ppe_item} onChange={(e) => setPpeForm({ ...ppeForm, ppe_item: e.target.value })} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <TextInput label={i18n.catalog["text_4e5892a34a06"]} type="date" value={ppeForm.issue_date} onChange={(e) => setPpeForm({ ...ppeForm, issue_date: e.target.value })} />
                        <TextInput label={i18n.catalog["text_ec3093bd6fd5"]} type="date" value={ppeForm.expiry_date} onChange={(e) => setPpeForm({ ...ppeForm, expiry_date: e.target.value })} />
                    </div>
                    <div className="flex justify-end gap-2" style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid var(--border-color)" }}><Button variant="secondary" onClick={() => setShowPpeDialog(false)}>{i18n.catalog["text_9a30dc2a96b8"]}</Button><Button variant="primary" onClick={handleSavePpe} icon="save">{i18n.catalog["text_ddfcaf9d0144"]}</Button></div>
                </div>
            </Dialog>
        </div>
    );
}
