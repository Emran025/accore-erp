"use client";

import { useI18n, catalogText } from "@/lib/i18n";
import { PageSubHeader } from "@/components/layout";
import { ActionButtons, Button, Column, Dialog, Label, showToast, Table } from "@/components/ui";
import { TextInput } from "@/components/ui/TextInput";
import { Textarea } from "@/components/ui/Textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select } from "@/components/ui/select";
import { fetchAPI } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatCurrency } from "@/lib/utils";
import { PayrollComponent } from "@/types";
import { useEffect, useState } from "react";

export function PayrollComponents() {
    const { t: i18n } = useI18n();
  const [components, setComponents] = useState<PayrollComponent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [editingComponent, setEditingComponent] = useState<PayrollComponent | null>(null);

  const [formData, setFormData] = useState({
    component_code: "",
    component_name: "",
    component_type: "allowance" as PayrollComponent['component_type'],
    calculation_type: "fixed" as PayrollComponent['calculation_type'],
    base_amount: "",
    percentage: "",
    formula: "",
    is_taxable: true,
    is_active: true,
    display_order: 0,
    description: ""
  });

  useEffect(() => {
    loadComponents();
  }, []);

  const loadComponents = async () => {
    setIsLoading(true);
    try {
      const res: any = await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.COMPONENTS);
      const data = res.data || (Array.isArray(res) ? res : []);
      setComponents(data);
    } catch (e) {
      showToast(i18n.catalog["humanCapital.payrollcomponents.failedLoadPayrollComponents"], "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.component_code || !formData.component_name) {
      showToast(i18n.catalog["humanCapital.payrollcomponents.pleaseEnterAllRequiredFields"], "error");
      return;
    }

    try {
      const payload = {
        ...formData,
        base_amount: formData.base_amount ? parseFloat(formData.base_amount) : null,
        percentage: formData.percentage ? parseFloat(formData.percentage) : null,
        display_order: parseInt(formData.display_order.toString()) || 0
      };

      if (editingComponent) {
        await fetchAPI(catalogText(i18n, "common.general.message", { value0: API_ENDPOINTS.HUMAN_CAPITAL.COMPONENTS, value1: editingComponent.id }), {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        showToast(i18n.catalog["humanCapital.payrollcomponents.componentUpdatedSuccessfully"], "success");
      } else {
        await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.COMPONENTS, {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        showToast(i18n.catalog["humanCapital.payrollcomponents.componentCreatedSuccessfully"], "success");
      }

      setShowDialog(false);
      resetForm();
      loadComponents();
    } catch (e: any) {
      showToast(e.message || i18n.catalog["humanCapital.payrollcomponents.failedSaveComponent"], "error");
    }
  };

  const handleEdit = (component: PayrollComponent) => {
    setEditingComponent(component);
    setFormData({
      component_code: component.component_code,
      component_name: component.component_name,
      component_type: component.component_type,
      calculation_type: component.calculation_type,
      base_amount: component.base_amount?.toString() || "",
      percentage: component.percentage?.toString() || "",
      formula: component.formula || "",
      is_taxable: component.is_taxable,
      is_active: component.is_active,
      display_order: component.display_order,
      description: component.description || ""
    });
    setShowDialog(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm(i18n.catalog["humanCapital.payrollcomponents.areYouSureYouWantDeleteThisComponent"])) return;

    try {
      await fetchAPI(catalogText(i18n, "common.general.message", { value0: API_ENDPOINTS.HUMAN_CAPITAL.COMPONENTS, value1: id }), {
        method: 'DELETE'
      });
      showToast(i18n.catalog["humanCapital.payrollcomponents.componentDeletedSuccessfully"], "success");
      loadComponents();
    } catch (e: any) {
      showToast(e.message || i18n.catalog["humanCapital.payrollcomponents.failedDeleteComponent"], "error");
    }
  };

  const resetForm = () => {
    setEditingComponent(null);
    setFormData({
      component_code: "",
      component_name: "",
      component_type: "allowance" as PayrollComponent['component_type'],
      calculation_type: "fixed" as PayrollComponent['calculation_type'],
      base_amount: "",
      percentage: "",
      formula: "",
      is_taxable: true,
      is_active: true,
      display_order: 0,
      description: ""
    });
  };

  const columns: Column<PayrollComponent>[] = [
    {
      key: "component_code",
      header: i18n.catalog["common.general.componentCode"],
      dataLabel: i18n.catalog["common.general.componentCode"]
    },
    {
      key: "component_name",
      header: i18n.catalog["common.general.componentName"],
      dataLabel: i18n.catalog["common.general.componentName"]
    },
    {
      key: "component_type",
      header: i18n.catalog["common.general.type.alternative3"],
      dataLabel: i18n.catalog["common.general.type.alternative3"],
      render: (comp) => {
        const types: Record<string, string> = {
          allowance: i18n.catalog["common.general.allowance"],
          deduction: i18n.catalog["common.general.discount.alternative2"],
          overtime: i18n.catalog["common.general.overtime"],
          bonus: i18n.catalog["common.general.bonus"],
          other: i18n.catalog["common.general.other"]
        };
        return types[comp.component_type] || comp.component_type;
      }
    },
    {
      key: "calculation_type",
      header: i18n.catalog["common.general.accountType"],
      dataLabel: i18n.catalog["common.general.accountType"],
      render: (comp) => {
        const types: Record<string, string> = {
          fixed: i18n.catalog["common.general.fixed"],
          percentage: i18n.catalog["common.general.percentage"],
          formula: i18n.catalog["common.general.format"],
          attendance_based: i18n.catalog["common.general.basedAttendance"]
        };
        return types[comp.calculation_type] || comp.calculation_type;
      }
    },
    {
      key: "base_amount",
      header: i18n.catalog["common.general.baseAmount"],
      dataLabel: i18n.catalog["common.general.baseAmount"],
      render: (comp) => comp.base_amount ? formatCurrency(comp.base_amount) : "-"
    },
    {
      key: "is_active",
      header: i18n.catalog["common.general.active"],
      dataLabel: i18n.catalog["common.general.active"],
      render: (comp) => (
        <span className={comp.is_active ? "badge badge-success" : "badge badge-secondary"}>
          {comp.is_active ? i18n.catalog["common.general.yes"] : i18n.catalog["common.general.no"]}
        </span>
      )
    },
    {
      key: "actions",
      header: i18n.catalog["common.general.actions"],
      dataLabel: i18n.catalog["common.general.actions"],
      render: (comp) => (
        <ActionButtons
          actions={[
            {
              icon: "edit",
              title: i18n.catalog["common.general.edit"],
              variant: "edit",
              onClick: () => handleEdit(comp)
            },
            {
              icon: "trash",
              title: i18n.catalog["common.general.delete"],
              variant: "delete",
              onClick: () => handleDelete(comp.id)
            }
          ]}
        />
      )
    }
  ];

  return (
    <div className="sales-card animate-fade">
      <PageSubHeader
        title={i18n.catalog["common.general.payrollComponents"]}
        titleIcon="settings"
        actions={
          <Button
            variant="primary"
            onClick={() => {
              resetForm();
              setShowDialog(true);
            }}
            icon="plus">
            {i18n.catalog["humanCapital.payrollcomponents.addNewComponent"]}</Button>
        }
      />

      <div className="sales-card">
        <Table
          data={components}
          columns={columns}
          isLoading={isLoading}
          emptyMessage={i18n.catalog["humanCapital.payrollcomponents.noPayrollComponents"]}
          keyExtractor={(item) => item.id.toString()}
        />
      </div>

      <Dialog
        isOpen={showDialog}
        onClose={() => {
          setShowDialog(false);
          resetForm();
        }}
        title={editingComponent ? i18n.catalog["humanCapital.payrollcomponents.editSalaryComponent"] : i18n.catalog["humanCapital.payrollcomponents.addNewSalaryComponent"]}
        maxWidth="700px"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="block mb-1" style={{ color: 'var(--text-secondary)' }}>{i18n.catalog["humanCapital.payrollcomponents.componentCode"]}</Label>
              <TextInput
                value={formData.component_code}
                onChange={(e) => setFormData({ ...formData, component_code: e.target.value })}
                disabled={!!editingComponent}
              />
            </div>
            <div>
              <Label className="block mb-1" style={{ color: 'var(--text-secondary)' }}>{i18n.catalog["humanCapital.payrollcomponents.componentName"]}</Label>
              <TextInput
                value={formData.component_name}
                onChange={(e) => setFormData({ ...formData, component_name: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="block mb-1" style={{ color: 'var(--text-secondary)' }}>{i18n.catalog["humanCapital.payrollcomponents.componentType"]}</Label>
              <Select
                value={formData.component_type}
                onChange={(e) => setFormData({ ...formData, component_type: e.target.value as any })}
                options={[
                  { value: 'allowance', label: i18n.catalog["common.general.allowance"] },
                  { value: 'deduction', label: i18n.catalog["common.general.discount.alternative2"] },
                  { value: 'overtime', label: i18n.catalog["common.general.overtime"] },
                  { value: 'bonus', label: i18n.catalog["common.general.bonus"] },
                  { value: 'other', label: i18n.catalog["common.general.other"] }
                ]}
              />
            </div>
            <div>
              <Label className="block mb-1" style={{ color: 'var(--text-secondary)' }}>{i18n.catalog["humanCapital.payrollcomponents.accountType"]}</Label>
              <Select
                value={formData.calculation_type}
                onChange={(e) => setFormData({ ...formData, calculation_type: e.target.value as any })}
                options={[
                  { value: 'fixed', label: i18n.catalog["common.general.fixed"] },
                  { value: 'percentage', label: i18n.catalog["common.general.percentage"] },
                  { value: 'formula', label: i18n.catalog["common.general.format"] },
                  { value: 'attendance_based', label: i18n.catalog["common.general.basedAttendance"] }
                ]}
              />
            </div>
          </div>

          {formData.calculation_type === 'fixed' && (
            <div>
              <Label className="block mb-1" style={{ color: 'var(--text-secondary)' }}>{i18n.catalog["humanCapital.payrollcomponents.fixedAmount"]}</Label>
              <TextInput
                type="number"
                step="0.01"
                value={formData.base_amount}
                onChange={(e) => setFormData({ ...formData, base_amount: e.target.value })}
              />
            </div>
          )}

          {formData.calculation_type === 'percentage' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="block mb-1" style={{ color: 'var(--text-secondary)' }}>{i18n.catalog["humanCapital.payrollcomponents.baseAmount"]}</Label>
                <TextInput
                  type="number"
                  step="0.01"
                  value={formData.base_amount}
                  onChange={(e) => setFormData({ ...formData, base_amount: e.target.value })}
                />
              </div>
              <div>
                <Label className="block mb-1" style={{ color: 'var(--text-secondary)' }}>{i18n.catalog["humanCapital.payrollcomponents.percentage"]}</Label>
                <TextInput
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.percentage}
                  onChange={(e) => setFormData({ ...formData, percentage: e.target.value })}
                />
              </div>
            </div>
          )}

          {formData.calculation_type === 'formula' && (
            <div>
              <Label className="block mb-1" style={{ color: 'var(--text-secondary)' }}>{i18n.catalog["humanCapital.payrollcomponents.formula"]}</Label>
              <TextInput
                value={formData.formula}
                onChange={(e) => setFormData({ ...formData, formula: e.target.value })}
                placeholder={i18n.catalog["humanCapital.payrollcomponents.exampleHoursRate15"]}
              />
              <p className="text-xs" style={{ color: 'var(--text-light)', marginTop: '0.5rem' }}>
                {i18n.catalog["humanCapital.payrollcomponents.availableVariablesHoursRateOvertimeHoursBaseSalary"]}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="block mb-1" style={{ color: 'var(--text-secondary)' }}>{i18n.catalog["humanCapital.payrollcomponents.displayOrder"]}</Label>
              <TextInput
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="flex items-center gap-6 pt-6">
              <Label className="flex items-center gap-2" style={{ cursor: 'pointer' }}>
                <Checkbox
                  checked={formData.is_taxable}
                  onChange={(e) => setFormData({ ...formData, is_taxable: e.target.checked })}
                />
                <span style={{ color: 'var(--text-secondary)' }}>{i18n.catalog["common.general.taxable"]}</span>
              </Label>
              <Label className="flex items-center gap-2" style={{ cursor: 'pointer' }}>
                <Checkbox
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
                <span style={{ color: 'var(--text-secondary)' }}>{i18n.catalog["common.general.active"]}</span>
              </Label>
            </div>
          </div>

          <div>
            <Label className="block mb-1" style={{ color: 'var(--text-secondary)' }}>{i18n.catalog["common.general.description.alternative2"]}</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2" style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <Button variant="secondary" onClick={() => {
              setShowDialog(false);
              resetForm();
            }}>
              {i18n.catalog["common.general.cancel"]}</Button>
            <Button variant="primary" onClick={handleSave} icon="save">
              {i18n.catalog["common.general.save"]}</Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
