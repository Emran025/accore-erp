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
  internal_audit: catalogMessage("text_cee0b03d70da"),
  regulatory: catalogMessage("text_8053803bdbb7"),
  other: catalogMessage("text_17a9f38e22b6"),
};

const statusLabels: Record<string, string> = {
  pending: catalogMessage("text_7d7913fdef74"),
  in_progress: catalogMessage("text_d761119224ab"),
  completed: catalogMessage("text_c2da5684d63b"),
  non_compliant: catalogMessage("text_684a0f3b8fac"),
  cancelled: catalogMessage("text_616d302cb016"),
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
      console.error(i18n.catalog["text_cfed6eadcc4a"], error);
    } finally {
      setIsLoading(false);
    }
  };

  const columns: Column<Compliance>[] = [
    {
      key: "compliance_number",
      header: i18n.catalog["text_9bc067822064"],
      dataLabel: i18n.catalog["text_9bc067822064"],
    },
    {
      key: "standard_name",
      header: i18n.catalog["text_76a30341e72e"],
      dataLabel: i18n.catalog["text_76a30341e72e"],
    },
    {
      key: "compliance_type",
      header: i18n.catalog["text_caa3f2bb4a36"],
      dataLabel: i18n.catalog["text_caa3f2bb4a36"],
      render: (item) => typeLabels[item.compliance_type] || item.compliance_type,
    },
    {
      key: "employee",
      header: i18n.catalog["text_b71a39c832a6"],
      dataLabel: i18n.catalog["text_b71a39c832a6"],
      render: (item) => item.employee?.full_name || '-',
    },
    {
      key: "status",
      header: i18n.catalog["text_c3a4749caed4"],
      dataLabel: i18n.catalog["text_c3a4749caed4"],
      render: (item) => (
        <span className={`badge ${statusBadges[item.status] || 'badge-secondary'}`}>
          {statusLabels[item.status] || item.status}
        </span>
      ),
    },
    {
      key: "due_date",
      header: i18n.catalog["text_206afce1e45e"],
      dataLabel: i18n.catalog["text_206afce1e45e"],
      render: (item) => item.due_date ? formatDate(item.due_date) : '-',
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
              onClick: () => alert(i18n.catalog["text_5ba17dbe5a91"])
            }
          ]}
        />
      ),
    },
  ];

  return (
    <div className="sales-card animate-fade">
      <PageSubHeader
        title={i18n.catalog["text_a4a91ea866ef"]}
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
              placeholder={i18n.catalog["text_1ef213109d57"]}
              options={Object.entries(statusLabels).map(([value, label]) => ({ value, label })).filter(o => ["pending", "in_progress", "completed", "non_compliant"].includes(o.value))}
            />
            <Button
              onClick={() => alert(i18n.catalog["text_5ba17dbe5a91"])}
              variant="primary"
              icon="plus"
            >
              {i18n.catalog["text_c9dbf41298cc"]}</Button>
          </>
        }
      />

      <Table
        columns={columns}
        data={records}
        keyExtractor={(item) => item.id.toString()}
        emptyMessage={i18n.catalog["text_5afe0117e423"]}
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


