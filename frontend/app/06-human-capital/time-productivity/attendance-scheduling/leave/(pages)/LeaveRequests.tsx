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
      showToast(i18n.catalog["text_8894208f0a4e"], "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRequest = async () => {
    if (!newRequest.employee_id) {
      showToast(i18n.catalog["text_8c0019b7fcee"], "error");
      return;
    }

    try {
      await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.LEAVE.BASE, {
        method: 'POST',
        body: JSON.stringify(newRequest)
      });
      showToast(i18n.catalog["text_87f3dfc6d9a2"], "success");
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
      showToast(e.message || i18n.catalog["text_9a10ac72a5c6"], "error");
    }
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;

    if (approvalData.action === 'rejected' && !approvalData.reason) {
      showToast(i18n.catalog["text_e9132db276b3"], "error");
      return;
    }

    try {
      await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.LEAVE.APPROVE(selectedRequest.id), {
        method: 'POST',
        body: JSON.stringify(approvalData)
      });
      showToast(catalogText(i18n, "text_ba597627384e", { value0: approvalData.action === 'approved' ? i18n.catalog["text_d8558e0cb29f"] : i18n.catalog["text_cd27ea1580bb"] }), "success");
      setShowApproveDialog(false);
      setSelectedRequest(null);
      loadLeaveRequests();
    } catch (e: any) {
      showToast(e.message || i18n.catalog["text_a10d94a8bf8f"], "error");
    }
  };

  const columns: Column<LeaveRequest>[] = [
    {
      key: "employee",
      header: i18n.catalog["text_b71a39c832a6"],
      dataLabel: i18n.catalog["text_b71a39c832a6"],
      render: (record) => record.employee?.full_name || "-"
    },
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
    },
    {
      key: "actions",
      header: i18n.catalog["text_7797240d6caf"],
      dataLabel: i18n.catalog["text_7797240d6caf"],
      render: (record) => (
        <ActionButtons
          actions={[
            ...(canAccess("leave", "edit") ? [{
              icon: "check" as const,
              title: i18n.catalog["text_b3f295bd9c34"],
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
        title={i18n.catalog["text_f1240747d0a1"]}
        titleIcon="calendar"
        actions={
          canAccess("leave", "create") && (
            <Button
              variant="primary"
              onClick={() => setShowRequestDialog(true)}
              icon="plus">
              {i18n.catalog["text_5321087b563b"]}</Button>
          )
        }
      />

      <div className="sales-card compact" style={{ marginBottom: '1.5rem' }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1">
            <Label className="text-secondary mb-1">{i18n.catalog["text_b71a39c832a6"]}</Label>
            <SearchableSelect
              options={employees.map((emp: Employee) => ({ value: emp.id.toString(), label: emp.full_name }))}
              value={selectedEmployee?.toString() || ""}
              onChange={(value) => setSelectedEmployee(value ? Number(value) : null)}
              placeholder={i18n.catalog["text_057d12d60ddf"]}
            />
          </div>
          <Select
            label={i18n.catalog["text_c3a4749caed4"]}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            options={[
              { value: 'all', label: i18n.catalog["text_65f276da33cf"] },
              { value: 'pending', label: i18n.catalog["text_7d7913fdef74"] },
              { value: 'approved', label: i18n.catalog["text_a98d8a418ba0"] },
              { value: 'rejected', label: i18n.catalog["text_5d969a71dad3"] },
              { value: 'cancelled', label: i18n.catalog["text_616d302cb016"] }
            ]}
          />
          <div className="flex items-end">
            <Button
              onClick={loadLeaveRequests}
              variant="primary"
              icon="search"
              style={{ width: '100%' }}>
              {i18n.catalog["text_d0f6edcf6d65"]}</Button>
          </div>
        </div>
      </div>

      <div className="sales-card">
        <Table
          data={leaveRequests}
          columns={columns}
          isLoading={isLoading}
          emptyMessage={i18n.catalog["text_9c94b78094b3"]}
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
        title={i18n.catalog["text_5321087b563b"]}
        maxWidth="600px"
      >
        <div className="space-y-4">
          <div className="flex flex-col gap-1">
            <Label className="text-secondary mb-1">{i18n.catalog["text_972803dc7d86"]}</Label>
            <SearchableSelect
              options={employees.map((emp: Employee) => ({ value: emp.id.toString(), label: emp.full_name }))}
              value={newRequest.employee_id}
              onChange={(value) => setNewRequest({ ...newRequest, employee_id: value ? String(value) : "" })}
              placeholder={i18n.catalog["text_dee783929dea"]}
            />
          </div>
          <Select
            label={i18n.catalog["text_6dac3ee982cf"]}
            value={newRequest.leave_type}
            onChange={(e) => setNewRequest({ ...newRequest, leave_type: e.target.value as any })}
            options={[
              { value: 'vacation', label: i18n.catalog["text_91c6de93bb44"] },
              { value: 'sick', label: i18n.catalog["text_fca09aac41d9"] },
              { value: 'emergency', label: i18n.catalog["text_eb759e4e34a1"] },
              { value: 'unpaid', label: i18n.catalog["text_5f83f571fe77"] },
              { value: 'other', label: i18n.catalog["text_17a9f38e22b6"] }
            ]}
          />
          <div className="grid grid-cols-2 gap-4">
            <TextInput
              label={i18n.catalog["text_2861a808b514"]}
              type="date"
              value={newRequest.start_date}
              onChange={(e) => setNewRequest({ ...newRequest, start_date: e.target.value })}
            />
            <TextInput
              label={i18n.catalog["text_271f86cc7df0"]}
              type="date"
              value={newRequest.end_date}
              onChange={(e) => setNewRequest({ ...newRequest, end_date: e.target.value })}
            />
          </div>
          <Textarea
            label={i18n.catalog["text_c3b023d78238"]}
            value={newRequest.reason}
            onChange={(e) => setNewRequest({ ...newRequest, reason: e.target.value })}
          />
          <div className="flex justify-end gap-2" style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <Button variant="secondary" onClick={() => setShowRequestDialog(false)}>
              {i18n.catalog["text_9a30dc2a96b8"]}</Button>
            <Button variant="primary" onClick={handleCreateRequest} icon="save">
              {i18n.catalog["text_ddfcaf9d0144"]}</Button>
          </div>
        </div>
      </Dialog>

      <Dialog
        isOpen={showApproveDialog}
        onClose={() => setShowApproveDialog(false)}
        title={i18n.catalog["text_480cf00fcabc"]}
        maxWidth="500px"
      >
        <div className="space-y-4">
          <Select
            label={i18n.catalog["text_a087ea35cf5d"]}
            value={approvalData.action}
            onChange={(e) => setApprovalData({ ...approvalData, action: e.target.value as any })}
            options={[
              { value: 'approved', label: i18n.catalog["text_f4e17def8c1b"] },
              { value: 'rejected', label: i18n.catalog["text_eb3b1bcc04e5"] }
            ]}
          />
          {approvalData.action === 'rejected' && (
            <Textarea
              label={i18n.catalog["text_16743d16fdf8"]}
              value={approvalData.reason}
              onChange={(e) => setApprovalData({ ...approvalData, reason: e.target.value })}
              required
            />
          )}
          <div className="flex justify-end gap-2" style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <Button variant="secondary" onClick={() => setShowApproveDialog(false)}>
              {i18n.catalog["text_9a30dc2a96b8"]}</Button>
            <Button
              variant="primary"
              onClick={handleApprove}
              icon={approvalData.action === 'approved' ? 'check' : 'x'}>
              {approvalData.action === 'approved' ? i18n.catalog["text_f4e17def8c1b"] : i18n.catalog["text_eb3b1bcc04e5"]}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
