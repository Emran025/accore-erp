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

const priorityLabels: Record<string, string> = { low: catalogMessage("text_5dddca7f4a48"), normal: catalogMessage("text_f3569af24500"), high: catalogMessage("text_48acab16abdb"), urgent: catalogMessage("text_5858bf88ec0b") };
const priorityBadges: Record<string, string> = { low: "badge-secondary", normal: "badge-info", high: "badge-warning", urgent: "badge-danger" };
const audienceLabels: Record<string, string> = { all: catalogMessage("text_b2cac04c941f"), department: catalogMessage("text_427f02347c2f"), role: catalogMessage("text_874867797474"), location: catalogMessage("text_9c43a512b8d5"), custom: catalogMessage("text_17c28aaaa777") };
const surveyTypeLabels: Record<string, string> = { sentiment: catalogMessage("text_cb6e0fde6e8c"), burnout: catalogMessage("text_b2a2e5e29c92"), engagement: catalogMessage("text_6b9b17abe0b5"), custom: catalogMessage("text_17c28aaaa777") };

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
        } catch (e) { console.error(e); showToast(i18n.catalog["text_22ddcb0f398c"], "error"); }
        finally { setAnnLoading(false); }
    };

    const loadSurveys = async () => {
        setSurvLoading(true);
        try {
            const res: any = await fetchAPI(`${API_ENDPOINTS.HUMAN_CAPITAL.COMMUNICATIONS.SURVEYS.BASE}?page=${survPage}`);
            const data = res.data || (Array.isArray(res) ? res : []);
            setSurveys(data); setSurvTotal(Number(res.last_page) || 1); setSurvTotalRecords(Number(res.total) || data.length);
        } catch (e) { console.error(e); showToast(i18n.catalog["text_4b434d4c7abd"], "error"); }
        finally { setSurvLoading(false); }
    };

    const handleSaveAnnouncement = async () => {
        if (!annForm.title || !annForm.content) { showToast(i18n.catalog["text_a1127a6fd52c"], "error"); return; }
        try {
            await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.COMMUNICATIONS.ANNOUNCEMENTS.BASE, { method: "POST", body: JSON.stringify({ ...annForm, is_published: annForm.is_published }) });
            showToast(i18n.catalog["text_0f010f2924fe"], "success"); setShowAnnDialog(false); loadAnnouncements();
        } catch (e: any) { showToast(e.message || i18n.catalog["text_4b066c01e11b"], "error"); }
    };

    const togglePublish = async (ann: CorporateAnnouncement) => {
        try {
            await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.COMMUNICATIONS.ANNOUNCEMENTS.withId(ann.id), { method: "PUT", body: JSON.stringify({ is_published: !ann.is_published }) });
            showToast(ann.is_published ? i18n.catalog["text_9330b63fea3e"] : i18n.catalog["text_e4717f94f40d"], "success"); loadAnnouncements();
        } catch (e: any) { showToast(e.message || i18n.catalog["text_96c789857dbf"], "error"); }
    };

    const handleSaveSurvey = async () => {
        if (!survForm.survey_name || !survForm.end_date) { showToast(i18n.catalog["text_7b758312f829"], "error"); return; }
        let questions: any[];
        try { questions = JSON.parse(survForm.questions); } catch { showToast(i18n.catalog["text_99587be5bf76"], "error"); return; }
        try {
            await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.COMMUNICATIONS.SURVEYS.BASE, { method: "POST", body: JSON.stringify({ survey_name: survForm.survey_name, description: survForm.description, survey_type: survForm.survey_type, questions, start_date: survForm.start_date, end_date: survForm.end_date, is_anonymous: survForm.is_anonymous, target_audience: survForm.target_audience }) });
            showToast(i18n.catalog["text_bc3149cd7a2e"], "success"); setShowSurvDialog(false); loadSurveys();
        } catch (e: any) { showToast(e.message || i18n.catalog["text_c2b1c53a1925"], "error"); }
    };

    const annColumns: Column<CorporateAnnouncement>[] = [
        { key: "title", header: i18n.catalog["text_2d110e56d5f5"], dataLabel: i18n.catalog["text_2d110e56d5f5"] },
        { key: "priority", header: i18n.catalog["text_4c3e5a87f1e4"], dataLabel: i18n.catalog["text_4c3e5a87f1e4"], render: (i) => <span className={`badge ${priorityBadges[i.priority]}`}>{priorityLabels[i.priority] || i.priority}</span> },
        { key: "target_audience", header: i18n.catalog["text_37e34a9a0a12"], dataLabel: i18n.catalog["text_37e34a9a0a12"], render: (i) => audienceLabels[i.target_audience] || i.target_audience },
        { key: "publish_date", header: i18n.catalog["text_93cf0fcdb347"], dataLabel: i18n.catalog["text_93cf0fcdb347"], render: (i) => formatDate(i.publish_date) },
        { key: "is_published", header: i18n.catalog["text_74f0d5710a99"], dataLabel: i18n.catalog["text_74f0d5710a99"], render: (i) => <span className={`badge ${i.is_published ? "badge-success" : "badge-secondary"}`}>{i.is_published ? i18n.catalog["text_4b2d2c65d365"] : i18n.catalog["text_2bd073516a87"]}</span> },
        {
            key: "id", header: i18n.catalog["text_9f0a0f722601"], dataLabel: i18n.catalog["text_9f0a0f722601"], render: (i) => (
                <ActionButtons
                    actions={[
                        ...(canAccess("communications", "edit") ? [{
                            icon: (i.is_published ? "eye-off" : "eye") as any,
                            title: i.is_published ? i18n.catalog["text_391ee0811948"] : i18n.catalog["text_b19234315bac"],
                            variant: (i.is_published ? "delete" : "success") as any,
                            onClick: () => togglePublish(i)
                        }] : [])
                    ]}
                />
            )
        },
    ];

    const survColumns: Column<PulseSurvey>[] = [
        { key: "survey_name", header: i18n.catalog["text_2ddeb37cb0ff"], dataLabel: i18n.catalog["text_52ab09847cf8"] },
        { key: "survey_type", header: i18n.catalog["text_caa3f2bb4a36"], dataLabel: i18n.catalog["text_caa3f2bb4a36"], render: (i) => surveyTypeLabels[i.survey_type] || i.survey_type },
        { key: "start_date", header: i18n.catalog["text_c9364e4fe281"], dataLabel: i18n.catalog["text_c9364e4fe281"], render: (i) => formatDate(i.start_date) },
        { key: "end_date", header: i18n.catalog["text_43a6b0417696"], dataLabel: i18n.catalog["text_43a6b0417696"], render: (i) => formatDate(i.end_date) },
        { key: "is_active", header: i18n.catalog["text_629e90b3af3d"], dataLabel: i18n.catalog["text_629e90b3af3d"], render: (i) => <span className={`badge ${i.is_active ? "badge-success" : "badge-secondary"}`}>{i.is_active ? i18n.catalog["text_4b2d2c65d365"] : i18n.catalog["text_2bd073516a87"]}</span> },
        { key: "responses", header: i18n.catalog["text_8cf2bbf5752b"], dataLabel: i18n.catalog["text_8cf2bbf5752b"], render: (i) => i.responses?.length || 0 },
        {
            key: "id", header: i18n.catalog["text_9f0a0f722601"], dataLabel: i18n.catalog["text_9f0a0f722601"], render: (i) => (
                <ActionButtons
                    actions={[
                        {
                            icon: "eye",
                            title: i18n.catalog["text_29f382c73779"],
                            variant: "view",
                            onClick: () => { setSelectedSurvey(i); setShowSurvDetails(true); }
                        }
                    ]}
                />
            )
        },
    ];

    const tabs = [{ key: "announcements", label: i18n.catalog["text_9ebdedcaed7e"], icon: "bullhorn" }, { key: "surveys", label: i18n.catalog["text_28d90bb9f95b"], icon: "poll" }];

    return (
        <div className="sales-card animate-fade">
            <PageSubHeader
                title={i18n.catalog["text_ceaf6ce2fd61"]}
                titleIcon="bullhorn"
                actions={
                    <>
                        {activeTab === "announcements" ? (
                            canAccess("communications", "create") && (
                                <Button onClick={() => { setAnnForm({ title: "", content: "", priority: "normal", target_audience: "all", publish_date: new Date().toISOString().split("T")[0], expiry_date: "", is_published: false }); setShowAnnDialog(true); }}
                                    variant="primary"
                                    icon="plus"
                                >
                                    {i18n.catalog["text_025c58b5c410"]}</Button>
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
                                    {i18n.catalog["text_ebfda1473c44"]}</Button>
                            )
                        )}
                    </>
                }
            />
            <TabNavigation tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

            {activeTab === "announcements" && (
                <Table columns={annColumns} data={announcements} keyExtractor={(i) => i.id.toString()} emptyMessage={i18n.catalog["text_71b96ee2d26e"]} isLoading={annLoading} pagination={{ currentPage: annPage, totalPages: annTotal, onPageChange: setAnnPage }} />
            )}

            {activeTab === "surveys" && (
                <Table columns={survColumns} data={surveys} keyExtractor={(i) => i.id.toString()} emptyMessage={i18n.catalog["text_2adde5acff93"]} isLoading={survLoading} pagination={{ currentPage: survPage, totalPages: survTotal, onPageChange: setSurvPage }} />
            )}

            {/* Announcement Dialog */}
            <Dialog isOpen={showAnnDialog} onClose={() => setShowAnnDialog(false)} title={i18n.catalog["text_025c58b5c410"]} maxWidth="700px">
                <div className="space-y-4">
                    <TextInput label={i18n.catalog["text_7bb7b5920521"]} value={annForm.title} onChange={(e) => setAnnForm({ ...annForm, title: e.target.value })} />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Select
                            label={i18n.catalog["text_4c3e5a87f1e4"]}
                            value={annForm.priority}
                            onChange={(e) => setAnnForm({ ...annForm, priority: e.target.value })}
                            options={[
                                { value: 'low', label: i18n.catalog["text_5dddca7f4a48"] },
                                { value: 'normal', label: i18n.catalog["text_f3569af24500"] },
                                { value: 'high', label: i18n.catalog["text_48acab16abdb"] },
                                { value: 'urgent', label: i18n.catalog["text_5858bf88ec0b"] }
                            ]}
                        />
                        <Select
                            label={i18n.catalog["text_37e34a9a0a12"]}
                            value={annForm.target_audience}
                            onChange={(e) => setAnnForm({ ...annForm, target_audience: e.target.value })}
                            options={[
                                { value: 'all', label: i18n.catalog["text_b2cac04c941f"] },
                                { value: 'department', label: i18n.catalog["text_427f02347c2f"] },
                                { value: 'role', label: i18n.catalog["text_874867797474"] }
                            ]}
                        />
                        <TextInput label={i18n.catalog["text_93cf0fcdb347"]} type="date" value={annForm.publish_date} onChange={(e) => setAnnForm({ ...annForm, publish_date: e.target.value })} />
                    </div>
                    <Textarea label={i18n.catalog["text_0d7abc9a6d74"]} value={annForm.content} onChange={(e) => setAnnForm({ ...annForm, content: e.target.value })} rows={5} />
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <input type="checkbox" checked={annForm.is_published} onChange={(e) => setAnnForm({ ...annForm, is_published: e.target.checked })} id="pub" />
                        <Label htmlFor="pub" className="text-secondary">{i18n.catalog["text_88460957e040"]}</Label>
                    </div>
                    <div className="flex justify-end gap-2" style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid var(--border-color)" }}><Button variant="secondary" onClick={() => setShowAnnDialog(false)}>{i18n.catalog["text_9a30dc2a96b8"]}</Button><Button variant="primary" onClick={handleSaveAnnouncement} icon="save">{i18n.catalog["text_ddfcaf9d0144"]}</Button></div>
                </div>
            </Dialog>

            {/* Survey Dialog */}
            <Dialog isOpen={showSurvDialog} onClose={() => setShowSurvDialog(false)} title={i18n.catalog["text_ebfda1473c44"]} maxWidth="700px">
                <div className="space-y-4">
                    <TextInput label={i18n.catalog["text_0845b58ca9f7"]} value={survForm.survey_name} onChange={(e) => setSurvForm({ ...survForm, survey_name: e.target.value })} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select
                            label={i18n.catalog["text_caa3f2bb4a36"]}
                            value={survForm.survey_type}
                            onChange={(e) => setSurvForm({ ...survForm, survey_type: e.target.value })}
                            options={[
                                { value: 'sentiment', label: i18n.catalog["text_5876dd6262bf"] },
                                { value: 'burnout', label: i18n.catalog["text_637828284dcd"] },
                                { value: 'engagement', label: i18n.catalog["text_ace24891cec1"] },
                                { value: 'custom', label: i18n.catalog["text_17c28aaaa777"] }
                            ]}
                        />
                        <Select
                            label={i18n.catalog["text_37e34a9a0a12"]}
                            value={survForm.target_audience}
                            onChange={(e) => setSurvForm({ ...survForm, target_audience: e.target.value })}
                            options={[
                                { value: 'all', label: i18n.catalog["text_b2cac04c941f"] },
                                { value: 'department', label: i18n.catalog["text_427f02347c2f"] },
                                { value: 'role', label: i18n.catalog["text_874867797474"] }
                            ]}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <TextInput label={i18n.catalog["text_c9364e4fe281"]} type="date" value={survForm.start_date} onChange={(e) => setSurvForm({ ...survForm, start_date: e.target.value })} />
                        <TextInput label={i18n.catalog["text_004e50125d66"]} type="date" value={survForm.end_date} onChange={(e) => setSurvForm({ ...survForm, end_date: e.target.value })} />
                    </div>
                    <Textarea label={i18n.catalog["text_95023fc76e1b"]} value={survForm.description} onChange={(e) => setSurvForm({ ...survForm, description: e.target.value })} rows={2} />
                    <Textarea label={i18n.catalog["text_1056b77091a7"]} value={survForm.questions} onChange={(e) => setSurvForm({ ...survForm, questions: e.target.value })} rows={4} />
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <input type="checkbox" checked={survForm.is_anonymous} onChange={(e) => setSurvForm({ ...survForm, is_anonymous: e.target.checked })} id="anon" />
                        <Label htmlFor="anon" className="text-secondary">{i18n.catalog["text_3170f3844792"]}</Label>
                    </div>
                    <div className="flex justify-end gap-2" style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid var(--border-color)" }}><Button variant="secondary" onClick={() => setShowSurvDialog(false)}>{i18n.catalog["text_9a30dc2a96b8"]}</Button><Button variant="primary" onClick={handleSaveSurvey} icon="save">{i18n.catalog["text_ddfcaf9d0144"]}</Button></div>
                </div>
            </Dialog>

            {/* Survey Details Dialog */}
            <Dialog isOpen={showSurvDetails} onClose={() => setShowSurvDetails(false)} title={i18n.catalog["text_f375edc2d3bf"]} maxWidth="700px">
                {selectedSurvey && <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><strong>{i18n.catalog["text_b0ae3c0ca9a8"]}</strong> {selectedSurvey.survey_name}</div>
                        <div><strong>{i18n.catalog["text_0e20d829bef2"]}</strong> {surveyTypeLabels[selectedSurvey.survey_type]}</div>
                        <div><strong>{i18n.catalog["text_389190a30041"]}</strong> {formatDate(selectedSurvey.start_date)}</div>
                        <div><strong>{i18n.catalog["text_defe7b237e9d"]}</strong> {formatDate(selectedSurvey.end_date)}</div>
                        <div><strong>{i18n.catalog["text_1ddac0477791"]}</strong> {selectedSurvey.is_anonymous ? i18n.catalog["text_4b2d2c65d365"] : i18n.catalog["text_2bd073516a87"]}</div>
                        <div><strong>{i18n.catalog["text_de9493309b5b"]}</strong> {selectedSurvey.responses?.length || 0}</div>
                    </div>
                    {selectedSurvey.description && <div><strong>{i18n.catalog["text_3ec7e12fb399"]}</strong><p>{selectedSurvey.description}</p></div>}
                    <div><strong>{i18n.catalog["text_010f32270417"]}</strong><pre style={{ background: "var(--bg-secondary)", padding: "1rem", borderRadius: "8px", fontSize: "0.85rem", maxHeight: "200px", overflowY: "auto" }}>{JSON.stringify(selectedSurvey.questions, null, 2)}</pre></div>
                </div>}
            </Dialog>
        </div>
    );
}
