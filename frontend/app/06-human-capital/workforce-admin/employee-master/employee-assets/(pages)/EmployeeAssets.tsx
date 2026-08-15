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
  laptop: catalogMessage("text_fe1966fd0299"),
  phone: catalogMessage("text_c2e72da6dba5"),
  vehicle: catalogMessage("text_1a83da3f0239"),
  key: catalogMessage("text_8a9d0e6c56ec"),
  equipment: catalogMessage("text_441296311989"),
  other: catalogMessage("text_17a9f38e22b6"),
};

const statusLabels: Record<string, string> = {
  allocated: catalogMessage("text_17c28aaaa777"),
  returned: catalogMessage("text_75fbb16d08be"),
  maintenance: catalogMessage("text_9c499d210797"),
  lost: catalogMessage("text_b4e5ae7ca0e7"),
  damaged: catalogMessage("text_c4c3267f2898"),
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
      console.error(i18n.catalog["text_5f046588fd1c"], error);
    } finally {
      setIsLoading(false);
    }
  };

  const columns: Column<EmployeeAsset>[] = [
    {
      key: "asset_code",
      header: i18n.catalog["text_24f79f111ae7"],
      dataLabel: i18n.catalog["text_24f79f111ae7"],
    },
    {
      key: "asset_name",
      header: i18n.catalog["text_5812d0b5e210"],
      dataLabel: i18n.catalog["text_5812d0b5e210"],
    },
    {
      key: "asset_type",
      header: i18n.catalog["text_caa3f2bb4a36"],
      dataLabel: i18n.catalog["text_caa3f2bb4a36"],
      render: (item) => assetTypeLabels[item.asset_type] || item.asset_type,
    },
    {
      key: "employee",
      header: i18n.catalog["text_b71a39c832a6"],
      dataLabel: i18n.catalog["text_b71a39c832a6"],
      render: (item) => (
        <div>
          <div>{item.employee?.full_name || '-'}</div>
          <small className="text-muted">{item.employee?.employee_code || ''}</small>
        </div>
      ),
    },
    {
      key: "allocation_date",
      header: i18n.catalog["text_b7dad2d69588"],
      dataLabel: i18n.catalog["text_b7dad2d69588"],
      render: (item) => formatDate(item.allocation_date),
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
      key: "next_maintenance_date",
      header: i18n.catalog["text_cdd3ae723397"],
      dataLabel: i18n.catalog["text_cdd3ae723397"],
      render: (item) => item.next_maintenance_date ? formatDate(item.next_maintenance_date) : '-',
    },
    {
      key: "id",
      header: i18n.catalog["text_7797240d6caf"],
      dataLabel: i18n.catalog["text_9f0a0f722601"],
      render: (item) => (
        <ActionButtons
          actions={[
            {
              icon: "eye",
              title: i18n.catalog["text_4b615d0e6dd2"],
              variant: "view",
              onClick: () => router.push(`/06-human-capital/workforce-admin/employee-master/employee-assets/view/${item.id}`)
            },
            ...(canAccess("employees", "edit") ? [{
              icon: "edit" as const,
              title: i18n.catalog["text_113d570d6555"],
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
        title={i18n.catalog["text_dae7bb2736a6"]}
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
              options={Object.entries(statusLabels).map(([value, label]) => ({ value, label }))}
            />
            {canAccess("employees", "create") && (
              <Button
                onClick={() => router.push('/06-human-capital/workforce-admin/employee-master/employee-assets/add')}
                variant="primary"
                icon="plus"
              >
                {i18n.catalog["text_5952c2632b5f"]}</Button>
            )}
          </>
        }
      />

      <Table
        columns={columns}
        data={assets}
        keyExtractor={(item) => item.id.toString()}
        emptyMessage={i18n.catalog["text_af5031abf842"]}
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

