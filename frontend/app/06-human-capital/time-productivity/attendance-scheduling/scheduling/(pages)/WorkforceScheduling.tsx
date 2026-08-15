"use client";

import { useI18n, catalogMessage } from "@/lib/i18n";
import { PageSubHeader } from "@/components/layout";
import { ActionButtons, Button, Column, Table } from "@/components/ui";
import { fetchAPI } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatDate } from "@/lib/utils";
import { useAuthStore } from "@/stores/useAuthStore";
import type { Schedule } from "@/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";


const statusLabels: Record<string, string> = {
  draft: catalogMessage("common.general.draft"),
  published: catalogMessage("common.general.published"),
  archived: catalogMessage("common.general.archived"),
};

const statusBadges: Record<string, string> = {
  draft: "badge-secondary",
  published: "badge-success",
  archived: "badge-secondary",
};

export function WorkforceScheduling() {
    const { t: i18n } = useI18n();
  const router = useRouter();
  const { canAccess } = useAuthStore();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadSchedules();
  }, [currentPage]);

  const loadSchedules = async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams({
        page: currentPage.toString(),
      });
      const res = await fetchAPI(`${API_ENDPOINTS.HUMAN_CAPITAL.WORKFORCE_SCHEDULING.BASE}?${query}`);
      setSchedules(res.data as Schedule[] || []);
      setTotalPages(Number(res.last_page) || 1);
    } catch (error) {
      console.error(i18n.catalog["humanCapital.workforcescheduling.failedLoadSchedules"], error);
    } finally {
      setIsLoading(false);
    }
  };

  const columns: Column<Schedule>[] = [
    {
      key: "schedule_name",
      header: i18n.catalog["common.general.tableName"],
      dataLabel: i18n.catalog["common.general.tableName"],
    },
    {
      key: "schedule_date",
      header: i18n.catalog["common.general.tableDate"],
      dataLabel: i18n.catalog["common.general.tableDate"],
      render: (item) => formatDate(item.schedule_date),
    },
    {
      key: "department",
      header: i18n.catalog["common.general.section"],
      dataLabel: i18n.catalog["common.general.section"],
      render: (item) => item.department?.name_ar || '-',
    },
    {
      key: "shifts",
      header: i18n.catalog["common.general.numberShifts"],
      dataLabel: i18n.catalog["common.general.numberShifts"],
      render: (item) => item.shifts?.length || 0,
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
              title: i18n.catalog["humanCapital.workforcescheduling.showTable"],
              variant: "view",
              onClick: () => alert(i18n.catalog["common.general.thisFeatureIsUnderDevelopmentWillBeAdded"])
            },
            ...(canAccess("scheduling", "edit") ? [{
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
        title={i18n.catalog["common.general.workforceScheduling"]}
        titleIcon="calendar-days"
        actions={
          canAccess("scheduling", "create") && (
            <Button
              onClick={() => alert(i18n.catalog["common.general.thisFeatureIsUnderDevelopmentWillBeAdded"])}
              variant="primary"
              icon="plus"
            >
              {i18n.catalog["humanCapital.workforcescheduling.createNewSchedule"]}</Button>
          )
        }
      />

      <Table
        columns={columns}
        data={schedules}
        keyExtractor={(item) => item.id.toString()}
        emptyMessage={i18n.catalog["humanCapital.workforcescheduling.noTables"]}
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


