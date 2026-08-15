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
  health: catalogMessage("humanCapital.benefits.validity"),
  dental: catalogMessage("humanCapital.benefits.teeth"),
  vision: catalogMessage("humanCapital.benefits.vision"),
  life_insurance: catalogMessage("humanCapital.benefits.lifeInsurance"),
  disability: catalogMessage("humanCapital.benefits.disability"),
  retirement: catalogMessage("humanCapital.benefits.retirement"),
  fsa: "FSA",
  hsa: "HSA",
  other: catalogMessage("common.general.other"),
};

const enrollmentTypeLabels: Record<string, string> = {
  open_enrollment: catalogMessage("humanCapital.benefits.openRegistration"),
  new_hire: catalogMessage("humanCapital.benefits.newEmployee"),
  life_event: catalogMessage("humanCapital.benefits.myLifeEvent"),
  qualifying_event: catalogMessage("humanCapital.benefits.qualifiedEvent"),
};

const statusLabels: Record<string, string> = {
  enrolled: catalogMessage("common.general.registered"),
  active: catalogMessage("common.general.active"),
  terminated: catalogMessage("common.general.terminated"),
  cancelled: catalogMessage("common.general.canceled"),
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
      console.error(i18n.catalog["common.general.failedLoadPlans"], error);
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
      console.error(i18n.catalog["humanCapital.benefits.failedLoadEnrollments"], error);
    } finally {
      setIsLoading(false);
    }
  };

  const planColumns: Column<BenefitsPlan>[] = [
    {
      key: "plan_code",
      header: i18n.catalog["common.general.planCode"],
      dataLabel: i18n.catalog["common.general.planCode"],
    },
    {
      key: "plan_name",
      header: i18n.catalog["common.general.planName"],
      dataLabel: i18n.catalog["common.general.planName"],
    },
    {
      key: "plan_type",
      header: i18n.catalog["common.general.type.alternative3"],
      dataLabel: i18n.catalog["common.general.type.alternative3"],
      render: (item) => planTypeLabels[item.plan_type] || item.plan_type,
    },
    {
      key: "contributions",
      header: i18n.catalog["common.general.contributions"],
      dataLabel: i18n.catalog["common.general.contributions"],
      render: (item) => (
        <div>
          <div>{i18n.catalog["humanCapital.benefits.employee"]}{formatCurrency(item.employee_contribution)}</div>
          <div>{i18n.catalog["humanCapital.benefits.employer"]}{formatCurrency(item.employer_contribution)}</div>
        </div>
      ),
    },
    {
      key: "enrollments",
      header: i18n.catalog["common.general.numberRegistrants"],
      dataLabel: i18n.catalog["common.general.numberRegistrants"],
      render: (item) => item.enrollments?.length || 0,
    },
    {
      key: "is_active",
      header: i18n.catalog["common.general.status.alternative2"],
      dataLabel: i18n.catalog["common.general.status.alternative2"],
      render: (item) => (
        <span className={`badge ${item.is_active ? 'badge-success' : 'badge-secondary'}`}>
          {item.is_active ? i18n.catalog["common.general.active"] : i18n.catalog["common.general.inactive"]}
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
            ...(canAccess("benefits", "edit") ? [{
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

  const enrollmentColumns: Column<BenefitsEnrollment>[] = [
    {
      key: "employee",
      header: i18n.catalog["common.general.employee.alternative3"],
      dataLabel: i18n.catalog["common.general.employee.alternative3"],
      render: (item) => item.employee?.full_name || '-',
    },
    {
      key: "plan",
      header: i18n.catalog["common.general.plan"],
      dataLabel: i18n.catalog["common.general.plan"],
      render: (item) => item.plan?.plan_name || '-',
    },
    {
      key: "enrollment_type",
      header: i18n.catalog["common.general.registrationType"],
      dataLabel: i18n.catalog["common.general.registrationType"],
      render: (item) => enrollmentTypeLabels[item.enrollment_type] || item.enrollment_type,
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
      key: "enrollment_date",
      header: i18n.catalog["common.general.registrationDate"],
      dataLabel: i18n.catalog["common.general.registrationDate"],
      render: (item) => formatDate(item.enrollment_date),
    },
    {
      key: "effective_date",
      header: i18n.catalog["common.general.effectiveDate"],
      dataLabel: i18n.catalog["common.general.effectiveDate"],
      render: (item) => formatDate(item.effective_date),
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
            ...(canAccess("benefits", "edit") ? [{
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
        title={i18n.catalog["common.general.benefitsEntitlements"]}
        titleIcon="heart"
        actions={
          <>
            {activeTab === "plans" && canAccess("benefits", "create") && (
              <Button
                onClick={() => alert(i18n.catalog["common.general.thisFeatureIsUnderDevelopmentWillBeAdded"])}
                variant="primary"
                icon="plus"
              >
                {i18n.catalog["humanCapital.benefits.newBenefitsPlan"]}</Button>
            )}
            {activeTab === "enrollments" && canAccess("benefits", "create") && (
              <Button
                onClick={() => alert(i18n.catalog["common.general.thisFeatureIsUnderDevelopmentWillBeAdded"])}
                variant="primary"
                icon="plus"
              >
                {i18n.catalog["common.general.newRegistration"]}</Button>
            )}
          </>
        }
      />

      <TabNavigation
        tabs={[
          { key: "plans", label: i18n.catalog["humanCapital.benefits.benefitPlans"], icon: "file-alt" },
          { key: "enrollments", label: i18n.catalog["common.general.records.alternative2"], icon: "user-check" },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {activeTab === "plans" ? (
        <Table
          columns={planColumns}
          data={plans}
          keyExtractor={(item) => item.id.toString()}
          emptyMessage={i18n.catalog["humanCapital.benefits.noBenefitPlans"]}
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
          emptyMessage={i18n.catalog["common.general.noRecords.alternative2"]}
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


