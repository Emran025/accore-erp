import { SelectableInvoice, SelectableInvoiceItem } from "@/components/ui";

export interface LedgerStatsCustomer {
    total_debit: number;
    total_credit: number;
    total_returns: number;
    total_receipts: number;
    balance: number;
    transaction_count: number;
}

export interface Customer {
    id: number;
    customer_code?: string;
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    tax_number?: string;
    total_debt: number;
    total_paid: number;
    balance: number;
    current_balance?: number;
    created_at: string;
}

// This interface is for the detailed view of an invoice
export interface DetailedInvoiceCustomers extends SelectableInvoice {
    voucher_number?: string;
    customer_name?: string;
    customer_phone?: string;
    customer_tax?: string;
    amount_paid?: number;
    vat_rate?: number;
    tax_lines?: Array<{
        tax_type_code: string;
        tax_authority_code: string;
        rate: number;
        taxable_amount: number;
        tax_amount: number;
    }>;
    items: Array<SelectableInvoiceItem & { product_name?: string }>;
}
