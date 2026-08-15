"use client";

import { useI18n, catalogText } from "@/lib/i18n";
import { PageSubHeader } from "@/components/layout";
import { ActionButtons, Button, Column, Dialog, Label, SearchableSelect, showToast, Table } from "@/components/ui";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/Textarea";
import { TextInput } from "@/components/ui/TextInput";
import { fetchAPI } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatDate } from "@/lib/utils";
import { useAuthStore } from "@/stores/useAuthStore";
import { useEmployeeStore } from "@/stores/useEmployeeStore";
import { Employee, LeaveRequest } from "@/types";
import { useEffect, useState } from "react";

/**
 * Leave Request Management Component.
 * Allows employees to submit leave requests and managers to approve/reject them.
 * Supports multiple leave types: vacation, sick, emergency, unpaid, and other.
 * 
 * Features:
 * - Create new leave requests with date range and reason
 * - Filter requests by employee and status
 * - Approve or reject pending requests with mandatory rejection reason
 * 
 * @returns The LeaveRequests component
 */
export function LeaveRequests() {
    const { t: i18n } = useI18n();
  const { allEmployees: employees, loadAllEmployees } = useEmployeeStore();
  const { canAccess } = useAuthStore();
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [newRequest, setNewRequest] = useState({
    employee_id: "",
    leave_type: "vacation" as const,
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    reason: ""
  });

  const [approvalData, setApprovalData] = useState({
    action: "approved" as "approved" | "rejected",
    reason: ""
  });

  useEffect(() => {
    loadAllEmployees();
  }, [loadAllEmployees]);

  useEffect(() => {
    loadLeaveRequests();
  }, [selectedEmployee, statusFilter, currentPage]);

  const loadLeaveRequests = async () => {
    setIsLoading(true);
    try {
      let url = `${API_ENDPOINTS.HUMAN_CAPITAL.LEAVE.BASE}?page=${currentPage}&`;
      if (selectedEmployee) url += `employee_id=${selectedEmployee}&`;
      if (statusFilter !== 'all') url += `status=${statusFilter}&`;

      const res: any = await fetchAPI(url);
      const data = res.data || (Array.isArray(res) ? res : []);
      setLeaveRequests(data);
      setTotalPages(res.last_page || 1);
    } catch (e) {
      showToast(i18n.catalog["common.general.failedLoadLeaveRequests"], "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRequest = async () => {
    if (!newRequest.employee_id) {
      showToast(i18n.catalog["common.general.pleaseSelectEmployee"], "error");
      return;
    }

    try {
      await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.LEAVE.BASE, {
        method: 'POST',
        body: JSON.stringify(newRequest)
      });
      showToast(i18n.catalog["common.general.leaveRequestCreatedSuccessfully"], "success");
      setShowRequestDialog(false);
      setNewRequest({
        employee_id: "",
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

  const handleApprove = async () => {
    if (!selectedRequest) return;

    if (approvalData.action === 'rejected' && !approvalData.reason) {
      showToast(i18n.catalog["humanCapital.leaverequests.pleaseEnterReasonRejection"], "error");
      return;
    }

    try {
      await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.LEAVE.APPROVE(selectedRequest.id), {
        method: 'POST',
        body: JSON.stringify(approvalData)
      });
      showToast(catalogText(i18n, "humanCapital.leaverequests.successfullyLeaveRequest", { value0: approvalData.action === 'approved' ? i18n.catalog["humanCapital.leaverequests.approval"] : i18n.catalog["humanCapital.leaverequests.rejection"] }), "success");
      setShowApproveDialog(false);
      setSelectedRequest(null);
      loadLeaveRequests();
    } catch (e: any) {
      showToast(e.message || i18n.catalog["humanCapital.leaverequests.failedProcessLeaveRequest"], "error");
    }
  };

  const columns: Column<LeaveRequest>[] = [
    {
      key: "employee",
      header: i18n.catalog["common.general.employee.alternative3"],
      dataLabel: i18n.catalog["common.general.employee.alternative3"],
      render: (record) => record.employee?.full_name || "-"
    },
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
    },
    {
      key: "actions",
      header: i18n.catalog["common.general.actions"],
      dataLabel: i18n.catalog["common.general.actions"],
      render: (record) => (
        <ActionButtons
          actions={[
            ...(canAccess("leave", "edit") ? [{
              icon: "check" as const,
              title: i18n.catalog["humanCapital.leaverequests.processingRequest"],
              variant: "edit" as const,
              onClick: () => {
                setSelectedRequest(record);
                setApprovalData({ action: "approved", reason: "" });
                setShowApproveDialog(true);
              },
              hidden: record.status !== 'pending'
            }] : [])
          ]}
        />
      )
    }
  ];

  return (
    <div className="sales-card animate-fade">
      <PageSubHeader
        title={i18n.catalog["common.general.leaveRequests"]}
        titleIcon="calendar"
        actions={
          canAccess("leave", "create") && (
            <Button
              variant="primary"
              onClick={() => setShowRequestDialog(true)}
              icon="plus">
              {i18n.catalog["common.general.newLeaveRequest"]}</Button>
          )
        }
      />

      <div className="sales-card compact" style={{ marginBottom: '1.5rem' }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1">
            <Label className="text-secondary mb-1">{i18n.catalog["common.general.employee.alternative3"]}</Label>
            <SearchableSelect
              options={employees.map((emp: Employee) => ({ value: emp.id.toString(), label: emp.full_name }))}
              value={selectedEmployee?.toString() || ""}
              onChange={(value) => setSelectedEmployee(value ? Number(value) : null)}
              placeholder={i18n.catalog["humanCapital.leaverequests.allEmployees"]}
            />
          </div>
          <Select
            label={i18n.catalog["common.general.status.alternative2"]}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            options={[
              { value: 'all', label: i18n.catalog["common.general.all"] },
              { value: 'pending', label: i18n.catalog["common.general.pending.alternative2"] },
              { value: 'approved', label: i18n.catalog["common.general.approved"] },
              { value: 'rejected', label: i18n.catalog["common.general.rejected"] },
              { value: 'cancelled', label: i18n.catalog["common.general.canceled"] }
            ]}
          />
          <div className="flex items-end">
            <Button
              onClick={loadLeaveRequests}
              variant="primary"
              icon="search"
              style={{ width: '100%' }}>
              {i18n.catalog["common.general.search.alternative2"]}</Button>
          </div>
        </div>
      </div>

      <div className="sales-card">
        <Table
          data={leaveRequests}
          columns={columns}
          isLoading={isLoading}
          emptyMessage={i18n.catalog["common.general.noLeaveRequests"]}
          keyExtractor={(item) => item.id.toString()}
          pagination={{
            currentPage,
            totalPages,
            onPageChange: setCurrentPage
          }}
        />
      </div>

      <Dialog
        isOpen={showRequestDialog}
        onClose={() => setShowRequestDialog(false)}
        title={i18n.catalog["common.general.newLeaveRequest"]}
        maxWidth="600px"
      >
        <div className="space-y-4">
          <div className="flex flex-col gap-1">
            <Label className="text-secondary mb-1">{i18n.catalog["common.general.employee"]}</Label>
            <SearchableSelect
              options={employees.map((emp: Employee) => ({ value: emp.id.toString(), label: emp.full_name }))}
              value={newRequest.employee_id}
              onChange={(value) => setNewRequest({ ...newRequest, employee_id: value ? String(value) : "" })}
              placeholder={i18n.catalog["common.general.selectEmployee"]}
            />
          </div>
          <Select
            label={i18n.catalog["common.general.leaveType.alternative2"]}
            value={newRequest.leave_type}
            onChange={(e) => setNewRequest({ ...newRequest, leave_type: e.target.value as any })}
            options={[
              { value: 'vacation', label: i18n.catalog["common.general.annualLeave"] },
              { value: 'sick', label: i18n.catalog["common.general.sickLeave"] },
              { value: 'emergency', label: i18n.catalog["common.general.emergencyLeave"] },
              { value: 'unpaid', label: i18n.catalog["common.general.unpaidLeave"] },
              { value: 'other', label: i18n.catalog["common.general.other"] }
            ]}
          />
          <div className="grid grid-cols-2 gap-4">
            <TextInput
              label={i18n.catalog["common.general.date.alternative5"]}
              type="date"
              value={newRequest.start_date}
              onChange={(e) => setNewRequest({ ...newRequest, start_date: e.target.value })}
            />
            <TextInput
              label={i18n.catalog["common.general.date.alternative4"]}
              type="date"
              value={newRequest.end_date}
              onChange={(e) => setNewRequest({ ...newRequest, end_date: e.target.value })}
            />
          </div>
          <Textarea
            label={i18n.catalog["common.general.reason"]}
            value={newRequest.reason}
            onChange={(e) => setNewRequest({ ...newRequest, reason: e.target.value })}
          />
          <div className="flex justify-end gap-2" style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <Button variant="secondary" onClick={() => setShowRequestDialog(false)}>
              {i18n.catalog["common.general.cancel"]}</Button>
            <Button variant="primary" onClick={handleCreateRequest} icon="save">
              {i18n.catalog["common.general.save"]}</Button>
          </div>
        </div>
      </Dialog>

      <Dialog
        isOpen={showApproveDialog}
        onClose={() => setShowApproveDialog(false)}
        title={i18n.catalog["humanCapital.leaverequests.processingLeaveRequest"]}
        maxWidth="500px"
      >
        <div className="space-y-4">
          <Select
            label={i18n.catalog["humanCapital.leaverequests.action"]}
            value={approvalData.action}
            onChange={(e) => setApprovalData({ ...approvalData, action: e.target.value as any })}
            options={[
              { value: 'approved', label: i18n.catalog["common.general.approval"] },
              { value: 'rejected', label: i18n.catalog["common.general.rejected.alternative2"] }
            ]}
          />
          {approvalData.action === 'rejected' && (
            <Textarea
              label={i18n.catalog["humanCapital.leaverequests.reasonRejection"]}
              value={approvalData.reason}
              onChange={(e) => setApprovalData({ ...approvalData, reason: e.target.value })}
              required
            />
          )}
          <div className="flex justify-end gap-2" style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <Button variant="secondary" onClick={() => setShowApproveDialog(false)}>
              {i18n.catalog["common.general.cancel"]}</Button>
            <Button
              variant="primary"
              onClick={handleApprove}
              icon={approvalData.action === 'approved' ? 'check' : 'x'}>
              {approvalData.action === 'approved' ? i18n.catalog["common.general.approval"] : i18n.catalog["common.general.rejected.alternative2"]}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
