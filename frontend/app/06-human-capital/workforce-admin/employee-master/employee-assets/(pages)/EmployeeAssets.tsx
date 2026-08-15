"use client";

import { useI18n, catalogMessage } from "@/lib/i18n";
import { EmployeeAsset } from "@/types";
import { PageSubHeader } from "@/components/layout";
import { ActionButtons, Button, Column, SearchableSelect, Select, Table } from "@/components/ui";
import { fetchAPI } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatDate } from "@/lib/utils";
import { useAuthStore } from "@/stores/useAuthStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const assetTypeLabels: Record<string, string> = {
  laptop: catalogMessage("common.general.laptop"),
  phone: catalogMessage("common.general.phone.alternative2"),
  vehicle: catalogMessage("common.general.vehicle"),
  key: catalogMessage("common.general.key"),
  equipment: catalogMessage("common.general.equipment"),
  other: catalogMessage("common.general.other"),
};

const statusLabels: Record<string, string> = {
  allocated: catalogMessage("common.general.custom"),
  returned: catalogMessage("common.general.refunded"),
  maintenance: catalogMessage("common.general.maintenance"),
  lost: catalogMessage("common.general.missing"),
  damaged: catalogMessage("common.general.damaged"),
};

const statusBadges: Record<string, string> = {
  allocated: "badge-success",
  returned: "badge-secondary",
  maintenance: "badge-warning",
  lost: "badge-danger",
  damaged: "badge-danger",
};

export function EmployeeAssets() {
    const { t: i18n } = useI18n();
  const router = useRouter();
  const { canAccess } = useAuthStore();
  const [assets, setAssets] = useState<EmployeeAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    loadAssets();
  }, [currentPage, searchTerm, statusFilter]);

  const loadAssets = async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams({
        page: currentPage.toString(),
        search: searchTerm,
        status: statusFilter,
      });
      const res = await fetchAPI(`${API_ENDPOINTS.HUMAN_CAPITAL.EMPLOYEE_ASSETS.BASE}?${query}`);
      setAssets(res.data as EmployeeAsset[] || []);
      setTotalPages(Number(res.last_page) || 1);
    } catch (error) {
      console.error(i18n.catalog["humanCapital.employeeassets.failedLoadAssets"], error);
    } finally {
      setIsLoading(false);
    }
  };

  const columns: Column<EmployeeAsset>[] = [
    {
      key: "asset_code",
      header: i18n.catalog["common.general.originCode"],
      dataLabel: i18n.catalog["common.general.originCode"],
    },
    {
      key: "asset_name",
      header: i18n.catalog["common.general.assetName.alternative2"],
      dataLabel: i18n.catalog["common.general.assetName.alternative2"],
    },
    {
      key: "asset_type",
      header: i18n.catalog["common.general.type.alternative3"],
      dataLabel: i18n.catalog["common.general.type.alternative3"],
      render: (item) => assetTypeLabels[item.asset_type] || item.asset_type,
    },
    {
      key: "employee",
      header: i18n.catalog["common.general.employee.alternative3"],
      dataLabel: i18n.catalog["common.general.employee.alternative3"],
      render: (item) => (
        <div>
          <div>{item.employee?.full_name || '-'}</div>
          <small className="text-muted">{item.employee?.employee_code || ''}</small>
        </div>
      ),
    },
    {
      key: "allocation_date",
      header: i18n.catalog["common.general.allocationDate"],
      dataLabel: i18n.catalog["common.general.allocationDate"],
      render: (item) => formatDate(item.allocation_date),
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
      key: "next_maintenance_date",
      header: i18n.catalog["common.general.upcomingMaintenance"],
      dataLabel: i18n.catalog["common.general.upcomingMaintenance"],
      render: (item) => item.next_maintenance_date ? formatDate(item.next_maintenance_date) : '-',
    },
    {
      key: "id",
      header: i18n.catalog["common.general.actions"],
      dataLabel: i18n.catalog["common.general.actions.alternative2"],
      render: (item) => (
        <ActionButtons
          actions={[
            {
              icon: "eye",
              title: i18n.catalog["common.general.viewDetails"],
              variant: "view",
              onClick: () => router.push(`/06-human-capital/workforce-admin/employee-master/employee-assets/view/${item.id}`)
            },
            ...(canAccess("employees", "edit") ? [{
              icon: "edit" as const,
              title: i18n.catalog["common.general.edit"],
              variant: "edit" as const,
              onClick: () => router.push(`/06-human-capital/workforce-admin/employee-master/employee-assets/edit/${item.id}`)
            }] : [])
          ]}
        />
      ),
    },
  ];

  return (
    <div className="sales-card animate-fade">
      <PageSubHeader
        title={i18n.catalog["common.general.employeeAssets"]}
        titleIcon="laptop"
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
              options={Object.entries(statusLabels).map(([value, label]) => ({ value, label }))}
            />
            {canAccess("employees", "create") && (
              <Button
                onClick={() => router.push('/06-human-capital/workforce-admin/employee-master/employee-assets/add')}
                variant="primary"
                icon="plus"
              >
                {i18n.catalog["humanCapital.employeeassets.addAsset"]}</Button>
            )}
          </>
        }
      />

      <Table
        columns={columns}
        data={assets}
        keyExtractor={(item) => item.id.toString()}
        emptyMessage={i18n.catalog["common.general.noRegisteredAssets"]}
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

