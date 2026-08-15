"use client";

import { useI18n } from "@/lib/i18n";
import { PageSubHeader } from "@/components/layout";
import { ActionButtons, Button, Column, SearchableSelect, Table } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import { useAuthStore } from "@/stores/useAuthStore";
import { useEmployeeStore } from "@/stores/useEmployeeStore";
import { Employee } from "@/types";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function Employees() {
    const { t: i18n } = useI18n();
  const router = useRouter();
  const { canAccess } = useAuthStore();

  // Use Employee Store
  const {
    employees,
    isLoading,
    currentPage,
    totalPages,
    loadEmployees,
    searchTerm,
    setSearchTerm,
    departmentFilter
  } = useEmployeeStore();

  useEffect(() => {
    loadEmployees(currentPage, searchTerm, departmentFilter);
  }, [loadEmployees, currentPage, searchTerm, departmentFilter]);

  const handlePageChange = (page: number) => {
    loadEmployees(page, searchTerm, departmentFilter);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active': return 'badge-success';
      case 'suspended': return 'badge-warning';
      case 'terminated': return 'badge-danger';
      default: return 'badge-secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return i18n.catalog["text_629e90b3af3d"];
      case 'suspended': return i18n.catalog["text_701d5d7a86f9"];
      case 'terminated': return i18n.catalog["text_ec0852e29a7e"];
      default: return status;
    }
  };

  const columns: Column<Employee>[] = [
    { key: "employee_code", header: i18n.catalog["text_ecd9a67932c9"], dataLabel: i18n.catalog["text_ecd9a67932c9"] },
    { key: "full_name", header: i18n.catalog["text_6c2ab9bdeb2c"], dataLabel: i18n.catalog["text_6c2ab9bdeb2c"] },
    { key: "role", header: i18n.catalog["text_f658e386df0d"], dataLabel: i18n.catalog["text_f658e386df0d"], render: (item) => item.position?.position_name_ar || item.role?.role_name_ar || '-' },
    { key: "department", header: i18n.catalog["text_0771c3ff9336"], dataLabel: i18n.catalog["text_0771c3ff9336"], render: (item) => item.department?.name_ar || '-' },
    { key: "base_salary", header: i18n.catalog["text_73ad6b20ceb7"], dataLabel: i18n.catalog["text_73ad6b20ceb7"], render: (item) => formatCurrency(item.base_salary) },
    {
      key: "employment_status", header: i18n.catalog["text_c3a4749caed4"], dataLabel: i18n.catalog["text_c3a4749caed4"], render: (item) => (
        <span className={`badge ${getStatusBadgeClass(item.employment_status)}`}>
          {getStatusText(item.employment_status)}
        </span>
      )
    },
    {
      key: "id", header: i18n.catalog["text_7797240d6caf"], dataLabel: i18n.catalog["text_7797240d6caf"], render: (item) => (
        <ActionButtons
          actions={[
            {
              icon: "eye",
              title: i18n.catalog["text_501439113157"],
              variant: "view",
              onClick: () => router.push(`/06-human-capital/workforce-admin/employee-master/employees-list/view/${item.id}`)
            },
            ...(canAccess("employees", "edit") ? [{
              icon: "edit" as const,
              title: i18n.catalog["text_113d570d6555"],
              variant: "edit" as const,
              onClick: () => router.push(`/06-human-capital/workforce-admin/employee-master/employees-list/edit/${item.id}`)
            }] : [])
          ]}
        />
      )
    },
  ];

  return (
    <div className="sales-card animate-fade">
      <PageSubHeader
        title={i18n.catalog["text_bd3f73d63cba"]}
        titleIcon="users"
        searchInput={
          <SearchableSelect
            options={[]}
            value={null}
            onChange={() => { }}
            onSearch={(val) => {
              setSearchTerm(val);
              loadEmployees(1, val, departmentFilter); // Reset to page 1 on search
            }}
            placeholder={i18n.catalog["text_c0d15d40fd31"]}
            className="header-search-bar"
          />
        }
        actions={
          canAccess("employees", "create") && (
            <Button
              variant="primary"
              onClick={() => router.push('/06-human-capital/workforce-admin/employee-master/employees-list/add')}
              icon="plus"
            >
              {i18n.catalog["text_d4a371aa1bf4"]}</Button>
          )
        }
      />

      <Table
        columns={columns}
        data={employees}
        keyExtractor={(item) => item.id}
        emptyMessage={i18n.catalog["text_c9202f059791"]}
        isLoading={isLoading}
        pagination={{
          currentPage: currentPage,
          totalPages: totalPages,
          onPageChange: handlePageChange
        }}
      />
    </div>
  );
}
