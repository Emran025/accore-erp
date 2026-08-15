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
      showToast(i18n.catalog["common.general.pleaseSelectEmployee"], "error");
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
      showToast(e.message || i18n.catalog["humanCapital.eosbcalculator.failedCalculateEndServiceGratuity"], "error");
    } finally {
      setIsLoading(false);
    }
  };

  const selectedEmp = employees.find(e => e.id.toString() === formData.employee_id);

  return (
    <div className="sales-card animate-fade">
      <PageSubHeader
        title={i18n.catalog["humanCapital.eosbcalculator.endServiceBenefitCalculator"]}
        titleIcon="calculator"
      />

      <div className="sales-card compact" style={{ marginBottom: '1.5rem' }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1">
            <Label className="text-secondary mb-1">{i18n.catalog["common.general.employee"]}</Label>
            <SearchableSelect
              options={employees.map((emp: Employee) => ({ value: emp.id.toString(), label: emp.full_name }))}
              value={formData.employee_id}
              onChange={(value) => {
                setFormData({ ...formData, employee_id: String(value || "") });
                const emp = employees.find(e => e.id.toString() === String(value || ""));
                setSelectedEmployee(emp || null);
              }}
              placeholder={i18n.catalog["common.general.selectEmployee"]}
            />
          </div>
          <TextInput
            label={i18n.catalog["humanCapital.eosbcalculator.endServiceDate"]}
            type="date"
            value={formData.termination_date}
            onChange={(e) => setFormData({ ...formData, termination_date: e.target.value })}
          />
          <Select
            label={i18n.catalog["humanCapital.eosbcalculator.reasonServiceTermination"]}
            value={formData.termination_reason}
            onChange={(e) => setFormData({ ...formData, termination_reason: e.target.value as any })}
            options={[
              { value: 'resignation', label: i18n.catalog["humanCapital.eosbcalculator.resignation"] },
              { value: 'termination', label: i18n.catalog["humanCapital.eosbcalculator.terminatedEmployer"] },
              { value: 'end_of_contract', label: i18n.catalog["humanCapital.eosbcalculator.contractExpiry"] }
            ]}
          />
        </div>

        {selectedEmp && (
          <div className="sales-card compact" style={{ marginTop: '1.5rem', background: 'var(--primary-subtle)', border: '1px solid var(--primary-light)' }}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="stat-item">
                <span className="stat-label">{i18n.catalog["humanCapital.eosbcalculator.employmentDate"]}</span>
                <span className="stat-value" style={{ fontSize: '0.95rem' }}>{formatDate(selectedEmp.hire_date)}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">{i18n.catalog["common.general.basicSalary"]}</span>
                <span className="stat-value" style={{ fontSize: '0.95rem' }}>{formatCurrency(selectedEmp.base_salary)}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">{i18n.catalog["common.general.leaveBalance"]}</span>
                <span className="stat-value" style={{ fontSize: '0.95rem' }}>{selectedEmp.vacation_days_balance} {i18n.catalog["common.general.day"]}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">{i18n.catalog["common.general.employmentStatus"]}</span>
                <span className="stat-value" style={{ fontSize: '0.95rem' }}>
                  {selectedEmp.employment_status === 'active' ? i18n.catalog["common.general.active"] :
                    selectedEmp.employment_status === 'suspended' ? i18n.catalog["common.general.suspended"] : i18n.catalog["common.general.expired"]}
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
              {i18n.catalog["humanCapital.eosbcalculator.endServiceGratuityAccount"]}</Button>
          )}
        </div>
      </div>

      <Dialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        title={i18n.catalog["humanCapital.eosbcalculator.endServiceGratuityCalculationResult"]}
        maxWidth="700px"
      >
        {calculation && (
          <div className="space-y-4">
            <div className="sales-card compact" style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', border: '1px solid #bfdbfe' }}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="stat-item">
                  <span className="stat-label">{i18n.catalog["humanCapital.eosbcalculator.yearsService"]}</span>
                  <span className="stat-value">{calculation.years_of_service} {i18n.catalog["common.general.year"]}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">{i18n.catalog["humanCapital.eosbcalculator.monthsService"]}</span>
                  <span className="stat-value">{calculation.months_of_service} {i18n.catalog["humanCapital.eosbcalculator.month"]}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">{i18n.catalog["humanCapital.eosbcalculator.serviceDays"]}</span>
                  <span className="stat-value">{calculation.days_of_service} {i18n.catalog["common.general.day"]}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">{i18n.catalog["humanCapital.eosbcalculator.lastGrossSalary"]}</span>
                  <span className="stat-value">{formatCurrency(calculation.last_gross_salary)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 style={{ fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)' }}>{i18n.catalog["humanCapital.eosbcalculator.accountDetails"]}</h4>
              <div className="sales-card compact">
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex justify-between items-center p-3" style={{ background: 'var(--bg-color)', borderRadius: 'var(--radius-md)' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{i18n.catalog["humanCapital.eosbcalculator.endServiceGratuity"]}</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{formatCurrency(calculation.eosb_amount)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3" style={{ background: 'var(--bg-color)', borderRadius: 'var(--radius-md)' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{i18n.catalog["humanCapital.eosbcalculator.unusedLeaveBalance"]}</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{formatCurrency(calculation.unused_vacation_amount)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3" style={{ background: 'var(--bg-color)', borderRadius: 'var(--radius-md)' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{i18n.catalog["humanCapital.eosbcalculator.noticePeriodAmount"]}</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{formatCurrency(calculation.notice_period_amount)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="sales-card compact" style={{ background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)', border: '2px solid #10b981' }}>
              <div className="flex justify-between items-center">
                <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{i18n.catalog["humanCapital.eosbcalculator.totalSettlement"]}</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#059669' }}>
                  {formatCurrency(calculation.total_settlement)}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2" style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
              <Button variant="secondary" onClick={() => setShowDialog(false)}>
                {i18n.catalog["common.general.cancel"]}</Button>
              <Button
                onClick={() => {
                  showToast(i18n.catalog["humanCapital.eosbcalculator.accountSaved"], "success");
                }}
                variant="primary"
                icon="save">
                {i18n.catalog["common.general.save"]}</Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
