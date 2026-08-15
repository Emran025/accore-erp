"use client";

import { useI18n, catalogMessage } from "@/lib/i18n";
import { PageSubHeader } from "@/components/layout";
import { ActionButtons, Button, Column, Dialog, Label, TabNavigation, Table, showToast } from "@/components/ui";
import { TextInput } from "@/components/ui/TextInput";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/select";
import { fetchAPI } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatDate } from "@/lib/utils";
import { useAuthStore } from "@/stores/useAuthStore";
import type { CorporateAnnouncement, PulseSurvey } from "@/types";
import { useEffect, useState } from "react";

const priorityLabels: Record<string, string> = { low: catalogMessage("common.general.low"), normal: catalogMessage("common.general.normal"), high: catalogMessage("common.general.high"), urgent: catalogMessage("common.general.urgent") };
const priorityBadges: Record<string, string> = { low: "badge-secondary", normal: "badge-info", high: "badge-warning", urgent: "badge-danger" };
const audienceLabels: Record<string, string> = { all: catalogMessage("common.general.all.alternative2"), department: catalogMessage("common.general.department"), role: catalogMessage("common.general.role"), location: catalogMessage("humanCapital.corporatecommunications.location"), custom: catalogMessage("common.general.custom") };
const surveyTypeLabels: Record<string, string> = { sentiment: catalogMessage("humanCapital.corporatecommunications.sentimentMeasurement"), burnout: catalogMessage("humanCapital.corporatecommunications.fatigue.alternative2"), engagement: catalogMessage("humanCapital.corporatecommunications.participation"), custom: catalogMessage("common.general.custom") };

export function CorporateCommunications() {
    const { t: i18n } = useI18n();
    const { canAccess } = useAuthStore();
    const [activeTab, setActiveTab] = useState("announcements");
    // Announcements
    const [announcements, setAnnouncements] = useState<CorporateAnnouncement[]>([]);
    const [annLoading, setAnnLoading] = useState(false);
    const [annPage, setAnnPage] = useState(1);
    const [annTotal, setAnnTotal] = useState(1);
    const [annTotalRecords, setAnnTotalRecords] = useState(0);
    const [showAnnDialog, setShowAnnDialog] = useState(false);
    const [annForm, setAnnForm] = useState({ title: "", content: "", priority: "normal", target_audience: "all", publish_date: new Date().toISOString().split("T")[0], expiry_date: "", is_published: false });
    // Surveys
    const [surveys, setSurveys] = useState<PulseSurvey[]>([]);
    const [survLoading, setSurvLoading] = useState(false);
    const [survPage, setSurvPage] = useState(1);
    const [survTotal, setSurvTotal] = useState(1);
    const [survTotalRecords, setSurvTotalRecords] = useState(0);
    const [showSurvDialog, setShowSurvDialog] = useState(false);
    const [showSurvDetails, setShowSurvDetails] = useState(false);
    const [selectedSurvey, setSelectedSurvey] = useState<PulseSurvey | null>(null);
    const [survForm, setSurvForm] = useState({ survey_name: "", description: "", survey_type: "engagement", questions: "[]", start_date: new Date().toISOString().split("T")[0], end_date: "", is_anonymous: true, target_audience: "all" });

    useEffect(() => { loadAnnouncements(); }, [annPage]);
    useEffect(() => { loadSurveys(); }, [survPage]);

    const loadAnnouncements = async () => {
        setAnnLoading(true);
        try {
            const res: any = await fetchAPI(`${API_ENDPOINTS.HUMAN_CAPITAL.COMMUNICATIONS.ANNOUNCEMENTS.BASE}?page=${annPage}&all=true`);
            const data = res.data || (Array.isArray(res) ? res : []);
            setAnnouncements(data); setAnnTotal(Number(res.last_page) || 1); setAnnTotalRecords(Number(res.total) || data.length);
        } catch (e) { console.error(e); showToast(i18n.catalog["humanCapital.corporatecommunications.failedLoadAds"], "error"); }
        finally { setAnnLoading(false); }
    };

    const loadSurveys = async () => {
        setSurvLoading(true);
        try {
            const res: any = await fetchAPI(`${API_ENDPOINTS.HUMAN_CAPITAL.COMMUNICATIONS.SURVEYS.BASE}?page=${survPage}`);
            const data = res.data || (Array.isArray(res) ? res : []);
            setSurveys(data); setSurvTotal(Number(res.last_page) || 1); setSurvTotalRecords(Number(res.total) || data.length);
        } catch (e) { console.error(e); showToast(i18n.catalog["humanCapital.corporatecommunications.failedLoadSurveys"], "error"); }
        finally { setSurvLoading(false); }
    };

    const handleSaveAnnouncement = async () => {
        if (!annForm.title || !annForm.content) { showToast(i18n.catalog["humanCapital.corporatecommunications.pleaseEnterTitleContent"], "error"); return; }
        try {
            await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.COMMUNICATIONS.ANNOUNCEMENTS.BASE, { method: "POST", body: JSON.stringify({ ...annForm, is_published: annForm.is_published }) });
            showToast(i18n.catalog["humanCapital.corporatecommunications.announcementPublishedSuccessfully"], "success"); setShowAnnDialog(false); loadAnnouncements();
        } catch (e: any) { showToast(e.message || i18n.catalog["humanCapital.corporatecommunications.failedSaveAnnouncement"], "error"); }
    };

    const togglePublish = async (ann: CorporateAnnouncement) => {
        try {
            await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.COMMUNICATIONS.ANNOUNCEMENTS.withId(ann.id), { method: "PUT", body: JSON.stringify({ is_published: !ann.is_published }) });
            showToast(ann.is_published ? i18n.catalog["common.general.unpublished"] : i18n.catalog["humanCapital.corporatecommunications.published"], "success"); loadAnnouncements();
        } catch (e: any) { showToast(e.message || i18n.catalog["common.general.updateFailed"], "error"); }
    };

    const handleSaveSurvey = async () => {
        if (!survForm.survey_name || !survForm.end_date) { showToast(i18n.catalog["common.general.pleaseFillRequiredFields.alternative2"], "error"); return; }
        let questions: any[];
        try { questions = JSON.parse(survForm.questions); } catch { showToast(i18n.catalog["humanCapital.corporatecommunications.questionsFormatInvalidJson"], "error"); return; }
        try {
            await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.COMMUNICATIONS.SURVEYS.BASE, { method: "POST", body: JSON.stringify({ survey_name: survForm.survey_name, description: survForm.description, survey_type: survForm.survey_type, questions, start_date: survForm.start_date, end_date: survForm.end_date, is_anonymous: survForm.is_anonymous, target_audience: survForm.target_audience }) });
            showToast(i18n.catalog["humanCapital.corporatecommunications.surveyCreatedSuccessfully"], "success"); setShowSurvDialog(false); loadSurveys();
        } catch (e: any) { showToast(e.message || i18n.catalog["humanCapital.corporatecommunications.failedCreateSurvey"], "error"); }
    };

    const annColumns: Column<CorporateAnnouncement>[] = [
        { key: "title", header: i18n.catalog["common.general.title"], dataLabel: i18n.catalog["common.general.title"] },
        { key: "priority", header: i18n.catalog["common.general.priority"], dataLabel: i18n.catalog["common.general.priority"], render: (i) => <span className={`badge ${priorityBadges[i.priority]}`}>{priorityLabels[i.priority] || i.priority}</span> },
        { key: "target_audience", header: i18n.catalog["common.general.audience"], dataLabel: i18n.catalog["common.general.audience"], render: (i) => audienceLabels[i.target_audience] || i.target_audience },
        { key: "publish_date", header: i18n.catalog["common.general.publicationDate"], dataLabel: i18n.catalog["common.general.publicationDate"], render: (i) => formatDate(i.publish_date) },
        { key: "is_published", header: i18n.catalog["common.general.published"], dataLabel: i18n.catalog["common.general.published"], render: (i) => <span className={`badge ${i.is_published ? "badge-success" : "badge-secondary"}`}>{i.is_published ? i18n.catalog["common.general.yes"] : i18n.catalog["common.general.no"]}</span> },
        {
            key: "id", header: i18n.catalog["common.general.actions.alternative2"], dataLabel: i18n.catalog["common.general.actions.alternative2"], render: (i) => (
                <ActionButtons
                    actions={[
                        ...(canAccess("communications", "edit") ? [{
                            icon: (i.is_published ? "eye-off" : "eye") as any,
                            title: i.is_published ? i18n.catalog["common.general.unpublish"] : i18n.catalog["common.general.publish"],
                            variant: (i.is_published ? "delete" : "success") as any,
                            onClick: () => togglePublish(i)
                        }] : [])
                    ]}
                />
            )
        },
    ];

    const survColumns: Column<PulseSurvey>[] = [
        { key: "survey_name", header: i18n.catalog["humanCapital.corporatecommunications.surveyName.alternative2"], dataLabel: i18n.catalog["common.general.name"] },
        { key: "survey_type", header: i18n.catalog["common.general.type.alternative3"], dataLabel: i18n.catalog["common.general.type.alternative3"], render: (i) => surveyTypeLabels[i.survey_type] || i.survey_type },
        { key: "start_date", header: i18n.catalog["common.general.start.alternative3"], dataLabel: i18n.catalog["common.general.start.alternative3"], render: (i) => formatDate(i.start_date) },
        { key: "end_date", header: i18n.catalog["common.general.end.alternative3"], dataLabel: i18n.catalog["common.general.end.alternative3"], render: (i) => formatDate(i.end_date) },
        { key: "is_active", header: i18n.catalog["common.general.active"], dataLabel: i18n.catalog["common.general.active"], render: (i) => <span className={`badge ${i.is_active ? "badge-success" : "badge-secondary"}`}>{i.is_active ? i18n.catalog["common.general.yes"] : i18n.catalog["common.general.no"]}</span> },
        { key: "responses", header: i18n.catalog["common.general.responses"], dataLabel: i18n.catalog["common.general.responses"], render: (i) => i.responses?.length || 0 },
        {
            key: "id", header: i18n.catalog["common.general.actions.alternative2"], dataLabel: i18n.catalog["common.general.actions.alternative2"], render: (i) => (
                <ActionButtons
                    actions={[
                        {
                            icon: "eye",
                            title: i18n.catalog["common.general.details"],
                            variant: "view",
                            onClick: () => { setSelectedSurvey(i); setShowSurvDetails(true); }
                        }
                    ]}
                />
            )
        },
    ];

    const tabs = [{ key: "announcements", label: i18n.catalog["humanCapital.corporatecommunications.announcements"], icon: "bullhorn" }, { key: "surveys", label: i18n.catalog["humanCapital.corporatecommunications.surveys"], icon: "poll" }];

    return (
        <div className="sales-card animate-fade">
            <PageSubHeader
                title={i18n.catalog["common.general.corporateCommunications"]}
                titleIcon="bullhorn"
                actions={
                    <>
                        {activeTab === "announcements" ? (
                            canAccess("communications", "create") && (
                                <Button onClick={() => { setAnnForm({ title: "", content: "", priority: "normal", target_audience: "all", publish_date: new Date().toISOString().split("T")[0], expiry_date: "", is_published: false }); setShowAnnDialog(true); }}
                                    variant="primary"
                                    icon="plus"
                                >
                                    {i18n.catalog["common.general.newAnnouncement"]}</Button>
                            )
                        ) : (
                            canAccess("communications", "create") && (
                                <Button
                                    onClick={() => {
                                        setSurvForm({
                                            survey_name: "",
                                            description: "",
                                            survey_type: "engagement",
                                            questions: "[]",
                                            start_date: new Date().toISOString().split("T")[0],
                                            end_date: "",
                                            is_anonymous: true,
                                            target_audience: "all"
                                        });
                                        setShowSurvDialog(true);
                                    }}
                                    variant="primary"
                                    icon="plus"
                                >
                                    {i18n.catalog["common.general.newSurvey"]}</Button>
                            )
                        )}
                    </>
                }
            />
            <TabNavigation tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

            {activeTab === "announcements" && (
                <Table columns={annColumns} data={announcements} keyExtractor={(i) => i.id.toString()} emptyMessage={i18n.catalog["humanCapital.corporatecommunications.noAnnouncements"]} isLoading={annLoading} pagination={{ currentPage: annPage, totalPages: annTotal, onPageChange: setAnnPage }} />
            )}

            {activeTab === "surveys" && (
                <Table columns={survColumns} data={surveys} keyExtractor={(i) => i.id.toString()} emptyMessage={i18n.catalog["humanCapital.corporatecommunications.noSurveys"]} isLoading={survLoading} pagination={{ currentPage: survPage, totalPages: survTotal, onPageChange: setSurvPage }} />
            )}

            {/* Announcement Dialog */}
            <Dialog isOpen={showAnnDialog} onClose={() => setShowAnnDialog(false)} title={i18n.catalog["common.general.newAnnouncement"]} maxWidth="700px">
                <div className="space-y-4">
                    <TextInput label={i18n.catalog["common.general.address"]} value={annForm.title} onChange={(e) => setAnnForm({ ...annForm, title: e.target.value })} />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Select
                            label={i18n.catalog["common.general.priority"]}
                            value={annForm.priority}
                            onChange={(e) => setAnnForm({ ...annForm, priority: e.target.value })}
                            options={[
                                { value: 'low', label: i18n.catalog["common.general.low"] },
                                { value: 'normal', label: i18n.catalog["common.general.normal"] },
                                { value: 'high', label: i18n.catalog["common.general.high"] },
                                { value: 'urgent', label: i18n.catalog["common.general.urgent"] }
                            ]}
                        />
                        <Select
                            label={i18n.catalog["common.general.audience"]}
                            value={annForm.target_audience}
                            onChange={(e) => setAnnForm({ ...annForm, target_audience: e.target.value })}
                            options={[
                                { value: 'all', label: i18n.catalog["common.general.all.alternative2"] },
                                { value: 'department', label: i18n.catalog["common.general.department"] },
                                { value: 'role', label: i18n.catalog["common.general.role"] }
                            ]}
                        />
                        <TextInput label={i18n.catalog["common.general.publicationDate"]} type="date" value={annForm.publish_date} onChange={(e) => setAnnForm({ ...annForm, publish_date: e.target.value })} />
                    </div>
                    <Textarea label={i18n.catalog["common.general.content"]} value={annForm.content} onChange={(e) => setAnnForm({ ...annForm, content: e.target.value })} rows={5} />
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <input type="checkbox" checked={annForm.is_published} onChange={(e) => setAnnForm({ ...annForm, is_published: e.target.checked })} id="pub" />
                        <Label htmlFor="pub" className="text-secondary">{i18n.catalog["humanCapital.corporatecommunications.publishImmediately"]}</Label>
                    </div>
                    <div className="flex justify-end gap-2" style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid var(--border-color)" }}><Button variant="secondary" onClick={() => setShowAnnDialog(false)}>{i18n.catalog["common.general.cancel"]}</Button><Button variant="primary" onClick={handleSaveAnnouncement} icon="save">{i18n.catalog["common.general.save"]}</Button></div>
                </div>
            </Dialog>

            {/* Survey Dialog */}
            <Dialog isOpen={showSurvDialog} onClose={() => setShowSurvDialog(false)} title={i18n.catalog["common.general.newSurvey"]} maxWidth="700px">
                <div className="space-y-4">
                    <TextInput label={i18n.catalog["humanCapital.corporatecommunications.surveyName"]} value={survForm.survey_name} onChange={(e) => setSurvForm({ ...survForm, survey_name: e.target.value })} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select
                            label={i18n.catalog["common.general.type.alternative3"]}
                            value={survForm.survey_type}
                            onChange={(e) => setSurvForm({ ...survForm, survey_type: e.target.value })}
                            options={[
                                { value: 'sentiment', label: i18n.catalog["humanCapital.corporatecommunications.sentiments"] },
                                { value: 'burnout', label: i18n.catalog["humanCapital.corporatecommunications.fatigue"] },
                                { value: 'engagement', label: i18n.catalog["humanCapital.corporatecommunications.share"] },
                                { value: 'custom', label: i18n.catalog["common.general.custom"] }
                            ]}
                        />
                        <Select
                            label={i18n.catalog["common.general.audience"]}
                            value={survForm.target_audience}
                            onChange={(e) => setSurvForm({ ...survForm, target_audience: e.target.value })}
                            options={[
                                { value: 'all', label: i18n.catalog["common.general.all.alternative2"] },
                                { value: 'department', label: i18n.catalog["common.general.department"] },
                                { value: 'role', label: i18n.catalog["common.general.role"] }
                            ]}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <TextInput label={i18n.catalog["common.general.start.alternative3"]} type="date" value={survForm.start_date} onChange={(e) => setSurvForm({ ...survForm, start_date: e.target.value })} />
                        <TextInput label={i18n.catalog["common.general.end"]} type="date" value={survForm.end_date} onChange={(e) => setSurvForm({ ...survForm, end_date: e.target.value })} />
                    </div>
                    <Textarea label={i18n.catalog["common.general.description.alternative2"]} value={survForm.description} onChange={(e) => setSurvForm({ ...survForm, description: e.target.value })} rows={2} />
                    <Textarea label={i18n.catalog["humanCapital.corporatecommunications.questionsJson"]} value={survForm.questions} onChange={(e) => setSurvForm({ ...survForm, questions: e.target.value })} rows={4} />
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <input type="checkbox" checked={survForm.is_anonymous} onChange={(e) => setSurvForm({ ...survForm, is_anonymous: e.target.checked })} id="anon" />
                        <Label htmlFor="anon" className="text-secondary">{i18n.catalog["humanCapital.corporatecommunications.unknown.alternative2"]}</Label>
                    </div>
                    <div className="flex justify-end gap-2" style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid var(--border-color)" }}><Button variant="secondary" onClick={() => setShowSurvDialog(false)}>{i18n.catalog["common.general.cancel"]}</Button><Button variant="primary" onClick={handleSaveSurvey} icon="save">{i18n.catalog["common.general.save"]}</Button></div>
                </div>
            </Dialog>

            {/* Survey Details Dialog */}
            <Dialog isOpen={showSurvDetails} onClose={() => setShowSurvDetails(false)} title={i18n.catalog["humanCapital.corporatecommunications.surveyDetails"]} maxWidth="700px">
                {selectedSurvey && <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><strong>{i18n.catalog["common.general.name.alternative2"]}</strong> {selectedSurvey.survey_name}</div>
                        <div><strong>{i18n.catalog["common.general.type"]}</strong> {surveyTypeLabels[selectedSurvey.survey_type]}</div>
                        <div><strong>{i18n.catalog["common.general.start"]}</strong> {formatDate(selectedSurvey.start_date)}</div>
                        <div><strong>{i18n.catalog["common.general.end.alternative5"]}</strong> {formatDate(selectedSurvey.end_date)}</div>
                        <div><strong>{i18n.catalog["humanCapital.corporatecommunications.unknown"]}</strong> {selectedSurvey.is_anonymous ? i18n.catalog["common.general.yes"] : i18n.catalog["common.general.no"]}</div>
                        <div><strong>{i18n.catalog["humanCapital.corporatecommunications.numberReplies"]}</strong> {selectedSurvey.responses?.length || 0}</div>
                    </div>
                    {selectedSurvey.description && <div><strong>{i18n.catalog["common.general.description"]}</strong><p>{selectedSurvey.description}</p></div>}
                    <div><strong>{i18n.catalog["humanCapital.corporatecommunications.questions"]}</strong><pre style={{ background: "var(--bg-secondary)", padding: "1rem", borderRadius: "8px", fontSize: "0.85rem", maxHeight: "200px", overflowY: "auto" }}>{JSON.stringify(selectedSurvey.questions, null, 2)}</pre></div>
                </div>}
            </Dialog>
        </div>
    );
}
