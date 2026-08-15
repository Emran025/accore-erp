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
      showToast(i18n.catalog["text_0c31da7eec0b"], "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.component_code || !formData.component_name) {
      showToast(i18n.catalog["text_0fd2f2ad0e62"], "error");
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
        await fetchAPI(catalogText(i18n, "text_0907f4dfb304", { value0: API_ENDPOINTS.HUMAN_CAPITAL.COMPONENTS, value1: editingComponent.id }), {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        showToast(i18n.catalog["text_9a57c9379e4e"], "success");
      } else {
        await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.COMPONENTS, {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        showToast(i18n.catalog["text_e2463a6b984d"], "success");
      }

      setShowDialog(false);
      resetForm();
      loadComponents();
    } catch (e: any) {
      showToast(e.message || i18n.catalog["text_440f1443976d"], "error");
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
    if (!confirm(i18n.catalog["text_db74b5ad3350"])) return;

    try {
      await fetchAPI(catalogText(i18n, "text_0907f4dfb304", { value0: API_ENDPOINTS.HUMAN_CAPITAL.COMPONENTS, value1: id }), {
        method: 'DELETE'
      });
      showToast(i18n.catalog["text_bc82e360828b"], "success");
      loadComponents();
    } catch (e: any) {
      showToast(e.message || i18n.catalog["text_6031abf570a0"], "error");
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
      header: i18n.catalog["text_eb40af592b1f"],
      dataLabel: i18n.catalog["text_eb40af592b1f"]
    },
    {
      key: "component_name",
      header: i18n.catalog["text_f782471424d8"],
      dataLabel: i18n.catalog["text_f782471424d8"]
    },
    {
      key: "component_type",
      header: i18n.catalog["text_caa3f2bb4a36"],
      dataLabel: i18n.catalog["text_caa3f2bb4a36"],
      render: (comp) => {
        const types: Record<string, string> = {
          allowance: i18n.catalog["text_83b35523b1bf"],
          deduction: i18n.catalog["text_ec9ccd93320a"],
          overtime: i18n.catalog["text_05751aac2a08"],
          bonus: i18n.catalog["text_c396e6b8b30a"],
          other: i18n.catalog["text_17a9f38e22b6"]
        };
        return types[comp.component_type] || comp.component_type;
      }
    },
    {
      key: "calculation_type",
      header: i18n.catalog["text_89e7f9277213"],
      dataLabel: i18n.catalog["text_89e7f9277213"],
      render: (comp) => {
        const types: Record<string, string> = {
          fixed: i18n.catalog["text_61ff6797c5fc"],
          percentage: i18n.catalog["text_3b43f75bb9b8"],
          formula: i18n.catalog["text_7d692c8de501"],
          attendance_based: i18n.catalog["text_274019a89d55"]
        };
        return types[comp.calculation_type] || comp.calculation_type;
      }
    },
    {
      key: "base_amount",
      header: i18n.catalog["text_c550adb6fc12"],
      dataLabel: i18n.catalog["text_c550adb6fc12"],
      render: (comp) => comp.base_amount ? formatCurrency(comp.base_amount) : "-"
    },
    {
      key: "is_active",
      header: i18n.catalog["text_629e90b3af3d"],
      dataLabel: i18n.catalog["text_629e90b3af3d"],
      render: (comp) => (
        <span className={comp.is_active ? "badge badge-success" : "badge badge-secondary"}>
          {comp.is_active ? i18n.catalog["text_4b2d2c65d365"] : i18n.catalog["text_2bd073516a87"]}
        </span>
      )
    },
    {
      key: "actions",
      header: i18n.catalog["text_7797240d6caf"],
      dataLabel: i18n.catalog["text_7797240d6caf"],
      render: (comp) => (
        <ActionButtons
          actions={[
            {
              icon: "edit",
              title: i18n.catalog["text_113d570d6555"],
              variant: "edit",
              onClick: () => handleEdit(comp)
            },
            {
              icon: "trash",
              title: i18n.catalog["text_59ca629220a6"],
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
        title={i18n.catalog["text_861283f6aed4"]}
        titleIcon="settings"
        actions={
          <Button
            variant="primary"
            onClick={() => {
              resetForm();
              setShowDialog(true);
            }}
            icon="plus">
            {i18n.catalog["text_033da2167cd4"]}</Button>
        }
      />

      <div className="sales-card">
        <Table
          data={components}
          columns={columns}
          isLoading={isLoading}
          emptyMessage={i18n.catalog["text_14eae4806278"]}
          keyExtractor={(item) => item.id.toString()}
        />
      </div>

      <Dialog
        isOpen={showDialog}
        onClose={() => {
          setShowDialog(false);
          resetForm();
        }}
        title={editingComponent ? i18n.catalog["text_7d36a80d195c"] : i18n.catalog["text_989435c680fe"]}
        maxWidth="700px"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="block mb-1" style={{ color: 'var(--text-secondary)' }}>{i18n.catalog["text_2a74cb1b82d7"]}</Label>
              <TextInput
                value={formData.component_code}
                onChange={(e) => setFormData({ ...formData, component_code: e.target.value })}
                disabled={!!editingComponent}
              />
            </div>
            <div>
              <Label className="block mb-1" style={{ color: 'var(--text-secondary)' }}>{i18n.catalog["text_79250353322b"]}</Label>
              <TextInput
                value={formData.component_name}
                onChange={(e) => setFormData({ ...formData, component_name: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="block mb-1" style={{ color: 'var(--text-secondary)' }}>{i18n.catalog["text_a80adcb92431"]}</Label>
              <Select
                value={formData.component_type}
                onChange={(e) => setFormData({ ...formData, component_type: e.target.value as any })}
                options={[
                  { value: 'allowance', label: i18n.catalog["text_83b35523b1bf"] },
                  { value: 'deduction', label: i18n.catalog["text_ec9ccd93320a"] },
                  { value: 'overtime', label: i18n.catalog["text_05751aac2a08"] },
                  { value: 'bonus', label: i18n.catalog["text_c396e6b8b30a"] },
                  { value: 'other', label: i18n.catalog["text_17a9f38e22b6"] }
                ]}
              />
            </div>
            <div>
              <Label className="block mb-1" style={{ color: 'var(--text-secondary)' }}>{i18n.catalog["text_56b6ffb058f7"]}</Label>
              <Select
                value={formData.calculation_type}
                onChange={(e) => setFormData({ ...formData, calculation_type: e.target.value as any })}
                options={[
                  { value: 'fixed', label: i18n.catalog["text_61ff6797c5fc"] },
                  { value: 'percentage', label: i18n.catalog["text_3b43f75bb9b8"] },
                  { value: 'formula', label: i18n.catalog["text_7d692c8de501"] },
                  { value: 'attendance_based', label: i18n.catalog["text_274019a89d55"] }
                ]}
              />
            </div>
          </div>

          {formData.calculation_type === 'fixed' && (
            <div>
              <Label className="block mb-1" style={{ color: 'var(--text-secondary)' }}>{i18n.catalog["text_af996fc14483"]}</Label>
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
                <Label className="block mb-1" style={{ color: 'var(--text-secondary)' }}>{i18n.catalog["text_7a12d25fe52a"]}</Label>
                <TextInput
                  type="number"
                  step="0.01"
                  value={formData.base_amount}
                  onChange={(e) => setFormData({ ...formData, base_amount: e.target.value })}
                />
              </div>
              <div>
                <Label className="block mb-1" style={{ color: 'var(--text-secondary)' }}>{i18n.catalog["text_1db347f0348c"]}</Label>
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
              <Label className="block mb-1" style={{ color: 'var(--text-secondary)' }}>{i18n.catalog["text_55a2d2f4fdee"]}</Label>
              <TextInput
                value={formData.formula}
                onChange={(e) => setFormData({ ...formData, formula: e.target.value })}
                placeholder={i18n.catalog["text_72b6afd74b89"]}
              />
              <p className="text-xs" style={{ color: 'var(--text-light)', marginTop: '0.5rem' }}>
                {i18n.catalog["text_3a5e4d38ea20"]}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="block mb-1" style={{ color: 'var(--text-secondary)' }}>{i18n.catalog["text_3fe4baa9ea9f"]}</Label>
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
                <span style={{ color: 'var(--text-secondary)' }}>{i18n.catalog["text_8d1c87e5718b"]}</span>
              </Label>
              <Label className="flex items-center gap-2" style={{ cursor: 'pointer' }}>
                <Checkbox
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
                <span style={{ color: 'var(--text-secondary)' }}>{i18n.catalog["text_629e90b3af3d"]}</span>
              </Label>
            </div>
          </div>

          <div>
            <Label className="block mb-1" style={{ color: 'var(--text-secondary)' }}>{i18n.catalog["text_95023fc76e1b"]}</Label>
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
              {i18n.catalog["text_9a30dc2a96b8"]}</Button>
            <Button variant="primary" onClick={handleSave} icon="save">
              {i18n.catalog["text_ddfcaf9d0144"]}</Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
