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
      showToast(i18n.catalog["text_f0a8c393be98"], "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecordAttendance = async () => {
    if (!newRecord.employee_id) {
      showToast(i18n.catalog["text_8c0019b7fcee"], "error");
      return;
    }

    try {
      await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.ATTENDANCE.BASE, {
        method: 'POST',
        body: JSON.stringify(newRecord)
      });
      showToast(i18n.catalog["text_d4b96b12fce0"], "success");
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
      showToast(e.message || i18n.catalog["text_a8f7a8de4ac3"], "error");
    }
  };

  const columns: Column<AttendanceRecord>[] = [
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
      render: (record) => record.check_in ? formatTime(record.check_in) : "-"
    },
    {
      key: "check_out",
      header: i18n.catalog["text_d15b689176c8"],
      dataLabel: i18n.catalog["text_d15b689176c8"],
      render: (record) => record.check_out ? formatTime(record.check_out) : "-"
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
      render: (record) => catalogText(i18n, "text_555f401b505c", { value0: record.hours_worked.toFixed(2) })
    },
    {
      key: "overtime_hours",
      header: i18n.catalog["text_05751aac2a08"],
      dataLabel: i18n.catalog["text_05751aac2a08"],
      render: (record) => record.overtime_hours > 0 ? (
        <span className="badge badge-warning">{record.overtime_hours.toFixed(2)} {i18n.catalog["text_44c3abfb7720"]}</span>
      ) : "-"
    },
    {
      key: "is_late",
      header: i18n.catalog["text_e1baf3dc920f"],
      dataLabel: i18n.catalog["text_e1baf3dc920f"],
      render: (record) => record.is_late ? (
        <span className="badge badge-warning">{i18n.catalog["text_b08c6d64b403"]}{record.late_minutes} {i18n.catalog["text_f8b39b3e3b9b"]}</span>
      ) : (
        <span className="badge badge-success">{i18n.catalog["text_2bd073516a87"]}</span>
      )
    }
  ];

  return (
    <div className="sales-card animate-fade">
      <PageSubHeader
        title={i18n.catalog["text_4039a0cc7703"]}
        titleIcon="clock"
        actions={
          canAccess("attendance", "create") && (
            <Button
              variant="primary"
              onClick={() => setShowRecordDialog(true)}
              icon="plus">
              {i18n.catalog["text_bebc0f4e123d"]}</Button>
          )
        }
      />

      <div className="sales-card compact" style={{ marginBottom: '1.5rem' }}>
        <PageSubHeader
          searchInput={
            <div className="form-group">
              <Label className="text-secondary mb-1">{i18n.catalog["text_b71a39c832a6"]}</Label>
              <SearchableSelect
                options={employees.map((emp: Employee) => ({ value: emp.id.toString(), label: emp.full_name }))}
                value={selectedEmployee?.toString() || ""}
                onChange={(value) => setSelectedEmployee(value ? Number(value) : null)}
                placeholder={i18n.catalog["text_dee783929dea"]}
              />
            </div>
          }

          actions={
            <>
              <TextInput
                label={i18n.catalog["text_996988dbc52e"]}
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setCurrentPage(1);
                }}
              />
              <TextInput
                label={i18n.catalog["text_217caed1c04f"]}
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
                {i18n.catalog["text_d0f6edcf6d65"]}</Button>
            </>
          }
        />
      </div>

      {summary && (
        <div className="sales-card compact" style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', border: '1px solid #bfdbfe' }}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="stat-item">
              <span className="stat-label">{i18n.catalog["text_9aba92a6587e"]}</span>
              <span className="stat-value">{summary.total_hours?.toFixed(2) || 0} {i18n.catalog["text_44c3abfb7720"]}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">{i18n.catalog["text_05751aac2a08"]}</span>
              <span className="stat-value highlight">{summary.total_overtime?.toFixed(2) || 0} {i18n.catalog["text_44c3abfb7720"]}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">{i18n.catalog["text_2ebc83ed3d26"]}</span>
              <span className="stat-value">{summary.total_days_present || 0} {i18n.catalog["text_eb07f635d883"]}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">{i18n.catalog["text_520784683ed3"]}</span>
              <span className="stat-value">{summary.total_days_absent || 0} {i18n.catalog["text_eb07f635d883"]}</span>
            </div>
          </div>
        </div>
      )}

      <div className="sales-card">
        <Table
          data={attendanceRecords}
          columns={columns}
          isLoading={isLoading}
          emptyMessage={i18n.catalog["text_6d7d7b7ab049"]}
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
        title={i18n.catalog["text_bebc0f4e123d"]}
        maxWidth="600px"
      >
        <div className="space-y-4">
          <div className="flex flex-col gap-1">
            <Label className="text-secondary mb-1">{i18n.catalog["text_972803dc7d86"]}</Label>
            <SearchableSelect
              options={employees.map((emp: Employee) => ({ value: emp.id.toString(), label: emp.full_name }))}
              value={newRecord.employee_id}
              onChange={(value) => setNewRecord({ ...newRecord, employee_id: value ? String(value) : "" })}
              placeholder={i18n.catalog["text_dee783929dea"]}
            />
          </div>
          <TextInput
            label={i18n.catalog["text_24ab9ad4f30d"]}
            type="date"
            value={newRecord.attendance_date}
            onChange={(e) => setNewRecord({ ...newRecord, attendance_date: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <TextInput
              label={i18n.catalog["text_9f3c0b8bfe50"]}
              type="time"
              value={newRecord.check_in}
              onChange={(e) => setNewRecord({ ...newRecord, check_in: e.target.value })}
            />
            <TextInput
              label={i18n.catalog["text_d15b689176c8"]}
              type="time"
              value={newRecord.check_out}
              onChange={(e) => setNewRecord({ ...newRecord, check_out: e.target.value })}
            />
          </div>
          <Select
            label={i18n.catalog["text_c3a4749caed4"]}
            value={newRecord.status}
            onChange={(e) => setNewRecord({ ...newRecord, status: e.target.value as any })}
            options={[
              { value: 'present', label: i18n.catalog["text_40284b78e717"] },
              { value: 'absent', label: i18n.catalog["text_3799f9c5cbe6"] },
              { value: 'leave', label: i18n.catalog["text_caad22be276b"] },
              { value: 'holiday', label: i18n.catalog["text_1b2ee5b8ba2c"] },
              { value: 'weekend', label: i18n.catalog["text_80d62c077b65"] }
            ]}
          />
          <Textarea
            label={i18n.catalog["text_d446d2dc6b81"]}
            value={newRecord.notes}
            onChange={(e) => setNewRecord({ ...newRecord, notes: e.target.value })}
          />
          <div className="flex justify-end gap-2" style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <Button variant="secondary" onClick={() => setShowRecordDialog(false)}>
              {i18n.catalog["text_9a30dc2a96b8"]}</Button>
            <Button variant="primary" onClick={handleRecordAttendance} icon="save">
              {i18n.catalog["text_ddfcaf9d0144"]}</Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
