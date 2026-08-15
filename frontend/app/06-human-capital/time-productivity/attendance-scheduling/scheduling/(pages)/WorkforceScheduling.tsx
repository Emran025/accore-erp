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
  draft: catalogMessage("text_552aec56f591"),
  published: catalogMessage("text_74f0d5710a99"),
  archived: catalogMessage("text_9d1b78e3b949"),
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
      console.error(i18n.catalog["text_323f6ce27f35"], error);
    } finally {
      setIsLoading(false);
    }
  };

  const columns: Column<Schedule>[] = [
    {
      key: "schedule_name",
      header: i18n.catalog["text_bbb0ffd7055c"],
      dataLabel: i18n.catalog["text_bbb0ffd7055c"],
    },
    {
      key: "schedule_date",
      header: i18n.catalog["text_119220a2ede2"],
      dataLabel: i18n.catalog["text_119220a2ede2"],
      render: (item) => formatDate(item.schedule_date),
    },
    {
      key: "department",
      header: i18n.catalog["text_0771c3ff9336"],
      dataLabel: i18n.catalog["text_0771c3ff9336"],
      render: (item) => item.department?.name_ar || '-',
    },
    {
      key: "shifts",
      header: i18n.catalog["text_f9503c89feb5"],
      dataLabel: i18n.catalog["text_f9503c89feb5"],
      render: (item) => item.shifts?.length || 0,
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
              title: i18n.catalog["text_0e9aff808b31"],
              variant: "view",
              onClick: () => alert(i18n.catalog["text_5ba17dbe5a91"])
            },
            ...(canAccess("scheduling", "edit") ? [{
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
        title={i18n.catalog["text_83d32cd90f2d"]}
        titleIcon="calendar-days"
        actions={
          canAccess("scheduling", "create") && (
            <Button
              onClick={() => alert(i18n.catalog["text_5ba17dbe5a91"])}
              variant="primary"
              icon="plus"
            >
              {i18n.catalog["text_3a44e54ad348"]}</Button>
          )
        }
      />

      <Table
        columns={columns}
        data={schedules}
        keyExtractor={(item) => item.id.toString()}
        emptyMessage={i18n.catalog["text_f96340768d88"]}
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


