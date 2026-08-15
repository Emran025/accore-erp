"use client";

import { useI18n, catalogMessage } from "@/lib/i18n";
import { PageSubHeader } from "@/components/layout";
import { ActionButtons, Button, Column, SearchableSelect, Select, Table } from "@/components/ui";
import { fetchAPI } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useAuthStore } from "@/stores/useAuthStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ContingentWorker {
  id: number;
  worker_code: string;
  full_name: string;
  email?: string;
  phone?: string;
  worker_type: string;
  company_name?: string;
  start_date: string;
  end_date?: string;
  status: string;
  hourly_rate?: number;
  monthly_rate?: number;
  badge_expiry?: string;
  system_access_expiry?: string;
}

const workerTypeLabels: Record<string, string> = {
  contractor: catalogMessage("text_0ee686846368"),
  consultant: catalogMessage("text_f1ca19d26268"),
  freelancer: catalogMessage("text_7ff9277f8b10"),
  temp_agency: catalogMessage("text_39dfc305dbcb"),
};

const statusLabels: Record<string, string> = {
  active: catalogMessage("text_629e90b3af3d"),
  inactive: catalogMessage("text_b719ac8add4e"),
  terminated: catalogMessage("text_66d41b8c662e"),
};

const statusBadges: Record<string, string> = {
  active: "badge-success",
  inactive: "badge-secondary",
  terminated: "badge-danger",
};

export function ContingentWorkers() {
    const { t: i18n } = useI18n();
  const router = useRouter();
  const { canAccess } = useAuthStore();
  const [workers, setWorkers] = useState<ContingentWorker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    loadWorkers();
  }, [currentPage, searchTerm, statusFilter]);

  const loadWorkers = async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams({
        page: currentPage.toString(),
        search: searchTerm,
        status: statusFilter,
      });
      const res = await fetchAPI(`${API_ENDPOINTS.HUMAN_CAPITAL.CONTINGENT_WORKERS.BASE}?${query}`);
      setWorkers(res.data as ContingentWorker[] || []);
      setTotalPages(Number(res.last_page) || 1);
    } catch (error) {
      console.error(i18n.catalog["text_acf34b7ad16d"], error);
    } finally {
      setIsLoading(false);
    }
  };

  const columns: Column<ContingentWorker>[] = [
    {
      key: "worker_code",
      header: i18n.catalog["text_dc4bf01b8f11"],
      dataLabel: i18n.catalog["text_dc4bf01b8f11"],
    },
    {
      key: "full_name",
      header: i18n.catalog["text_6c2ab9bdeb2c"],
      dataLabel: i18n.catalog["text_6c2ab9bdeb2c"],
    },
    {
      key: "worker_type",
      header: i18n.catalog["text_caa3f2bb4a36"],
      dataLabel: i18n.catalog["text_caa3f2bb4a36"],
      render: (item) => workerTypeLabels[item.worker_type] || item.worker_type,
    },
    {
      key: "company_name",
      header: i18n.catalog["text_9ee7213d2258"],
      dataLabel: i18n.catalog["text_9ee7213d2258"],
      render: (item) => item.company_name || '-',
    },
    {
      key: "start_date",
      header: i18n.catalog["text_90f719b91522"],
      dataLabel: i18n.catalog["text_90f719b91522"],
      render: (item) => formatDate(item.start_date),
    },
    {
      key: "end_date",
      header: i18n.catalog["text_ec3093bd6fd5"],
      dataLabel: i18n.catalog["text_ec3093bd6fd5"],
      render: (item) => item.end_date ? formatDate(item.end_date) : '-',
    },
    {
      key: "rate",
      header: i18n.catalog["text_54b29abbf17d"],
      dataLabel: i18n.catalog["text_54b29abbf17d"],
      render: (item) => {
        if (item.hourly_rate) return formatCurrency(item.hourly_rate) + '/ساعة';
        if (item.monthly_rate) return formatCurrency(item.monthly_rate) + '/شهر';
        return '-';
      },
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
            },
            ...(canAccess("contingent", "edit") ? [{
              icon: "edit" as const,
              title: i18n.catalog["text_113d570d6555"],
              variant: "edit" as const,
              onClick: () => alert(i18n.catalog["text_5ba17dbe5a91"])
            }] : [])
          ]}
        />
      ),
    },
  ];

  return (
    <div className="sales-card animate-fade">
      <PageSubHeader
        title={i18n.catalog["text_25f00fd24148"]}
        titleIcon="briefcase"
        searchInput={
          <SearchableSelect
            options={[]}
            value={null}
            onChange={() => { }}
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
            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              style={{ minWidth: '150px' }}
              placeholder={i18n.catalog["text_1ef213109d57"]}
              options={[
                { value: 'active', label: i18n.catalog["text_629e90b3af3d"] },
                { value: 'inactive', label: i18n.catalog["text_b719ac8add4e"] },
                { value: 'terminated', label: i18n.catalog["text_66d41b8c662e"] }
              ]}
            />
            {canAccess("contingent", "create") && (
              <Button
                onClick={() => alert(i18n.catalog["text_5ba17dbe5a91"])}
                variant="primary"
                icon="plus"
              >
                {i18n.catalog["text_daa47acf4f81"]}</Button>
            )}
          </>
        }
      />

      <Table
        columns={columns}
        data={workers}
        keyExtractor={(item) => item.id.toString()}
        emptyMessage={i18n.catalog["text_dc4e7377a961"]}
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


