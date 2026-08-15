"use client";

import { useI18n } from "@/lib/i18n";
import { PageSubHeader } from "@/components/layout";
import { Button, Dialog, Label, SearchableSelect, showToast } from "@/components/ui";
import { TextInput } from "@/components/ui/TextInput";
import { Select } from "@/components/ui/select";
import { fetchAPI } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useAuthStore } from "@/stores/useAuthStore";
import { useEmployeeStore } from "@/stores/useEmployeeStore";
import { Employee, EOSBCalculation } from "@/types";
import { useEffect, useState } from "react";

/**
 * End of Service Benefit (EOSB) Calculation result.
 * Based on Saudi Labor Law Article 84-85 for termination benefits.
 */

/**
 * End of Service Benefit (EOSB) Calculator Component.
 * Calculates termination benefits according to Saudi Labor Law:
 * - EOSB: Based on years of service (half month for first 5 years, full month after)
 * - Unused vacation pay: Remaining vacation balance at daily rate
 * - Notice period compensation: Based on termination reason
 * 
 * Formula varies by termination reason per Article 84-85.
 * 
 * @returns The EOSBCalculator component
 */
export function EOSBCalculator() {
    const { t: i18n } = useI18n();
  const { allEmployees: employees, loadAllEmployees } = useEmployeeStore();
  const { canAccess } = useAuthStore();
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [calculation, setCalculation] = useState<EOSBCalculation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  const [formData, setFormData] = useState({
    employee_id: "",
    termination_date: new Date().toISOString().split('T')[0],
    termination_reason: "resignation" as "resignation" | "termination" | "end_of_contract"
  });

  useEffect(() => {
    loadAllEmployees();
  }, [loadAllEmployees]);

  const handleCalculate = async () => {
    if (!formData.employee_id) {
      showToast(i18n.catalog["text_8c0019b7fcee"], "error");
      return;
    }

    setIsLoading(true);
    try {
      const res: any = await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.EOSB.PREVIEW, {
        method: 'POST',
        body: JSON.stringify({
          employee_id: formData.employee_id,
          termination_date: formData.termination_date,
          termination_reason: formData.termination_reason
        })
      });
      setCalculation(res);
      setShowDialog(true);
    } catch (e: any) {
      showToast(e.message || i18n.catalog["text_6497f864668b"], "error");
    } finally {
      setIsLoading(false);
    }
  };

  const selectedEmp = employees.find(e => e.id.toString() === formData.employee_id);

  return (
    <div className="sales-card animate-fade">
      <PageSubHeader
        title={i18n.catalog["text_49abcfa72030"]}
        titleIcon="calculator"
      />

      <div className="sales-card compact" style={{ marginBottom: '1.5rem' }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1">
            <Label className="text-secondary mb-1">{i18n.catalog["text_972803dc7d86"]}</Label>
            <SearchableSelect
              options={employees.map((emp: Employee) => ({ value: emp.id.toString(), label: emp.full_name }))}
              value={formData.employee_id}
              onChange={(value) => {
                setFormData({ ...formData, employee_id: String(value || "") });
                const emp = employees.find(e => e.id.toString() === String(value || ""));
                setSelectedEmployee(emp || null);
              }}
              placeholder={i18n.catalog["text_dee783929dea"]}
            />
          </div>
          <TextInput
            label={i18n.catalog["text_c247115504ea"]}
            type="date"
            value={formData.termination_date}
            onChange={(e) => setFormData({ ...formData, termination_date: e.target.value })}
          />
          <Select
            label={i18n.catalog["text_2508f0f772c8"]}
            value={formData.termination_reason}
            onChange={(e) => setFormData({ ...formData, termination_reason: e.target.value as any })}
            options={[
              { value: 'resignation', label: i18n.catalog["text_07b5904e4949"] },
              { value: 'termination', label: i18n.catalog["text_bfd7ed22e667"] },
              { value: 'end_of_contract', label: i18n.catalog["text_170f227e0594"] }
            ]}
          />
        </div>

        {selectedEmp && (
          <div className="sales-card compact" style={{ marginTop: '1.5rem', background: 'var(--primary-subtle)', border: '1px solid var(--primary-light)' }}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="stat-item">
                <span className="stat-label">{i18n.catalog["text_075142ff2d44"]}</span>
                <span className="stat-value" style={{ fontSize: '0.95rem' }}>{formatDate(selectedEmp.hire_date)}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">{i18n.catalog["text_73ad6b20ceb7"]}</span>
                <span className="stat-value" style={{ fontSize: '0.95rem' }}>{formatCurrency(selectedEmp.base_salary)}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">{i18n.catalog["text_65c7b5f96855"]}</span>
                <span className="stat-value" style={{ fontSize: '0.95rem' }}>{selectedEmp.vacation_days_balance} {i18n.catalog["text_eb07f635d883"]}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">{i18n.catalog["text_b9fae6c6b12f"]}</span>
                <span className="stat-value" style={{ fontSize: '0.95rem' }}>
                  {selectedEmp.employment_status === 'active' ? i18n.catalog["text_629e90b3af3d"] :
                    selectedEmp.employment_status === 'suspended' ? i18n.catalog["text_e858894dedb7"] : i18n.catalog["text_6217883aee8e"]}
                </span>
              </div>
            </div>
          </div>
        )}

        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
          {canAccess("eosb", "create") && (
            <Button
              onClick={handleCalculate}
              disabled={isLoading || !formData.employee_id}
              variant="primary"
              icon="calculator">
              {i18n.catalog["text_25a547cdd42e"]}</Button>
          )}
        </div>
      </div>

      <Dialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        title={i18n.catalog["text_3551cefcbbd4"]}
        maxWidth="700px"
      >
        {calculation && (
          <div className="space-y-4">
            <div className="sales-card compact" style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', border: '1px solid #bfdbfe' }}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="stat-item">
                  <span className="stat-label">{i18n.catalog["text_abcd7088179f"]}</span>
                  <span className="stat-value">{calculation.years_of_service} {i18n.catalog["text_2d54bea33ed4"]}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">{i18n.catalog["text_4950f16d03c1"]}</span>
                  <span className="stat-value">{calculation.months_of_service} {i18n.catalog["text_418e78e480bd"]}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">{i18n.catalog["text_36a062950c5c"]}</span>
                  <span className="stat-value">{calculation.days_of_service} {i18n.catalog["text_eb07f635d883"]}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">{i18n.catalog["text_0280b2c2f72d"]}</span>
                  <span className="stat-value">{formatCurrency(calculation.last_gross_salary)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 style={{ fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)' }}>{i18n.catalog["text_13f6b1265e3f"]}</h4>
              <div className="sales-card compact">
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex justify-between items-center p-3" style={{ background: 'var(--bg-color)', borderRadius: 'var(--radius-md)' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{i18n.catalog["text_a04b5cf98000"]}</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{formatCurrency(calculation.eosb_amount)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3" style={{ background: 'var(--bg-color)', borderRadius: 'var(--radius-md)' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{i18n.catalog["text_196d8f5a0c1d"]}</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{formatCurrency(calculation.unused_vacation_amount)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3" style={{ background: 'var(--bg-color)', borderRadius: 'var(--radius-md)' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{i18n.catalog["text_8e7ccf6a2b82"]}</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{formatCurrency(calculation.notice_period_amount)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="sales-card compact" style={{ background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)', border: '2px solid #10b981' }}>
              <div className="flex justify-between items-center">
                <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{i18n.catalog["text_a05353dbd114"]}</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#059669' }}>
                  {formatCurrency(calculation.total_settlement)}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2" style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
              <Button variant="secondary" onClick={() => setShowDialog(false)}>
                {i18n.catalog["text_9a30dc2a96b8"]}</Button>
              <Button
                onClick={() => {
                  showToast(i18n.catalog["text_8a7ce06014e1"], "success");
                }}
                variant="primary"
                icon="save">
                {i18n.catalog["text_ddfcaf9d0144"]}</Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
