export interface PurchaseRequest {
    id: number;
    product_id: number | null;
    product_name: string | null;
    quantity: number;
    user_id: number | null;
    status: "pending" | "approved" | "rejected" | "done";
    notes: string | null;
    created_at: string;
    product?: {
        id: number;
        name: string;
        stock_quantity: number;
        low_stock_threshold: number;
    };
    user?: {
        id: number;
        name: string;
    };
}

export interface Category {
    id: number;
    name: string;
}

export interface Product {
    id: number;
    name: string;
    barcode: string;
    category_id: number | null;
    category_name?: string;
    unit_price: number;
    minimum_profit_margin: number;
    stock_quantity: number;
    unit_name: string;
    items_per_unit: number;
    sub_unit_name: string | null;
    description?: string;
    created_at: string;
    // UI mapping
    selling_price?: number;
    purchase_price?: number;
    stock?: number;
    min_stock?: number;
    unit_type?: string;
    profit_margin?: number;
    expiry_date?: string;
    item_type: 'product' | 'service' | 'raw_material';
    taxable: boolean;
    inventory_control: boolean;
    sellable: boolean;
}


export interface Purchase {
    id: number;
    product_id: number;
    product_name: string;
    quantity: number;
    unit_type: string;
    unit_price: number;
    total_price: number;
    supplier?: string;
    purchase_date: string;
    expiry_date?: string;
    notes?: string;
    created_at: string;
    voucher_number?: string;
    approval_status?: string;
    vat_rate?: number;
    vat_amount?: number;
    payment_type?: string;
}
