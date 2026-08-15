"use client";

import { useI18n, catalogMessage } from "@/lib/i18n";
import { PageSubHeader } from "@/components/layout";
import { ActionButtons, Button, Column, Select, Table } from "@/components/ui";
import { fetchAPI } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatDate } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Compliance {
  id: number;
  compliance_number: string;
  compliance_type: string;
  standard_name: string;
  employee_id?: number;
  employee?: { full_name: string };
  status: string;
  due_date?: string;
  completed_date?: string;
}

const typeLabels: Record<string, string> = {
  iso: "ISO",
  soc: "SOC",
  internal_audit: catalogMessage("humanCapital.qacompliance.internalAudit"),
  regulatory: catalogMessage("humanCapital.qacompliance.organizational"),
  other: catalogMessage("common.general.other"),
};

const statusLabels: Record<string, string> = {
  pending: catalogMessage("common.general.pending.alternative2"),
  in_progress: catalogMessage("common.general.progress.alternative3"),
  completed: catalogMessage("common.general.completed"),
  non_compliant: catalogMessage("humanCapital.qacompliance.incompatible"),
  cancelled: catalogMessage("common.general.canceled"),
};

const statusBadges: Record<string, string> = {
  pending: "badge-warning",
  in_progress: "badge-info",
  completed: "badge-success",
  non_compliant: "badge-danger",
  cancelled: "badge-secondary",
};

export function QaCompliance() {
    const { t: i18n } = useI18n();
  const router = useRouter();
  const [records, setRecords] = useState<Compliance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    loadRecords();
  }, [currentPage, statusFilter]);

  const loadRecords = async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams({
        page: currentPage.toString(),
        status: statusFilter,
      });
      const res = await fetchAPI(`${API_ENDPOINTS.HUMAN_CAPITAL.QA_COMPLIANCE.BASE}?${query}`);
      setRecords(res.data as Compliance[] || []);
      setTotalPages(Number(res.last_page) || 1);
    } catch (error) {
      console.error(i18n.catalog["humanCapital.qacompliance.failedLoadComplianceRecords"], error);
    } finally {
      setIsLoading(false);
    }
  };

  const columns: Column<Compliance>[] = [
    {
      key: "compliance_number",
      header: i18n.catalog["common.general.complianceNumber"],
      dataLabel: i18n.catalog["common.general.complianceNumber"],
    },
    {
      key: "standard_name",
      header: i18n.catalog["common.general.standardName"],
      dataLabel: i18n.catalog["common.general.standardName"],
    },
    {
      key: "compliance_type",
      header: i18n.catalog["common.general.type.alternative3"],
      dataLabel: i18n.catalog["common.general.type.alternative3"],
      render: (item) => typeLabels[item.compliance_type] || item.compliance_type,
    },
    {
      key: "employee",
      header: i18n.catalog["common.general.employee.alternative3"],
      dataLabel: i18n.catalog["common.general.employee.alternative3"],
      render: (item) => item.employee?.full_name || '-',
    },
    {
      key: "status",
      header: i18n.catalog["common.general.status.alternative2"],
      dataLabel: i18n.catalog["common.general.status.alternative2"],
      render: (item) => (
        <span className={`badge ${statusBadges[item.status] || 'badge-secondary'}`}>
          {statusLabels[item.status] || item.status}
        </span>
      ),
    },
    {
      key: "due_date",
      header: i18n.catalog["common.general.dueDate"],
      dataLabel: i18n.catalog["common.general.dueDate"],
      render: (item) => item.due_date ? formatDate(item.due_date) : '-',
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
              onClick: () => alert(i18n.catalog["common.general.thisFeatureIsUnderDevelopmentWillBeAdded"])
            }
          ]}
        />
      ),
    },
  ];

  return (
    <div className="sales-card animate-fade">
      <PageSubHeader
        title={i18n.catalog["common.general.qualityCompliance"]}
        titleIcon="shield-check"
        actions={
          <>
            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              style={{ minWidth: "150px" }}
              placeholder={i18n.catalog["common.general.allStatuses"]}
              options={Object.entries(statusLabels).map(([value, label]) => ({ value, label })).filter(o => ["pending", "in_progress", "completed", "non_compliant"].includes(o.value))}
            />
            <Button
              onClick={() => alert(i18n.catalog["common.general.thisFeatureIsUnderDevelopmentWillBeAdded"])}
              variant="primary"
              icon="plus"
            >
              {i18n.catalog["humanCapital.qacompliance.addComplianceRecord"]}</Button>
          </>
        }
      />

      <Table
        columns={columns}
        data={records}
        keyExtractor={(item) => item.id.toString()}
        emptyMessage={i18n.catalog["humanCapital.qacompliance.noComplianceRecords"]}
        isLoading={isLoading}
        pagination={{
          currentPage,
          totalPages,
          onPageChange: setCurrentPage,
        }}
      />
    </div>
  );
}


