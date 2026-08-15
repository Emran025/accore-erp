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
      case 'active': return i18n.catalog["common.general.active"];
      case 'suspended': return i18n.catalog["common.general.pending"];
      case 'terminated': return i18n.catalog["common.general.employmentTerminated"];
      default: return status;
    }
  };

  const columns: Column<Employee>[] = [
    { key: "employee_code", header: i18n.catalog["common.general.employeeNumber.alternative2"], dataLabel: i18n.catalog["common.general.employeeNumber.alternative2"] },
    { key: "full_name", header: i18n.catalog["common.general.fullName"], dataLabel: i18n.catalog["common.general.fullName"] },
    { key: "role", header: i18n.catalog["common.general.positionTitle"], dataLabel: i18n.catalog["common.general.positionTitle"], render: (item) => item.position?.position_name_ar || item.role?.role_name_ar || '-' },
    { key: "department", header: i18n.catalog["common.general.section"], dataLabel: i18n.catalog["common.general.section"], render: (item) => item.department?.name_ar || '-' },
    { key: "base_salary", header: i18n.catalog["common.general.basicSalary"], dataLabel: i18n.catalog["common.general.basicSalary"], render: (item) => formatCurrency(item.base_salary) },
    {
      key: "employment_status", header: i18n.catalog["common.general.status.alternative2"], dataLabel: i18n.catalog["common.general.status.alternative2"], render: (item) => (
        <span className={`badge ${getStatusBadgeClass(item.employment_status)}`}>
          {getStatusText(item.employment_status)}
        </span>
      )
    },
    {
      key: "id", header: i18n.catalog["common.general.actions"], dataLabel: i18n.catalog["common.general.actions"], render: (item) => (
        <ActionButtons
          actions={[
            {
              icon: "eye",
              title: i18n.catalog["humanCapital.employees.viewFile"],
              variant: "view",
              onClick: () => router.push(`/06-human-capital/workforce-admin/employee-master/employees-list/view/${item.id}`)
            },
            ...(canAccess("employees", "edit") ? [{
              icon: "edit" as const,
              title: i18n.catalog["common.general.edit"],
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
        title={i18n.catalog["humanCapital.employees.employeeManagement"]}
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
            placeholder={i18n.catalog["common.general.quickSearch"]}
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
              {i18n.catalog["humanCapital.employees.addEmployee"]}</Button>
          )
        }
      />

      <Table
        columns={columns}
        data={employees}
        keyExtractor={(item) => item.id}
        emptyMessage={i18n.catalog["humanCapital.employees.noEmployees"]}
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
