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
      console.error(catalogMessage("text_3900d19bf171"));
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
      showToast(catalogMessage("text_23680a3711fb"), "success");
      loadSessions(sessionsPage);
    } catch {
      showToast(catalogMessage("text_d9e59d574328"), "error");
    }
  };

  const sessionColumns: Column<Session>[] = [
    { key: "device", header: catalogMessage("text_bd3ee8aa6cb7"), dataLabel: catalogMessage("text_bd3ee8aa6cb7") },
    { key: "ip_address", header: catalogMessage("text_662315283697"), dataLabel: catalogMessage("text_662315283697") },
    {
      key: "last_activity",
      header: catalogMessage("text_aceab161a5e6"),
      dataLabel: catalogMessage("text_aceab161a5e6"),
      render: (item) => formatDateTime(item.last_activity),
    },
    {
      key: "is_current",
      header: catalogMessage("text_c3a4749caed4"),
      dataLabel: catalogMessage("text_c3a4749caed4"),
      render: (item) =>
        item.is_current ? (
          <span className="badge badge-success">{catalogMessage("text_74ae3d1fa584")}</span>
        ) : null,
    },
    {
      key: "actions",
      header: catalogMessage("text_7797240d6caf"),
      dataLabel: catalogMessage("text_7797240d6caf"),
      render: (item) =>
        !item.is_current && (
          <button
            className="btn btn-sm btn-danger"
            onClick={() => terminateSession(item.id)}
          >
            {catalogMessage("text_3d21a7889032")}</button>
        ),
    },
  ];

  return (
    <div className="sales-card">
      <h3>{catalogMessage("text_49726b3d3b3c")}</h3>
      <Table
        columns={sessionColumns}
        data={sessions}
        keyExtractor={(item) => item.id}
        emptyMessage={catalogMessage("text_21433179b809")}
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
