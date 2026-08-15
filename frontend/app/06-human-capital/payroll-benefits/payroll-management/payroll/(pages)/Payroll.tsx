"use client";

import { useI18n, catalogText } from "@/lib/i18n";
import { PageSubHeader } from "@/components/layout";
import { ActionButtons, Button, Column, Dialog, Label, Select, showToast, Table, Textarea, TextInput } from "@/components/ui";
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup";
import { Checkbox } from "@/components/ui/checkbox";
import { getIcon } from "@/lib/icons";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { useAuthStore } from "@/stores/useAuthStore";
import { useEmployeeStore } from "@/stores/useEmployeeStore";
import { PayrollItemExtended, PayrollTransaction, usePayrollStore } from "@/stores/usePayrollStore";
import { Employee, PayrollCycle } from "@/types";
import { useEffect, useState } from "react";

/**
 * Payroll Management Component.
 * Provides a comprehensive interface for:
 * - Generating payroll cycles (salary, bonus, incentive)
 * - Multi-level approval workflow
 * - Individual and bulk payment processing
 * - Payment history tracking
 * 
 * Integrates with PayrollController API for all operations.
 */
export function Payroll() {
    const { t: i18n } = useI18n();
  // ─── Stores ──────────────────────────────────────────────
  const {
    cycles: payrollCycles,
    cyclesLoading: isLoading,
    selectedCycle,
    items: payrollItems,
    accounts,
    defaultAccountId,
    transactions,
    loadCycles: loadPayrollCycles,
    loadCycleDetails,
    loadAccounts,
    loadItemHistory,
    createCycle,
    approveCycle: handleApproveAction,
    bulkPayment,
    toggleItemStatus: toggleStopSalary,
    updateItem,
    individualPayment,
    setSelectedCycle,
  } = usePayrollStore();
  const { allEmployees, loadAllEmployees } = useEmployeeStore();
  const { canAccess, user: currentUser } = useAuthStore();

  // Dialog States
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showBulkPaymentDialog, setShowBulkPaymentDialog] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [showCreateCycleDialog, setShowCreateCycleDialog] = useState(false);
  const [showEditItemDialog, setShowEditItemDialog] = useState(false);

  const [selectedItem, setSelectedItem] = useState<PayrollItemExtended | null>(null);

  // Create Cycle Form State
  const [newCycle, setNewCycle] = useState({
    payment_nature: 'salary' as 'salary' | 'bonus' | 'incentive' | 'other',
    cycle_name: '',
    period_start: new Date().toISOString().split('T')[0],
    period_end: new Date().toISOString().split('T')[0],
    payment_date: new Date().toISOString().split('T')[0],
    target_type: 'all' as 'all' | 'selected' | 'excluded',
    employee_ids: [] as number[],
    base_amount: "",
    description: ""
  });

  // Edit Item Form State
  const [editItemData, setEditItemData] = useState({
    base_salary: 0,
    total_allowances: 0,
    total_deductions: 0,
    notes: ""
  });

  // Individual Form States
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter States
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [cycleSearch] = useState("");

  useEffect(() => {
    loadPayrollCycles();
    loadAccounts();
    loadAllEmployees();
  }, [loadPayrollCycles, loadAccounts, loadAllEmployees]);

  // Set default account ID when loaded
  useEffect(() => {
    if (defaultAccountId && !selectedAccountId) {
      setSelectedAccountId(defaultAccountId);
    }
  }, [defaultAccountId]);

  // Wrapper: load cycle details + open dialog
  const handleLoadCycleDetails = async (cycleId: number) => {
    await loadCycleDetails(cycleId);
    setShowDetailsDialog(true);
  };

  // Wrapper: load item history + open dialog
  const handleLoadItemHistory = async (item: PayrollItemExtended) => {
    setSelectedItem(item);
    await loadItemHistory(item.id);
    setShowHistoryDialog(true);
  };

  const handleCreateCycle = async () => {
    if (newCycle.payment_nature !== 'salary' && !newCycle.cycle_name) {
      showToast(i18n.catalog["humanCapital.payroll.pleaseEnterManagerSName"], "error");
      return;
    }
    setIsSubmitting(true);
    const success = await createCycle({
      ...newCycle,
      base_amount: parseFloat(newCycle.base_amount) || 0,
    });
    if (success) setShowCreateCycleDialog(false);
    setIsSubmitting(false);
  };

  const handleApprove = async (id: number) => {
    if (!confirm(i18n.catalog["humanCapital.payroll.areYouSureYouWantApprovePayrollRun"])) return;
    const success = await handleApproveAction(id);
    if (success) setShowDetailsDialog(false);
  };

  const handleBulkPayment = async () => {
    if (!selectedCycle || !selectedAccountId) {
      showToast(i18n.catalog["humanCapital.payroll.pleaseSelectExpenseAccount"], "error");
      return;
    }
    if (!confirm(i18n.catalog["humanCapital.payroll.areYouSureYouWantDisburseAllSalaries"])) return;
    setIsSubmitting(true);
    const success = await bulkPayment(selectedCycle.id, selectedAccountId);
    if (success) {
      setShowBulkPaymentDialog(false);
      if (showDetailsDialog) loadCycleDetails(selectedCycle.id);
    }
    setIsSubmitting(false);
  };

  const handleUpdateItem = async () => {
    if (!selectedItem) return;
    setIsSubmitting(true);
    const success = await updateItem(selectedItem.id, editItemData);
    if (success) {
      setShowEditItemDialog(false);
      loadCycleDetails(selectedItem.payroll_cycle_id);
    }
    setIsSubmitting(false);
  };

  const openPaymentDialog = (item: PayrollItemExtended) => {
    if (item.status === 'on_hold') {
      showToast(i18n.catalog["humanCapital.payroll.cannotDisburseSalarySuspendedEmployee"], "error");
      return;
    }
    setSelectedItem(item);
    setPaymentAmount(item.remaining_balance?.toString() || item.net_salary.toString());
    setPaymentNotes("");
    setShowPaymentDialog(true);
  };

  const handleIndividualPayment = async () => {
    if (!selectedItem || !paymentAmount) {
      showToast(i18n.catalog["common.general.pleaseEnterAmount"], "error");
      return;
    }
    setIsSubmitting(true);
    const success = await individualPayment(selectedItem.id, {
      amount: parseFloat(paymentAmount),
      notes: paymentNotes,
      account_id: selectedAccountId,
    });
    if (success) {
      setShowPaymentDialog(false);
      if (selectedCycle) loadCycleDetails(selectedCycle.id);
    }
    setIsSubmitting(false);
  };

  const cycleColumns: Column<PayrollCycle>[] = [
    { key: "cycle_name", header: i18n.catalog["humanCapital.payroll.cycleOccasion"], dataLabel: i18n.catalog["common.general.cycle"] },
    {
      key: "status",
      header: i18n.catalog["humanCapital.payroll.statusApproval"],
      dataLabel: i18n.catalog["common.general.status.alternative2"],
      render: (item: any) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span className={`badge ${item.status === 'paid' ? 'badge-success' : item.status === 'approved' ? 'badge-info' : item.status === 'pending_approval' ? 'badge-warning' : 'badge-secondary'}`}>
            {item.status === 'draft' ? i18n.catalog["common.general.draft"] : item.status === 'pending_approval' ? i18n.catalog["common.general.pendingApproval.alternative2"] : item.status === 'approved' ? i18n.catalog["common.general.approved.alternative2"] : item.status === 'paid' ? i18n.catalog["common.general.paid.alternative2"] : item.status}
          </span>
          {item.status === 'pending_approval' && item.current_approver && (
            <small className="text-muted">{i18n.catalog["humanCapital.payroll.currently"]}{item.current_approver.full_name}</small>
          )}
        </div>
      )
    },
    {
      key: "cycle_type",
      header: i18n.catalog["common.general.type.alternative3"],
      dataLabel: i18n.catalog["common.general.type.alternative3"],
      render: (item: any) => {
        const typeMap: any = { salary: i18n.catalog["humanCapital.payroll.monthlySalary"], bonus: i18n.catalog["common.general.bonus"], incentive: i18n.catalog["humanCapital.payroll.incentive"], other: i18n.catalog["common.general.other"] };
        return <span className={`badge ${item.cycle_type === 'salary' ? 'badge-primary' : 'badge-info'}`}>{typeMap[item.cycle_type] || item.cycle_type}</span>;
      }
    },
    { key: "payment_date", header: i18n.catalog["common.general.disbursementDate"], dataLabel: i18n.catalog["common.general.disbursementDate"], render: (item) => formatDate(item.payment_date) },
    { key: "total_net", header: i18n.catalog["common.general.totalAmount"], dataLabel: i18n.catalog["humanCapital.payroll.netAmount"], render: (item) => <strong>{formatCurrency(item.total_net)}</strong> },
    {
      key: "id", header: i18n.catalog["common.general.actions"], dataLabel: i18n.catalog["common.general.actions"], render: (item: any) => (
        <ActionButtons
          actions={[
            {
              icon: "eye",
              title: i18n.catalog["humanCapital.payroll.detailsReview"],
              variant: "view",
              onClick: () => { setSelectedCycle(item); handleLoadCycleDetails(item.id); }
            },
            ...(canAccess("payroll", "edit") ? [{
              icon: "send" as const,
              title: i18n.catalog["humanCapital.payroll.approvalProcessStarted"],
              variant: "success" as const,
              onClick: () => handleApprove(item.id),
              hidden: !(item.status === 'draft' && item.created_by == currentUser?.id)
            }] : []),
            ...(canAccess("payroll", "edit") ? [{
              icon: "check" as const,
              title: i18n.catalog["humanCapital.payroll.approvePass"],
              variant: "success" as const,
              onClick: () => handleApprove(item.id),
              hidden: !(item.status === 'pending_approval' && item.current_approver_id == currentUser?.id)
            }] : []),
            ...(canAccess("payroll", "edit") ? [{
              icon: "dollar" as const,
              title: i18n.catalog["humanCapital.payroll.disburseAll"],
              variant: "primary" as const,
              onClick: () => { setSelectedCycle(item); setShowBulkPaymentDialog(true); },
              hidden: item.status !== 'approved'
            }] : [])
          ]}
        />
      )
    },
  ];

  const filteredItems = payrollItems.filter(item => {
    const name = item.employee_name || item.employee?.full_name || "";
    const matchesSearch = !searchTerm || name.toLowerCase().includes(searchTerm.toLowerCase());
    const remaining = (item.remaining_balance !== undefined) ? item.remaining_balance : item.net_salary;
    const matchesStatus = filterStatus === "all" ||
      (filterStatus === "paid" && remaining <= 0) ||
      (filterStatus === "unpaid" && remaining > 0);
    return matchesSearch && matchesStatus;
  });

  const isUserApprover = selectedCycle?.status === 'pending_approval' && selectedCycle?.current_approver_id == currentUser?.id;
  const isDraftCreator = selectedCycle?.status === 'draft' && selectedCycle?.created_by == currentUser?.id;

  const itemColumns: Column<PayrollItemExtended>[] = [
    {
      key: "employee_name", header: i18n.catalog["common.general.employee.alternative3"], dataLabel: i18n.catalog["common.general.employee.alternative3"], render: (item) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: 600 }}>{item.employee_name || item.employee?.full_name || "-"}</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{item.employee?.employee_code || ""}</span>
        </div>
      )
    },
    { key: "net_salary", header: i18n.catalog["humanCapital.payroll.netDue"], dataLabel: i18n.catalog["humanCapital.payroll.due"], render: (item) => formatCurrency(item.net_salary) },
    {
      key: "status",
      header: i18n.catalog["humanCapital.payroll.disbursementStatus"],
      dataLabel: i18n.catalog["common.general.status.alternative2"],
      render: (item) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className={`badge ${item.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
            {item.status === 'active' ? i18n.catalog["common.general.active"] : i18n.catalog["common.general.suspended"]}
          </span>
          {(isUserApprover || isDraftCreator) && canAccess("payroll", "edit") && (
            <button
              onClick={() => toggleStopSalary(item)}
              className={`btn btn-xs ${item.status === 'active' ? 'btn-outline-danger' : 'btn-outline-success'}`}
              style={{ fontSize: '0.7rem', padding: '2px 5px' }}
            >
              {item.status === 'active' ? i18n.catalog["common.general.disable"] : i18n.catalog["common.general.activate"]}
            </button>
          )}
        </div>
      )
    },
    {
      key: "paid_amount", header: i18n.catalog["common.general.converter"], dataLabel: i18n.catalog["common.general.converter"], render: (item) => (
        <button className="text-link" onClick={() => handleLoadItemHistory(item)} style={{ background: 'none', border: 'none', padding: 0, color: 'var(--primary-color)', cursor: 'pointer', textDecoration: 'underline' }}>
          {formatCurrency(item.paid_amount || 0)}
        </button>
      )
    },
    {
      key: "actions", header: i18n.catalog["common.general.actions"], dataLabel: i18n.catalog["common.general.actions"], render: (item) => {
        const remaining = (item.remaining_balance !== undefined) ? item.remaining_balance : item.net_salary;
        return (
          <ActionButtons
            actions={[
              ...(canAccess("payroll", "edit") ? [{
                icon: "edit" as const,
                title: i18n.catalog["humanCapital.payroll.editAmounts"],
                variant: "edit" as const,
                onClick: () => {
                  setSelectedItem(item);
                  setEditItemData({
                    base_salary: item.base_salary,
                    total_allowances: item.total_allowances,
                    total_deductions: item.total_deductions,
                    notes: item.notes || ""
                  });
                  setShowEditItemDialog(true);
                },
                hidden: !(isUserApprover || isDraftCreator)
              }] : []),
              ...(canAccess("payroll", "edit") ? [{
                icon: "dollar" as const,
                title: i18n.catalog["common.general.transfer.alternative2"],
                variant: "primary" as const,
                onClick: () => openPaymentDialog(item),
                hidden: !(remaining > 0 && selectedCycle?.status === 'approved' && item.status === 'active')
              }] : []),
              {
                icon: "history",
                title: i18n.catalog["humanCapital.payroll.transferLog.alternative2"],
                variant: "view",
                onClick: () => handleLoadItemHistory(item)
              }
            ]}
          />
        );
      }
    },
  ];

  const toggleEmployeeSelection = (id: number) => {
    setNewCycle(prev => ({
      ...prev,
      employee_ids: prev.employee_ids.includes(id)
        ? prev.employee_ids.filter(eid => eid !== id)
        : [...prev.employee_ids, id]
    }));
  };

  const transactionColumns: Column<PayrollTransaction>[] = [
    { key: "transaction_date", header: i18n.catalog["common.general.date.alternative7"], dataLabel: i18n.catalog["common.general.date.alternative7"], render: (item) => formatDateTime(item.transaction_date) },
    { key: "amount", header: i18n.catalog["common.general.amount"], dataLabel: i18n.catalog["common.general.amount"], render: (item) => formatCurrency(item.amount) },
    { key: "transaction_type", header: i18n.catalog["common.general.type.alternative3"], dataLabel: i18n.catalog["common.general.type.alternative3"], render: (item) => item.transaction_type === 'payment' ? i18n.catalog["humanCapital.payroll.payment"] : i18n.catalog["humanCapital.payroll.advance"] },
    { key: "notes", header: i18n.catalog["common.general.notes.alternative2"], dataLabel: i18n.catalog["common.general.notes.alternative2"] },
  ];

  return (
    <>
      <div className="sales-card animate-fade">
        <PageSubHeader
          title={i18n.catalog["humanCapital.payroll.payrollManagementDisbursementApprovals"]}
          titleIcon="dollar"
          actions={
            canAccess("payroll", "create") && (
              <Button
                variant="primary"
                onClick={() => setShowCreateCycleDialog(true)}
                icon="plus">
                {i18n.catalog["humanCapital.payroll.newPayoutBonusIncentiveSalary"]}</Button>
            )
          }
        />

        <Table
          columns={cycleColumns}
          data={payrollCycles.filter(c => !cycleSearch || c.cycle_name.toLowerCase().includes(cycleSearch.toLowerCase()))}
          keyExtractor={(item) => item.id}
          emptyMessage={i18n.catalog["humanCapital.payroll.noPayrollCyclesRegistered"]}
          isLoading={isLoading}
        />
      </div>

      {/* Create Cycle Dialog */}
      <Dialog
        isOpen={showCreateCycleDialog}
        onClose={() => setShowCreateCycleDialog(false)}
        title={i18n.catalog["humanCapital.payroll.createNewDisbursementOrder"]}
        maxWidth="900px"
        footer={
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={() => setShowCreateCycleDialog(false)}>{i18n.catalog["common.general.cancel"]}</button>
            <button className="btn btn-primary" onClick={handleCreateCycle} disabled={isSubmitting}>
              {isSubmitting ? i18n.catalog["humanCapital.payroll.creating"] : i18n.catalog["humanCapital.payroll.createDraft"]}
            </button>
          </div>
        }
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <Select
              label={i18n.catalog["humanCapital.payroll.natureDisbursement"]}
              value={newCycle.payment_nature}
              onChange={(e) => setNewCycle({ ...newCycle, payment_nature: e.target.value as any, cycle_name: e.target.value === 'salary' ? '' : newCycle.cycle_name })}
              options={[
                { value: 'salary', label: i18n.catalog["humanCapital.payroll.basicMonthlySalary"] },
                { value: 'incentive', label: i18n.catalog["humanCapital.payroll.performanceIncentive"] },
                { value: 'bonus', label: i18n.catalog["humanCapital.payroll.exceptionalBonus"] },
                { value: 'other', label: i18n.catalog["common.general.other"] }
              ]}
            />

            <TextInput
              label={i18n.catalog["humanCapital.payroll.hostEventTitle"]}
              type="text"
              placeholder={i18n.catalog["humanCapital.payroll.exampleJanuarySalesIncentives"]}
              value={newCycle.cycle_name}
              onChange={(e) => setNewCycle({ ...newCycle, cycle_name: e.target.value })}
            />

            <TextInput
              label={i18n.catalog["humanCapital.payroll.dueDisbursementDate"]}
              type="date"
              value={newCycle.payment_date}
              onChange={(e) => setNewCycle({ ...newCycle, payment_date: e.target.value })}
            />

            <TextInput
              label={i18n.catalog["humanCapital.payroll.unifiedAmountOptional"]}
              type="number"
              placeholder={i18n.catalog["common.general.message000"]}
              value={newCycle.base_amount}
              onChange={(e) => setNewCycle({ ...newCycle, base_amount: e.target.value })}
            />
          </div>

          <div style={{ border: '1px solid #eee', borderRadius: '8px', padding: '1rem', background: '#fcfcfc' }}>
            <Label className="form-label" style={{ fontWeight: 600, marginBottom: '1rem', display: 'block' }}>{i18n.catalog["humanCapital.payroll.assignIncludedEmployees"]}</Label>

            <div style={{ marginBottom: '1rem' }}>
              <RadioGroup
                className="flex gap-4 mb-4"
                value={newCycle.target_type}
                onValueChange={(val) => setNewCycle({ ...newCycle, target_type: val as any, employee_ids: val === 'all' ? [] : newCycle.employee_ids })}
              >
                <RadioGroupItem value="all" label={i18n.catalog["common.general.all"]} />
                <RadioGroupItem value="selected" label={i18n.catalog["humanCapital.payroll.specified"]} />
                <RadioGroupItem value="excluded" label={i18n.catalog["humanCapital.payroll.exception"]} />
              </RadioGroup>

              {(newCycle.target_type === 'selected' || newCycle.target_type === 'excluded') && (
                <div style={{ maxHeight: '250px', overflowY: 'auto', border: '1px solid #eee', padding: '10px', borderRadius: '4px' }}>
                  {allEmployees.map((emp: Employee) => (
                    <div key={emp.id} style={{ marginBottom: '8px' }}>
                      <Checkbox
                        label={emp.full_name}
                        checked={newCycle.employee_ids.includes(emp.id)}
                        onChange={() => toggleEmployeeSelection(emp.id)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </Dialog>

      {/* Cycle Details Dialog */}
      <Dialog
        isOpen={showDetailsDialog}
        onClose={() => setShowDetailsDialog(false)}
        title={catalogText(i18n, "humanCapital.payroll.payrollDetailsApproval", { value0: selectedCycle?.cycle_name || "" })}
        maxWidth="1200px"
        footer={
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', width: '100%' }}>
            <div style={{ marginRight: 'auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{i18n.catalog["common.general.status"]}</span>
              <span className={`badge ${selectedCycle?.status === 'approved' ? 'badge-success' : 'badge-warning'}`}>
                {selectedCycle?.status === 'draft' ? i18n.catalog["common.general.draft"] : selectedCycle?.status === 'pending_approval' ? i18n.catalog["common.general.pendingApproval.alternative2"] : i18n.catalog["common.general.approved.alternative2"]}
              </span>
            </div>
            <button className="btn btn-secondary" onClick={() => setShowDetailsDialog(false)}>{i18n.catalog["common.general.close"]}</button>

            {isUserApprover && (
              <button className="btn btn-primary" onClick={() => handleApprove(selectedCycle!.id)}>
                {getIcon("check")} {i18n.catalog["humanCapital.payroll.approvePost"]}</button>
            )}

            {isDraftCreator && (
              <button className="btn btn-primary" onClick={() => handleApprove(selectedCycle!.id)}>
                {getIcon("rocket")} {i18n.catalog["humanCapital.payroll.submitApproval"]}</button>
            )}
          </div>
        }
      >
        <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '1.5rem' }}>
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <div className="form-row" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}>
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <div className="input-group" style={{ display: 'flex', position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>
                      {getIcon("search")}
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      style={{ paddingLeft: '35px' }}
                      placeholder={i18n.catalog["humanCapital.payroll.searchEmployee"]}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="stat-card" style={{ background: '#f0f7ff', padding: '1rem', borderRadius: '8px', border: '1px solid #cce5ff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{i18n.catalog["humanCapital.payroll.totalReceivables"]}</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>{formatCurrency(selectedCycle?.total_net || 0)}</div>
                </div>
                <div className="stat-card" style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px', border: '1px solid #eee' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{i18n.catalog["humanCapital.payroll.pendingDisbursement"]}</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{formatCurrency(payrollItems.reduce((acc, item) => acc + (item.status === 'active' ? (item.remaining_balance || 0) : 0), 0))}</div>
                </div>
                <div className="stat-card" style={{ background: '#e8f5e9', padding: '1rem', borderRadius: '8px', border: '1px solid #c3e6cb' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{i18n.catalog["humanCapital.payroll.disbursed"]}</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#28a745' }}>{formatCurrency(payrollItems.reduce((acc, item) => acc + (item.paid_amount || 0), 0))}</div>
                </div>
              </div>
            </div>

            <div className="table-responsive">
              <Table
                columns={itemColumns}
                data={filteredItems}
                keyExtractor={(item) => item.id}
                emptyMessage={i18n.catalog["common.general.noData"]}
              />
            </div>
          </div>

          <div style={{ borderRight: '1px solid #eee', paddingRight: '1rem' }}>
            <h5 style={{ marginBottom: '1rem', borderBottom: '2px solid var(--primary-color)', paddingBottom: '0.5rem' }}>{i18n.catalog["humanCapital.payroll.approvalPath"]}</h5>
            {selectedCycle?.approval_trail && selectedCycle.approval_trail.length > 0 ? (
              <div style={{ display: 'grid', gap: '15px' }}>
                {selectedCycle.approval_trail.map((step, idx) => (
                  <div key={idx} style={{ position: 'relative', paddingLeft: '20px', borderLeft: '2px solid #28a745' }}>
                    <div style={{ position: 'absolute', left: '-7px', top: '0', width: '12px', height: '12px', borderRadius: '50%', background: '#28a745' }}></div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{step.user_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{formatDateTime(step.timestamp)}</div>
                    <div style={{ fontSize: '0.75rem', color: '#28a745' }}>{i18n.catalog["humanCapital.payroll.approved"]}</div>
                  </div>
                ))}
                {selectedCycle?.status === 'pending_approval' && selectedCycle?.current_approver && (
                  <div style={{ position: 'relative', paddingLeft: '20px', borderLeft: '2px dashed #fbc02d' }}>
                    <div style={{ position: 'absolute', left: '-7px', top: '0', width: '12px', height: '12px', borderRadius: '50%', background: '#fbc02d' }}></div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{selectedCycle?.current_approver?.full_name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#fbc02d' }}>{i18n.catalog["humanCapital.payroll.awaitingCurrentApproval"]}</div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{i18n.catalog["humanCapital.payroll.noPreviousTransactions"]}</div>
            )}
          </div>
        </div>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog
        isOpen={showEditItemDialog}
        onClose={() => setShowEditItemDialog(false)}
        title={catalogText(i18n, "humanCapital.payroll.adjustAmounts", { value0: selectedItem?.employee_name })}
        footer={
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={() => setShowEditItemDialog(false)}>{i18n.catalog["common.general.cancel"]}</button>
            <button className="btn btn-primary" onClick={handleUpdateItem} disabled={isSubmitting}>{i18n.catalog["common.general.saveChanges.alternative2"]}</button>
          </div>
        }
      >
        <div style={{ display: 'grid', gap: '1rem' }}>
          <TextInput label={i18n.catalog["humanCapital.payroll.baseSalaryBaseAmount"]} type="number" value={editItemData.base_salary} onChange={(e) => setEditItemData({ ...editItemData, base_salary: parseFloat(e.target.value) })} />
          <TextInput label={i18n.catalog["humanCapital.payroll.totalAllowancesAdditions"]} type="number" value={editItemData.total_allowances} onChange={(e) => setEditItemData({ ...editItemData, total_allowances: parseFloat(e.target.value) })} />
          <TextInput label={i18n.catalog["common.general.totalDeductions"]} type="number" value={editItemData.total_deductions} onChange={(e) => setEditItemData({ ...editItemData, total_deductions: parseFloat(e.target.value) })} />
          <Textarea label={i18n.catalog["humanCapital.payroll.notesAmounts"]} value={editItemData.notes} onChange={(e) => setEditItemData({ ...editItemData, notes: e.target.value })} rows={2} />
          <div style={{ padding: '10px', background: '#f0f7ff', borderRadius: '6px' }}>
            <strong>{i18n.catalog["humanCapital.payroll.newNet"]}{formatCurrency(editItemData.base_salary + editItemData.total_allowances - editItemData.total_deductions)}</strong>
          </div>
        </div>
      </Dialog>

      {/* Other dialogs (Payment, History, Bulk) remain largely the same or minor edits */}
      <Dialog
        isOpen={showHistoryDialog}
        onClose={() => setShowHistoryDialog(false)}
        title={catalogText(i18n, "humanCapital.payroll.transferLog", { value0: selectedItem?.employee_name || "" })}
        maxWidth="800px"
      >
        <Table columns={transactionColumns} data={transactions} keyExtractor={(item) => item.id} />
      </Dialog>

      <Dialog
        isOpen={showPaymentDialog}
        onClose={() => setShowPaymentDialog(false)}
        title={i18n.catalog["humanCapital.payroll.transferAmountEmployee"]}
        footer={
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={() => setShowPaymentDialog(false)}>{i18n.catalog["common.general.cancel"]}</button>
            <button className="btn btn-primary" onClick={handleIndividualPayment} disabled={isSubmitting}>{i18n.catalog["humanCapital.payroll.confirmDisbursement"]}</button>
          </div>
        }
      >
        <Select
          label={i18n.catalog["humanCapital.payroll.paymentMethod"]}
          value={selectedAccountId}
          onChange={(e) => setSelectedAccountId(e.target.value)}
          options={accounts.map(acc => ({ value: acc.id, label: catalogText(i18n, "common.general.notAvailable", { value0: acc.code, value1: acc.name }) }))}
        />
        <TextInput label={i18n.catalog["common.general.amount"]} type="number" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} />
      </Dialog>

      <Dialog
        isOpen={showBulkPaymentDialog}
        onClose={() => setShowBulkPaymentDialog(false)}
        title={i18n.catalog["humanCapital.payroll.disburseEntirePayroll"]}
        footer={
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={() => setShowBulkPaymentDialog(false)}>{i18n.catalog["common.general.cancel"]}</button>
            <button className="btn btn-primary" onClick={handleBulkPayment} disabled={isSubmitting}>{i18n.catalog["humanCapital.payroll.confirmPayAll"]}</button>
          </div>
        }
      >
        <Select label={i18n.catalog["humanCapital.payroll.disbursementAccount"]} value={selectedAccountId} onChange={(e) => setSelectedAccountId(e.target.value)}>
          {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.code} - {acc.name}</option>)}
        </Select>
        <div style={{ padding: '15px', background: '#e8f5e9', borderRadius: '8px', marginTop: '10px' }}>
          {i18n.catalog["humanCapital.payroll.totalAmount"]}<strong>{formatCurrency(selectedCycle?.total_net || 0)}</strong>
        </div>
      </Dialog>
    </>
  );
}
