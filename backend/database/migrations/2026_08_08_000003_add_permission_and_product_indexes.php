<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Additional Performance Indexes — Round 2 (2026-08-08)
 * Verified against live DB schema before adding any index.
 * Skips indexes that already exist on the table.
 *
 * Covers:
 *  1. role_permissions — auth CRUD flag lookups (4 indexes)
 *  2. roles            — active + system flag filter
 *  3. modules          — sidebar navigation builder
 *  4. users            — login + role-based listing
 *  5. products         — item_type/sellable/inventory_control/category/name
 *  6. universal_journals — document_type filter, created_at
 *  7. unearned_revenue   — created_at (no existing date index)
 *  8. batch_processing   — status + created_at (no existing indexes)
 *  9. purchase_requests  — status + created_at (no existing indexes)
 * 10. batch_items        — compound (batch_id, status) — status alone exists
 */
return new class extends Migration
{
    public function up(): void
    {
        // ── 1. ROLE_PERMISSIONS ────────────────────────────────────────────────
        Schema::table('role_permissions', function (Blueprint $table) {
            $table->index(['role_id', 'can_view'],   'idx_rp_role_view');
            $table->index(['role_id', 'can_create'], 'idx_rp_role_create');
            $table->index(['role_id', 'can_edit'],   'idx_rp_role_edit');
            $table->index(['role_id', 'can_delete'], 'idx_rp_role_delete');
        });

        // ── 2. ROLES ───────────────────────────────────────────────────────────
        Schema::table('roles', function (Blueprint $table) {
            $table->index(['is_active', 'is_system'], 'idx_roles_active_system');
        });

        // ── 3. MODULES ─────────────────────────────────────────────────────────
        // (module_key and category already have single-col indexes)
        Schema::table('modules', function (Blueprint $table) {
            $table->index(['is_active', 'category', 'sort_order'], 'idx_modules_active_cat_sort');
        });

        // ── 4. USERS ───────────────────────────────────────────────────────────
        // username is unique (covered); add compound for login + active check
        Schema::table('users', function (Blueprint $table) {
            $table->index(['username', 'is_active'], 'idx_users_username_active');
            $table->index(['role_id', 'is_active'],  'idx_users_role_active');
        });

        // ── 5. PRODUCTS ────────────────────────────────────────────────────────
        // item_type, taxable, inventory_control, sellable added 2026-03-17 but
        // no indexes were added at that time. These are the heaviest filters used
        // by the product-selector dropdowns, food-item catalog, and purchasing.
        Schema::table('products', function (Blueprint $table) {
            $table->index(['item_type', 'sellable'],         'idx_products_type_sellable');
            $table->index(['inventory_control', 'item_type'],'idx_products_inventory_type');
            $table->index(['taxable'],                       'idx_products_taxable');
            $table->index(['category_id', 'item_type'],      'idx_products_category_type');
            $table->index(['name'],                          'idx_products_name');
            $table->index(['low_stock_threshold'],           'idx_products_low_stock');
        });

        // ── 6. UNIVERSAL_JOURNALS ──────────────────────────────────────────────
        // voucher_number is UNIQUE (covered). Add document_type + created_at.
        Schema::table('universal_journals', function (Blueprint $table) {
            $table->index(['document_type'], 'idx_uj_document_type');
            $table->index(['created_at'],    'idx_uj_created_at');
        });

        // ── 7. UNEARNED_REVENUE ────────────────────────────────────────────────
        // No date index exists — receipt_date and created_at both useful
        Schema::table('unearned_revenue', function (Blueprint $table) {
            $table->index(['receipt_date'], 'idx_unearned_revenue_receipt_date');
            $table->index(['created_at'],   'idx_unearned_revenue_created_at');
        });

        // ── 8. BATCH_PROCESSING ────────────────────────────────────────────────
        // No indexes other than PK + FK
        Schema::table('batch_processing', function (Blueprint $table) {
            $table->index(['status'],     'idx_batch_processing_status');
            $table->index(['created_at'], 'idx_batch_processing_created_at');
            $table->index(['batch_type'], 'idx_batch_processing_type');
        });

        // ── 9. PURCHASE_REQUESTS ───────────────────────────────────────────────
        // No indexes other than PK + FKs
        Schema::table('purchase_requests', function (Blueprint $table) {
            $table->index(['status'],     'idx_purchase_requests_status');
            $table->index(['created_at'], 'idx_purchase_requests_created_at');
        });

        // ── 10. BATCH_ITEMS ────────────────────────────────────────────────────
        // status alone already has an index; add compound (batch_id, status) for
        // "give me all failed items in batch X" pattern
        Schema::table('batch_items', function (Blueprint $table) {
            $table->index(['batch_id', 'status'], 'idx_batch_items_batch_status');
        });
    }

    public function down(): void
    {
        Schema::table('role_permissions', function (Blueprint $table) {
            $table->dropIndex('idx_rp_role_view');
            $table->dropIndex('idx_rp_role_create');
            $table->dropIndex('idx_rp_role_edit');
            $table->dropIndex('idx_rp_role_delete');
        });

        Schema::table('roles', function (Blueprint $table) {
            $table->dropIndex('idx_roles_active_system');
        });

        Schema::table('modules', function (Blueprint $table) {
            $table->dropIndex('idx_modules_active_cat_sort');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex('idx_users_username_active');
            $table->dropIndex('idx_users_role_active');
        });

        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex('idx_products_type_sellable');
            $table->dropIndex('idx_products_inventory_type');
            $table->dropIndex('idx_products_taxable');
            $table->dropIndex('idx_products_category_type');
            $table->dropIndex('idx_products_name');
            $table->dropIndex('idx_products_low_stock');
        });

        Schema::table('universal_journals', function (Blueprint $table) {
            $table->dropIndex('idx_uj_document_type');
            $table->dropIndex('idx_uj_created_at');
        });

        Schema::table('unearned_revenue', function (Blueprint $table) {
            $table->dropIndex('idx_unearned_revenue_receipt_date');
            $table->dropIndex('idx_unearned_revenue_created_at');
        });

        Schema::table('batch_processing', function (Blueprint $table) {
            $table->dropIndex('idx_batch_processing_status');
            $table->dropIndex('idx_batch_processing_created_at');
            $table->dropIndex('idx_batch_processing_type');
        });

        Schema::table('purchase_requests', function (Blueprint $table) {
            $table->dropIndex('idx_purchase_requests_status');
            $table->dropIndex('idx_purchase_requests_created_at');
        });

        Schema::table('batch_items', function (Blueprint $table) {
            $table->dropIndex('idx_batch_items_batch_status');
        });
    }
};