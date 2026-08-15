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
      showToast(i18n.catalog["humanCapital.employeeportal.failedLoadPayrolls"], "error");
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
      showToast(i18n.catalog["common.general.failedLoadLeaveRequests"], "error");
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
      showToast(i18n.catalog["common.general.failedLoadAttendanceRecords"], "error");
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
      showToast(i18n.catalog["common.general.leaveRequestCreatedSuccessfully"], "success");
      setShowLeaveDialog(false);
      setNewLeaveRequest({
        leave_type: "vacation",
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
        reason: ""
      });
      loadLeaveRequests();
    } catch (e: any) {
      showToast(e.message || i18n.catalog["common.general.failedCreateLeaveRequest"], "error");
    }
  };

  const payslipColumns: Column<PayrollItem>[] = [
    {
      key: "payroll_cycle",
      header: i18n.catalog["common.general.period"],
      dataLabel: i18n.catalog["common.general.period"],
      render: (item) => item.payroll_cycle?.cycle_name || "-"
    },
    {
      key: "period",
      header: i18n.catalog["common.general.timePeriod"],
      dataLabel: i18n.catalog["common.general.timePeriod"],
      render: (item) => {
        if (!item.payroll_cycle) return "-";
        return `${formatDate(item.payroll_cycle.period_start)} - ${formatDate(item.payroll_cycle.period_end)}`;
      }
    },
    {
      key: "base_salary",
      header: i18n.catalog["common.general.basicSalary"],
      dataLabel: i18n.catalog["common.general.basicSalary"],
      render: (item) => formatCurrency(item.base_salary)
    },
    {
      key: "total_allowances",
      header: i18n.catalog["common.general.allowances"],
      dataLabel: i18n.catalog["common.general.allowances"],
      render: (item) => formatCurrency(item.total_allowances)
    },
    {
      key: "total_deductions",
      header: i18n.catalog["common.general.discounts"],
      dataLabel: i18n.catalog["common.general.discounts"],
      render: (item) => formatCurrency(item.total_deductions)
    },
    {
      key: "net_salary",
      header: i18n.catalog["common.general.netSalary"],
      dataLabel: i18n.catalog["common.general.netSalary"],
      render: (item) => <span style={{ fontWeight: 700, color: 'var(--primary-color)' }}>{formatCurrency(item.net_salary)}</span>
    },
    {
      key: "paid_amount",
      header: i18n.catalog["common.general.paid.alternative3"],
      dataLabel: i18n.catalog["common.general.paid.alternative3"],
      render: (item) => formatCurrency(item.paid_amount || 0)
    },
    {
      key: "remaining_balance",
      header: i18n.catalog["common.general.remaining.alternative2"],
      dataLabel: i18n.catalog["common.general.remaining.alternative2"],
      render: (item) => {
        const remaining = item.remaining_balance || item.net_salary;
        return remaining > 0 ? (
          <span className="badge badge-warning">{formatCurrency(remaining)}</span>
        ) : (
          <span className="badge badge-success">{i18n.catalog["humanCapital.employeeportal.paidFull"]}</span>
        );
      }
    }
  ];

  const leaveColumns: Column<LeaveRequest>[] = [
    {
      key: "leave_type",
      header: i18n.catalog["common.general.leaveType"],
      dataLabel: i18n.catalog["common.general.leaveType"],
      render: (record) => {
        const types: Record<string, string> = {
          vacation: i18n.catalog["common.general.annualLeave"],
          sick: i18n.catalog["common.general.sickLeave"],
          emergency: i18n.catalog["common.general.emergencyLeave"],
          unpaid: i18n.catalog["common.general.unpaidLeave"],
          other: i18n.catalog["common.general.other"]
        };
        return types[record.leave_type] || record.leave_type;
      }
    },
    {
      key: "start_date",
      header: i18n.catalog["common.general.date.alternative6"],
      dataLabel: i18n.catalog["common.general.date.alternative6"],
      render: (record) => formatDate(record.start_date)
    },
    {
      key: "end_date",
      header: i18n.catalog["common.general.date.alternative2"],
      dataLabel: i18n.catalog["common.general.date.alternative2"],
      render: (record) => formatDate(record.end_date)
    },
    {
      key: "days_requested",
      header: i18n.catalog["common.general.numberDays"],
      dataLabel: i18n.catalog["common.general.numberDays"],
      render: (record) => catalogText(i18n, "common.general.dayS", { value0: record.days_requested })
    },
    {
      key: "status",
      header: i18n.catalog["common.general.status.alternative2"],
      dataLabel: i18n.catalog["common.general.status.alternative2"],
      render: (record) => {
        const statusMap: Record<string, { text: string; class: string }> = {
          pending: { text: i18n.catalog["common.general.pending.alternative2"], class: i18n.catalog["common.general.badgeBadgeWarning"] },
          approved: { text: i18n.catalog["common.general.approved"], class: i18n.catalog["common.general.badgeBadgeSuccess"] },
          rejected: { text: i18n.catalog["common.general.rejected"], class: i18n.catalog["common.general.badgeBadgeDanger"] },
          cancelled: { text: i18n.catalog["common.general.canceled"], class: i18n.catalog["common.general.badgeBadgeSecondary"] }
        };
        const status = statusMap[record.status] || { text: record.status, class: "badge" };
        return <span className={status.class}>{status.text}</span>;
      }
    }
  ];

  const attendanceColumns: Column<AttendanceRecord>[] = [
    {
      key: "attendance_date",
      header: i18n.catalog["common.general.date.alternative7"],
      dataLabel: i18n.catalog["common.general.date.alternative7"],
      render: (record) => formatDate(record.attendance_date)
    },
    {
      key: "check_in",
      header: i18n.catalog["common.general.loginTime"],
      dataLabel: i18n.catalog["common.general.loginTime"],
      render: (record) => record.check_in || "-"
    },
    {
      key: "check_out",
      header: i18n.catalog["common.general.checkOutTime"],
      dataLabel: i18n.catalog["common.general.checkOutTime"],
      render: (record) => record.check_out || "-"
    },
    {
      key: "status",
      header: i18n.catalog["common.general.status.alternative2"],
      dataLabel: i18n.catalog["common.general.status.alternative2"],
      render: (record) => {
        const statusMap: Record<string, { text: string; class: string }> = {
          present: { text: i18n.catalog["common.general.present"], class: i18n.catalog["common.general.badgeBadgeSuccess"] },
          absent: { text: i18n.catalog["common.general.absent"], class: i18n.catalog["common.general.badgeBadgeDanger"] },
          leave: { text: i18n.catalog["common.general.leave"], class: i18n.catalog["common.general.badgeBadgeInfo"] },
          holiday: { text: i18n.catalog["common.general.holiday"], class: i18n.catalog["common.general.badgeBadgeSecondary"] },
          weekend: { text: i18n.catalog["common.general.weekend"], class: i18n.catalog["common.general.badgeBadgeSecondary"] }
        };
        const status = statusMap[record.status] || { text: record.status, class: "badge" };
        return <span className={status.class}>{status.text}</span>;
      }
    },
    {
      key: "hours_worked",
      header: i18n.catalog["common.general.workingHours"],
      dataLabel: i18n.catalog["common.general.workingHours"],
      render: (record) => catalogText(i18n, "common.general.hour.alternative2", { value0: (record.hours_worked || 0).toFixed(2) })
    }
  ];

  return (
    <div className="sales-card animate-fade">
      <PageSubHeader
        title={i18n.catalog["humanCapital.employeeportal.employeeSelfServicePortal"]}
        titleIcon="user-circle"
      />

      <div className="settings-wrapper">
        <TabNavigation
          tabs={[
            { key: "payslips", label: i18n.catalog["humanCapital.employeeportal.payroll"], icon: "fa-file-invoice-dollar" },
            { key: "leave", label: i18n.catalog["common.general.leaveRequests"], icon: "fa-calendar-alt" },
            { key: "attendance", label: i18n.catalog["humanCapital.employeeportal.attendanceRecords"], icon: "fa-clock" }
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
                emptyMessage={i18n.catalog["humanCapital.employeeportal.noPayrolls"]}
                keyExtractor={(item) => item.id.toString()}
              />
            </div>
          </div>
        )}

        {activeTab === "leave" && (
          <div className="tab-content active" style={{ marginTop: '1.5rem' }}>
            <div className="sales-card">
              <div className="card-header-flex" style={{ marginBottom: '1rem' }}>
                <h4 style={{ margin: 0 }}>{i18n.catalog["common.general.leaveRequests"]}</h4>
                <Button
                  variant="primary"
                  onClick={() => setShowLeaveDialog(true)}
                  icon="plus">
                  {i18n.catalog["common.general.newLeaveRequest"]}</Button>
              </div>
              <Table
                data={leaveRequests}
                columns={leaveColumns}
                isLoading={isLoading}
                emptyMessage={i18n.catalog["common.general.noLeaveRequests"]}
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
                  label={i18n.catalog["common.general.date.alternative6"]}
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <TextInput
                  label={i18n.catalog["common.general.date.alternative2"]}
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
                    {i18n.catalog["common.general.search.alternative2"]}</Button>
                </div>
              </div>
            </div>

            {attendance?.summary && (
              <div className="sales-card compact" style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', border: '1px solid #bfdbfe' }}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="stat-item">
                    <span className="stat-label">{i18n.catalog["common.general.totalHours"]}</span>
                    <span className="stat-value">{attendance.summary.total_hours?.toFixed(2) || 0} {i18n.catalog["common.general.hour"]}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">{i18n.catalog["common.general.overtime"]}</span>
                    <span className="stat-value highlight">{attendance.summary.total_overtime?.toFixed(2) || 0} {i18n.catalog["common.general.hour"]}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">{i18n.catalog["common.general.attendanceDays"]}</span>
                    <span className="stat-value">{attendance.summary.total_days_present || 0} {i18n.catalog["common.general.day"]}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">{i18n.catalog["common.general.daysAbsent"]}</span>
                    <span className="stat-value">{attendance.summary.total_days_absent || 0} {i18n.catalog["common.general.day"]}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="sales-card">
              <Table
                data={attendance?.records || []}
                columns={attendanceColumns}
                isLoading={isLoading}
                emptyMessage={i18n.catalog["common.general.noAttendanceRecords"]}
                keyExtractor={(item) => item.id.toString()}
              />
            </div>
          </div>
        )}
      </div>

      <Dialog
        isOpen={showLeaveDialog}
        onClose={() => setShowLeaveDialog(false)}
        title={i18n.catalog["common.general.newLeaveRequest"]}
        maxWidth="600px"
      >
        <div className="space-y-4">
          <Select
            label={i18n.catalog["common.general.leaveType.alternative2"]}
            value={newLeaveRequest.leave_type}
            onChange={(e) => setNewLeaveRequest({ ...newLeaveRequest, leave_type: e.target.value as any })}
            options={[
              { value: "vacation", label: i18n.catalog["common.general.annualLeave"] },
              { value: "sick", label: i18n.catalog["common.general.sickLeave"] },
              { value: "emergency", label: i18n.catalog["common.general.emergencyLeave"] },
              { value: "unpaid", label: i18n.catalog["common.general.unpaidLeave"] },
              { value: "other", label: i18n.catalog["common.general.other"] }
            ]}
          />
          <div className="grid grid-cols-2 gap-4">
            <TextInput
              label={i18n.catalog["common.general.date.alternative5"]}
              type="date"
              value={newLeaveRequest.start_date}
              onChange={(e) => setNewLeaveRequest({ ...newLeaveRequest, start_date: e.target.value })}
            />
            <TextInput
              label={i18n.catalog["common.general.date.alternative4"]}
              type="date"
              value={newLeaveRequest.end_date}
              onChange={(e) => setNewLeaveRequest({ ...newLeaveRequest, end_date: e.target.value })}
            />
          </div>
          <Textarea
            label={i18n.catalog["common.general.reason"]}
            value={newLeaveRequest.reason}
            onChange={(e) => setNewLeaveRequest({ ...newLeaveRequest, reason: e.target.value })}
          />
          <div className="flex justify-end gap-2" style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <Button variant="secondary" onClick={() => setShowLeaveDialog(false)}>
              {i18n.catalog["common.general.cancel"]}</Button>
            <Button variant="primary" onClick={handleCreateLeaveRequest} icon="save">
              {i18n.catalog["common.general.save"]}</Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
