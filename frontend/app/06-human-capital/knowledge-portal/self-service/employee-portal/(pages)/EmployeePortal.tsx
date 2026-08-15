"use client";

import { useI18n, catalogText } from "@/lib/i18n";
import { PageSubHeader } from "@/components/layout";
import { TabNavigation } from "@/components/navigation/TabNavigation";
import { Button, Column, Dialog, showToast, Table } from "@/components/ui";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/Textarea";
import { TextInput } from "@/components/ui/TextInput";
import { fetchAPI } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatCurrency, formatDate } from "@/lib/utils";
import { AttendanceRecord, LeaveRequest, PayrollItem } from "@/types";
import { useEffect, useState } from "react";

export function EmployeePortal() {
    const { t: i18n } = useI18n();
  const [activeTab, setActiveTab] = useState("payslips");
  const [payslips, setPayslips] = useState<PayrollItem[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [attendance, setAttendance] = useState<{ records: AttendanceRecord[]; summary: any } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const [newLeaveRequest, setNewLeaveRequest] = useState({
    leave_type: "vacation" as const,
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    reason: ""
  });

  useEffect(() => {
    loadPayslips();
  }, []);

  useEffect(() => {
    if (activeTab === 'leave') {
      loadLeaveRequests();
    } else if (activeTab === 'attendance') {
      loadAttendance();
    }
  }, [activeTab, startDate, endDate]);

  const loadPayslips = async () => {
    setIsLoading(true);
    try {
      const res: any = await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.EMPLOYEE_PORTAL.PAYSLIPS);
      const data = res.data || (Array.isArray(res) ? res : []);
      setPayslips(data);
    } catch (e) {
      showToast(i18n.catalog["text_6a4f2dcc33a3"], "error");
    } finally {
      setIsLoading(false);
    }
  };

  const loadLeaveRequests = async () => {
    setIsLoading(true);
    try {
      const res: any = await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.EMPLOYEE_PORTAL.LEAVE_REQUESTS);
      const data = res.data || (Array.isArray(res) ? res : []);
      setLeaveRequests(data);
    } catch (e) {
      showToast(i18n.catalog["text_8894208f0a4e"], "error");
    } finally {
      setIsLoading(false);
    }
  };

  const loadAttendance = async () => {
    setIsLoading(true);
    try {
      const res: any = await fetchAPI(
        `${API_ENDPOINTS.HUMAN_CAPITAL.EMPLOYEE_PORTAL.ATTENDANCE}?start_date=${startDate}&end_date=${endDate}`
      );
      if (res && !res.error) {
        setAttendance(res);
      } else {
        setAttendance(null);
        if (res?.error) showToast(res.error, "error");
      }
    } catch (e) {
      showToast(i18n.catalog["text_f0a8c393be98"], "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateLeaveRequest = async () => {
    try {
      await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.EMPLOYEE_PORTAL.LEAVE_REQUESTS, {
        method: 'POST',
        body: JSON.stringify(newLeaveRequest)
      });
      showToast(i18n.catalog["text_87f3dfc6d9a2"], "success");
      setShowLeaveDialog(false);
      setNewLeaveRequest({
        leave_type: "vacation",
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
        reason: ""
      });
      loadLeaveRequests();
    } catch (e: any) {
      showToast(e.message || i18n.catalog["text_9a10ac72a5c6"], "error");
    }
  };

  const payslipColumns: Column<PayrollItem>[] = [
    {
      key: "payroll_cycle",
      header: i18n.catalog["text_0335edfeb5f3"],
      dataLabel: i18n.catalog["text_0335edfeb5f3"],
      render: (item) => item.payroll_cycle?.cycle_name || "-"
    },
    {
      key: "period",
      header: i18n.catalog["text_d96f3935192c"],
      dataLabel: i18n.catalog["text_d96f3935192c"],
      render: (item) => {
        if (!item.payroll_cycle) return "-";
        return `${formatDate(item.payroll_cycle.period_start)} - ${formatDate(item.payroll_cycle.period_end)}`;
      }
    },
    {
      key: "base_salary",
      header: i18n.catalog["text_73ad6b20ceb7"],
      dataLabel: i18n.catalog["text_73ad6b20ceb7"],
      render: (item) => formatCurrency(item.base_salary)
    },
    {
      key: "total_allowances",
      header: i18n.catalog["text_47ad42ce3bd0"],
      dataLabel: i18n.catalog["text_47ad42ce3bd0"],
      render: (item) => formatCurrency(item.total_allowances)
    },
    {
      key: "total_deductions",
      header: i18n.catalog["text_d2c0940a5a2d"],
      dataLabel: i18n.catalog["text_d2c0940a5a2d"],
      render: (item) => formatCurrency(item.total_deductions)
    },
    {
      key: "net_salary",
      header: i18n.catalog["text_c7d44dba6d26"],
      dataLabel: i18n.catalog["text_c7d44dba6d26"],
      render: (item) => <span style={{ fontWeight: 700, color: 'var(--primary-color)' }}>{formatCurrency(item.net_salary)}</span>
    },
    {
      key: "paid_amount",
      header: i18n.catalog["text_bcfc50ef7c18"],
      dataLabel: i18n.catalog["text_bcfc50ef7c18"],
      render: (item) => formatCurrency(item.paid_amount || 0)
    },
    {
      key: "remaining_balance",
      header: i18n.catalog["text_b2127e3a35be"],
      dataLabel: i18n.catalog["text_b2127e3a35be"],
      render: (item) => {
        const remaining = item.remaining_balance || item.net_salary;
        return remaining > 0 ? (
          <span className="badge badge-warning">{formatCurrency(remaining)}</span>
        ) : (
          <span className="badge badge-success">{i18n.catalog["text_973ac5807247"]}</span>
        );
      }
    }
  ];

  const leaveColumns: Column<LeaveRequest>[] = [
    {
      key: "leave_type",
      header: i18n.catalog["text_61fc59d28e6c"],
      dataLabel: i18n.catalog["text_61fc59d28e6c"],
      render: (record) => {
        const types: Record<string, string> = {
          vacation: i18n.catalog["text_91c6de93bb44"],
          sick: i18n.catalog["text_fca09aac41d9"],
          emergency: i18n.catalog["text_eb759e4e34a1"],
          unpaid: i18n.catalog["text_5f83f571fe77"],
          other: i18n.catalog["text_17a9f38e22b6"]
        };
        return types[record.leave_type] || record.leave_type;
      }
    },
    {
      key: "start_date",
      header: i18n.catalog["text_996988dbc52e"],
      dataLabel: i18n.catalog["text_996988dbc52e"],
      render: (record) => formatDate(record.start_date)
    },
    {
      key: "end_date",
      header: i18n.catalog["text_217caed1c04f"],
      dataLabel: i18n.catalog["text_217caed1c04f"],
      render: (record) => formatDate(record.end_date)
    },
    {
      key: "days_requested",
      header: i18n.catalog["text_32266c44f2ee"],
      dataLabel: i18n.catalog["text_32266c44f2ee"],
      render: (record) => catalogText(i18n, "text_8f726399a049", { value0: record.days_requested })
    },
    {
      key: "status",
      header: i18n.catalog["text_c3a4749caed4"],
      dataLabel: i18n.catalog["text_c3a4749caed4"],
      render: (record) => {
        const statusMap: Record<string, { text: string; class: string }> = {
          pending: { text: i18n.catalog["text_7d7913fdef74"], class: i18n.catalog["text_35cf88831e8b"] },
          approved: { text: i18n.catalog["text_a98d8a418ba0"], class: i18n.catalog["text_59e14762e315"] },
          rejected: { text: i18n.catalog["text_5d969a71dad3"], class: i18n.catalog["text_662a2d1d0a2d"] },
          cancelled: { text: i18n.catalog["text_616d302cb016"], class: i18n.catalog["text_983fd0c81395"] }
        };
        const status = statusMap[record.status] || { text: record.status, class: "badge" };
        return <span className={status.class}>{status.text}</span>;
      }
    }
  ];

  const attendanceColumns: Column<AttendanceRecord>[] = [
    {
      key: "attendance_date",
      header: i18n.catalog["text_d90c384199ac"],
      dataLabel: i18n.catalog["text_d90c384199ac"],
      render: (record) => formatDate(record.attendance_date)
    },
    {
      key: "check_in",
      header: i18n.catalog["text_9f3c0b8bfe50"],
      dataLabel: i18n.catalog["text_9f3c0b8bfe50"],
      render: (record) => record.check_in || "-"
    },
    {
      key: "check_out",
      header: i18n.catalog["text_d15b689176c8"],
      dataLabel: i18n.catalog["text_d15b689176c8"],
      render: (record) => record.check_out || "-"
    },
    {
      key: "status",
      header: i18n.catalog["text_c3a4749caed4"],
      dataLabel: i18n.catalog["text_c3a4749caed4"],
      render: (record) => {
        const statusMap: Record<string, { text: string; class: string }> = {
          present: { text: i18n.catalog["text_40284b78e717"], class: i18n.catalog["text_59e14762e315"] },
          absent: { text: i18n.catalog["text_3799f9c5cbe6"], class: i18n.catalog["text_662a2d1d0a2d"] },
          leave: { text: i18n.catalog["text_caad22be276b"], class: i18n.catalog["text_99340b150df6"] },
          holiday: { text: i18n.catalog["text_1b2ee5b8ba2c"], class: i18n.catalog["text_983fd0c81395"] },
          weekend: { text: i18n.catalog["text_80d62c077b65"], class: i18n.catalog["text_983fd0c81395"] }
        };
        const status = statusMap[record.status] || { text: record.status, class: "badge" };
        return <span className={status.class}>{status.text}</span>;
      }
    },
    {
      key: "hours_worked",
      header: i18n.catalog["text_62ad30c3923e"],
      dataLabel: i18n.catalog["text_62ad30c3923e"],
      render: (record) => catalogText(i18n, "text_555f401b505c", { value0: (record.hours_worked || 0).toFixed(2) })
    }
  ];

  return (
    <div className="sales-card animate-fade">
      <PageSubHeader
        title={i18n.catalog["text_9c570f9f1332"]}
        titleIcon="user-circle"
      />

      <div className="settings-wrapper">
        <TabNavigation
          tabs={[
            { key: "payslips", label: i18n.catalog["text_254d737b29c3"], icon: "fa-file-invoice-dollar" },
            { key: "leave", label: i18n.catalog["text_f1240747d0a1"], icon: "fa-calendar-alt" },
            { key: "attendance", label: i18n.catalog["text_d162cfaed3e2"], icon: "fa-clock" }
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {activeTab === "payslips" && (
          <div className="tab-content active" style={{ marginTop: '1.5rem' }}>
            <div className="sales-card">
              <Table
                data={payslips}
                columns={payslipColumns}
                isLoading={isLoading}
                emptyMessage={i18n.catalog["text_6c6e6ccf5938"]}
                keyExtractor={(item) => item.id.toString()}
              />
            </div>
          </div>
        )}

        {activeTab === "leave" && (
          <div className="tab-content active" style={{ marginTop: '1.5rem' }}>
            <div className="sales-card">
              <div className="card-header-flex" style={{ marginBottom: '1rem' }}>
                <h4 style={{ margin: 0 }}>{i18n.catalog["text_f1240747d0a1"]}</h4>
                <Button
                  variant="primary"
                  onClick={() => setShowLeaveDialog(true)}
                  icon="plus">
                  {i18n.catalog["text_5321087b563b"]}</Button>
              </div>
              <Table
                data={leaveRequests}
                columns={leaveColumns}
                isLoading={isLoading}
                emptyMessage={i18n.catalog["text_9c94b78094b3"]}
                keyExtractor={(item) => item.id.toString()}
              />
            </div>
          </div>
        )}

        {activeTab === "attendance" && (
          <div className="tab-content active" style={{ marginTop: '1.5rem' }}>
            <div className="sales-card compact" style={{ marginBottom: '1.5rem' }}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <TextInput
                  label={i18n.catalog["text_996988dbc52e"]}
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <TextInput
                  label={i18n.catalog["text_217caed1c04f"]}
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
                <div className="flex items-end">
                  <Button
                    onClick={loadAttendance}
                    variant="primary"
                    icon="search"
                    style={{ width: '100%' }}>
                    {i18n.catalog["text_d0f6edcf6d65"]}</Button>
                </div>
              </div>
            </div>

            {attendance?.summary && (
              <div className="sales-card compact" style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', border: '1px solid #bfdbfe' }}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="stat-item">
                    <span className="stat-label">{i18n.catalog["text_9aba92a6587e"]}</span>
                    <span className="stat-value">{attendance.summary.total_hours?.toFixed(2) || 0} {i18n.catalog["text_44c3abfb7720"]}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">{i18n.catalog["text_05751aac2a08"]}</span>
                    <span className="stat-value highlight">{attendance.summary.total_overtime?.toFixed(2) || 0} {i18n.catalog["text_44c3abfb7720"]}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">{i18n.catalog["text_2ebc83ed3d26"]}</span>
                    <span className="stat-value">{attendance.summary.total_days_present || 0} {i18n.catalog["text_eb07f635d883"]}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">{i18n.catalog["text_520784683ed3"]}</span>
                    <span className="stat-value">{attendance.summary.total_days_absent || 0} {i18n.catalog["text_eb07f635d883"]}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="sales-card">
              <Table
                data={attendance?.records || []}
                columns={attendanceColumns}
                isLoading={isLoading}
                emptyMessage={i18n.catalog["text_6d7d7b7ab049"]}
                keyExtractor={(item) => item.id.toString()}
              />
            </div>
          </div>
        )}
      </div>

      <Dialog
        isOpen={showLeaveDialog}
        onClose={() => setShowLeaveDialog(false)}
        title={i18n.catalog["text_5321087b563b"]}
        maxWidth="600px"
      >
        <div className="space-y-4">
          <Select
            label={i18n.catalog["text_6dac3ee982cf"]}
            value={newLeaveRequest.leave_type}
            onChange={(e) => setNewLeaveRequest({ ...newLeaveRequest, leave_type: e.target.value as any })}
            options={[
              { value: "vacation", label: i18n.catalog["text_91c6de93bb44"] },
              { value: "sick", label: i18n.catalog["text_fca09aac41d9"] },
              { value: "emergency", label: i18n.catalog["text_eb759e4e34a1"] },
              { value: "unpaid", label: i18n.catalog["text_5f83f571fe77"] },
              { value: "other", label: i18n.catalog["text_17a9f38e22b6"] }
            ]}
          />
          <div className="grid grid-cols-2 gap-4">
            <TextInput
              label={i18n.catalog["text_2861a808b514"]}
              type="date"
              value={newLeaveRequest.start_date}
              onChange={(e) => setNewLeaveRequest({ ...newLeaveRequest, start_date: e.target.value })}
            />
            <TextInput
              label={i18n.catalog["text_271f86cc7df0"]}
              type="date"
              value={newLeaveRequest.end_date}
              onChange={(e) => setNewLeaveRequest({ ...newLeaveRequest, end_date: e.target.value })}
            />
          </div>
          <Textarea
            label={i18n.catalog["text_c3b023d78238"]}
            value={newLeaveRequest.reason}
            onChange={(e) => setNewLeaveRequest({ ...newLeaveRequest, reason: e.target.value })}
          />
          <div className="flex justify-end gap-2" style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <Button variant="secondary" onClick={() => setShowLeaveDialog(false)}>
              {i18n.catalog["text_9a30dc2a96b8"]}</Button>
            <Button variant="primary" onClick={handleCreateLeaveRequest} icon="save">
              {i18n.catalog["text_ddfcaf9d0144"]}</Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
