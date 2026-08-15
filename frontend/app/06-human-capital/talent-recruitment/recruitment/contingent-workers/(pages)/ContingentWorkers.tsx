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
  contractor: catalogMessage("humanCapital.contingentworkers.contractor"),
  consultant: catalogMessage("humanCapital.contingentworkers.consultant"),
  freelancer: catalogMessage("humanCapital.contingentworkers.independent"),
  temp_agency: catalogMessage("humanCapital.contingentworkers.temporaryAgency"),
};

const statusLabels: Record<string, string> = {
  active: catalogMessage("common.general.active"),
  inactive: catalogMessage("common.general.inactive"),
  terminated: catalogMessage("common.general.terminated"),
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
      console.error(i18n.catalog["humanCapital.contingentworkers.failedLoadContingentWorkers"], error);
    } finally {
      setIsLoading(false);
    }
  };

  const columns: Column<ContingentWorker>[] = [
    {
      key: "worker_code",
      header: i18n.catalog["common.general.workerCode"],
      dataLabel: i18n.catalog["common.general.workerCode"],
    },
    {
      key: "full_name",
      header: i18n.catalog["common.general.fullName"],
      dataLabel: i18n.catalog["common.general.fullName"],
    },
    {
      key: "worker_type",
      header: i18n.catalog["common.general.type.alternative3"],
      dataLabel: i18n.catalog["common.general.type.alternative3"],
      render: (item) => workerTypeLabels[item.worker_type] || item.worker_type,
    },
    {
      key: "company_name",
      header: i18n.catalog["common.general.company"],
      dataLabel: i18n.catalog["common.general.company"],
      render: (item) => item.company_name || '-',
    },
    {
      key: "start_date",
      header: i18n.catalog["common.general.startDate.alternative2"],
      dataLabel: i18n.catalog["common.general.startDate.alternative2"],
      render: (item) => formatDate(item.start_date),
    },
    {
      key: "end_date",
      header: i18n.catalog["common.general.endDate.alternative2"],
      dataLabel: i18n.catalog["common.general.endDate.alternative2"],
      render: (item) => item.end_date ? formatDate(item.end_date) : '-',
    },
    {
      key: "rate",
      header: i18n.catalog["common.general.rate"],
      dataLabel: i18n.catalog["common.general.rate"],
      render: (item) => {
        if (item.hourly_rate) return formatCurrency(item.hourly_rate) + '/ساعة';
        if (item.monthly_rate) return formatCurrency(item.monthly_rate) + '/شهر';
        return '-';
      },
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
            },
            ...(canAccess("contingent", "edit") ? [{
              icon: "edit" as const,
              title: i18n.catalog["common.general.edit"],
              variant: "edit" as const,
              onClick: () => alert(i18n.catalog["common.general.thisFeatureIsUnderDevelopmentWillBeAdded"])
            }] : [])
          ]}
        />
      ),
    },
  ];

  return (
    <div className="sales-card animate-fade">
      <PageSubHeader
        title={i18n.catalog["common.general.temporaryLabor"]}
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
            placeholder={i18n.catalog["common.general.search"]}
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
              placeholder={i18n.catalog["common.general.allStatuses"]}
              options={[
                { value: 'active', label: i18n.catalog["common.general.active"] },
                { value: 'inactive', label: i18n.catalog["common.general.inactive"] },
                { value: 'terminated', label: i18n.catalog["common.general.terminated"] }
              ]}
            />
            {canAccess("contingent", "create") && (
              <Button
                onClick={() => alert(i18n.catalog["common.general.thisFeatureIsUnderDevelopmentWillBeAdded"])}
                variant="primary"
                icon="plus"
              >
                {i18n.catalog["humanCapital.contingentworkers.addTemporaryWorker"]}</Button>
            )}
          </>
        }
      />

      <Table
        columns={columns}
        data={workers}
        keyExtractor={(item) => item.id.toString()}
        emptyMessage={i18n.catalog["humanCapital.contingentworkers.noTemporaryWorkersRegistered"]}
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


