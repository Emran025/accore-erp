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
  grievance: catalogMessage("common.general.appeal"),
  complaint: catalogMessage("common.general.complaint"),
  misconduct: catalogMessage("common.general.misconduct"),
  performance: catalogMessage("common.general.performance"),
  harassment: catalogMessage("common.general.harassment"),
  other: catalogMessage("common.general.other"),
};

const confidentialityLabels: Record<string, string> = {
  low: catalogMessage("common.general.low"),
  medium: catalogMessage("common.general.average"),
  high: catalogMessage("common.general.high"),
  restricted: catalogMessage("common.general.highlyConfidential"),
};

const statusLabels: Record<string, string> = {
  open: catalogMessage("common.general.open"),
  in_review: catalogMessage("common.general.underReview"),
  under_investigation: catalogMessage("common.general.underInvestigation"),
  resolved: catalogMessage("common.general.solution"),
  closed: catalogMessage("common.general.closed.alternative2"),
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
      showToast(i18n.catalog["humanCapital.employeerelations.failedLoadEmployeeRelationsCases"], "error");
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
      showToast(i18n.catalog["humanCapital.employeerelations.pleaseSelectEmployeeEnterCaseDescription"], "error");
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
        showToast(i18n.catalog["humanCapital.employeerelations.caseUpdatedSuccessfully"], "success");
      } else {
        await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.EMPLOYEE_RELATIONS.BASE, {
          method: "POST",
          body: JSON.stringify(payload),
        });
        showToast(i18n.catalog["humanCapital.employeerelations.caseCreatedSuccessfully"], "success");
      }
      setShowCaseDialog(false);
      loadCases();
    } catch (e: any) {
      showToast(e.message || i18n.catalog["humanCapital.employeerelations.errorOccurredWhileSavingCase"], "error");
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
      showToast(i18n.catalog["humanCapital.employeerelations.pleaseEnterViolationDetailsActionTaken"], "error");
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
      showToast(i18n.catalog["humanCapital.employeerelations.disciplinaryActionRecordedSuccessfully"], "success");
      setShowDisciplinaryDialog(false);
      loadCases();
    } catch (e: any) {
      showToast(e.message || i18n.catalog["humanCapital.employeerelations.failedSaveDisciplinaryAction"], "error");
    }
  };

  const columns: Column<EmployeeRelationsCase>[] = [
    {
      key: "case_number",
      header: i18n.catalog["common.general.caseNumber"],
      dataLabel: i18n.catalog["common.general.caseNumber"],
    },
    {
      key: "employee",
      header: i18n.catalog["common.general.employee.alternative3"],
      dataLabel: i18n.catalog["common.general.employee.alternative3"],
      render: (item) => item.employee?.full_name || "-",
    },
    {
      key: "case_type",
      header: i18n.catalog["common.general.caseType"],
      dataLabel: i18n.catalog["common.general.caseType"],
      render: (item) => caseTypeLabels[item.case_type] || item.case_type,
    },
    {
      key: "confidentiality_level",
      header: i18n.catalog["common.general.confidential"],
      dataLabel: i18n.catalog["common.general.confidential"],
      render: (item) => confidentialityLabels[item.confidentiality_level] || item.confidentiality_level,
    },
    {
      key: "status",
      header: i18n.catalog["common.general.status.alternative2"],
      dataLabel: i18n.catalog["common.general.status.alternative2"],
      render: (item) => (
        <span className={`badge ${statusBadges[item.status] || "badge-secondary"}`}>
          {statusLabels[item.status] || item.status}
        </span>
      ),
    },
    {
      key: "reported_date",
      header: i18n.catalog["common.general.reportDate"],
      dataLabel: i18n.catalog["common.general.reportDate"],
      render: (item) => formatDate(item.reported_date),
    },
    {
      key: "disciplinary_actions",
      header: i18n.catalog["common.general.disciplinaryActions"],
      dataLabel: i18n.catalog["common.general.disciplinaryActions"],
      render: (item) => item.disciplinary_actions?.length || 0,
    },
    {
      key: "id",
      header: i18n.catalog["common.general.actions"],
      dataLabel: i18n.catalog["common.general.actions"],
      render: (item) => (
        <ActionButtons
          actions={[
            {
              icon: "eye",
              title: i18n.catalog["common.general.viewDetails"],
              variant: "view",
              onClick: () => openCaseDetails(item)
            },
            ...(canAccess("relations", "edit") ? [{
              icon: "edit" as const,
              title: i18n.catalog["common.general.editCase"],
              variant: "edit" as const,
              onClick: () => openEditCase(item)
            }] : []),
            ...(canAccess("relations", "edit") ? [{
              icon: "gavel" as const,
              title: i18n.catalog["common.general.addDisciplinaryAction"],
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
        title={i18n.catalog["humanCapital.employeerelations.employeeRelationsCases"]}
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
              placeholder={i18n.catalog["common.general.allStatuses"]}
              options={[
                { value: 'open', label: i18n.catalog["common.general.open"] },
                { value: 'in_review', label: i18n.catalog["common.general.underReview"] },
                { value: 'under_investigation', label: i18n.catalog["common.general.underInvestigation"] },
                { value: 'resolved', label: i18n.catalog["common.general.solution"] },
                { value: 'closed', label: i18n.catalog["common.general.closed.alternative2"] }
              ]}
            />
            {canAccess("relations", "create") && (
              <Button onClick={openNewCaseDialog}
                variant="primary"
                icon="plus"
              >
                {i18n.catalog["common.general.openNewCase"]}</Button>
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
            <div className="stat-label">{i18n.catalog["humanCapital.employeerelations.totalCases"]}</div>
            <div className="stat-value">{stats.total}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">{i18n.catalog["humanCapital.employeerelations.open"]}</div>
            <div className="stat-value text-warning">{stats.open}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">{i18n.catalog["common.general.processing"]}</div>
            <div className="stat-value text-info">{stats.inProgress}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">{i18n.catalog["humanCapital.employeerelations.closedResolved"]}</div>
            <div className="stat-value text-success">{stats.closed}</div>
          </div>
        </div>
      </div>

      <Table
        columns={columns}
        data={cases}
        keyExtractor={(item) => item.id.toString()}
        emptyMessage={i18n.catalog["humanCapital.employeerelations.noIssuesRegistered"]}
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
        title={editingCase ? i18n.catalog["common.general.editCase"] : i18n.catalog["common.general.openNewCase"]}
        maxWidth="700px"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <Label className="text-secondary mb-1">{i18n.catalog["common.general.employee"]}</Label>
                <SearchableSelect
                  options={employees.map((emp: Employee) => ({ value: emp.id.toString(), label: emp.full_name }))}
                  value={caseForm.employee_id}
                  onChange={(val) => setCaseForm(prev => ({ ...prev, employee_id: val?.toString() || "" }))}
                  placeholder={i18n.catalog["common.general.selectEmployee"]}
                />
              </div>
              <Select
                label={i18n.catalog["common.general.caseType"]}
                value={caseForm.case_type}
                onChange={(e) => setCaseForm({ ...caseForm, case_type: e.target.value })}
                options={[
                  { value: 'complaint', label: i18n.catalog["common.general.complaint"] },
                  { value: 'grievance', label: i18n.catalog["common.general.appeal"] },
                  { value: 'misconduct', label: i18n.catalog["common.general.misconduct"] },
                  { value: 'performance', label: i18n.catalog["common.general.performance"] },
                  { value: 'harassment', label: i18n.catalog["common.general.harassment"] },
                  { value: 'other', label: i18n.catalog["common.general.other"] }
                ]}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label={i18n.catalog["humanCapital.employeerelations.confidentialityLevel"]}
              value={caseForm.confidentiality_level}
              onChange={(e) => setCaseForm({ ...caseForm, confidentiality_level: e.target.value })}
              options={[
                { value: 'low', label: i18n.catalog["common.general.low"] },
                { value: 'medium', label: i18n.catalog["common.general.average"] },
                { value: 'high', label: i18n.catalog["common.general.high"] },
                { value: 'restricted', label: i18n.catalog["common.general.highlyConfidential"] }
              ]}
            />
            <Select
              label={i18n.catalog["common.general.status.alternative2"]}
              value={caseForm.status}
              onChange={(e) => setCaseForm({ ...caseForm, status: e.target.value })}
              options={[
                { value: 'open', label: i18n.catalog["common.general.open"] },
                { value: 'in_review', label: i18n.catalog["common.general.underReview"] },
                { value: 'under_investigation', label: i18n.catalog["common.general.underInvestigation"] },
                { value: 'resolved', label: i18n.catalog["common.general.solution"] },
                { value: 'closed', label: i18n.catalog["common.general.closed.alternative2"] }
              ]}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextInput
              label={i18n.catalog["common.general.reportDate"]}
              type="date"
              value={caseForm.reported_date}
              onChange={(e) => setCaseForm({ ...caseForm, reported_date: e.target.value })}
            />
          </div>

          <Textarea
            label={i18n.catalog["humanCapital.employeerelations.caseDescription"]}
            value={caseForm.description}
            onChange={(e) => setCaseForm({ ...caseForm, description: e.target.value })}
            rows={4}
          />

          <Textarea
            label={i18n.catalog["humanCapital.employeerelations.solutionSummaryOptional"]}
            value={caseForm.resolution}
            onChange={(e) => setCaseForm({ ...caseForm, resolution: e.target.value })}
            rows={3}
          />

          <div
            className="flex justify-end gap-2"
            style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid var(--border-color)" }}
          >
            <Button variant="secondary" onClick={() => setShowCaseDialog(false)}>
              {i18n.catalog["common.general.cancel"]}</Button>
            <Button variant="primary" onClick={handleSaveCase} icon="save">
              {i18n.catalog["common.general.save"]}</Button>
          </div>
        </div>
      </Dialog>

      {/* Case Details Dialog */}
      <Dialog
        isOpen={showDetailsDialog}
        onClose={() => setShowDetailsDialog(false)}
        title={i18n.catalog["humanCapital.employeerelations.caseDetails"]}
        maxWidth="800px"
      >
        {selectedCase && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <strong>{i18n.catalog["humanCapital.employeerelations.caseNumber"]}</strong> {selectedCase.case_number}
              </div>
              <div>
                <strong>{i18n.catalog["common.general.employee.alternative2"]}</strong> {selectedCase.employee?.full_name || "-"}
              </div>
              <div>
                <strong>{i18n.catalog["humanCapital.employeerelations.caseType"]}</strong> {caseTypeLabels[selectedCase.case_type] || selectedCase.case_type}
              </div>
              <div>
                <strong>{i18n.catalog["humanCapital.employeerelations.confidentiality"]}</strong>{" "}
                {confidentialityLabels[selectedCase.confidentiality_level] || selectedCase.confidentiality_level}
              </div>
              <div>
                <strong>{i18n.catalog["common.general.status"]}</strong>{" "}
                <span className={`badge ${statusBadges[selectedCase.status] || "badge-secondary"}`}>
                  {statusLabels[selectedCase.status] || selectedCase.status}
                </span>
              </div>
              <div>
                <strong>{i18n.catalog["humanCapital.employeerelations.reportDate"]}</strong> {formatDate(selectedCase.reported_date)}
              </div>
              {selectedCase.resolved_date && (
                <div>
                  <strong>{i18n.catalog["humanCapital.employeerelations.closingDate"]}</strong> {formatDate(selectedCase.resolved_date)}
                </div>
              )}
            </div>

            <div>
              <strong>{i18n.catalog["humanCapital.employeerelations.issueDescription"]}</strong>
              <p style={{ marginTop: "0.5rem" }}>{selectedCase.description}</p>
            </div>

            {selectedCase.resolution && (
              <div>
                <strong>{i18n.catalog["humanCapital.employeerelations.solutionSummary"]}</strong>
                <p style={{ marginTop: "0.5rem" }}>{selectedCase.resolution}</p>
              </div>
            )}

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <strong>{i18n.catalog["humanCapital.employeerelations.disciplinaryActions"]}</strong>
                {canAccess("relations", "edit") && (
                  <Button size="sm" onClick={() => openDisciplinaryDialog(selectedCase)} variant="secondary" icon="gavel">
                    {i18n.catalog["humanCapital.employeerelations.addAction"]}</Button>
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
                <p>{i18n.catalog["humanCapital.employeerelations.noDisciplinaryActionsRecordedThisCase"]}</p>
              )}
            </div>
          </div>
        )}
      </Dialog>

      {/* Disciplinary Action Dialog */}
      <Dialog
        isOpen={showDisciplinaryDialog}
        onClose={() => setShowDisciplinaryDialog(false)}
        title={i18n.catalog["common.general.addDisciplinaryAction"]}
        maxWidth="600px"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label={i18n.catalog["humanCapital.employeerelations.actionType"]}
                value={disciplinaryForm.action_type}
                onChange={(e) => setDisciplinaryForm({ ...disciplinaryForm, action_type: e.target.value })}
                options={[
                  { value: 'warning', label: i18n.catalog["humanCapital.employeerelations.alert"] },
                  { value: 'suspension', label: i18n.catalog["common.general.disable"] },
                  { value: 'deduction', label: i18n.catalog["common.general.discount.alternative2"] },
                  { value: 'termination', label: i18n.catalog["common.general.terminateService"] }
                ]}
              />
              <TextInput
                label={i18n.catalog["humanCapital.employeerelations.actionDate"]}
                type="date"
                value={disciplinaryForm.action_date}
                onChange={(e) => setDisciplinaryForm({ ...disciplinaryForm, action_date: e.target.value })}
              />
            </div>
          </div>

          <Textarea
            label={i18n.catalog["humanCapital.employeerelations.violationDescription"]}
            value={disciplinaryForm.violation_description}
            onChange={(e) => setDisciplinaryForm({ ...disciplinaryForm, violation_description: e.target.value })}
            rows={3}
          />

          <Textarea
            label={i18n.catalog["humanCapital.employeerelations.actionTaken"]}
            value={disciplinaryForm.action_taken}
            onChange={(e) => setDisciplinaryForm({ ...disciplinaryForm, action_taken: e.target.value })}
            rows={3}
          />

          <TextInput
            label={i18n.catalog["humanCapital.employeerelations.actionExpirationDateOptional"]}
            type="date"
            value={disciplinaryForm.expiry_date}
            onChange={(e) => setDisciplinaryForm({ ...disciplinaryForm, expiry_date: e.target.value })}
          />

          <div
            className="flex justify-end gap-2"
            style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid var(--border-color)" }}
          >
            <Button variant="secondary" onClick={() => setShowDisciplinaryDialog(false)}>
              {i18n.catalog["common.general.cancel"]}</Button>
            <Button variant="primary" onClick={handleSaveDisciplinary} icon="save">
              {i18n.catalog["common.general.save"]}</Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}


