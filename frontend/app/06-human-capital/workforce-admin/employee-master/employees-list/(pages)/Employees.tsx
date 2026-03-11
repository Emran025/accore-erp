"use client";

import { PageSubHeader } from "@/components/layout";
import { ActionButtons, Button, Column, SearchableSelect, Table } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import { useAuthStore } from "@/stores/useAuthStore";
import { useEmployeeStore } from "@/stores/useEmployeeStore";
import { Employee } from "@/types";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function Employees() {
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
      case 'active': return 'نشط';
      case 'suspended': return 'معلق';
      case 'terminated': return 'منهي خدماته';
      default: return status;
    }
  };

  const columns: Column<Employee>[] = [
    { key: "employee_code", header: "رقم الموظف", dataLabel: "رقم الموظف" },
    { key: "full_name", header: "الاسم الكامل", dataLabel: "الاسم الكامل" },
    { key: "role", header: "المنصب / المسمى", dataLabel: "المنصب / المسمى", render: (item) => item.position?.position_name_ar || item.role?.role_name_ar || '-' },
    { key: "department", header: "القسم", dataLabel: "القسم", render: (item) => item.department?.name_ar || '-' },
    { key: "base_salary", header: "الراتب الأساسي", dataLabel: "الراتب الأساسي", render: (item) => formatCurrency(item.base_salary) },
    {
      key: "employment_status", header: "الحالة", dataLabel: "الحالة", render: (item) => (
        <span className={`badge ${getStatusBadgeClass(item.employment_status)}`}>
          {getStatusText(item.employment_status)}
        </span>
      )
    },
    {
      key: "id", header: "الإجراءات", dataLabel: "الإجراءات", render: (item) => (
        <ActionButtons
          actions={[
            {
              icon: "eye",
              title: "عرض الملف",
              variant: "view",
              onClick: () => router.push(`/06-human-capital/workforce-admin/employee-master/employees-list/view/${item.id}`)
            },
            ...(canAccess("employees", "edit") ? [{
              icon: "edit" as const,
              title: "تعديل",
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
        title="إدارة الموظفين"
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
            placeholder="بحث سريع..."
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
              إضافة موظف
            </Button>
          )
        }
      />

      <Table
        columns={columns}
        data={employees}
        keyExtractor={(item) => item.id}
        emptyMessage="لا يوجد موظفين"
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
