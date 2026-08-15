"use client";

import { useI18n } from "@/lib/i18n";
import { ExpatRecord } from "@/types";
import { PageSubHeader } from "@/components/layout";
import { ActionButtons, Button, Column, SearchableSelect, Table } from "@/components/ui";
import { fetchAPI } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useAuthStore } from "@/stores/useAuthStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function ExpatManagement() {
    const { t: i18n } = useI18n();
  const router = useRouter();
  const { canAccess } = useAuthStore();
  const [records, setRecords] = useState<ExpatRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadRecords();
  }, [currentPage, searchTerm]);

  const loadRecords = async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams({
        page: currentPage.toString(),
        search: searchTerm,
      });
      const res = await fetchAPI(`${API_ENDPOINTS.HUMAN_CAPITAL.EXPAT_MANAGEMENT.BASE}?${query}`);
      setRecords(res.data as ExpatRecord[] || []);
      setTotalPages(Number(res.last_page) || 1);
    } catch (error) {
      console.error(i18n.catalog["humanCapital.expatmanagement.failedLoadExpatRecords"], error);
    } finally {
      setIsLoading(false);
    }
  };

  const getExpiryStatus = (expiryDate?: string) => {
    if (!expiryDate) return { class: "", text: "-" };
    const expiry = new Date(expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) return { class: "badge-danger", text: i18n.catalog["common.general.expired"] };
    if (daysUntilExpiry < 30) return { class: "badge-warning", text: i18n.catalog["common.general.comingSoon"] };
    if (daysUntilExpiry < 90) return { class: "badge-info", text: i18n.catalog["common.general.comingSoon"] };
    return { class: "badge-success", text: i18n.catalog["common.general.valid.alternative3"] };
  };

  const columns: Column<ExpatRecord>[] = [
    {
      key: "employee",
      header: i18n.catalog["common.general.employee.alternative3"],
      dataLabel: i18n.catalog["common.general.employee.alternative3"],
      render: (item) => (
        <div>
          <div>{item.employee?.full_name || '-'}</div>
          <small className="text-muted">{item.employee?.employee_code || ''}</small>
        </div>
      )
    },
    {
      key: "passport_expiry",
      header: i18n.catalog["common.general.passportExpiry"],
      dataLabel: i18n.catalog["common.general.passportExpiry"],
      render: (item) => {
        const status = getExpiryStatus(item.passport_expiry);
        return (
          <div>
            <div>{item.passport_expiry ? formatDate(item.passport_expiry) : '-'}</div>
            {item.passport_expiry && (
              <span className={`badge ${status.class}`}>{status.text}</span>
            )}
          </div>
        );
      }
    },
    {
      key: "visa_expiry",
      header: i18n.catalog["common.general.visaExpiry"],
      dataLabel: i18n.catalog["common.general.visaExpiry"],
      render: (item) => {
        const status = getExpiryStatus(item.visa_expiry);
        return (
          <div>
            <div>{item.visa_expiry ? formatDate(item.visa_expiry) : '-'}</div>
            {item.visa_expiry && (
              <span className={`badge ${status.class}`}>{status.text}</span>
            )}
          </div>
        );
      }
    },
    {
      key: "host_country",
      header: i18n.catalog["common.general.hostCountry"],
      dataLabel: i18n.catalog["common.general.hostCountry"],
      render: (item) => item.host_country || '-'
    },
    {
      key: "cost_of_living_adjustment",
      header: i18n.catalog["common.general.costLivingAllowance"],
      dataLabel: i18n.catalog["common.general.costLivingAllowance"],
      render: (item) => formatCurrency(item.cost_of_living_adjustment || 0)
    },
    {
      key: "housing_allowance",
      header: i18n.catalog["common.general.housingAllowance"],
      dataLabel: i18n.catalog["common.general.housingAllowance"],
      render: (item) => formatCurrency(item.housing_allowance || 0)
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
              onClick: () => router.push(`/06-human-capital/workforce-admin/employee-master/expat-management/view/${item.id}`)
            },
            ...(canAccess("expat_management", "edit") ? [{
              icon: "edit" as const,
              title: i18n.catalog["common.general.edit"],
              variant: "edit" as const,
              onClick: () => router.push(`/06-human-capital/workforce-admin/employee-master/expat-management/edit/${item.id}`)
            }] : [])
          ]}
        />
      ),
    },
  ];

  return (
    <div className="sales-card animate-fade">
      <PageSubHeader
        title={i18n.catalog["common.general.foreignWorkforceManagement"]}
        titleIcon="globe"
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
          canAccess("expat_management", "create") && (
            <Button
              onClick={() => router.push('/06-human-capital/workforce-admin/employee-master/expat-management/add')}
              variant="primary"
              icon="plus"
            >
              {i18n.catalog["common.general.addRecord"]}</Button>
          )
        }
      />

      <Table
        columns={columns}
        data={records}
        keyExtractor={(item) => item.id.toString()}
        emptyMessage={i18n.catalog["humanCapital.expatmanagement.noRecordsExpatriates"]}
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

