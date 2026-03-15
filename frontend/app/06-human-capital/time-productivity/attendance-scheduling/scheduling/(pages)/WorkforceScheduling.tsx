"use client";

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
  draft: "مسودة",
  published: "منشور",
  archived: "مؤرشف",
};

const statusBadges: Record<string, string> = {
  draft: "badge-secondary",
  published: "badge-success",
  archived: "badge-secondary",
};

export function WorkforceScheduling() {
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
      console.error("Failed to load schedules", error);
    } finally {
      setIsLoading(false);
    }
  };

  const columns: Column<Schedule>[] = [
    {
      key: "schedule_name",
      header: "اسم الجدول",
      dataLabel: "اسم الجدول",
    },
    {
      key: "schedule_date",
      header: "تاريخ الجدول",
      dataLabel: "تاريخ الجدول",
      render: (item) => formatDate(item.schedule_date),
    },
    {
      key: "department",
      header: "القسم",
      dataLabel: "القسم",
      render: (item) => item.department?.name_ar || '-',
    },
    {
      key: "shifts",
      header: "عدد المناوبات",
      dataLabel: "عدد المناوبات",
      render: (item) => item.shifts?.length || 0,
    },
    {
      key: "status",
      header: "الحالة",
      dataLabel: "الحالة",
      render: (item) => (
        <span className={`badge ${statusBadges[item.status] || 'badge-secondary'}`}>
          {statusLabels[item.status] || item.status}
        </span>
      ),
    },
    {
      key: "id",
      header: "الإجراءات",
      dataLabel: "الإجراءات",
      render: (item) => (
        <ActionButtons
          actions={[
            {
              icon: "eye",
              title: "عرض الجدول",
              variant: "view",
              onClick: () => alert("هذه الميزة قيد التطوير وسيتم إضافتها قريباً")
            },
            ...(canAccess("scheduling", "edit") ? [{
              icon: "edit" as const,
              title: "تعديل",
              variant: "edit" as const,
              onClick: () => alert("هذه الميزة قيد التطوير وسيتم إضافتها قريباً")
            }] : [])
          ]}
        />
      ),
    },
  ];

  return (
    <div className="sales-card animate-fade">
      <PageSubHeader
        title="جدولة القوى العاملة"
        titleIcon="calendar-days"
        actions={
          canAccess("scheduling", "create") && (
            <Button
              onClick={() => alert("هذه الميزة قيد التطوير وسيتم إضافتها قريباً")}
              variant="primary"
              icon="plus"
            >
              إنشاء جدول جديد
            </Button>
          )
        }
      />

      <Table
        columns={columns}
        data={schedules}
        keyExtractor={(item) => item.id.toString()}
        emptyMessage="لا توجد جداول"
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


