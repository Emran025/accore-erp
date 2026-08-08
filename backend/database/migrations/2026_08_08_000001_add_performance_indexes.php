<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Performance Index Migration — ACCORE ERP
 *
 * Adds composite and targeted single-column indexes to every hot-path table
 * identified in the August 2026 database performance audit.
 *
 * Design principles applied:
 *  - Composite indexes are ordered by EQUALITY filters first, then RANGE filters.
 *  - Index names follow the convention:  idx_{table}_{col1}_{col2}
 *  - The migration is fully reversible via down().
 */
return new class extends Migration
{
    public function up(): void
    {
        // ── 1. GENERAL LEDGER ────────────────────────────────────────────────────
        // This is the highest-volume table. Every financial report touches it.
        // Three composite indexes eliminate full-table scans for the three primary
        // query patterns used by LedgerService.
        Schema::table('general_ledger', function (Blueprint $table) {
            // Trial balance & account balance:
            //   WHERE account_id = ? AND is_closed = false AND entry_type = ?
            $table->index(
                ['account_id', 'entry_type', 'is_closed'],
                'idx_gl_account_type_closed'
            );

            // As-of-date balance queries:
            //   WHERE account_id = ? AND is_closed = false AND voucher_date <= ?
            $table->index(
                ['account_id', 'is_closed', 'voucher_date'],
                'idx_gl_account_closed_date'
            );

            // Period-scoped P&L / TB:
            //   WHERE fiscal_period_id = ? AND account_id = ?
            $table->index(
                ['fiscal_period_id', 'account_id'],
                'idx_gl_period_account'
            );

            // Cost-centre reporting:
            //   WHERE cost_center_id = ? AND fiscal_period_id = ?
            $table->index(
                ['cost_center_id', 'fiscal_period_id'],
                'idx_gl_cost_center_period'
            );

            // Profit-centre reporting:
            //   WHERE profit_center_id = ? AND fiscal_period_id = ?
            $table->index(
                ['profit_center_id', 'fiscal_period_id'],
                'idx_gl_profit_center_period'
            );
        });

        // ── 2. INVOICES ──────────────────────────────────────────────────────────
        Schema::table('invoices', function (Blueprint $table) {
            // Customer invoice history (ordered list):
            //   WHERE customer_id = ? ORDER BY created_at DESC
            $table->index(['customer_id', 'created_at'], 'idx_invoices_customer_date');

            // Date-range listing & pagination:
            //   WHERE created_at BETWEEN ? AND ?
            $table->index(['created_at'], 'idx_invoices_created_at');

            // Status filtering (active, non-reversed):
            //   WHERE payment_type = ? AND is_reversed = ?
            $table->index(['payment_type', 'is_reversed'], 'idx_invoices_type_reversed');

            // Sales representative filtered list:
            //   WHERE sales_representative_id = ? ORDER BY created_at DESC
            $table->index(
                ['sales_representative_id', 'created_at'],
                'idx_invoices_sales_rep_date'
            );
        });

        // ── 3. INVOICE ITEMS ─────────────────────────────────────────────────────
        Schema::table('invoice_items', function (Blueprint $table) {
            // Product sales history:
            //   WHERE product_id = ?
            $table->index(['product_id'], 'idx_invoice_items_product');

            // Combined lookup for product per invoice:
            //   WHERE invoice_id = ? AND product_id = ?
            $table->index(['invoice_id', 'product_id'], 'idx_invoice_items_invoice_product');
        });

        // ── 4. PURCHASES ─────────────────────────────────────────────────────────
        Schema::table('purchases', function (Blueprint $table) {
            // Supplier purchase history:
            //   WHERE supplier_id = ? ORDER BY purchase_date DESC
            $table->index(['supplier_id', 'purchase_date'], 'idx_purchases_supplier_date');

            // Product purchase history:
            //   WHERE product_id = ? ORDER BY purchase_date DESC
            $table->index(['product_id', 'purchase_date'], 'idx_purchases_product_date');

            // Date-range listing:
            //   WHERE purchase_date BETWEEN ? AND ?
            $table->index(['purchase_date'], 'idx_purchases_date');

            // Pending approvals filtered by supplier:
            //   WHERE approval_status = 'pending' AND supplier_id = ?
            $table->index(['approval_status', 'supplier_id'], 'idx_purchases_status_supplier');
        });

        // ── 5. AR_TRANSACTIONS ───────────────────────────────────────────────────
        Schema::table('ar_transactions', function (Blueprint $table) {
            // Customer ledger ordered by date:
            //   WHERE customer_id = ? ORDER BY transaction_date DESC
            $table->index(
                ['customer_id', 'transaction_date'],
                'idx_ar_txn_customer_date'
            );

            // Date-range AR ageing:
            //   WHERE transaction_date BETWEEN ? AND ?
            $table->index(['transaction_date'], 'idx_ar_txn_date');

            // Active transaction type filtering:
            //   WHERE type = ? AND is_deleted = false
            $table->index(['type', 'is_deleted'], 'idx_ar_txn_type_deleted');

            // Polymorphic reference lookup:
            //   WHERE reference_type = ? AND reference_id = ?
            $table->index(['reference_type', 'reference_id'], 'idx_ar_txn_reference');
        });

        // ── 6. AP_TRANSACTIONS ───────────────────────────────────────────────────
        Schema::table('ap_transactions', function (Blueprint $table) {
            // Supplier ledger ordered by date:
            //   WHERE supplier_id = ? ORDER BY transaction_date DESC
            $table->index(
                ['supplier_id', 'transaction_date'],
                'idx_ap_txn_supplier_date'
            );

            // Date-range AP ageing:
            //   WHERE transaction_date BETWEEN ? AND ?
            $table->index(['transaction_date'], 'idx_ap_txn_date');

            // Active type filtering:
            //   WHERE type = ? AND is_deleted = false
            $table->index(['type', 'is_deleted'], 'idx_ap_txn_type_deleted');
        });

        // ── 7. TAX LINES ─────────────────────────────────────────────────────────
        Schema::table('tax_lines', function (Blueprint $table) {
            // Tax lookup per document + type:
            //   WHERE taxable_type = ? AND taxable_id = ? AND tax_type_code = ?
            $table->index(
                ['taxable_type', 'taxable_id', 'tax_type_code'],
                'idx_tax_lines_taxable_type_code'
            );

            // Tax authority scoped lookup:
            //   WHERE taxable_type = ? AND taxable_id = ? AND tax_authority_id = ?
            $table->index(
                ['taxable_type', 'taxable_id', 'tax_authority_id'],
                'idx_tax_lines_taxable_authority'
            );
        });

        // ── 8. INVENTORY COSTING ─────────────────────────────────────────────────
        Schema::table('inventory_costing', function (Blueprint $table) {
            // FIFO batch lookup — unsold batches for a product ordered by date:
            //   WHERE product_id = ? AND is_sold = false ORDER BY transaction_date ASC
            $table->index(
                ['product_id', 'is_sold', 'transaction_date'],
                'idx_inv_costing_product_sold_date'
            );

            // Costing method scoped lookup:
            //   WHERE product_id = ? AND costing_method = ? AND is_sold = false
            $table->index(
                ['product_id', 'costing_method', 'is_sold'],
                'idx_inv_costing_product_method_sold'
            );
        });

        // ── 9. INVENTORY CONSUMPTIONS ────────────────────────────────────────────
        Schema::table('inventory_consumptions', function (Blueprint $table) {
            // COGS lookup by source document:
            //   WHERE reference_type = ? AND reference_id = ?
            $table->index(
                ['reference_type', 'reference_id'],
                'idx_inv_consumption_reference'
            );

            // Aggregation by consumption type:
            //   WHERE consumption_type = ?
            $table->index(['consumption_type'], 'idx_inv_consumption_type');
        });

        // ── 10. EMPLOYEES ────────────────────────────────────────────────────────
        Schema::table('employees', function (Blueprint $table) {
            // Department roster filtered by status:
            //   WHERE department_id = ? AND employment_status = ?
            $table->index(
                ['department_id', 'employment_status'],
                'idx_employees_dept_status'
            );

            // Active employee count / HR dashboard:
            //   WHERE employment_status = 'active' AND is_active = true
            $table->index(
                ['employment_status', 'is_active'],
                'idx_employees_status_active'
            );

            // Manager hierarchy traversal:
            //   WHERE manager_id = ?
            $table->index(['manager_id'], 'idx_employees_manager');
        });

        // ── 11. PAYROLL ITEMS ────────────────────────────────────────────────────
        Schema::table('payroll_items', function (Blueprint $table) {
            // Payslip lookup (both directions are needed):
            //   WHERE payroll_cycle_id = ? AND employee_id = ?
            $table->index(
                ['payroll_cycle_id', 'employee_id'],
                'idx_payroll_items_cycle_employee'
            );

            // Per-employee payroll history by status:
            //   WHERE employee_id = ? AND status = ?
            $table->index(['employee_id', 'status'], 'idx_payroll_items_employee_status');
        });

        // ── 12. PAYROLL CYCLES ───────────────────────────────────────────────────
        Schema::table('payroll_cycles', function (Blueprint $table) {
            // Pending/approved cycle listing:
            //   WHERE status = ? ORDER BY period_start DESC
            $table->index(['status', 'period_start'], 'idx_payroll_cycles_status_period');

            // Cycle type filtered by period:
            //   WHERE cycle_type = ? AND period_start >= ?
            $table->index(['cycle_type', 'period_start'], 'idx_payroll_cycles_type_period');
        });

        // ── 13. FISCAL PERIODS ───────────────────────────────────────────────────
        Schema::table('fiscal_periods', function (Blueprint $table) {
            // getFiscalPeriodForDate() — range lookup + status filter:
            //   WHERE start_date <= ? AND end_date >= ? AND is_closed = false
            $table->index(
                ['start_date', 'end_date', 'is_closed'],
                'idx_fiscal_periods_range_closed'
            );

            // Open (not locked) period lookup:
            //   WHERE is_closed = false AND is_locked = false
            $table->index(
                ['is_closed', 'is_locked'],
                'idx_fiscal_periods_closed_locked'
            );
        });

        // ── 14. SALES RETURNS ────────────────────────────────────────────────────
        Schema::table('sales_returns', function (Blueprint $table) {
            // Returns per invoice ordered by date (original has invoice_id alone):
            //   WHERE invoice_id = ? ORDER BY created_at DESC
            $table->index(
                ['invoice_id', 'created_at'],
                'idx_sales_returns_invoice_date'
            );
        });

        // ── 15. CHART OF ACCOUNTS ────────────────────────────────────────────────
        Schema::table('chart_of_accounts', function (Blueprint $table) {
            // Trial balance active-account filter:
            //   WHERE account_type = ? AND is_active = true
            $table->index(
                ['account_type', 'is_active'],
                'idx_coa_type_active'
            );
        });

        // ── 16. EXPENSES ─────────────────────────────────────────────────────────
        Schema::table('expenses', function (Blueprint $table) {
            // Expense listing by date & payment type:
            //   WHERE expense_date BETWEEN ? AND ? AND payment_type = ?
            $table->index(
                ['expense_date', 'payment_type'],
                'idx_expenses_date_type'
            );

            // Supplier expense history:
            //   WHERE supplier_id = ? ORDER BY expense_date DESC
            $table->index(['supplier_id'], 'idx_expenses_supplier');
        });
    }

    public function down(): void
    {
        Schema::table('general_ledger', function (Blueprint $table) {
            $table->dropIndex('idx_gl_account_type_closed');
            $table->dropIndex('idx_gl_account_closed_date');
            $table->dropIndex('idx_gl_period_account');
            $table->dropIndex('idx_gl_cost_center_period');
            $table->dropIndex('idx_gl_profit_center_period');
        });

        Schema::table('invoices', function (Blueprint $table) {
            $table->dropIndex('idx_invoices_customer_date');
            $table->dropIndex('idx_invoices_created_at');
            $table->dropIndex('idx_invoices_type_reversed');
            $table->dropIndex('idx_invoices_sales_rep_date');
        });

        Schema::table('invoice_items', function (Blueprint $table) {
            $table->dropIndex('idx_invoice_items_product');
            $table->dropIndex('idx_invoice_items_invoice_product');
        });

        Schema::table('purchases', function (Blueprint $table) {
            $table->dropIndex('idx_purchases_supplier_date');
            $table->dropIndex('idx_purchases_product_date');
            $table->dropIndex('idx_purchases_date');
            $table->dropIndex('idx_purchases_status_supplier');
        });

        Schema::table('ar_transactions', function (Blueprint $table) {
            $table->dropIndex('idx_ar_txn_customer_date');
            $table->dropIndex('idx_ar_txn_date');
            $table->dropIndex('idx_ar_txn_type_deleted');
            $table->dropIndex('idx_ar_txn_reference');
        });

        Schema::table('ap_transactions', function (Blueprint $table) {
            $table->dropIndex('idx_ap_txn_supplier_date');
            $table->dropIndex('idx_ap_txn_date');
            $table->dropIndex('idx_ap_txn_type_deleted');
        });

        Schema::table('tax_lines', function (Blueprint $table) {
            $table->dropIndex('idx_tax_lines_taxable_type_code');
            $table->dropIndex('idx_tax_lines_taxable_authority');
        });

        Schema::table('inventory_costing', function (Blueprint $table) {
            $table->dropIndex('idx_inv_costing_product_sold_date');
            $table->dropIndex('idx_inv_costing_product_method_sold');
        });

        Schema::table('inventory_consumptions', function (Blueprint $table) {
            $table->dropIndex('idx_inv_consumption_reference');
            $table->dropIndex('idx_inv_consumption_type');
        });

        Schema::table('employees', function (Blueprint $table) {
            $table->dropIndex('idx_employees_dept_status');
            $table->dropIndex('idx_employees_status_active');
            $table->dropIndex('idx_employees_manager');
        });

        Schema::table('payroll_items', function (Blueprint $table) {
            $table->dropIndex('idx_payroll_items_cycle_employee');
            $table->dropIndex('idx_payroll_items_employee_status');
        });

        Schema::table('payroll_cycles', function (Blueprint $table) {
            $table->dropIndex('idx_payroll_cycles_status_period');
            $table->dropIndex('idx_payroll_cycles_type_period');
        });

        Schema::table('fiscal_periods', function (Blueprint $table) {
            $table->dropIndex('idx_fiscal_periods_range_closed');
            $table->dropIndex('idx_fiscal_periods_closed_locked');
        });

        Schema::table('sales_returns', function (Blueprint $table) {
            $table->dropIndex('idx_sales_returns_invoice_date');
        });

        Schema::table('chart_of_accounts', function (Blueprint $table) {
            $table->dropIndex('idx_coa_type_active');
        });

        Schema::table('expenses', function (Blueprint $table) {
            $table->dropIndex('idx_expenses_date_type');
            $table->dropIndex('idx_expenses_supplier');
        });
    }
};
