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
      showToast(i18n.catalog["text_a72382c370b4"], "error");
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
    if (!confirm(i18n.catalog["text_130c9e4be9b9"])) return;
    const success = await handleApproveAction(id);
    if (success) setShowDetailsDialog(false);
  };

  const handleBulkPayment = async () => {
    if (!selectedCycle || !selectedAccountId) {
      showToast(i18n.catalog["text_3adb9ad063d5"], "error");
      return;
    }
    if (!confirm(i18n.catalog["text_8931cf5d74e4"])) return;
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
      showToast(i18n.catalog["text_94e9fdb0f960"], "error");
      return;
    }
    setSelectedItem(item);
    setPaymentAmount(item.remaining_balance?.toString() || item.net_salary.toString());
    setPaymentNotes("");
    setShowPaymentDialog(true);
  };

  const handleIndividualPayment = async () => {
    if (!selectedItem || !paymentAmount) {
      showToast(i18n.catalog["text_a76ef36cf119"], "error");
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
    { key: "cycle_name", header: i18n.catalog["text_eb0cdd7cf91f"], dataLabel: i18n.catalog["text_41195137d9ea"] },
    {
      key: "status",
      header: i18n.catalog["text_258880273825"],
      dataLabel: i18n.catalog["text_c3a4749caed4"],
      render: (item: any) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span className={`badge ${item.status === 'paid' ? 'badge-success' : item.status === 'approved' ? 'badge-info' : item.status === 'pending_approval' ? 'badge-warning' : 'badge-secondary'}`}>
            {item.status === 'draft' ? i18n.catalog["text_552aec56f591"] : item.status === 'pending_approval' ? i18n.catalog["text_aa37635e9733"] : item.status === 'approved' ? i18n.catalog["text_ef0a0d80aedd"] : item.status === 'paid' ? i18n.catalog["text_75f7db4415ec"] : item.status}
          </span>
          {item.status === 'pending_approval' && item.current_approver && (
            <small className="text-muted">{i18n.catalog["text_bf803d45c379"]}{item.current_approver.full_name}</small>
          )}
        </div>
      )
    },
    {
      key: "cycle_type",
      header: i18n.catalog["text_caa3f2bb4a36"],
      dataLabel: i18n.catalog["text_caa3f2bb4a36"],
      render: (item: any) => {
        const typeMap: any = { salary: i18n.catalog["text_ec17074bad41"], bonus: i18n.catalog["text_c396e6b8b30a"], incentive: i18n.catalog["text_6432e51d7d0a"], other: i18n.catalog["text_17a9f38e22b6"] };
        return <span className={`badge ${item.cycle_type === 'salary' ? 'badge-primary' : 'badge-info'}`}>{typeMap[item.cycle_type] || item.cycle_type}</span>;
      }
    },
    { key: "payment_date", header: i18n.catalog["text_1de51d2cdd19"], dataLabel: i18n.catalog["text_1de51d2cdd19"], render: (item) => formatDate(item.payment_date) },
    { key: "total_net", header: i18n.catalog["text_1f4a626bcba2"], dataLabel: i18n.catalog["text_d9a8617ba2a0"], render: (item) => <strong>{formatCurrency(item.total_net)}</strong> },
    {
      key: "id", header: i18n.catalog["text_7797240d6caf"], dataLabel: i18n.catalog["text_7797240d6caf"], render: (item: any) => (
        <ActionButtons
          actions={[
            {
              icon: "eye",
              title: i18n.catalog["text_a8cad8e87818"],
              variant: "view",
              onClick: () => { setSelectedCycle(item); handleLoadCycleDetails(item.id); }
            },
            ...(canAccess("payroll", "edit") ? [{
              icon: "send" as const,
              title: i18n.catalog["text_c8587f9ca64a"],
              variant: "success" as const,
              onClick: () => handleApprove(item.id),
              hidden: !(item.status === 'draft' && item.created_by == currentUser?.id)
            }] : []),
            ...(canAccess("payroll", "edit") ? [{
              icon: "check" as const,
              title: i18n.catalog["text_05c063357298"],
              variant: "success" as const,
              onClick: () => handleApprove(item.id),
              hidden: !(item.status === 'pending_approval' && item.current_approver_id == currentUser?.id)
            }] : []),
            ...(canAccess("payroll", "edit") ? [{
              icon: "dollar" as const,
              title: i18n.catalog["text_3e422ddf2a25"],
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
      key: "employee_name", header: i18n.catalog["text_b71a39c832a6"], dataLabel: i18n.catalog["text_b71a39c832a6"], render: (item) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: 600 }}>{item.employee_name || item.employee?.full_name || "-"}</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{item.employee?.employee_code || ""}</span>
        </div>
      )
    },
    { key: "net_salary", header: i18n.catalog["text_fda344404d45"], dataLabel: i18n.catalog["text_d7430cd2a6c1"], render: (item) => formatCurrency(item.net_salary) },
    {
      key: "status",
      header: i18n.catalog["text_c990a06e64e7"],
      dataLabel: i18n.catalog["text_c3a4749caed4"],
      render: (item) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className={`badge ${item.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
            {item.status === 'active' ? i18n.catalog["text_629e90b3af3d"] : i18n.catalog["text_e858894dedb7"]}
          </span>
          {(isUserApprover || isDraftCreator) && canAccess("payroll", "edit") && (
            <button
              onClick={() => toggleStopSalary(item)}
              className={`btn btn-xs ${item.status === 'active' ? 'btn-outline-danger' : 'btn-outline-success'}`}
              style={{ fontSize: '0.7rem', padding: '2px 5px' }}
            >
              {item.status === 'active' ? i18n.catalog["text_87c89429ccaa"] : i18n.catalog["text_c3c09fe13363"]}
            </button>
          )}
        </div>
      )
    },
    {
      key: "paid_amount", header: i18n.catalog["text_46c4618a603e"], dataLabel: i18n.catalog["text_46c4618a603e"], render: (item) => (
        <button className="text-link" onClick={() => handleLoadItemHistory(item)} style={{ background: 'none', border: 'none', padding: 0, color: 'var(--primary-color)', cursor: 'pointer', textDecoration: 'underline' }}>
          {formatCurrency(item.paid_amount || 0)}
        </button>
      )
    },
    {
      key: "actions", header: i18n.catalog["text_7797240d6caf"], dataLabel: i18n.catalog["text_7797240d6caf"], render: (item) => {
        const remaining = (item.remaining_balance !== undefined) ? item.remaining_balance : item.net_salary;
        return (
          <ActionButtons
            actions={[
              ...(canAccess("payroll", "edit") ? [{
                icon: "edit" as const,
                title: i18n.catalog["text_b17aea69327f"],
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
                title: i18n.catalog["text_4f0356aad001"],
                variant: "primary" as const,
                onClick: () => openPaymentDialog(item),
                hidden: !(remaining > 0 && selectedCycle?.status === 'approved' && item.status === 'active')
              }] : []),
              {
                icon: "history",
                title: i18n.catalog["text_87315ab2bf1d"],
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
    { key: "transaction_date", header: i18n.catalog["text_d90c384199ac"], dataLabel: i18n.catalog["text_d90c384199ac"], render: (item) => formatDateTime(item.transaction_date) },
    { key: "amount", header: i18n.catalog["text_1cd480f91b24"], dataLabel: i18n.catalog["text_1cd480f91b24"], render: (item) => formatCurrency(item.amount) },
    { key: "transaction_type", header: i18n.catalog["text_caa3f2bb4a36"], dataLabel: i18n.catalog["text_caa3f2bb4a36"], render: (item) => item.transaction_type === 'payment' ? i18n.catalog["text_d9388205a0bb"] : i18n.catalog["text_e00d82a6bb61"] },
    { key: "notes", header: i18n.catalog["text_d446d2dc6b81"], dataLabel: i18n.catalog["text_d446d2dc6b81"] },
  ];

  return (
    <>
      <div className="sales-card animate-fade">
        <PageSubHeader
          title={i18n.catalog["text_df07270ff633"]}
          titleIcon="dollar"
          actions={
            canAccess("payroll", "create") && (
              <Button
                variant="primary"
                onClick={() => setShowCreateCycleDialog(true)}
                icon="plus">
                {i18n.catalog["text_f58b75951b2e"]}</Button>
            )
          }
        />

        <Table
          columns={cycleColumns}
          data={payrollCycles.filter(c => !cycleSearch || c.cycle_name.toLowerCase().includes(cycleSearch.toLowerCase()))}
          keyExtractor={(item) => item.id}
          emptyMessage={i18n.catalog["text_0a63c43247b4"]}
          isLoading={isLoading}
        />
      </div>

      {/* Create Cycle Dialog */}
      <Dialog
        isOpen={showCreateCycleDialog}
        onClose={() => setShowCreateCycleDialog(false)}
        title={i18n.catalog["text_46775988aa57"]}
        maxWidth="900px"
        footer={
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={() => setShowCreateCycleDialog(false)}>{i18n.catalog["text_9a30dc2a96b8"]}</button>
            <button className="btn btn-primary" onClick={handleCreateCycle} disabled={isSubmitting}>
              {isSubmitting ? i18n.catalog["text_a582c5237c6b"] : i18n.catalog["text_32b55ee6511c"]}
            </button>
          </div>
        }
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <Select
              label={i18n.catalog["text_a629989e0f25"]}
              value={newCycle.payment_nature}
              onChange={(e) => setNewCycle({ ...newCycle, payment_nature: e.target.value as any, cycle_name: e.target.value === 'salary' ? '' : newCycle.cycle_name })}
              options={[
                { value: 'salary', label: i18n.catalog["text_568886dd6d99"] },
                { value: 'incentive', label: i18n.catalog["text_a233b3dc6a97"] },
                { value: 'bonus', label: i18n.catalog["text_364a5e5bbb6e"] },
                { value: 'other', label: i18n.catalog["text_17a9f38e22b6"] }
              ]}
            />

            <TextInput
              label={i18n.catalog["text_d4b4f428c0dd"]}
              type="text"
              placeholder={i18n.catalog["text_8f68db10384d"]}
              value={newCycle.cycle_name}
              onChange={(e) => setNewCycle({ ...newCycle, cycle_name: e.target.value })}
            />

            <TextInput
              label={i18n.catalog["text_b434f5694f8d"]}
              type="date"
              value={newCycle.payment_date}
              onChange={(e) => setNewCycle({ ...newCycle, payment_date: e.target.value })}
            />

            <TextInput
              label={i18n.catalog["text_1cc9497aa651"]}
              type="number"
              placeholder={i18n.catalog["text_561b2814d3c0"]}
              value={newCycle.base_amount}
              onChange={(e) => setNewCycle({ ...newCycle, base_amount: e.target.value })}
            />
          </div>

          <div style={{ border: '1px solid #eee', borderRadius: '8px', padding: '1rem', background: '#fcfcfc' }}>
            <Label className="form-label" style={{ fontWeight: 600, marginBottom: '1rem', display: 'block' }}>{i18n.catalog["text_3e0c86919761"]}</Label>

            <div style={{ marginBottom: '1rem' }}>
              <RadioGroup
                className="flex gap-4 mb-4"
                value={newCycle.target_type}
                onValueChange={(val) => setNewCycle({ ...newCycle, target_type: val as any, employee_ids: val === 'all' ? [] : newCycle.employee_ids })}
              >
                <RadioGroupItem value="all" label={i18n.catalog["text_65f276da33cf"]} />
                <RadioGroupItem value="selected" label={i18n.catalog["text_76c6bbf236ce"]} />
                <RadioGroupItem value="excluded" label={i18n.catalog["text_4256f8e3e5a5"]} />
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
        title={catalogText(i18n, "text_7c37c1a2d65d", { value0: selectedCycle?.cycle_name || "" })}
        maxWidth="1200px"
        footer={
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', width: '100%' }}>
            <div style={{ marginRight: 'auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{i18n.catalog["text_02e196bdec60"]}</span>
              <span className={`badge ${selectedCycle?.status === 'approved' ? 'badge-success' : 'badge-warning'}`}>
                {selectedCycle?.status === 'draft' ? i18n.catalog["text_552aec56f591"] : selectedCycle?.status === 'pending_approval' ? i18n.catalog["text_aa37635e9733"] : i18n.catalog["text_ef0a0d80aedd"]}
              </span>
            </div>
            <button className="btn btn-secondary" onClick={() => setShowDetailsDialog(false)}>{i18n.catalog["text_ca90c297b099"]}</button>

            {isUserApprover && (
              <button className="btn btn-primary" onClick={() => handleApprove(selectedCycle!.id)}>
                {getIcon("check")} {i18n.catalog["text_59a4fe28fe98"]}</button>
            )}

            {isDraftCreator && (
              <button className="btn btn-primary" onClick={() => handleApprove(selectedCycle!.id)}>
                {getIcon("rocket")} {i18n.catalog["text_c2df787d9cf3"]}</button>
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
                      placeholder={i18n.catalog["text_a039060af6a0"]}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="stat-card" style={{ background: '#f0f7ff', padding: '1rem', borderRadius: '8px', border: '1px solid #cce5ff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{i18n.catalog["text_b0e4b8323682"]}</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>{formatCurrency(selectedCycle?.total_net || 0)}</div>
                </div>
                <div className="stat-card" style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px', border: '1px solid #eee' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{i18n.catalog["text_cf48b5995eb1"]}</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{formatCurrency(payrollItems.reduce((acc, item) => acc + (item.status === 'active' ? (item.remaining_balance || 0) : 0), 0))}</div>
                </div>
                <div className="stat-card" style={{ background: '#e8f5e9', padding: '1rem', borderRadius: '8px', border: '1px solid #c3e6cb' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{i18n.catalog["text_6826a42bd63c"]}</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#28a745' }}>{formatCurrency(payrollItems.reduce((acc, item) => acc + (item.paid_amount || 0), 0))}</div>
                </div>
              </div>
            </div>

            <div className="table-responsive">
              <Table
                columns={itemColumns}
                data={filteredItems}
                keyExtractor={(item) => item.id}
                emptyMessage={i18n.catalog["text_d812e8bbc06f"]}
              />
            </div>
          </div>

          <div style={{ borderRight: '1px solid #eee', paddingRight: '1rem' }}>
            <h5 style={{ marginBottom: '1rem', borderBottom: '2px solid var(--primary-color)', paddingBottom: '0.5rem' }}>{i18n.catalog["text_da1fda130df5"]}</h5>
            {selectedCycle?.approval_trail && selectedCycle.approval_trail.length > 0 ? (
              <div style={{ display: 'grid', gap: '15px' }}>
                {selectedCycle.approval_trail.map((step, idx) => (
                  <div key={idx} style={{ position: 'relative', paddingLeft: '20px', borderLeft: '2px solid #28a745' }}>
                    <div style={{ position: 'absolute', left: '-7px', top: '0', width: '12px', height: '12px', borderRadius: '50%', background: '#28a745' }}></div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{step.user_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{formatDateTime(step.timestamp)}</div>
                    <div style={{ fontSize: '0.75rem', color: '#28a745' }}>{i18n.catalog["text_2eca238ea320"]}</div>
                  </div>
                ))}
                {selectedCycle?.status === 'pending_approval' && selectedCycle?.current_approver && (
                  <div style={{ position: 'relative', paddingLeft: '20px', borderLeft: '2px dashed #fbc02d' }}>
                    <div style={{ position: 'absolute', left: '-7px', top: '0', width: '12px', height: '12px', borderRadius: '50%', background: '#fbc02d' }}></div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{selectedCycle?.current_approver?.full_name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#fbc02d' }}>{i18n.catalog["text_fa62b0600718"]}</div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{i18n.catalog["text_7ced00f0e785"]}</div>
            )}
          </div>
        </div>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog
        isOpen={showEditItemDialog}
        onClose={() => setShowEditItemDialog(false)}
        title={catalogText(i18n, "text_8dbfe1c3454a", { value0: selectedItem?.employee_name })}
        footer={
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={() => setShowEditItemDialog(false)}>{i18n.catalog["text_9a30dc2a96b8"]}</button>
            <button className="btn btn-primary" onClick={handleUpdateItem} disabled={isSubmitting}>{i18n.catalog["text_9b70c9af5cbd"]}</button>
          </div>
        }
      >
        <div style={{ display: 'grid', gap: '1rem' }}>
          <TextInput label={i18n.catalog["text_149431ed189d"]} type="number" value={editItemData.base_salary} onChange={(e) => setEditItemData({ ...editItemData, base_salary: parseFloat(e.target.value) })} />
          <TextInput label={i18n.catalog["text_c37dbcf115ff"]} type="number" value={editItemData.total_allowances} onChange={(e) => setEditItemData({ ...editItemData, total_allowances: parseFloat(e.target.value) })} />
          <TextInput label={i18n.catalog["text_496117914733"]} type="number" value={editItemData.total_deductions} onChange={(e) => setEditItemData({ ...editItemData, total_deductions: parseFloat(e.target.value) })} />
          <Textarea label={i18n.catalog["text_e1c0dc04ff0f"]} value={editItemData.notes} onChange={(e) => setEditItemData({ ...editItemData, notes: e.target.value })} rows={2} />
          <div style={{ padding: '10px', background: '#f0f7ff', borderRadius: '6px' }}>
            <strong>{i18n.catalog["text_2a6e29837337"]}{formatCurrency(editItemData.base_salary + editItemData.total_allowances - editItemData.total_deductions)}</strong>
          </div>
        </div>
      </Dialog>

      {/* Other dialogs (Payment, History, Bulk) remain largely the same or minor edits */}
      <Dialog
        isOpen={showHistoryDialog}
        onClose={() => setShowHistoryDialog(false)}
        title={catalogText(i18n, "text_4aead6ba53d5", { value0: selectedItem?.employee_name || "" })}
        maxWidth="800px"
      >
        <Table columns={transactionColumns} data={transactions} keyExtractor={(item) => item.id} />
      </Dialog>

      <Dialog
        isOpen={showPaymentDialog}
        onClose={() => setShowPaymentDialog(false)}
        title={i18n.catalog["text_17fd5aad5777"]}
        footer={
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={() => setShowPaymentDialog(false)}>{i18n.catalog["text_9a30dc2a96b8"]}</button>
            <button className="btn btn-primary" onClick={handleIndividualPayment} disabled={isSubmitting}>{i18n.catalog["text_a35566ed8e30"]}</button>
          </div>
        }
      >
        <Select
          label={i18n.catalog["text_530163a6d616"]}
          value={selectedAccountId}
          onChange={(e) => setSelectedAccountId(e.target.value)}
          options={accounts.map(acc => ({ value: acc.id, label: catalogText(i18n, "text_2a9059a3c52f", { value0: acc.code, value1: acc.name }) }))}
        />
        <TextInput label={i18n.catalog["text_1cd480f91b24"]} type="number" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} />
      </Dialog>

      <Dialog
        isOpen={showBulkPaymentDialog}
        onClose={() => setShowBulkPaymentDialog(false)}
        title={i18n.catalog["text_708e9c66f028"]}
        footer={
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={() => setShowBulkPaymentDialog(false)}>{i18n.catalog["text_9a30dc2a96b8"]}</button>
            <button className="btn btn-primary" onClick={handleBulkPayment} disabled={isSubmitting}>{i18n.catalog["text_2ff6a79a6e8b"]}</button>
          </div>
        }
      >
        <Select label={i18n.catalog["text_4f2d4e6214bb"]} value={selectedAccountId} onChange={(e) => setSelectedAccountId(e.target.value)}>
          {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.code} - {acc.name}</option>)}
        </Select>
        <div style={{ padding: '15px', background: '#e8f5e9', borderRadius: '8px', marginTop: '10px' }}>
          {i18n.catalog["text_d0884d255268"]}<strong>{formatCurrency(selectedCycle?.total_net || 0)}</strong>
        </div>
      </Dialog>
    </>
  );
}
