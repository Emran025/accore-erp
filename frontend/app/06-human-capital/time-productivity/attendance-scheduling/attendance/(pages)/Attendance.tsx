"use client";

import { useI18n, catalogText } from "@/lib/i18n";
import { PageSubHeader } from "@/components/layout";
import { Button, Column, Dialog, Label, SearchableSelect, showToast, Table } from "@/components/ui";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/Textarea";
import { TextInput } from "@/components/ui/TextInput";
import { fetchAPI } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatDate, formatTime } from "@/lib/utils";
import { useAuthStore } from "@/stores/useAuthStore";
import { useEmployeeStore } from "@/stores/useEmployeeStore";
import { AttendanceRecord, Employee } from "@/types";
import { useEffect, useState } from "react";

export function Attendance() {
    const { t: i18n } = useI18n();
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const { allEmployees: employees, loadAllEmployees } = useEmployeeStore();
  const { canAccess } = useAuthStore();
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [showRecordDialog, setShowRecordDialog] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [newRecord, setNewRecord] = useState({
    employee_id: "",
    attendance_date: new Date().toISOString().split('T')[0],
    check_in: "",
    check_out: "",
    status: "present" as const,
    notes: ""
  });

  useEffect(() => {
    loadAllEmployees();
  }, [loadAllEmployees]);

  useEffect(() => {
    if (selectedEmployee) {
      loadAttendance();
    }
  }, [selectedEmployee, startDate, endDate, currentPage]);

  const loadAttendance = async () => {
    if (!selectedEmployee) return;

    setIsLoading(true);
    try {
      const res: any = await fetchAPI(
        `${API_ENDPOINTS.HUMAN_CAPITAL.ATTENDANCE.BASE}?employee_id=${selectedEmployee}&start_date=${startDate}&end_date=${endDate}&page=${currentPage}`
      );
      const data = res.data || (Array.isArray(res) ? res : []);
      setAttendanceRecords(data);
      setTotalPages(res.last_page || 1);

      const summaryRes: any = await fetchAPI(
        `${API_ENDPOINTS.HUMAN_CAPITAL.ATTENDANCE.SUMMARY}?employee_id=${selectedEmployee}&start_date=${startDate}&end_date=${endDate}`
      );
      setSummary(summaryRes);
    } catch (e) {
      showToast(i18n.catalog["common.general.failedLoadAttendanceRecords"], "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecordAttendance = async () => {
    if (!newRecord.employee_id) {
      showToast(i18n.catalog["common.general.pleaseSelectEmployee"], "error");
      return;
    }

    try {
      await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.ATTENDANCE.BASE, {
        method: 'POST',
        body: JSON.stringify(newRecord)
      });
      showToast(i18n.catalog["humanCapital.attendance.attendanceRecordedSuccessfully"], "success");
      setShowRecordDialog(false);
      setNewRecord({
        employee_id: "",
        attendance_date: new Date().toISOString().split('T')[0],
        check_in: "",
        check_out: "",
        status: "present",
        notes: ""
      });
      if (selectedEmployee) loadAttendance();
    } catch (e: any) {
      showToast(e.message || i18n.catalog["humanCapital.attendance.failedRecordAttendance"], "error");
    }
  };

  const columns: Column<AttendanceRecord>[] = [
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
      render: (record) => record.check_in ? formatTime(record.check_in) : "-"
    },
    {
      key: "check_out",
      header: i18n.catalog["common.general.checkOutTime"],
      dataLabel: i18n.catalog["common.general.checkOutTime"],
      render: (record) => record.check_out ? formatTime(record.check_out) : "-"
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
      render: (record) => catalogText(i18n, "common.general.hour.alternative2", { value0: record.hours_worked.toFixed(2) })
    },
    {
      key: "overtime_hours",
      header: i18n.catalog["common.general.overtime"],
      dataLabel: i18n.catalog["common.general.overtime"],
      render: (record) => record.overtime_hours > 0 ? (
        <span className="badge badge-warning">{record.overtime_hours.toFixed(2)} {i18n.catalog["common.general.hour"]}</span>
      ) : "-"
    },
    {
      key: "is_late",
      header: i18n.catalog["common.general.delay"],
      dataLabel: i18n.catalog["common.general.delay"],
      render: (record) => record.is_late ? (
        <span className="badge badge-warning">{i18n.catalog["humanCapital.attendance.yes"]}{record.late_minutes} {i18n.catalog["humanCapital.attendance.minute"]}</span>
      ) : (
        <span className="badge badge-success">{i18n.catalog["common.general.no"]}</span>
      )
    }
  ];

  return (
    <div className="sales-card animate-fade">
      <PageSubHeader
        title={i18n.catalog["humanCapital.attendance.attendanceRecords"]}
        titleIcon="clock"
        actions={
          canAccess("attendance", "create") && (
            <Button
              variant="primary"
              onClick={() => setShowRecordDialog(true)}
              icon="plus">
              {i18n.catalog["common.general.registerNewAttendance"]}</Button>
          )
        }
      />

      <div className="sales-card compact" style={{ marginBottom: '1.5rem' }}>
        <PageSubHeader
          searchInput={
            <div className="form-group">
              <Label className="text-secondary mb-1">{i18n.catalog["common.general.employee.alternative3"]}</Label>
              <SearchableSelect
                options={employees.map((emp: Employee) => ({ value: emp.id.toString(), label: emp.full_name }))}
                value={selectedEmployee?.toString() || ""}
                onChange={(value) => setSelectedEmployee(value ? Number(value) : null)}
                placeholder={i18n.catalog["common.general.selectEmployee"]}
              />
            </div>
          }

          actions={
            <>
              <TextInput
                label={i18n.catalog["common.general.date.alternative6"]}
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setCurrentPage(1);
                }}
              />
              <TextInput
                label={i18n.catalog["common.general.date.alternative2"]}
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setCurrentPage(1);
                }}
              />
              <Button
                onClick={loadAttendance}
                disabled={!selectedEmployee}
                variant="primary"
                icon="search"
                style={{ width: '100%' }}>
                {i18n.catalog["common.general.search.alternative2"]}</Button>
            </>
          }
        />
      </div>

      {summary && (
        <div className="sales-card compact" style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', border: '1px solid #bfdbfe' }}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="stat-item">
              <span className="stat-label">{i18n.catalog["common.general.totalHours"]}</span>
              <span className="stat-value">{summary.total_hours?.toFixed(2) || 0} {i18n.catalog["common.general.hour"]}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">{i18n.catalog["common.general.overtime"]}</span>
              <span className="stat-value highlight">{summary.total_overtime?.toFixed(2) || 0} {i18n.catalog["common.general.hour"]}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">{i18n.catalog["common.general.attendanceDays"]}</span>
              <span className="stat-value">{summary.total_days_present || 0} {i18n.catalog["common.general.day"]}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">{i18n.catalog["common.general.daysAbsent"]}</span>
              <span className="stat-value">{summary.total_days_absent || 0} {i18n.catalog["common.general.day"]}</span>
            </div>
          </div>
        </div>
      )}

      <div className="sales-card">
        <Table
          data={attendanceRecords}
          columns={columns}
          isLoading={isLoading}
          emptyMessage={i18n.catalog["common.general.noAttendanceRecords"]}
          keyExtractor={(item) => item.id.toString()}
          pagination={{
            currentPage,
            totalPages,
            onPageChange: setCurrentPage
          }}
        />
      </div>

      <Dialog
        isOpen={showRecordDialog}
        onClose={() => setShowRecordDialog(false)}
        title={i18n.catalog["common.general.registerNewAttendance"]}
        maxWidth="600px"
      >
        <div className="space-y-4">
          <div className="flex flex-col gap-1">
            <Label className="text-secondary mb-1">{i18n.catalog["common.general.employee"]}</Label>
            <SearchableSelect
              options={employees.map((emp: Employee) => ({ value: emp.id.toString(), label: emp.full_name }))}
              value={newRecord.employee_id}
              onChange={(value) => setNewRecord({ ...newRecord, employee_id: value ? String(value) : "" })}
              placeholder={i18n.catalog["common.general.selectEmployee"]}
            />
          </div>
          <TextInput
            label={i18n.catalog["common.general.date.alternative3"]}
            type="date"
            value={newRecord.attendance_date}
            onChange={(e) => setNewRecord({ ...newRecord, attendance_date: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <TextInput
              label={i18n.catalog["common.general.loginTime"]}
              type="time"
              value={newRecord.check_in}
              onChange={(e) => setNewRecord({ ...newRecord, check_in: e.target.value })}
            />
            <TextInput
              label={i18n.catalog["common.general.checkOutTime"]}
              type="time"
              value={newRecord.check_out}
              onChange={(e) => setNewRecord({ ...newRecord, check_out: e.target.value })}
            />
          </div>
          <Select
            label={i18n.catalog["common.general.status.alternative2"]}
            value={newRecord.status}
            onChange={(e) => setNewRecord({ ...newRecord, status: e.target.value as any })}
            options={[
              { value: 'present', label: i18n.catalog["common.general.present"] },
              { value: 'absent', label: i18n.catalog["common.general.absent"] },
              { value: 'leave', label: i18n.catalog["common.general.leave"] },
              { value: 'holiday', label: i18n.catalog["common.general.holiday"] },
              { value: 'weekend', label: i18n.catalog["common.general.weekend"] }
            ]}
          />
          <Textarea
            label={i18n.catalog["common.general.notes.alternative2"]}
            value={newRecord.notes}
            onChange={(e) => setNewRecord({ ...newRecord, notes: e.target.value })}
          />
          <div className="flex justify-end gap-2" style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <Button variant="secondary" onClick={() => setShowRecordDialog(false)}>
              {i18n.catalog["common.general.cancel"]}</Button>
            <Button variant="primary" onClick={handleRecordAttendance} icon="save">
              {i18n.catalog["common.general.save"]}</Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
