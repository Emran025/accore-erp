"use client";

import { useI18n, catalogText, catalogMessage } from "@/lib/i18n";
import { useState, useEffect } from "react";
import { ExpandableTable, Column as ExpandableColumn } from "./ExpandableTable";
import { SelectableTable, SelectableColumn } from "./SelectableTable";
import { SearchableSelect, SelectOption } from "./SearchableSelect";
import { FloatingActionTableBar } from "./FloatingActionBar";
import { ConfirmDialog } from "./Dialog";
import { formatCurrency } from "@/lib/utils";
import { PageSubHeader } from "../layout";

// Re-export types for consumers
export type { ExpandableColumn as InvoiceTableColumn };

import type { Invoice, InvoiceItem as GlobalInvoiceItem } from "@/types";

export interface InvoiceItem extends GlobalInvoiceItem {
  id: number;
  product?: { name: string; barcode?: string };
}

export interface SelectableInvoice extends Partial<Invoice> {
  id: number;
  invoice_number: string;
  total_amount?: number;
  amount?: number;
}

export type { SelectableInvoice as Invoice };
export type { InvoiceItem as SelectableInvoiceItem };
export interface SelectedItem {
  invoiceId: number;
  invoiceItemId: number;
  quantity: number;
  maxQuantity: number;
  productName: string;
  unitPrice: number;
  originalQuantity?: number;
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

interface SelectableInvoiceTableProps<T extends SelectableInvoice> {
  invoices: T[];
  columns: ExpandableColumn<T>[];
  keyExtractor: (item: T) => string | number;
  onSelectionChange: (selectedItems: SelectedItem[]) => void;
  onSearch: (query: string) => void;
  searchPlaceholder?: string;
  isLoading?: boolean;
  pagination?: PaginationProps;
  getInvoiceItems: (invoice: T) => Promise<InvoiceItem[]> | InvoiceItem[];
  emptyMessage?: string;
  multiInvoiceSelection?: boolean;
  isExpandable?: (item: T) => boolean;
  openReturnDialog: () => void;
  renderCustomExpandedRow?: (item: T) => React.ReactNode;
  invoiceIdExtractor?: (item: T) => number;
  FilterTabNavigation?: React.ReactNode;
}

export function SelectableInvoiceTable<T extends SelectableInvoice>({
  invoices,
  columns,
  keyExtractor,
  onSelectionChange,
  onSearch,
  searchPlaceholder = catalogMessage("text_aa511cb1c4c3"),
  isLoading = false,
  pagination,
  getInvoiceItems,
  emptyMessage = catalogMessage("text_e954a549b77f"),
  multiInvoiceSelection = false,
  isExpandable,
  openReturnDialog,
  renderCustomExpandedRow,
  invoiceIdExtractor = (item: T) => item.id,
  FilterTabNavigation,
}: SelectableInvoiceTableProps<T>) {
    const { t: i18n } = useI18n();
  // State
  const [invoiceItems, setInvoiceItems] = useState<Record<number, InvoiceItem[]>>({});
  const [loadingItems, setLoadingItems] = useState<Record<number, boolean>>({});
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);

  // Confirmation state
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmData, setConfirmData] = useState<{
    onConfirm: () => void;
    message: string;
  } | null>(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredInvoices, setFilteredInvoices] = useState<T[]>(invoices);

  // Filter invoices when search changes or invoices update
  useEffect(() => {
    if (!searchQuery) {
      setFilteredInvoices(invoices);
    } else {
      setFilteredInvoices(invoices.filter(inv =>
        inv.invoice_number.toLowerCase().includes(searchQuery.toLowerCase())
      ));
    }
  }, [searchQuery, invoices]);


  // Current invoice being selected from
  const currentInvoiceId = selectedItems.length > 0 ? selectedItems[0].invoiceId : null;

  // Search Handler
  const handleSearchChange = (value: string | number | null, option: SelectOption | null) => {
    const query = option ? option.label : "";
    setSearchQuery(query);
    onSearch(query);
  };

  // Convert invoices to options for SearchableSelect
  const searchOptions: SelectOption[] = invoices.map(inv => ({
    value: inv.id,
    label: inv.invoice_number,
    subtitle: catalogText(i18n, "text_2944777ec6bf", { value0: formatCurrency(inv.total_amount ?? inv.amount ?? 0) })
  }));

  // Fetch items when expanding
  const handleExpand = async (invoice: T, isExpanded: boolean) => {
    const invId = invoiceIdExtractor(invoice);
    if (isExpanded && !invoiceItems[invId] && !loadingItems[invId]) {
      setLoadingItems(prev => ({ ...prev, [invId]: true }));
      try {
        const items = await getInvoiceItems(invoice);
        setInvoiceItems(prev => ({ ...prev, [invId]: items }));
      } catch (error) {
        console.error(i18n.catalog["text_6d54b0001795"], error);
      } finally {
        setLoadingItems(prev => ({ ...prev, [invId]: false }));
      }
    }
  };

  // Handle Inner Table Selection
  const handleItemSelectionChange = (selectedIds: (string | number)[], invoiceId: number) => {
    // Process the selection change
    const processSelection = () => {
      const items = invoiceItems[invoiceId] || [];
      const invoiceSelectedItems: SelectedItem[] = items
        .filter(item => selectedIds.includes(item.id))
        .map(item => ({
          invoiceId: Number(invoiceId),
          invoiceItemId: Number(item.id),
          quantity: item.quantity,
          maxQuantity: item.quantity,
          productName: item.product?.name || (item as any).product_name || catalogText(i18n, "text_46d08c61c7d5", { value0: item.product_id }),
          unitPrice: item.unit_price,
          originalQuantity: item.original_quantity,
        }));

      let newSelectedItems: SelectedItem[];
      if (multiInvoiceSelection) {
        // Merge with existing items from other invoices
        const itemsFromOtherInvoices = selectedItems.filter(si => si.invoiceId !== invoiceId);
        newSelectedItems = [...itemsFromOtherInvoices, ...invoiceSelectedItems];
      } else {
        newSelectedItems = invoiceSelectedItems;
      }

      setSelectedItems(newSelectedItems);
      setSelectionMode(newSelectedItems.length > 0);
      onSelectionChange(newSelectedItems);
    };

    // Enforce Single Invoice Constraint if not multi-invoice
    if (!multiInvoiceSelection && currentInvoiceId && currentInvoiceId !== invoiceId && selectedIds.length > 0) {
      setConfirmData({
        message: i18n.catalog["text_7fcda5a704e7"],
        onConfirm: processSelection
      });
      setShowConfirm(true);
      return;
    }

    processSelection();
  };

  // Inner Columns definition
  const itemColumns: SelectableColumn<InvoiceItem>[] = [
    {
      key: "product_name",
      header: i18n.catalog["text_a79e304d96a1"],
      render: (item) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span>{item.product?.name || (item as any).product_name || item.product_id}</span>
          {item.returned_quantity && item.returned_quantity > 0 && (
            <span style={{
              fontSize: '10px',
              color: item.quantity === 0 ? 'var(--danger-color)' : 'var(--warning-color)',
              fontWeight: 'bold'
            }}>
              {item.quantity === 0 ? i18n.catalog["text_4af7488d2163"] : catalogText(i18n, "text_1922f97d21a6", { value0: item.returned_quantity })}
            </span>
          )}
        </div>
      )
    },
    {
      key: "quantity",
      header: i18n.catalog["text_935e21853946"],
      render: (item) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {item.original_quantity !== undefined && item.original_quantity !== item.quantity && (
            <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '0.9em' }}>
              {item.original_quantity}
            </span>
          )}
          <span style={{
            fontWeight: 'bold',
            color: item.quantity === 0 ? 'var(--danger-color)' : 'inherit'
          }}>
            {item.quantity}
          </span>
        </div>
      )
    },
    { key: "unit_price", header: i18n.catalog["text_259862e8b313"], render: (item) => formatCurrency(item.unit_price) },
    { key: "subtotal", header: i18n.catalog["text_baed6e999960"], render: (item) => formatCurrency(item.unit_price * item.quantity) },
  ];

  const clearSelection = () => {
    setSelectedItems([]);
    setSelectionMode(false);
    onSelectionChange([]);
  };



  return (
    <div className="selectable-invoice-table">
      {/* Search Bar 

      */}

      {FilterTabNavigation &&
        (<PageSubHeader
          title={i18n.catalog["text_62bd2aabbe5f"]}
          titleIcon="receipt"
          actions={
            <>
              {FilterTabNavigation}
            </>
          }
        />)}
      <div className="table-controls">
        <div className="search-wrapper">
          <SearchableSelect
            options={searchOptions}
            value={null} // Controlled manually via query interaction usually, but SearchableSelect handles input. 
            // Using it as a filter input mainly.
            onChange={handleSearchChange}
            placeholder={searchPlaceholder}
            className="invoice-search"
            // On search generic
            onSearch={(term) => {
              setSearchQuery(term);
              onSearch(term);
            }}
          />
        </div>
        <FloatingActionTableBar
          isVisible={selectionMode}
          message={catalogText(i18n, "text_6dc5241b1d0e", { value0: selectedItems.length, value1: new Set(selectedItems.map(i => i.invoiceId)).size })}
          actions={[
            {
              label: i18n.catalog["text_1aeab420bcd7"],
              icon: "repeat",
              onClick: openReturnDialog,
              variant: "primary"
            },
            {
              label: i18n.catalog["text_1551d5ed3d4d"],
              icon: "shield-check",
              onClick: clearSelection,
              variant: "secondary"
            }
          ]}
        />
      </div>

      {/* Main Table */}
      <ExpandableTable
        data={filteredInvoices}
        columns={columns}
        keyExtractor={keyExtractor}
        isLoading={isLoading}
        emptyMessage={emptyMessage}
        onExpand={handleExpand}
        isExpandable={isExpandable}
        renderExpandedRow={(invoice) => {
          if (renderCustomExpandedRow) {
            const custom = renderCustomExpandedRow(invoice);
            if (custom) return custom;
          }

          const invId = invoiceIdExtractor(invoice);
          const isLoading = loadingItems[invId];
          const items = invoiceItems[invId] || [];

          // Calculate selected IDs for this specific invoice table
          const currentInvoiceSelectedIds = selectedItems
            .filter(si => si.invoiceId === invId)
            .map(si => si.invoiceItemId);

          return (
            <>
              {isLoading ? (
                <div className="p-4 text-center text-secondary">{i18n.catalog["text_bb3a8d5d282e"]}</div>
              ) : (
                <div className="inner-table-container">

                  <SelectableTable
                    data={items}
                    columns={itemColumns}
                    keyExtractor={(item) => item.id}
                    selectedIds={currentInvoiceSelectedIds}
                    onSelectionChange={(ids) => handleItemSelectionChange(ids, invId)}
                    selectionMode={true} // Always allow selection in expanded row
                    isRowSelectable={(item) => item.quantity > 0}
                    emptyMessage={i18n.catalog["text_8d63376ad1e9"]}
                  // If user wants long press to toggle "selection mode" visually (checkboxes), pass state.
                  // Here we just enable checkboxes always for clarity or logic.
                  // User "Selection is not long-pressed" fix: 
                  // We enable strict selection mode.
                  />
                </div>
              )}
            </>
          );
        }}
      />

      {/* Ready-made Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={() => confirmData?.onConfirm()}
        message={confirmData?.message || ""}
        title={i18n.catalog["text_dbe619a3f14f"]}
        confirmText={i18n.catalog["text_b6d8927cdf78"]}
        cancelText={i18n.catalog["text_9a30dc2a96b8"]}
      />
    </div>
  );
}
