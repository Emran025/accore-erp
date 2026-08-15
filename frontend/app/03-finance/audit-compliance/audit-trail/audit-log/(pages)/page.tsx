"use client";

import { useI18n, catalogMessage } from "@/lib/i18n";
import { MainLayout, PageSubHeader } from "@/components/layout";
import { Button, Column, DateRangePicker, FilterActions, FilterGroup, FilterSection, Table, showToast } from "@/components/ui";
import { fetchAPI } from "@/lib/api";
import { User, getStoredUser } from "@/lib/auth";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatDateTime } from "@/lib/utils";
import { useCallback, useEffect, useState } from "react";

interface AuditLog {
  id: number;
  user_name: string;
  action: string;
  module: string;
  description: string;
  ip_address: string;
  created_at: string;
}

const actionTypes = [
  { value: "", label: catalogMessage("finance.auditLog.allActions") },
  { value: "create", label: catalogMessage("common.general.create") },
  { value: "update", label: catalogMessage("common.general.edit") },
  { value: "delete", label: catalogMessage("common.general.delete") },
  { value: "login", label: catalogMessage("finance.auditLog.login.alternative2") },
  { value: "logout", label: catalogMessage("finance.auditLog.signOut") },
];

const moduleTypes = [
  { value: "", label: catalogMessage("finance.auditLog.allUnits") },
  { value: "auth", label: catalogMessage("finance.auditLog.authentication") },
  { value: "sales", label: catalogMessage("common.general.sales") },
  { value: "products", label: catalogMessage("finance.auditLog.products") },
  { value: "purchases", label: catalogMessage("common.general.purchases") },
  { value: "expenses", label: catalogMessage("common.general.expenses") },
  { value: "users", label: catalogMessage("common.general.users") },
  { value: "settings", label: catalogMessage("common.general.settings") },
  { value: "accounts", label: catalogMessage("finance.auditLog.accounts") },
  { value: "vouchers", label: catalogMessage("finance.auditLog.vouchers") },
];

export default function AuditTrailPage() {
    const { t: i18n } = useI18n();
  const [user, setUser] = useState<User | null>(null);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [moduleFilter, setModuleFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const itemsPerPage = 20;

  const loadLogs = useCallback(async (page: number = 1) => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      params.append("page", String(page));
      params.append("limit", String(itemsPerPage));
      if (dateFrom) params.append("date_from", dateFrom);
      if (dateTo) params.append("date_to", dateTo);
      if (actionFilter) params.append("action", actionFilter);
      if (moduleFilter) params.append("module", moduleFilter);
      if (searchTerm) params.append("search", searchTerm);

      const response = await fetchAPI(`${API_ENDPOINTS.ENTERPRISE_CORE.AUDIT.LOGS}?${params.toString()}`);
      setLogs(response.logs as AuditLog[] || []);
      setTotalPages(Math.ceil((response.total as number || 0) / itemsPerPage));
      setCurrentPage(page);
    } catch {
      showToast(i18n.catalog["finance.auditLog.errorLoadingAuditLog"], "error");
    } finally {
      setIsLoading(false);
    }
  }, [dateFrom, dateTo, actionFilter, moduleFilter, searchTerm]);

  useEffect(() => {
    const storedUser = getStoredUser();
    setUser(storedUser);
    loadLogs();
  }, [loadLogs]);

  const handleFilter = () => {
    loadLogs(1);
  };

  const handleExport = () => {
    showToast(i18n.catalog["finance.auditLog.exportingRecord"], "info");
    // Export logic would go here
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case "create":
        return <span className="badge badge-success">{i18n.catalog["common.general.create"]}</span>;
      case "update":
        return <span className="badge badge-info">{i18n.catalog["common.general.edit"]}</span>;
      case "delete":
        return <span className="badge badge-danger">{i18n.catalog["common.general.delete"]}</span>;
      case "login":
        return <span className="badge badge-primary">{i18n.catalog["finance.auditLog.login"]}</span>;
      case "logout":
        return <span className="badge badge-secondary">{i18n.catalog["finance.auditLog.logout"]}</span>;
      default:
        return <span className="badge badge-secondary">{action}</span>;
    }
  };

  const getModuleLabel = (module: string) => {
    const found = moduleTypes.find((m) => m.value === module);
    return found?.label || module;
  };

  const columns: Column<AuditLog>[] = [
    {
      key: "created_at",
      header: i18n.catalog["common.general.dateTime"],
      dataLabel: i18n.catalog["common.general.dateTime"],
      render: (item) => formatDateTime(item.created_at),
    },
    { key: "user_name", header: i18n.catalog["common.general.user"], dataLabel: i18n.catalog["common.general.user"] },
    {
      key: "action",
      header: i18n.catalog["common.general.action.alternative2"],
      dataLabel: i18n.catalog["common.general.action.alternative2"],
      render: (item) => getActionBadge(item.action),
    },
    {
      key: "module",
      header: i18n.catalog["common.general.unit.alternative2"],
      dataLabel: i18n.catalog["common.general.unit.alternative2"],
      render: (item) => getModuleLabel(item.module),
    },
    { key: "description", header: i18n.catalog["common.general.description.alternative2"], dataLabel: i18n.catalog["common.general.description.alternative2"] },
    { key: "ip_address", header: i18n.catalog["common.general.ipAddress"], dataLabel: i18n.catalog["common.general.ipAddress"] },
  ];

  return (
    <MainLayout requiredModule="audit_trail">

      <div className="sales-card animate-fade">
        <PageSubHeader
          actions={
            <Button variant="secondary" onClick={handleExport} icon="download">
              {i18n.catalog["common.general.export"]}</Button>
          }
        />
        {/* Filters */}
        <FilterSection>
          <DateRangePicker
            label={i18n.catalog["finance.auditLog.reviewPeriod"]}
            startDate={dateFrom}
            endDate={dateTo}
            onStartDateChange={setDateFrom}
            onEndDateChange={setDateTo}
          />
          <FilterGroup label={i18n.catalog["common.general.action.alternative2"]}>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
            >
              {actionTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </FilterGroup>
          <FilterGroup label={i18n.catalog["common.general.unit.alternative2"]}>
            <select
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
            >
              {moduleTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </FilterGroup>
          <FilterGroup label={i18n.catalog["common.general.search.alternative2"]}>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={i18n.catalog["finance.auditLog.searchUserDescription"]}
            />
          </FilterGroup>
          <FilterActions>
            <Button onClick={handleFilter} icon="search">
              {i18n.catalog["common.general.filter"]}</Button>
          </FilterActions>
        </FilterSection>

        <Table
          columns={columns}
          data={logs}
          keyExtractor={(item) => item.id}
          emptyMessage={i18n.catalog["common.general.noRecords"]}
          isLoading={isLoading}
          pagination={{
            currentPage,
            totalPages,
            onPageChange: loadLogs,
          }}
        />
      </div>
    </MainLayout>
  );
}

