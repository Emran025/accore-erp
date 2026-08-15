"use client";

import { useI18n, catalogMessage } from "@/lib/i18n";
import { PageSubHeader } from "@/components/layout";
import { ActionButtons, Button, Column, Table, TabNavigation } from "@/components/ui";
import { fetchAPI } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useAuthStore } from "@/stores/useAuthStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface BenefitsPlan {
  id: number;
  plan_code: string;
  plan_name: string;
  plan_type: string;
  employee_contribution: number;
  employer_contribution: number;
  effective_date: string;
  is_active: boolean;
  enrollments?: Array<{ id: number }>;
}

interface BenefitsEnrollment {
  id: number;
  plan?: { plan_name: string };
  employee?: { full_name: string };
  enrollment_type: string;
  status: string;
  enrollment_date: string;
  effective_date: string;
}

const planTypeLabels: Record<string, string> = {
  health: catalogMessage("text_6605fc8d25fd"),
  dental: catalogMessage("text_176501f881e9"),
  vision: catalogMessage("text_07bfb4fefeae"),
  life_insurance: catalogMessage("text_10e3b3f48ee7"),
  disability: catalogMessage("text_10fd83f64d4c"),
  retirement: catalogMessage("text_056f8089aa7f"),
  fsa: "FSA",
  hsa: "HSA",
  other: catalogMessage("text_17a9f38e22b6"),
};

const enrollmentTypeLabels: Record<string, string> = {
  open_enrollment: catalogMessage("text_e2859040d031"),
  new_hire: catalogMessage("text_dd2f6476b317"),
  life_event: catalogMessage("text_0148d0a5b4d7"),
  qualifying_event: catalogMessage("text_51440b17a183"),
};

const statusLabels: Record<string, string> = {
  enrolled: catalogMessage("text_f6aee102d51b"),
  active: catalogMessage("text_629e90b3af3d"),
  terminated: catalogMessage("text_66d41b8c662e"),
  cancelled: catalogMessage("text_616d302cb016"),
};

const statusBadges: Record<string, string> = {
  enrolled: "badge-info",
  active: "badge-success",
  terminated: "badge-danger",
  cancelled: "badge-secondary",
};

export function Benefits() {
    const { t: i18n } = useI18n();
  const router = useRouter();
  const { canAccess } = useAuthStore();
  const [activeTab, setActiveTab] = useState("plans");
  const [plans, setPlans] = useState<BenefitsPlan[]>([]);
  const [enrollments, setEnrollments] = useState<BenefitsEnrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (activeTab === "plans") {
      loadPlans();
    } else {
      loadEnrollments();
    }
  }, [activeTab, currentPage]);

  const loadPlans = async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams({
        page: currentPage.toString(),
      });
      const res = await fetchAPI(`${API_ENDPOINTS.HUMAN_CAPITAL.BENEFITS.PLANS.BASE}?${query}`);
      setPlans(res.data as BenefitsPlan[] || []);
      setTotalPages(Number(res.last_page) || 1);
    } catch (error) {
      console.error(i18n.catalog["text_a37d4d9af6c0"], error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadEnrollments = async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams({
        page: currentPage.toString(),
      });
      const res = await fetchAPI(`${API_ENDPOINTS.HUMAN_CAPITAL.BENEFITS.ENROLLMENTS.BASE}?${query}`);
      setEnrollments(res.data as BenefitsEnrollment[] || []);
      setTotalPages(Number(res.last_page) || 1);
    } catch (error) {
      console.error(i18n.catalog["text_be2a3ff12491"], error);
    } finally {
      setIsLoading(false);
    }
  };

  const planColumns: Column<BenefitsPlan>[] = [
    {
      key: "plan_code",
      header: i18n.catalog["text_7fe92be3740d"],
      dataLabel: i18n.catalog["text_7fe92be3740d"],
    },
    {
      key: "plan_name",
      header: i18n.catalog["text_0dbb5c16476f"],
      dataLabel: i18n.catalog["text_0dbb5c16476f"],
    },
    {
      key: "plan_type",
      header: i18n.catalog["text_caa3f2bb4a36"],
      dataLabel: i18n.catalog["text_caa3f2bb4a36"],
      render: (item) => planTypeLabels[item.plan_type] || item.plan_type,
    },
    {
      key: "contributions",
      header: i18n.catalog["text_fc0b37d93fa0"],
      dataLabel: i18n.catalog["text_fc0b37d93fa0"],
      render: (item) => (
        <div>
          <div>{i18n.catalog["text_5a1127038136"]}{formatCurrency(item.employee_contribution)}</div>
          <div>{i18n.catalog["text_883b0a9fde70"]}{formatCurrency(item.employer_contribution)}</div>
        </div>
      ),
    },
    {
      key: "enrollments",
      header: i18n.catalog["text_373c407a58f4"],
      dataLabel: i18n.catalog["text_373c407a58f4"],
      render: (item) => item.enrollments?.length || 0,
    },
    {
      key: "is_active",
      header: i18n.catalog["text_c3a4749caed4"],
      dataLabel: i18n.catalog["text_c3a4749caed4"],
      render: (item) => (
        <span className={`badge ${item.is_active ? 'badge-success' : 'badge-secondary'}`}>
          {item.is_active ? i18n.catalog["text_629e90b3af3d"] : i18n.catalog["text_b719ac8add4e"]}
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
            ...(canAccess("benefits", "edit") ? [{
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

  const enrollmentColumns: Column<BenefitsEnrollment>[] = [
    {
      key: "employee",
      header: i18n.catalog["text_b71a39c832a6"],
      dataLabel: i18n.catalog["text_b71a39c832a6"],
      render: (item) => item.employee?.full_name || '-',
    },
    {
      key: "plan",
      header: i18n.catalog["text_c5e91a6961c4"],
      dataLabel: i18n.catalog["text_c5e91a6961c4"],
      render: (item) => item.plan?.plan_name || '-',
    },
    {
      key: "enrollment_type",
      header: i18n.catalog["text_2543e22c3294"],
      dataLabel: i18n.catalog["text_2543e22c3294"],
      render: (item) => enrollmentTypeLabels[item.enrollment_type] || item.enrollment_type,
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
      key: "enrollment_date",
      header: i18n.catalog["text_b8fcbb3f2d33"],
      dataLabel: i18n.catalog["text_b8fcbb3f2d33"],
      render: (item) => formatDate(item.enrollment_date),
    },
    {
      key: "effective_date",
      header: i18n.catalog["text_6f53e00bf25e"],
      dataLabel: i18n.catalog["text_6f53e00bf25e"],
      render: (item) => formatDate(item.effective_date),
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
            ...(canAccess("benefits", "edit") ? [{
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
        title={i18n.catalog["text_800701b92996"]}
        titleIcon="heart"
        actions={
          <>
            {activeTab === "plans" && canAccess("benefits", "create") && (
              <Button
                onClick={() => alert(i18n.catalog["text_5ba17dbe5a91"])}
                variant="primary"
                icon="plus"
              >
                {i18n.catalog["text_4984727c03bb"]}</Button>
            )}
            {activeTab === "enrollments" && canAccess("benefits", "create") && (
              <Button
                onClick={() => alert(i18n.catalog["text_5ba17dbe5a91"])}
                variant="primary"
                icon="plus"
              >
                {i18n.catalog["text_c2e3319378d7"]}</Button>
            )}
          </>
        }
      />

      <TabNavigation
        tabs={[
          { key: "plans", label: i18n.catalog["text_2945976e0601"], icon: "file-alt" },
          { key: "enrollments", label: i18n.catalog["text_7c32d489fa12"], icon: "user-check" },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {activeTab === "plans" ? (
        <Table
          columns={planColumns}
          data={plans}
          keyExtractor={(item) => item.id.toString()}
          emptyMessage={i18n.catalog["text_1fdf4236adc6"]}
          isLoading={isLoading}
          pagination={{
            currentPage,
            totalPages,
            onPageChange: setCurrentPage,
          }}
        />
      ) : (
        <Table
          columns={enrollmentColumns}
          data={enrollments}
          keyExtractor={(item) => item.id.toString()}
          emptyMessage={i18n.catalog["text_9552c2d039cc"]}
          isLoading={isLoading}
          pagination={{
            currentPage,
            totalPages,
            onPageChange: setCurrentPage,
          }}
        />
      )}
    </div>
  );
}


