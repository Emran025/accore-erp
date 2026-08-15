import { catalogMessage } from "@/lib/i18n";
import { Column, showToast, Table } from "@/components/ui";
import { fetchAPI } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatDateTime } from "@/lib/utils";
import { Session } from "@/types";
import { useCallback, useEffect, useState } from "react";

export function SessionsTab() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionsPage, setSessionsPage] = useState(1);
  const [sessionsTotalPages, setSessionsTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const loadSessions = useCallback(async (page: number = 1) => {
    setIsLoading(true);
    try {
      const response = await fetchAPI(`${API_ENDPOINTS.ENTERPRISE_CORE.IAM.USERS.SESSIONS}?page=${page}&limit=10`);
      if (response.sessions && Array.isArray(response.sessions)) {
        setSessions(response.sessions as Session[]);
      }
      const total = Number(response.total) || 0;
      setSessionsTotalPages(Math.ceil(total / 10));
      setSessionsPage(page);
    } catch {
      console.error(catalogMessage("enterpriseCore.sessions.errorLoadingSessions"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const terminateSession = async (sessionId: number) => {
    try {
      await fetchAPI(API_ENDPOINTS.ENTERPRISE_CORE.IAM.USERS.SESSIONS_WITH_ID(sessionId), { method: "DELETE" });
      showToast(catalogMessage("enterpriseCore.sessions.sessionEnded"), "success");
      loadSessions(sessionsPage);
    } catch {
      showToast(catalogMessage("enterpriseCore.sessions.errorEndingSession"), "error");
    }
  };

  const sessionColumns: Column<Session>[] = [
    { key: "device", header: catalogMessage("common.general.device"), dataLabel: catalogMessage("common.general.device") },
    { key: "ip_address", header: catalogMessage("common.general.ipAddress"), dataLabel: catalogMessage("common.general.ipAddress") },
    {
      key: "last_activity",
      header: catalogMessage("common.general.lastActivity"),
      dataLabel: catalogMessage("common.general.lastActivity"),
      render: (item) => formatDateTime(item.last_activity),
    },
    {
      key: "is_current",
      header: catalogMessage("common.general.status.alternative2"),
      dataLabel: catalogMessage("common.general.status.alternative2"),
      render: (item) =>
        item.is_current ? (
          <span className="badge badge-success">{catalogMessage("enterpriseCore.sessions.currentSession")}</span>
        ) : null,
    },
    {
      key: "actions",
      header: catalogMessage("common.general.actions"),
      dataLabel: catalogMessage("common.general.actions"),
      render: (item) =>
        !item.is_current && (
          <button
            className="btn btn-sm btn-danger"
            onClick={() => terminateSession(item.id)}
          >
            {catalogMessage("enterpriseCore.sessions.finish")}</button>
        ),
    },
  ];

  return (
    <div className="sales-card">
      <h3>{catalogMessage("common.general.activeSessions")}</h3>
      <Table
        columns={sessionColumns}
        data={sessions}
        keyExtractor={(item) => item.id}
        emptyMessage={catalogMessage("enterpriseCore.sessions.noSessions")}
        isLoading={isLoading}
        pagination={{
          currentPage: sessionsPage,
          totalPages: sessionsTotalPages,
          onPageChange: loadSessions,
        }}
      />
    </div>
  );
}
