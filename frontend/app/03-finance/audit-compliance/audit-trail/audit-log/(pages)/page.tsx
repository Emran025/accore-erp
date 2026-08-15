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
  { value: "", label: catalogMessage("text_c6cd32defc32") },
  { value: "create", label: catalogMessage("text_a820f3590d36") },
  { value: "update", label: catalogMessage("text_113d570d6555") },
  { value: "delete", label: catalogMessage("text_59ca629220a6") },
  { value: "login", label: catalogMessage("text_e8408f9d3589") },
  { value: "logout", label: catalogMessage("text_1850ba90fe7e") },
];

const moduleTypes = [
  { value: "", label: catalogMessage("text_a9051bd4dd17") },
  { value: "auth", label: catalogMessage("text_e3c1917077fd") },
  { value: "sales", label: catalogMessage("text_7bf1b13416bc") },
  { value: "products", label: catalogMessage("text_c8775206b252") },
  { value: "purchases", label: catalogMessage("text_2a14f93caa32") },
  { value: "expenses", label: catalogMessage("text_4d514b65a483") },
  { value: "users", label: catalogMessage("text_b378cbffd5df") },
  { value: "settings", label: catalogMessage("text_5fd9563e6846") },
  { value: "accounts", label: catalogMessage("text_c447ac426926") },
  { value: "vouchers", label: catalogMessage("text_22a192d98656") },
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
      showToast(i18n.catalog["text_bfd528946468"], "error");
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
    showToast(i18n.catalog["text_02fab3be3aba"], "info");
    // Export logic would go here
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case "create":
        return <span className="badge badge-success">{i18n.catalog["text_a820f3590d36"]}</span>;
      case "update":
        return <span className="badge badge-info">{i18n.catalog["text_113d570d6555"]}</span>;
      case "delete":
        return <span className="badge badge-danger">{i18n.catalog["text_59ca629220a6"]}</span>;
      case "login":
        return <span className="badge badge-primary">{i18n.catalog["text_2c860cedec90"]}</span>;
      case "logout":
        return <span className="badge badge-secondary">{i18n.catalog["text_39db927c23ae"]}</span>;
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
      header: i18n.catalog["text_78e9c561195c"],
      dataLabel: i18n.catalog["text_78e9c561195c"],
      render: (item) => formatDateTime(item.created_at),
    },
    { key: "user_name", header: i18n.catalog["text_2fb01868740d"], dataLabel: i18n.catalog["text_2fb01868740d"] },
    {
      key: "action",
      header: i18n.catalog["text_9200595fd0fe"],
      dataLabel: i18n.catalog["text_9200595fd0fe"],
      render: (item) => getActionBadge(item.action),
    },
    {
      key: "module",
      header: i18n.catalog["text_9a08d7d4bf73"],
      dataLabel: i18n.catalog["text_9a08d7d4bf73"],
      render: (item) => getModuleLabel(item.module),
    },
    { key: "description", header: i18n.catalog["text_95023fc76e1b"], dataLabel: i18n.catalog["text_95023fc76e1b"] },
    { key: "ip_address", header: i18n.catalog["text_662315283697"], dataLabel: i18n.catalog["text_662315283697"] },
  ];

  return (
    <MainLayout requiredModule="audit_trail">

      <div className="sales-card animate-fade">
        <PageSubHeader
          actions={
            <Button variant="secondary" onClick={handleExport} icon="download">
              {i18n.catalog["text_4fa0ad254538"]}</Button>
          }
        />
        {/* Filters */}
        <FilterSection>
          <DateRangePicker
            label={i18n.catalog["text_703172db8cd5"]}
            startDate={dateFrom}
            endDate={dateTo}
            onStartDateChange={setDateFrom}
            onEndDateChange={setDateTo}
          />
          <FilterGroup label={i18n.catalog["text_9200595fd0fe"]}>
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
          <FilterGroup label={i18n.catalog["text_9a08d7d4bf73"]}>
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
          <FilterGroup label={i18n.catalog["text_d0f6edcf6d65"]}>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={i18n.catalog["text_ce0b389bffe4"]}
            />
          </FilterGroup>
          <FilterActions>
            <Button onClick={handleFilter} icon="search">
              {i18n.catalog["text_a826a913e567"]}</Button>
          </FilterActions>
        </FilterSection>

        <Table
          columns={columns}
          data={logs}
          keyExtractor={(item) => item.id}
          emptyMessage={i18n.catalog["text_6db2fc201fed"]}
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

