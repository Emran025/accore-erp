"use client";

import { useI18n, catalogMessage } from "@/lib/i18n";
import { PageSubHeader } from "@/components/layout";
import { ActionButtons, Button, Column, Dialog, Label, SearchableSelect, showToast, Table } from "@/components/ui";
import { TextInput } from "@/components/ui/TextInput";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/select";
import { fetchAPI } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatDate } from "@/lib/utils";
import { useAuthStore } from "@/stores/useAuthStore";
import { useEmployeeStore } from "@/stores/useEmployeeStore";
import type { Employee, EmployeeRelationsCase } from "@/types";
import { useEffect, useState } from "react";


const caseTypeLabels: Record<string, string> = {
  grievance: catalogMessage("text_ff1070efe4f8"),
  complaint: catalogMessage("text_12506e99b6f7"),
  misconduct: catalogMessage("text_74de946001aa"),
  performance: catalogMessage("text_a7049a61fea1"),
  harassment: catalogMessage("text_0a267f391766"),
  other: catalogMessage("text_17a9f38e22b6"),
};

const confidentialityLabels: Record<string, string> = {
  low: catalogMessage("text_5dddca7f4a48"),
  medium: catalogMessage("text_42a5dadf6e45"),
  high: catalogMessage("text_48acab16abdb"),
  restricted: catalogMessage("text_1bfb3a580f87"),
};

const statusLabels: Record<string, string> = {
  open: catalogMessage("text_46ea59915eec"),
  in_review: catalogMessage("text_8aac5fac1498"),
  under_investigation: catalogMessage("text_8264d0f28e97"),
  resolved: catalogMessage("text_917419892c64"),
  closed: catalogMessage("text_e655261f9c96"),
};

const statusBadges: Record<string, string> = {
  open: "badge-warning",
  in_review: "badge-info",
  under_investigation: "badge-info",
  resolved: "badge-success",
  closed: "badge-secondary",
};

export function EmployeeRelations() {
    const { t: i18n } = useI18n();
  const [cases, setCases] = useState<EmployeeRelationsCase[]>([]);
  const { allEmployees: employees, loadAllEmployees } = useEmployeeStore();
  const { canAccess } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [totalRecords, setTotalRecords] = useState(0);

  const [showCaseDialog, setShowCaseDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showDisciplinaryDialog, setShowDisciplinaryDialog] = useState(false);

  const [editingCase, setEditingCase] = useState<EmployeeRelationsCase | null>(null);
  const [selectedCase, setSelectedCase] = useState<EmployeeRelationsCase | null>(null);

  const [caseForm, setCaseForm] = useState({
    employee_id: "",
    case_type: "complaint",
    confidentiality_level: "medium",
    description: "",
    status: "open",
    reported_date: new Date().toISOString().split("T")[0],
    resolution: "",
  });

  const [disciplinaryForm, setDisciplinaryForm] = useState({
    action_type: "warning",
    violation_description: "",
    action_taken: "",
    action_date: new Date().toISOString().split("T")[0],
    expiry_date: "",
  });

  useEffect(() => {
    loadAllEmployees();
  }, [loadAllEmployees]);

  useEffect(() => {
    loadCases();
  }, [currentPage, statusFilter]);

  const loadCases = async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams({
        page: currentPage.toString(),
        status: statusFilter,
      });
      const res: any = await fetchAPI(`${API_ENDPOINTS.HUMAN_CAPITAL.EMPLOYEE_RELATIONS.BASE}?${query}`);
      const data = res.data || (Array.isArray(res) ? res : []);
      setCases(data);
      setTotalPages(Number(res.last_page) || 1);
      setTotalRecords(Number(res.total) || data.length);
    } catch (e) {
      console.error(e);
      showToast(i18n.catalog["text_4e281ad19f55"], "error");
    } finally {
      setIsLoading(false);
    }
  };

  const openNewCaseDialog = () => {
    setEditingCase(null);
    setCaseForm({
      employee_id: "",
      case_type: "complaint",
      confidentiality_level: "medium",
      description: "",
      status: "open",
      reported_date: new Date().toISOString().split("T")[0],
      resolution: "",
    });
    setShowCaseDialog(true);
  };

  const handleSaveCase = async () => {
    if (!caseForm.employee_id || !caseForm.description) {
      showToast(i18n.catalog["text_4b74080ad8ab"], "error");
      return;
    }

    const payload = {
      employee_id: Number(caseForm.employee_id),
      case_type: caseForm.case_type,
      confidentiality_level: caseForm.confidentiality_level,
      description: caseForm.description,
      status: caseForm.status,
      reported_date: caseForm.reported_date,
      resolution: caseForm.resolution || undefined,
    };

    try {
      if (editingCase) {
        await fetchAPI(`${API_ENDPOINTS.HUMAN_CAPITAL.EMPLOYEE_RELATIONS.withId(editingCase.id)}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        showToast(i18n.catalog["text_7acc288b5b7b"], "success");
      } else {
        await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.EMPLOYEE_RELATIONS.BASE, {
          method: "POST",
          body: JSON.stringify(payload),
        });
        showToast(i18n.catalog["text_1939e6efdc98"], "success");
      }
      setShowCaseDialog(false);
      loadCases();
    } catch (e: any) {
      showToast(e.message || i18n.catalog["text_2e0468bce1ea"], "error");
    }
  };

  const openEditCase = (item: EmployeeRelationsCase) => {
    setEditingCase(item);
    setCaseForm({
      employee_id: item.employee_id.toString(),
      case_type: item.case_type,
      confidentiality_level: item.confidentiality_level,
      description: item.description,
      status: item.status,
      reported_date: item.reported_date,
      resolution: item.resolution || "",
    });
    setShowCaseDialog(true);
  };

  const openCaseDetails = (item: EmployeeRelationsCase) => {
    setSelectedCase(item);
    setShowDetailsDialog(true);
  };

  const openDisciplinaryDialog = (item: EmployeeRelationsCase) => {
    setSelectedCase(item);
    setDisciplinaryForm({
      action_type: "warning",
      violation_description: "",
      action_taken: "",
      action_date: new Date().toISOString().split("T")[0],
      expiry_date: "",
    });
    setShowDisciplinaryDialog(true);
  };

  const handleSaveDisciplinary = async () => {
    if (!selectedCase) return;
    if (!disciplinaryForm.violation_description || !disciplinaryForm.action_taken) {
      showToast(i18n.catalog["text_ae4bd7a48a26"], "error");
      return;
    }

    try {
      await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.EMPLOYEE_RELATIONS.DISCIPLINARY(selectedCase.id), {
        method: "POST",
        body: JSON.stringify({
          action_type: disciplinaryForm.action_type,
          violation_description: disciplinaryForm.violation_description,
          action_taken: disciplinaryForm.action_taken,
          action_date: disciplinaryForm.action_date,
          expiry_date: disciplinaryForm.expiry_date || undefined,
        }),
      });
      showToast(i18n.catalog["text_9650956d2120"], "success");
      setShowDisciplinaryDialog(false);
      loadCases();
    } catch (e: any) {
      showToast(e.message || i18n.catalog["text_459588aa493f"], "error");
    }
  };

  const columns: Column<EmployeeRelationsCase>[] = [
    {
      key: "case_number",
      header: i18n.catalog["text_84042ce7357e"],
      dataLabel: i18n.catalog["text_84042ce7357e"],
    },
    {
      key: "employee",
      header: i18n.catalog["text_b71a39c832a6"],
      dataLabel: i18n.catalog["text_b71a39c832a6"],
      render: (item) => item.employee?.full_name || "-",
    },
    {
      key: "case_type",
      header: i18n.catalog["text_9e01e2dc5067"],
      dataLabel: i18n.catalog["text_9e01e2dc5067"],
      render: (item) => caseTypeLabels[item.case_type] || item.case_type,
    },
    {
      key: "confidentiality_level",
      header: i18n.catalog["text_284869a2be2a"],
      dataLabel: i18n.catalog["text_284869a2be2a"],
      render: (item) => confidentialityLabels[item.confidentiality_level] || item.confidentiality_level,
    },
    {
      key: "status",
      header: i18n.catalog["text_c3a4749caed4"],
      dataLabel: i18n.catalog["text_c3a4749caed4"],
      render: (item) => (
        <span className={`badge ${statusBadges[item.status] || "badge-secondary"}`}>
          {statusLabels[item.status] || item.status}
        </span>
      ),
    },
    {
      key: "reported_date",
      header: i18n.catalog["text_f406586dd55d"],
      dataLabel: i18n.catalog["text_f406586dd55d"],
      render: (item) => formatDate(item.reported_date),
    },
    {
      key: "disciplinary_actions",
      header: i18n.catalog["text_6b989a1e738d"],
      dataLabel: i18n.catalog["text_6b989a1e738d"],
      render: (item) => item.disciplinary_actions?.length || 0,
    },
    {
      key: "id",
      header: i18n.catalog["text_7797240d6caf"],
      dataLabel: i18n.catalog["text_7797240d6caf"],
      render: (item) => (
        <ActionButtons
          actions={[
            {
              icon: "eye",
              title: i18n.catalog["text_4b615d0e6dd2"],
              variant: "view",
              onClick: () => openCaseDetails(item)
            },
            ...(canAccess("relations", "edit") ? [{
              icon: "edit" as const,
              title: i18n.catalog["text_7be9d526299e"],
              variant: "edit" as const,
              onClick: () => openEditCase(item)
            }] : []),
            ...(canAccess("relations", "edit") ? [{
              icon: "gavel" as const,
              title: i18n.catalog["text_50d2a352dbd3"],
              variant: "secondary" as const,
              onClick: () => openDisciplinaryDialog(item)
            }] : [])
          ]}
        />
      ),
    },
  ];

  const stats = {
    total: totalRecords,
    open: statusFilter === "open" ? totalRecords : (statusFilter === "" ? cases.filter((c) => c.status === "open").length : "-"),
    inProgress: statusFilter === "" ? cases.filter((c) => c.status === "in_review" || c.status === "under_investigation").length : "-",
    closed: statusFilter === "" ? cases.filter((c) => c.status === "resolved" || c.status === "closed").length : "-",
  };

  return (
    <div className="sales-card animate-fade">
      <PageSubHeader
        title={i18n.catalog["text_df02b37e3b72"]}
        titleIcon="scale"
        actions={
          <>
            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="form-select"
              style={{ minWidth: "160px", padding: '0.4rem 2rem 0.4rem 1rem' }}
              placeholder={i18n.catalog["text_1ef213109d57"]}
              options={[
                { value: 'open', label: i18n.catalog["text_46ea59915eec"] },
                { value: 'in_review', label: i18n.catalog["text_8aac5fac1498"] },
                { value: 'under_investigation', label: i18n.catalog["text_8264d0f28e97"] },
                { value: 'resolved', label: i18n.catalog["text_917419892c64"] },
                { value: 'closed', label: i18n.catalog["text_e655261f9c96"] }
              ]}
            />
            {canAccess("relations", "create") && (
              <Button onClick={openNewCaseDialog}
                variant="primary"
                icon="plus"
              >
                {i18n.catalog["text_892fb6705680"]}</Button>
            )}
          </>
        }
      />

      <div
        className="sales-card compact"
        style={{
          marginBottom: "1.5rem",
          background: "linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%)",
          border: "1px solid #fde68a",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "1rem",
          }}
        >
          <div className="stat-card">
            <div className="stat-label">{i18n.catalog["text_3393e82b239e"]}</div>
            <div className="stat-value">{stats.total}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">{i18n.catalog["text_7c0267827a67"]}</div>
            <div className="stat-value text-warning">{stats.open}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">{i18n.catalog["text_0cc6a7db6080"]}</div>
            <div className="stat-value text-info">{stats.inProgress}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">{i18n.catalog["text_164d93b187e4"]}</div>
            <div className="stat-value text-success">{stats.closed}</div>
          </div>
        </div>
      </div>

      <Table
        columns={columns}
        data={cases}
        keyExtractor={(item) => item.id.toString()}
        emptyMessage={i18n.catalog["text_f91a611b35e1"]}
        isLoading={isLoading}
        pagination={{
          currentPage,
          totalPages,
          onPageChange: setCurrentPage,
        }}
      />

      {/* Create / Edit Case Dialog */}
      <Dialog
        isOpen={showCaseDialog}
        onClose={() => setShowCaseDialog(false)}
        title={editingCase ? i18n.catalog["text_7be9d526299e"] : i18n.catalog["text_892fb6705680"]}
        maxWidth="700px"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <Label className="text-secondary mb-1">{i18n.catalog["text_972803dc7d86"]}</Label>
                <SearchableSelect
                  options={employees.map((emp: Employee) => ({ value: emp.id.toString(), label: emp.full_name }))}
                  value={caseForm.employee_id}
                  onChange={(val) => setCaseForm(prev => ({ ...prev, employee_id: val?.toString() || "" }))}
                  placeholder={i18n.catalog["text_dee783929dea"]}
                />
              </div>
              <Select
                label={i18n.catalog["text_9e01e2dc5067"]}
                value={caseForm.case_type}
                onChange={(e) => setCaseForm({ ...caseForm, case_type: e.target.value })}
                options={[
                  { value: 'complaint', label: i18n.catalog["text_12506e99b6f7"] },
                  { value: 'grievance', label: i18n.catalog["text_ff1070efe4f8"] },
                  { value: 'misconduct', label: i18n.catalog["text_74de946001aa"] },
                  { value: 'performance', label: i18n.catalog["text_a7049a61fea1"] },
                  { value: 'harassment', label: i18n.catalog["text_0a267f391766"] },
                  { value: 'other', label: i18n.catalog["text_17a9f38e22b6"] }
                ]}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label={i18n.catalog["text_df05ec94766b"]}
              value={caseForm.confidentiality_level}
              onChange={(e) => setCaseForm({ ...caseForm, confidentiality_level: e.target.value })}
              options={[
                { value: 'low', label: i18n.catalog["text_5dddca7f4a48"] },
                { value: 'medium', label: i18n.catalog["text_42a5dadf6e45"] },
                { value: 'high', label: i18n.catalog["text_48acab16abdb"] },
                { value: 'restricted', label: i18n.catalog["text_1bfb3a580f87"] }
              ]}
            />
            <Select
              label={i18n.catalog["text_c3a4749caed4"]}
              value={caseForm.status}
              onChange={(e) => setCaseForm({ ...caseForm, status: e.target.value })}
              options={[
                { value: 'open', label: i18n.catalog["text_46ea59915eec"] },
                { value: 'in_review', label: i18n.catalog["text_8aac5fac1498"] },
                { value: 'under_investigation', label: i18n.catalog["text_8264d0f28e97"] },
                { value: 'resolved', label: i18n.catalog["text_917419892c64"] },
                { value: 'closed', label: i18n.catalog["text_e655261f9c96"] }
              ]}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextInput
              label={i18n.catalog["text_f406586dd55d"]}
              type="date"
              value={caseForm.reported_date}
              onChange={(e) => setCaseForm({ ...caseForm, reported_date: e.target.value })}
            />
          </div>

          <Textarea
            label={i18n.catalog["text_87553255bf4c"]}
            value={caseForm.description}
            onChange={(e) => setCaseForm({ ...caseForm, description: e.target.value })}
            rows={4}
          />

          <Textarea
            label={i18n.catalog["text_56857620a044"]}
            value={caseForm.resolution}
            onChange={(e) => setCaseForm({ ...caseForm, resolution: e.target.value })}
            rows={3}
          />

          <div
            className="flex justify-end gap-2"
            style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid var(--border-color)" }}
          >
            <Button variant="secondary" onClick={() => setShowCaseDialog(false)}>
              {i18n.catalog["text_9a30dc2a96b8"]}</Button>
            <Button variant="primary" onClick={handleSaveCase} icon="save">
              {i18n.catalog["text_ddfcaf9d0144"]}</Button>
          </div>
        </div>
      </Dialog>

      {/* Case Details Dialog */}
      <Dialog
        isOpen={showDetailsDialog}
        onClose={() => setShowDetailsDialog(false)}
        title={i18n.catalog["text_267d1cc066ef"]}
        maxWidth="800px"
      >
        {selectedCase && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <strong>{i18n.catalog["text_462a2cd8696f"]}</strong> {selectedCase.case_number}
              </div>
              <div>
                <strong>{i18n.catalog["text_b6293eeef8b9"]}</strong> {selectedCase.employee?.full_name || "-"}
              </div>
              <div>
                <strong>{i18n.catalog["text_f0dbc23078b7"]}</strong> {caseTypeLabels[selectedCase.case_type] || selectedCase.case_type}
              </div>
              <div>
                <strong>{i18n.catalog["text_86913294ad08"]}</strong>{" "}
                {confidentialityLabels[selectedCase.confidentiality_level] || selectedCase.confidentiality_level}
              </div>
              <div>
                <strong>{i18n.catalog["text_02e196bdec60"]}</strong>{" "}
                <span className={`badge ${statusBadges[selectedCase.status] || "badge-secondary"}`}>
                  {statusLabels[selectedCase.status] || selectedCase.status}
                </span>
              </div>
              <div>
                <strong>{i18n.catalog["text_635d2d8d5ead"]}</strong> {formatDate(selectedCase.reported_date)}
              </div>
              {selectedCase.resolved_date && (
                <div>
                  <strong>{i18n.catalog["text_2b5e2ef23059"]}</strong> {formatDate(selectedCase.resolved_date)}
                </div>
              )}
            </div>

            <div>
              <strong>{i18n.catalog["text_da8657a4db77"]}</strong>
              <p style={{ marginTop: "0.5rem" }}>{selectedCase.description}</p>
            </div>

            {selectedCase.resolution && (
              <div>
                <strong>{i18n.catalog["text_a9951ad0bce9"]}</strong>
                <p style={{ marginTop: "0.5rem" }}>{selectedCase.resolution}</p>
              </div>
            )}

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <strong>{i18n.catalog["text_a52ebb6e2692"]}</strong>
                {canAccess("relations", "edit") && (
                  <Button size="sm" onClick={() => openDisciplinaryDialog(selectedCase)} variant="secondary" icon="gavel">
                    {i18n.catalog["text_f23986bf557d"]}</Button>
                )}
              </div>
              {selectedCase.disciplinary_actions && selectedCase.disciplinary_actions.length > 0 ? (
                <ul className="list-disc pr-5 space-y-1">
                  {selectedCase.disciplinary_actions.map((action) => (
                    <li key={action.id}>
                      <strong>{action.action_type} - {formatDate(action.action_date)}</strong>:{" "}
                      {action.action_taken}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>{i18n.catalog["text_751ecb8ac408"]}</p>
              )}
            </div>
          </div>
        )}
      </Dialog>

      {/* Disciplinary Action Dialog */}
      <Dialog
        isOpen={showDisciplinaryDialog}
        onClose={() => setShowDisciplinaryDialog(false)}
        title={i18n.catalog["text_50d2a352dbd3"]}
        maxWidth="600px"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label={i18n.catalog["text_21e054481a76"]}
                value={disciplinaryForm.action_type}
                onChange={(e) => setDisciplinaryForm({ ...disciplinaryForm, action_type: e.target.value })}
                options={[
                  { value: 'warning', label: i18n.catalog["text_9cd45fa1f22f"] },
                  { value: 'suspension', label: i18n.catalog["text_87c89429ccaa"] },
                  { value: 'deduction', label: i18n.catalog["text_ec9ccd93320a"] },
                  { value: 'termination', label: i18n.catalog["text_2010c54f5a20"] }
                ]}
              />
              <TextInput
                label={i18n.catalog["text_9b60316f41be"]}
                type="date"
                value={disciplinaryForm.action_date}
                onChange={(e) => setDisciplinaryForm({ ...disciplinaryForm, action_date: e.target.value })}
              />
            </div>
          </div>

          <Textarea
            label={i18n.catalog["text_ef007dff9707"]}
            value={disciplinaryForm.violation_description}
            onChange={(e) => setDisciplinaryForm({ ...disciplinaryForm, violation_description: e.target.value })}
            rows={3}
          />

          <Textarea
            label={i18n.catalog["text_d09169996227"]}
            value={disciplinaryForm.action_taken}
            onChange={(e) => setDisciplinaryForm({ ...disciplinaryForm, action_taken: e.target.value })}
            rows={3}
          />

          <TextInput
            label={i18n.catalog["text_c09242e38dc6"]}
            type="date"
            value={disciplinaryForm.expiry_date}
            onChange={(e) => setDisciplinaryForm({ ...disciplinaryForm, expiry_date: e.target.value })}
          />

          <div
            className="flex justify-end gap-2"
            style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid var(--border-color)" }}
          >
            <Button variant="secondary" onClick={() => setShowDisciplinaryDialog(false)}>
              {i18n.catalog["text_9a30dc2a96b8"]}</Button>
            <Button variant="primary" onClick={handleSaveDisciplinary} icon="save">
              {i18n.catalog["text_ddfcaf9d0144"]}</Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}


