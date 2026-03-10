import { SelectableInvoice, SelectableInvoiceItem } from "@/components/ui";

export interface LedgerStatsRepresentatives {
    total_commissions: number;
    total_payments: number;
    total_returns: number;
    balance: number;
    transaction_count: number;
}

export interface Representative {
    id: number;
    name: string;
    phone?: string;
    email?: string;
}

// This interface is for the detailed view of an invoice
export interface DetailedInvoiceRepresentatives extends SelectableInvoice {
    voucher_number?: string;
    salesperson_name?: string;
    customer_name?: string;
    amount_paid?: number;
    items: Array<SelectableInvoiceItem & { product_name?: string }>;
}
