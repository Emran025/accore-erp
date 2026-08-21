<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Rebuilds the catalog view with an explicit collation for its GROUP_CONCAT
 * expressions. MariaDB may otherwise preserve a differing session collation
 * inside the persisted view definition, which prevents mariadb-dump from
 * reading its CREATE VIEW statement during a logical backup.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::statement("CREATE OR REPLACE VIEW v_product_items AS
            SELECT
                p.id AS product_id, p.name AS product_name,
                p.description AS product_description,
                p.item_type, p.taxable, p.inventory_control, p.sellable,
                p.category_id, cat.name AS category_name,
                p.unit_name, p.sub_unit_name, p.items_per_unit,
                p.unit_price AS selling_price, p.weighted_average_cost AS wac,
                p.minimum_profit_margin, p.low_stock_threshold,
                p.stock_quantity,
                CASE WHEN p.stock_quantity <= p.low_stock_threshold THEN 1 ELSE 0 END AS needs_reorder,
                CASE WHEN p.stock_quantity > 0 THEN 1 ELSE 0 END AS in_stock,
                lp.last_purchase_date, lp.last_purchase_price, lp.last_supplier_id,
                lp_sup.name AS last_supplier_name,
                lp.last_expiry_date,
                COALESCE(ic_agg.available_qty, 0) AS costing_qty_available,
                COALESCE(ic_agg.inventory_value, 0) AS costing_inventory_value,
                COALESCE(ic_agg.unsold_batch_count, 0) AS unsold_batch_count,
                lp.last_expiry_date AS earliest_expiry_date,
                CASE WHEN lp.last_expiry_date IS NOT NULL
                      AND lp.last_expiry_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
                     THEN 1 ELSE 0 END AS expiring_soon,
                COALESCE(sales_agg.total_sold_qty, 0) AS total_sold_qty,
                COALESCE(sales_agg.total_revenue, 0) AS total_revenue,
                COALESCE(sales_agg.sales_invoice_count, 0) AS sales_invoice_count,
                p.created_by, u.full_name AS created_by_name,
                p.created_at, p.updated_at,
                p.purchase_currency_id, cur.code AS purchase_currency_code
            FROM products p
            LEFT JOIN categories cat ON cat.id = p.category_id
            LEFT JOIN users u ON u.id = p.created_by
            LEFT JOIN currencies cur ON cur.id = p.purchase_currency_id
            LEFT JOIN (
                SELECT product_id,
                    MAX(purchase_date) AS last_purchase_date,
                    MAX(expiry_date) AS last_expiry_date,
                    SUBSTRING_INDEX(
                        GROUP_CONCAT(invoice_price ORDER BY purchase_date DESC SEPARATOR ',') COLLATE utf8mb4_unicode_ci,
                        _utf8mb4',' COLLATE utf8mb4_unicode_ci,
                        1
                    ) + 0 AS last_purchase_price,
                    SUBSTRING_INDEX(
                        GROUP_CONCAT(supplier_id ORDER BY purchase_date DESC SEPARATOR ',') COLLATE utf8mb4_unicode_ci,
                        _utf8mb4',' COLLATE utf8mb4_unicode_ci,
                        1
                    ) + 0 AS last_supplier_id
                FROM purchases
                GROUP BY product_id
            ) lp ON lp.product_id = p.id
            LEFT JOIN ap_suppliers lp_sup ON lp_sup.id = lp.last_supplier_id
            LEFT JOIN (
                SELECT product_id,
                    SUM(quantity - consumed_quantity) AS available_qty,
                    SUM((quantity - consumed_quantity) * unit_cost) AS inventory_value,
                    COUNT(*) AS unsold_batch_count
                FROM inventory_costing
                WHERE is_sold = 0
                GROUP BY product_id
            ) ic_agg ON ic_agg.product_id = p.id
            LEFT JOIN (
                SELECT ii.product_id,
                    SUM(ii.quantity) AS total_sold_qty,
                    SUM(ii.subtotal) AS total_revenue,
                    COUNT(DISTINCT ii.invoice_id) AS sales_invoice_count
                FROM invoice_items ii
                INNER JOIN invoices inv ON inv.id = ii.invoice_id AND inv.is_reversed = 0
                GROUP BY ii.product_id
            ) sales_agg ON sales_agg.product_id = p.id");
    }

    public function down(): void
    {
        // The preceding migration owns the view lifecycle. Retain the corrected
        // definition on rollback so a restored database is still dumpable.
    }
};
