"use client";

import { useI18n, catalogText, catalogMessage } from "@/lib/i18n";
import { PageSubHeader } from "@/components/layout";
import { ActionButtons, Button, Column, Dialog, Label, TabNavigation, Table, showToast } from "@/components/ui";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { TextInput } from "@/components/ui/TextInput";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/select";
import { fetchAPI } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { getIcon } from "@/lib/icons";
import { formatDate } from "@/lib/utils";
import { useAuthStore } from "@/stores/useAuthStore";
import { useEmployeeStore } from "@/stores/useEmployeeStore";
import type { Employee } from "@/types";
import { useEffect, useState } from "react";

interface KnowledgeArticle {
  id: number; title: string; content?: string; category: string;
  tags?: string[]; view_count: number; helpful_count: number;
  is_published: boolean; created_at: string; file_path?: string;
}

interface Expertise {
  id: number; employee_id: number; employee?: { full_name: string };
  skill_name: string; proficiency_level: string; years_of_experience: number;
  description?: string; certifications?: string[]; projects?: string[];
  is_available_for_projects: boolean;
}

const categoryLabels: Record<string, string> = { policy: catalogMessage("text_56ccba3b51a7"), procedure: catalogMessage("text_8b2c85333b99"), best_practice: catalogMessage("text_e0af260f23ea"), faq: catalogMessage("text_10cfb406c4aa"), training: catalogMessage("text_473a0e92b97c"), other: catalogMessage("text_17a9f38e22b6") };
const profLabels: Record<string, string> = { beginner: catalogMessage("text_5815d31a6692"), intermediate: catalogMessage("text_42a5dadf6e45"), advanced: catalogMessage("text_a3993b7fdc58"), expert: catalogMessage("text_bbb098674cde") };
const profBadges: Record<string, string> = { beginner: "badge-secondary", intermediate: "badge-info", advanced: "badge-warning", expert: "badge-success" };

export function KnowledgeBase() {
    const { t: i18n } = useI18n();
  const { canAccess } = useAuthStore();
  const [activeTab, setActiveTab] = useState("knowledge");
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [expertise, setExpertise] = useState<Expertise[]>([]);
  const { allEmployees: employees, loadAllEmployees } = useEmployeeStore();
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  // Dialogs
  const [showArticleDialog, setShowArticleDialog] = useState(false);
  const [showArticleDetail, setShowArticleDetail] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null);
  const [showExpertDialog, setShowExpertDialog] = useState(false);
  const [showExpertDetail, setShowExpertDetail] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState<Expertise | null>(null);
  // Forms
  const [articleForm, setArticleForm] = useState({ title: "", content: "", category: "policy", tags: "", is_published: false });
  const [expertForm, setExpertForm] = useState({ employee_id: "", skill_name: "", proficiency_level: "beginner", years_of_experience: "", description: "", is_available_for_projects: true });

  useEffect(() => { loadAllEmployees(); }, [loadAllEmployees]);
  useEffect(() => { setCurrentPage(1); }, [activeTab]);
  useEffect(() => { activeTab === "knowledge" ? loadArticles() : loadExpertise(); }, [activeTab, currentPage, searchTerm]);

  const loadArticles = async () => {
    setIsLoading(true);
    try {
      const q = new URLSearchParams({ page: currentPage.toString(), ...(searchTerm && { search: searchTerm }) });
      const res: any = await fetchAPI(`${API_ENDPOINTS.HUMAN_CAPITAL.KNOWLEDGE.BASE}?${q}`);
      setArticles(res.data || []); setTotalPages(Number(res.last_page) || 1);
    } catch { showToast(i18n.catalog["text_32b5b623f8f5"], "error"); }
    finally { setIsLoading(false); }
  };

  const loadExpertise = async () => {
    setIsLoading(true);
    try {
      const res: any = await fetchAPI(`${API_ENDPOINTS.HUMAN_CAPITAL.EXPERTISE.BASE}?page=${currentPage}`);
      setExpertise(res.data || []); setTotalPages(Number(res.last_page) || 1);
    } catch { showToast(i18n.catalog["text_1d21692b8729"], "error"); }
    finally { setIsLoading(false); }
  };

  const handleSaveArticle = async () => {
    if (!articleForm.title || !articleForm.content) { showToast(i18n.catalog["text_7b758312f829"], "error"); return; }
    try {
      await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.KNOWLEDGE.BASE, {
        method: "POST", body: JSON.stringify({
          title: articleForm.title, content: articleForm.content, category: articleForm.category,
          tags: articleForm.tags ? articleForm.tags.split(",").map(t => t.trim()).filter(Boolean) : undefined,
          is_published: articleForm.is_published,
        })
      });
      showToast(i18n.catalog["text_069f282692cd"], "success"); setShowArticleDialog(false); loadArticles();
    } catch (e: any) { showToast(e.message || i18n.catalog["text_b0dbba00004b"], "error"); }
  };

  const viewArticleDetail = async (id: number) => {
    try {
      const res: any = await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.KNOWLEDGE.withId(id));
      setSelectedArticle(res.data || res); setShowArticleDetail(true);
    } catch { showToast(i18n.catalog["text_6467762a8e34"], "error"); }
  };

  const handlePublishArticle = async (id: number, publish: boolean) => {
    try {
      await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.KNOWLEDGE.withId(id), { method: "PUT", body: JSON.stringify({ is_published: publish }) });
      showToast(publish ? i18n.catalog["text_45391725043d"] : i18n.catalog["text_9330b63fea3e"], "success"); loadArticles();
    } catch (e: any) { showToast(e.message || i18n.catalog["text_96c789857dbf"], "error"); }
  };

  const handleMarkHelpful = async (id: number) => {
    try {
      await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.KNOWLEDGE.HELPFUL(id), { method: "POST" });
      showToast(i18n.catalog["text_a282c8324134"], "success");
      if (selectedArticle && selectedArticle.id === id) {
        setSelectedArticle({ ...selectedArticle, helpful_count: selectedArticle.helpful_count + 1 });
      }
    } catch { }
  };

  const handleSaveExpert = async () => {
    if (!expertForm.employee_id || !expertForm.skill_name) { showToast(i18n.catalog["text_7b758312f829"], "error"); return; }
    try {
      await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.EXPERTISE.BASE, {
        method: "POST", body: JSON.stringify({
          employee_id: Number(expertForm.employee_id), skill_name: expertForm.skill_name,
          proficiency_level: expertForm.proficiency_level,
          years_of_experience: expertForm.years_of_experience ? Number(expertForm.years_of_experience) : undefined,
          description: expertForm.description || undefined,
          is_available_for_projects: expertForm.is_available_for_projects,
        })
      });
      showToast(i18n.catalog["text_748ba1f205db"], "success"); setShowExpertDialog(false); loadExpertise();
    } catch (e: any) { showToast(e.message || i18n.catalog["text_b0dbba00004b"], "error"); }
  };

  const articleColumns: Column<KnowledgeArticle>[] = [
    { key: "title", header: i18n.catalog["text_2d110e56d5f5"], dataLabel: i18n.catalog["text_2d110e56d5f5"] },
    { key: "category", header: i18n.catalog["text_ff61fb213ffc"], dataLabel: i18n.catalog["text_ff61fb213ffc"], render: (i) => categoryLabels[i.category] || i.category },
    { key: "view_count", header: i18n.catalog["text_51629c524d3c"], dataLabel: i18n.catalog["text_51629c524d3c"], render: (i) => <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>{getIcon("eye", "", 14)} {i.view_count}</span> },
    { key: "helpful_count", header: i18n.catalog["text_55cf1e58e096"], dataLabel: i18n.catalog["text_55cf1e58e096"], render: (i) => <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>{getIcon("thumbs-up", "", 14)} {i.helpful_count}</span> },
    { key: "is_published", header: i18n.catalog["text_c3a4749caed4"], dataLabel: i18n.catalog["text_c3a4749caed4"], render: (i) => <span className={`badge ${i.is_published ? "badge-success" : "badge-secondary"}`}>{i.is_published ? i18n.catalog["text_74f0d5710a99"] : i18n.catalog["text_552aec56f591"]}</span> },
    {
      key: "id", header: i18n.catalog["text_9f0a0f722601"], dataLabel: i18n.catalog["text_9f0a0f722601"], render: (i) => (
        <ActionButtons
          actions={[
            {
              icon: "eye",
              title: i18n.catalog["text_3824e18ca83b"],
              variant: "view",
              onClick: () => viewArticleDetail(i.id)
            },
            ...(canAccess("knowledge", "edit") ? [{
              icon: (i.is_published ? "eye-off" : "upload") as any,
              title: i.is_published ? i18n.catalog["text_391ee0811948"] : i18n.catalog["text_b19234315bac"],
              variant: (i.is_published ? "secondary" : "success") as any,
              onClick: () => handlePublishArticle(i.id, !i.is_published)
            }] : [])
          ]}
        />
      )
    },
  ];

  const expertColumns: Column<Expertise>[] = [
    { key: "employee", header: i18n.catalog["text_b71a39c832a6"], dataLabel: i18n.catalog["text_b71a39c832a6"], render: (i) => i.employee?.full_name || "-" },
    { key: "skill_name", header: i18n.catalog["text_19b43cba0b90"], dataLabel: i18n.catalog["text_19b43cba0b90"] },
    { key: "proficiency_level", header: i18n.catalog["text_1256b3c2e7fc"], dataLabel: i18n.catalog["text_1256b3c2e7fc"], render: (i) => <span className={`badge ${profBadges[i.proficiency_level]}`}>{profLabels[i.proficiency_level] || i.proficiency_level}</span> },
    { key: "years_of_experience", header: i18n.catalog["text_324bf1664245"], dataLabel: i18n.catalog["text_4d50c4c9262b"], render: (i) => catalogText(i18n, "text_f69616269742", { value0: i.years_of_experience }) },
    { key: "is_available_for_projects", header: i18n.catalog["text_1f5830f563ab"], dataLabel: i18n.catalog["text_1f5830f563ab"], render: (i) => <span className={`badge ${i.is_available_for_projects ? "badge-success" : "badge-secondary"}`}>{i.is_available_for_projects ? i18n.catalog["text_4b2d2c65d365"] : i18n.catalog["text_2bd073516a87"]}</span> },
    {
      key: "id", header: i18n.catalog["text_9f0a0f722601"], dataLabel: i18n.catalog["text_9f0a0f722601"], render: (i) => (
        <ActionButtons
          actions={[
            {
              icon: "eye",
              title: i18n.catalog["text_29f382c73779"],
              variant: "view",
              onClick: () => { setSelectedExpert(i); setShowExpertDetail(true); }
            }
          ]}
        />
      )
    },
  ];

  const tabs = [
    ...(canAccess("knowledge", "view") ? [{ key: "knowledge", label: i18n.catalog["text_659aa2733c32"], icon: "book" }] : []),
    ...(canAccess("expertise", "view") ? [{ key: "expertise", label: i18n.catalog["text_e688fc5a7084"], icon: "users-gear" }] : [])
  ];

  return (
    <div className="sales-card animate-fade">
      <PageSubHeader
        title={i18n.catalog["text_659aa2733c32"]}
        titleIcon="book"
        searchInput={
          <SearchableSelect
            options={[]}
            value={searchTerm} onChange={(value) => { setSearchTerm(value?.toLocaleString ?? ''); setCurrentPage(1); }}
            onSearch={(val) => {
              setSearchTerm(val);
              setCurrentPage(1);
            }}
            placeholder={i18n.catalog["text_76b858f96489"]}
            className="search-input"
          />
        }
        actions={
          <>
            {activeTab === "knowledge" && canAccess("knowledge", "create") && <>
              <Button
                onClick={() => { setArticleForm({ title: "", content: "", category: "policy", tags: "", is_published: false }); setShowArticleDialog(true); }}
                variant="primary"
                icon="plus"
              >
                {i18n.catalog["text_cca90b30125e"]}</Button>
            </>}
            {activeTab === "expertise" && canAccess("expertise", "create") &&
              <Button
                onClick={() => { setExpertForm({ employee_id: "", skill_name: "", proficiency_level: "beginner", years_of_experience: "", description: "", is_available_for_projects: true }); setShowExpertDialog(true); }}
                variant="primary"
                icon="plus"
              >
                {i18n.catalog["text_f2a9dc2e107b"]}</Button>}
          </>
        }
      />

      <TabNavigation tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === "knowledge" ? (
        <Table columns={articleColumns} data={articles} keyExtractor={(i) => i.id.toString()} emptyMessage={i18n.catalog["text_6c99c54f872e"]} isLoading={isLoading} pagination={{ currentPage, totalPages, onPageChange: setCurrentPage }} />
      ) : (
        <Table columns={expertColumns} data={expertise} keyExtractor={(i) => i.id.toString()} emptyMessage={i18n.catalog["text_ea52378c2cd1"]} isLoading={isLoading} pagination={{ currentPage, totalPages, onPageChange: setCurrentPage }} />
      )}

      {/* Create Article Dialog */}
      <Dialog isOpen={showArticleDialog} onClose={() => setShowArticleDialog(false)} title={i18n.catalog["text_6c323640d3b8"]} maxWidth="700px">
        <div className="space-y-4">
          <TextInput label={i18n.catalog["text_7bb7b5920521"]} value={articleForm.title} onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label={i18n.catalog["text_ff61fb213ffc"]}
              value={articleForm.category}
              onChange={(e) => setArticleForm({ ...articleForm, category: e.target.value })}
              options={Object.entries(categoryLabels).map(([value, label]) => ({ value, label }))}
            />
            <TextInput label={i18n.catalog["text_bdb46fd8fa2c"]} value={articleForm.tags} onChange={(e) => setArticleForm({ ...articleForm, tags: e.target.value })} placeholder={i18n.catalog["text_2743f00cdeb1"]} />
          </div>
          <Textarea label={i18n.catalog["text_0d7abc9a6d74"]} value={articleForm.content} onChange={(e) => setArticleForm({ ...articleForm, content: e.target.value })} rows={8} />
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <input type="checkbox" checked={articleForm.is_published} onChange={(e) => setArticleForm({ ...articleForm, is_published: e.target.checked })} id="is_published" />
            <Label htmlFor="is_published" className="text-secondary">{i18n.catalog["text_1811127e0abb"]}</Label>
          </div>
          <div className="flex justify-end gap-2" style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid var(--border-color)" }}><Button variant="secondary" onClick={() => setShowArticleDialog(false)}>{i18n.catalog["text_9a30dc2a96b8"]}</Button><Button variant="primary" onClick={handleSaveArticle} icon="save">{i18n.catalog["text_ddfcaf9d0144"]}</Button></div>
        </div>
      </Dialog>

      {/* Article Detail */}
      <Dialog isOpen={showArticleDetail} onClose={() => setShowArticleDetail(false)} title={i18n.catalog["text_569916928c0a"]} maxWidth="700px">
        {selectedArticle && <div className="space-y-4">
          <h3 style={{ margin: 0 }}>{selectedArticle.title}</h3>
          <div style={{ display: "flex", gap: "1rem", color: "var(--text-secondary)", fontSize: "0.85rem", alignItems: "center" }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>{getIcon("folder", "", 14)} {categoryLabels[selectedArticle.category]}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>{getIcon("eye", "", 14)} {selectedArticle.view_count}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>{getIcon("thumbs-up", "", 14)} {selectedArticle.helpful_count}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>{getIcon("calendar", "", 14)} {formatDate(selectedArticle.created_at)}</span>
            <span className={`badge ${selectedArticle.is_published ? "badge-success" : "badge-secondary"}`}>{selectedArticle.is_published ? i18n.catalog["text_74f0d5710a99"] : i18n.catalog["text_552aec56f591"]}</span>
          </div>
          {selectedArticle.tags && selectedArticle.tags.length > 0 && <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {selectedArticle.tags.map((t, i) => <span key={i} className="badge badge-info">{t}</span>)}
          </div>}
          <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.8, padding: "1rem", background: "var(--bg-secondary)", borderRadius: "8px" }}>{selectedArticle.content}</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Button variant="secondary" onClick={() => handleMarkHelpful(selectedArticle.id)} icon="thumbs-up">{i18n.catalog["text_55cf1e58e096"]}</Button>
          </div>
        </div>}
      </Dialog>

      {/* Create Expertise Dialog */}
      <Dialog isOpen={showExpertDialog} onClose={() => setShowExpertDialog(false)} title={i18n.catalog["text_fda68ae0af09"]} maxWidth="550px">
        <div className="space-y-4">
          <Select
            label={i18n.catalog["text_972803dc7d86"]}
            value={expertForm.employee_id}
            onChange={(e) => setExpertForm({ ...expertForm, employee_id: e.target.value })}
            placeholder={i18n.catalog["text_d6b8d3e4d508"]}
            options={employees.map((e: Employee) => ({ value: e.id.toString(), label: e.full_name }))}
          />
          <TextInput label={i18n.catalog["text_4320d709076d"]} value={expertForm.skill_name} onChange={(e) => setExpertForm({ ...expertForm, skill_name: e.target.value })} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label={i18n.catalog["text_eaa17fda7bfa"]}
              value={expertForm.proficiency_level}
              onChange={(e) => setExpertForm({ ...expertForm, proficiency_level: e.target.value })}
              options={Object.entries(profLabels).map(([value, label]) => ({ value, label }))}
            />
            <TextInput label={i18n.catalog["text_324bf1664245"]} type="number" value={expertForm.years_of_experience} onChange={(e) => setExpertForm({ ...expertForm, years_of_experience: e.target.value })} />
          </div>
          <Textarea label={i18n.catalog["text_95023fc76e1b"]} value={expertForm.description} onChange={(e) => setExpertForm({ ...expertForm, description: e.target.value })} rows={3} />
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <input type="checkbox" checked={expertForm.is_available_for_projects} onChange={(e) => setExpertForm({ ...expertForm, is_available_for_projects: e.target.checked })} id="is_available_for_projects" />
            <Label htmlFor="is_available_for_projects" className="text-secondary">{i18n.catalog["text_b0f6353ce55e"]}</Label>
          </div>
          <div className="flex justify-end gap-2" style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid var(--border-color)" }}><Button variant="secondary" onClick={() => setShowExpertDialog(false)}>{i18n.catalog["text_9a30dc2a96b8"]}</Button><Button variant="primary" onClick={handleSaveExpert} icon="save">{i18n.catalog["text_ddfcaf9d0144"]}</Button></div>
        </div>
      </Dialog>

      {/* Expertise Detail */}
      <Dialog isOpen={showExpertDetail} onClose={() => setShowExpertDetail(false)} title={i18n.catalog["text_62465ff2bccb"]} maxWidth="550px">
        {selectedExpert && <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><strong>{i18n.catalog["text_b6293eeef8b9"]}</strong> {selectedExpert.employee?.full_name}</div>
            <div><strong>{i18n.catalog["text_5c529d2031d1"]}</strong> {selectedExpert.skill_name}</div>
            <div><strong>{i18n.catalog["text_265474ed3570"]}</strong> <span className={`badge ${profBadges[selectedExpert.proficiency_level]}`}>{profLabels[selectedExpert.proficiency_level]}</span></div>
            <div><strong>{i18n.catalog["text_fdd1ac4a04a2"]}</strong> {selectedExpert.years_of_experience} {i18n.catalog["text_2d54bea33ed4"]}</div>
            <div><strong>{i18n.catalog["text_5da38d79a68c"]}</strong> <span className={`badge ${selectedExpert.is_available_for_projects ? "badge-success" : "badge-secondary"}`}>{selectedExpert.is_available_for_projects ? i18n.catalog["text_4b2d2c65d365"] : i18n.catalog["text_2bd073516a87"]}</span></div>
          </div>
          {selectedExpert.description && <div><strong>{i18n.catalog["text_3ec7e12fb399"]}</strong><p>{selectedExpert.description}</p></div>}
          {selectedExpert.certifications && selectedExpert.certifications.length > 0 && <div>
            <strong>{i18n.catalog["text_a05a497758d0"]}</strong>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.25rem" }}>
              {selectedExpert.certifications.map((c, i) => <span key={i} className="badge badge-info">{c}</span>)}
            </div>
          </div>}
        </div>}
      </Dialog>
    </div>
  );
}
