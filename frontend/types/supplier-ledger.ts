import { SelectableInvoice, SelectableInvoiceItem } from "@/components/ui";

export interface LedgerTransaction extends SelectableInvoice {
    transaction_date: string;
    type: "invoice" | "payment" | "return" | "receipt" | "commission" | "adjustment"
    description?: string;
    amount: number;
    created_by?: string;
    is_deleted: boolean;
    reference_type?: string;
    reference_id?: number;
    sales_representative_id?: number;
}

export interface Pagination {
    total_records: number;
    total_pages: number;
    current_page: number;
};
export interface LedgerStatsSuppliers {
    total_debit: number;
    total_credit: number;
    total_returns: number;
    total_payments: number;
    balance: number;
    transaction_count: number;
}

export interface Supplier {
    id: number;
    supplier_code?: string;
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    tax_number?: string;
    credit_limit: number;
    payment_terms: number;
    current_balance: number;
    created_at: string;
}



// This interface is for the detailed view of a purchase invoice
export interface DetailedInvoiceSuppliers extends SelectableInvoice {
    voucher_number?: string;
    supplier_name?: string;
    supplier_phone?: string;
    supplier_tax?: string;
    amount_paid?: number;
    vat_rate?: number;
    items: Array<SelectableInvoiceItem & { product_name?: string }>;
}
