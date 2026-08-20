<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * ERP Views Migration — ACCORE ERP (v3 — verified 2026-08-08)
 *
 * All column names verified against live DB schema before writing.
 *
 * Key schema facts:
 *  - users:           full_name (NOT name)
 *  - products:        low_stock_threshold (NOT reorder_level); no reorder_level column
 *  - ar_transactions: no updated_at
 *  - ap_transactions: no updated_at
 *
 * Views created (10 total):
 *  1.  v_account_balances    6.  v_ap_ageing
 *  2.  v_trial_balance       7.  v_inventory_position
 *  3.  v_invoice_summary     8.  v_payroll_summary
 *  4.  v_purchase_summary    9.  v_product_items
 *  5.  v_ar_ageing          10.  v_role_permissions
 */
return new class extends Migration
{
    public function up(): void
    {
        // ── 1. v_account_balances ──────────────────────────────────────────────
        DB::statement("CREATE OR REPLACE VIEW v_account_balances AS
            SELECT gl.account_id, gl.fiscal_period_id,
                coa.account_code, coa.account_name, coa.account_type, coa.parent_id,
                gl.entry_type,
                SUM(gl.amount) AS total_amount, COUNT(*) AS entry_count,
                MIN(gl.voucher_date) AS first_entry_date, MAX(gl.voucher_date) AS last_entry_date
            FROM general_ledger gl
            INNER JOIN chart_of_accounts coa ON coa.id = gl.account_id
            WHERE gl.is_closed = 0
            GROUP BY gl.account_id, gl.fiscal_period_id,
                coa.account_code, coa.account_name, coa.account_type,
                coa.parent_id, gl.entry_type");

        // ── 2. v_trial_balance ─────────────────────────────────────────────────
        DB::statement("CREATE OR REPLACE VIEW v_trial_balance AS
            SELECT ab.account_id, ab.fiscal_period_id,
                ab.account_code, ab.account_name, ab.account_type, ab.parent_id,
                COALESCE(SUM(CASE WHEN ab.entry_type='DEBIT'  THEN ab.total_amount ELSE 0 END),0) AS debit_total,
                COALESCE(SUM(CASE WHEN ab.entry_type='CREDIT' THEN ab.total_amount ELSE 0 END),0) AS credit_total,
                CASE WHEN ab.account_type IN ('Asset','Expense')
                    THEN COALESCE(SUM(CASE WHEN ab.entry_type='DEBIT'  THEN ab.total_amount ELSE 0 END),0)
                       - COALESCE(SUM(CASE WHEN ab.entry_type='CREDIT' THEN ab.total_amount ELSE 0 END),0)
                    ELSE COALESCE(SUM(CASE WHEN ab.entry_type='CREDIT' THEN ab.total_amount ELSE 0 END),0)
                       - COALESCE(SUM(CASE WHEN ab.entry_type='DEBIT'  THEN ab.total_amount ELSE 0 END),0)
                END AS net_balance
            FROM v_account_balances ab
            GROUP BY ab.account_id, ab.fiscal_period_id, ab.account_code,
                ab.account_name, ab.account_type, ab.parent_id");

        // ── 3. v_invoice_summary ───────────────────────────────────────────────
        DB::statement("CREATE OR REPLACE VIEW v_invoice_summary AS
            SELECT inv.id AS invoice_id, inv.invoice_number, inv.voucher_number,
                inv.payment_type, inv.is_reversed, inv.reversed_at,
                inv.created_at, inv.updated_at,
                inv.customer_id, cust.name AS customer_name,
                cust.phone AS customer_phone, cust.current_balance AS customer_balance,
                inv.user_id, u.full_name AS created_by_name,
                inv.sales_representative_id, sr.name AS sales_rep_name,
                COALESCE(gl_agg.total_debit,  0) AS gl_debit_total,
                COALESCE(gl_agg.total_credit, 0) AS gl_credit_total,
                COALESCE(tl_agg.total_tax,      0) AS tax_total,
                COALESCE(tl_agg.taxable_amount, 0) AS taxable_amount,
                COALESCE(ii_agg.item_count, 0) AS item_count,
                COALESCE(ii_agg.subtotal,   0) AS items_subtotal
            FROM invoices inv
            LEFT JOIN ar_customers cust         ON cust.id = inv.customer_id
            LEFT JOIN users u                   ON u.id    = inv.user_id
            LEFT JOIN sales_representatives sr  ON sr.id   = inv.sales_representative_id
            LEFT JOIN (
                SELECT voucher_number,
                    SUM(CASE WHEN entry_type='DEBIT'  THEN amount ELSE 0 END) AS total_debit,
                    SUM(CASE WHEN entry_type='CREDIT' THEN amount ELSE 0 END) AS total_credit
                FROM general_ledger WHERE is_closed=0 GROUP BY voucher_number
            ) gl_agg ON gl_agg.voucher_number = inv.voucher_number
            LEFT JOIN (
                SELECT taxable_id,
                    SUM(tax_amount) AS total_tax, SUM(taxable_amount) AS taxable_amount
                FROM tax_lines WHERE taxable_type='invoices' GROUP BY taxable_id
            ) tl_agg ON tl_agg.taxable_id = inv.id
            LEFT JOIN (
                SELECT invoice_id, COUNT(*) AS item_count, SUM(subtotal) AS subtotal
                FROM invoice_items GROUP BY invoice_id
            ) ii_agg ON ii_agg.invoice_id = inv.id");

        // ── 4. v_purchase_summary ──────────────────────────────────────────────
        DB::statement("CREATE OR REPLACE VIEW v_purchase_summary AS
            SELECT p.id AS purchase_id, p.voucher_number, p.purchase_date,
                p.payment_type, p.approval_status, p.is_reversed, p.reversed_at,
                p.created_at, p.quantity, p.unit_type, p.invoice_price,
                p.production_date, p.expiry_date, p.notes,
                p.product_id, pr.name AS product_name, pr.unit_name, pr.sub_unit_name,
                pr.stock_quantity AS current_stock, pr.weighted_average_cost,
                p.supplier_id, sup.name AS supplier_name,
                sup.phone AS supplier_phone, sup.current_balance AS supplier_balance,
                p.user_id, u.full_name AS created_by_name,
                p.approved_by, appr.full_name AS approved_by_name, p.approved_at,
                COALESCE(gl_agg.total_debit,  0) AS gl_debit_total,
                COALESCE(gl_agg.total_credit, 0) AS gl_credit_total,
                COALESCE(tl_agg.total_tax,      0) AS tax_total,
                COALESCE(tl_agg.taxable_amount, 0) AS taxable_amount
            FROM purchases p
            LEFT JOIN products     pr   ON pr.id   = p.product_id
            LEFT JOIN ap_suppliers sup  ON sup.id  = p.supplier_id
            LEFT JOIN users        u    ON u.id    = p.user_id
            LEFT JOIN users        appr ON appr.id = p.approved_by
            LEFT JOIN (
                SELECT voucher_number,
                    SUM(CASE WHEN entry_type='DEBIT'  THEN amount ELSE 0 END) AS total_debit,
                    SUM(CASE WHEN entry_type='CREDIT' THEN amount ELSE 0 END) AS total_credit
                FROM general_ledger WHERE is_closed=0 GROUP BY voucher_number
            ) gl_agg ON gl_agg.voucher_number = p.voucher_number
            LEFT JOIN (
                SELECT taxable_id,
                    SUM(tax_amount) AS total_tax, SUM(taxable_amount) AS taxable_amount
                FROM tax_lines WHERE taxable_type='purchases' GROUP BY taxable_id
            ) tl_agg ON tl_agg.taxable_id = p.id");

        // ── 5. v_ar_ageing ─────────────────────────────────────────────────────
        DB::statement("CREATE OR REPLACE VIEW v_ar_ageing AS
            SELECT art.customer_id,
                cust.name AS customer_name, cust.phone AS customer_phone,
                cust.tax_number, cust.current_balance AS ledger_balance,
                COALESCE(gl_agg.net_amount, 0) AS transaction_amount,
                art.type AS transaction_type, art.transaction_date,
                art.voucher_number, art.reference_type, art.reference_id,
                DATEDIFF(CURDATE(), DATE(art.transaction_date)) AS days_outstanding,
                CASE
                    WHEN DATEDIFF(CURDATE(), DATE(art.transaction_date)) <= 30 THEN '0-30'
                    WHEN DATEDIFF(CURDATE(), DATE(art.transaction_date)) <= 60 THEN '31-60'
                    WHEN DATEDIFF(CURDATE(), DATE(art.transaction_date)) <= 90 THEN '61-90'
                    ELSE '90+'
                END AS ageing_bucket
            FROM ar_transactions art
            INNER JOIN ar_customers cust ON cust.id = art.customer_id
            LEFT JOIN (
                SELECT voucher_number,
                    SUM(CASE WHEN entry_type='DEBIT'  THEN amount ELSE 0 END)
                  - SUM(CASE WHEN entry_type='CREDIT' THEN amount ELSE 0 END) AS net_amount
                FROM general_ledger WHERE is_closed=0 GROUP BY voucher_number
            ) gl_agg ON gl_agg.voucher_number = art.voucher_number
            WHERE art.is_deleted = 0");

        // ── 6. v_ap_ageing ─────────────────────────────────────────────────────
        DB::statement("CREATE OR REPLACE VIEW v_ap_ageing AS
            SELECT apt.supplier_id,
                sup.name AS supplier_name, sup.phone AS supplier_phone,
                sup.tax_number, sup.current_balance AS ledger_balance,
                sup.credit_limit, sup.payment_terms,
                COALESCE(gl_agg.net_amount, 0) AS transaction_amount,
                apt.type AS transaction_type, apt.transaction_date,
                apt.voucher_number, apt.reference_type, apt.reference_id,
                DATEDIFF(CURDATE(), DATE(apt.transaction_date)) AS days_outstanding,
                CASE
                    WHEN DATEDIFF(CURDATE(), DATE(apt.transaction_date)) <= 30 THEN '0-30'
                    WHEN DATEDIFF(CURDATE(), DATE(apt.transaction_date)) <= 60 THEN '31-60'
                    WHEN DATEDIFF(CURDATE(), DATE(apt.transaction_date)) <= 90 THEN '61-90'
                    ELSE '90+'
                END AS ageing_bucket,
                GREATEST(0, DATEDIFF(CURDATE(), DATE(apt.transaction_date)) - sup.payment_terms) AS days_overdue
            FROM ap_transactions apt
            INNER JOIN ap_suppliers sup ON sup.id = apt.supplier_id
            LEFT JOIN (
                SELECT voucher_number,
                    SUM(CASE WHEN entry_type='CREDIT' THEN amount ELSE 0 END)
                  - SUM(CASE WHEN entry_type='DEBIT'  THEN amount ELSE 0 END) AS net_amount
                FROM general_ledger WHERE is_closed=0 GROUP BY voucher_number
            ) gl_agg ON gl_agg.voucher_number = apt.voucher_number
            WHERE apt.is_deleted = 0");

        // ── 7. v_inventory_position ────────────────────────────────────────────
        // FIXED: products.low_stock_threshold (not reorder_level)
        DB::statement("CREATE OR REPLACE VIEW v_inventory_position AS
            SELECT p.id AS product_id, p.name AS product_name,
                p.item_type, p.taxable, p.inventory_control, p.sellable,
                p.unit_name, p.sub_unit_name, p.items_per_unit, p.stock_quantity,
                p.weighted_average_cost, p.unit_price AS selling_price,
                p.minimum_profit_margin, p.low_stock_threshold,
                cat.id AS category_id, cat.name AS category_name,
                COALESCE(ic_agg.total_available_qty,   0) AS costing_qty_available,
                COALESCE(ic_agg.total_inventory_value, 0) AS total_inventory_value,
                COALESCE(ic_agg.batch_count,           0) AS unsold_batch_count,
                COALESCE(cons_agg.total_consumed_qty,  0) AS total_consumed_qty,
                COALESCE(cons_agg.total_cogs,          0) AS total_cogs,
                CASE WHEN p.stock_quantity <= p.low_stock_threshold THEN 1 ELSE 0 END AS needs_reorder,
                CASE WHEN p.weighted_average_cost > 0
                    THEN ROUND(((p.unit_price - p.weighted_average_cost) / p.unit_price) * 100, 2)
                    ELSE NULL END AS gross_margin_pct
            FROM products p
            LEFT JOIN categories cat ON cat.id = p.category_id
            LEFT JOIN (
                SELECT product_id,
                    SUM(quantity - consumed_quantity) AS total_available_qty,
                    SUM((quantity - consumed_quantity) * unit_cost) AS total_inventory_value,
                    COUNT(*) AS batch_count
                FROM inventory_costing WHERE is_sold=0 GROUP BY product_id
            ) ic_agg ON ic_agg.product_id = p.id
            LEFT JOIN (
                SELECT ic2.product_id,
                    SUM(ic_cons.quantity)   AS total_consumed_qty,
                    SUM(ic_cons.total_cost) AS total_cogs
                FROM inventory_consumptions ic_cons
                INNER JOIN inventory_costing ic2 ON ic2.id = ic_cons.inventory_costing_id
                GROUP BY ic2.product_id
            ) cons_agg ON cons_agg.product_id = p.id");

        // ── 8. v_payroll_summary ───────────────────────────────────────────────
        DB::statement("CREATE OR REPLACE VIEW v_payroll_summary AS
            SELECT pc.id AS cycle_id, pc.cycle_name, pc.cycle_type,
                pc.period_start, pc.period_end, pc.payment_date, pc.status,
                pc.total_gross, pc.total_deductions, pc.total_net,
                pc.approved_at, pc.created_at,
                pc.approved_by, appr.full_name AS approved_by_name,
                pc.created_by, creator.full_name AS created_by_name,
                COALESCE(pi_agg.employee_count,      0) AS employee_count,
                COALESCE(pi_agg.active_count,        0) AS active_item_count,
                COALESCE(pi_agg.on_hold_count,       0) AS on_hold_item_count,
                COALESCE(pi_agg.computed_gross,      0) AS computed_gross,
                COALESCE(pi_agg.computed_deductions, 0) AS computed_deductions,
                COALESCE(pi_agg.computed_net,        0) AS computed_net,
                COALESCE(pi_agg.computed_allowances, 0) AS computed_allowances
            FROM payroll_cycles pc
            LEFT JOIN users appr    ON appr.id    = pc.approved_by
            LEFT JOIN users creator ON creator.id = pc.created_by
            LEFT JOIN (
                SELECT payroll_cycle_id,
                    COUNT(DISTINCT employee_id) AS employee_count,
                    SUM(CASE WHEN status='active'  THEN 1 ELSE 0 END) AS active_count,
                    SUM(CASE WHEN status='on_hold' THEN 1 ELSE 0 END) AS on_hold_count,
                    SUM(gross_salary)     AS computed_gross,
                    SUM(total_deductions) AS computed_deductions,
                    SUM(net_salary)       AS computed_net,
                    SUM(total_allowances) AS computed_allowances
                FROM payroll_items GROUP BY payroll_cycle_id
            ) pi_agg ON pi_agg.payroll_cycle_id = pc.id");

        // ── 9. v_product_items ─────────────────────────────────────────────────
        // Comprehensive product / food-item catalog view.
        // Covers: item_type filter, category, stock thresholds (low_stock_threshold),
        // expiry tracking from purchases, sales performance, last purchase info.
        // FIXED: low_stock_threshold; users.full_name
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
                COALESCE(ic_agg.available_qty,      0) AS costing_qty_available,
                COALESCE(ic_agg.inventory_value,    0) AS costing_inventory_value,
                COALESCE(ic_agg.unsold_batch_count, 0) AS unsold_batch_count,
                lp.last_expiry_date AS earliest_expiry_date,
                CASE WHEN lp.last_expiry_date IS NOT NULL
                      AND lp.last_expiry_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
                     THEN 1 ELSE 0 END AS expiring_soon,
                COALESCE(sales_agg.total_sold_qty,      0) AS total_sold_qty,
                COALESCE(sales_agg.total_revenue,       0) AS total_revenue,
                COALESCE(sales_agg.sales_invoice_count, 0) AS sales_invoice_count,
                p.created_by, u.full_name AS created_by_name,
                p.created_at, p.updated_at,
                p.purchase_currency_id, cur.code AS purchase_currency_code
            FROM products p
            LEFT JOIN categories cat ON cat.id = p.category_id
            LEFT JOIN users      u   ON u.id   = p.created_by
            LEFT JOIN currencies cur ON cur.id = p.purchase_currency_id
            LEFT JOIN (
                SELECT product_id,
                    MAX(purchase_date)  AS last_purchase_date,
                    MAX(expiry_date)    AS last_expiry_date,
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
                FROM purchases GROUP BY product_id
            ) lp ON lp.product_id = p.id
            LEFT JOIN ap_suppliers lp_sup ON lp_sup.id = lp.last_supplier_id
            LEFT JOIN (
                SELECT product_id,
                    SUM(quantity - consumed_quantity) AS available_qty,
                    SUM((quantity - consumed_quantity) * unit_cost) AS inventory_value,
                    COUNT(*) AS unsold_batch_count
                FROM inventory_costing WHERE is_sold=0 GROUP BY product_id
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

        // ── 10. v_role_permissions ─────────────────────────────────────────────
        // Flattened role x module CRUD matrix for auth middleware and UI.
        DB::statement("CREATE OR REPLACE VIEW v_role_permissions AS
            SELECT rp.id AS permission_id,
                rp.role_id, r.role_key, r.role_name_ar, r.role_name_en,
                r.is_system AS role_is_system, r.is_active AS role_is_active,
                rp.module_id, m.module_key, m.module_name_ar, m.module_name_en,
                m.category AS module_category, m.icon AS module_icon,
                m.sort_order AS module_sort_order, m.is_active AS module_is_active,
                rp.can_view, rp.can_create, rp.can_edit, rp.can_delete,
                CASE WHEN (rp.can_view OR rp.can_create OR rp.can_edit OR rp.can_delete) THEN 1 ELSE 0 END AS has_any_access,
                CASE WHEN (rp.can_view AND rp.can_create AND rp.can_edit AND rp.can_delete) THEN 1 ELSE 0 END AS has_full_access,
                rp.created_at, rp.updated_at
            FROM role_permissions rp
            INNER JOIN roles   r ON r.id = rp.role_id   AND r.is_active = 1
            INNER JOIN modules m ON m.id = rp.module_id AND m.is_active = 1");
    }

    public function down(): void
    {
        DB::statement('DROP VIEW IF EXISTS v_role_permissions');
        DB::statement('DROP VIEW IF EXISTS v_product_items');
        DB::statement('DROP VIEW IF EXISTS v_payroll_summary');
        DB::statement('DROP VIEW IF EXISTS v_inventory_position');
        DB::statement('DROP VIEW IF EXISTS v_ap_ageing');
        DB::statement('DROP VIEW IF EXISTS v_ar_ageing');
        DB::statement('DROP VIEW IF EXISTS v_purchase_summary');
        DB::statement('DROP VIEW IF EXISTS v_invoice_summary');
        DB::statement('DROP VIEW IF EXISTS v_trial_balance');
        DB::statement('DROP VIEW IF EXISTS v_account_balances');
    }
};
