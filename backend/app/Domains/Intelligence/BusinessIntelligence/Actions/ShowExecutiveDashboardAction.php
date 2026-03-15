<?php

namespace App\Domains\Intelligence\BusinessIntelligence\Actions;

use App\Domains\Commercial\SalesLifecycle\Models\Invoice;
use App\Domains\SupplyChain\Inventory\Models\Product;
use App\Domains\SupplyChain\Procurement\Models\Purchase;
use App\Domains\Finance\GeneralLedger\Models\GeneralLedger;
use App\Domains\EnterpriseCore\IdentityAccess\Services\PermissionService;

class ShowExecutiveDashboardAction
{
    public function execute(array $data): array
    {
        PermissionService::requirePermission('reports', 'view');
        $detail = $data['detail'] ?? null;

        if ($detail === 'low_stock') {
            return Product::where('stock_quantity', '<', 10)
                ->orderBy('stock_quantity')
                ->get(['id', 'name', 'stock_quantity as stock'])
                ->toArray();
        }

        if ($detail === 'expiring_soon') {
            return Purchase::whereBetween('expiry_date', [now(), now()->addDays(30)])
                ->whereNotNull('expiry_date')
                ->with('product')
                ->get()
                ->map(function ($purchase) {
                    return [
                        'id' => $purchase->product_id,
                        'name' => $purchase->product?->name,
                        'expiry_date' => $purchase->expiry_date,
                        'stock' => $purchase->product?->stock_quantity,
                    ];
                })
                ->toArray();
        }

        $today = now()->format('Y-m-d');

        $totalSales = GeneralLedger::whereHas('account', function ($q) {
                $q->where('account_type', 'Revenue');
            })
            ->selectRaw("SUM(CASE WHEN entry_type = 'CREDIT' THEN amount ELSE 0 END) - SUM(CASE WHEN entry_type = 'DEBIT' THEN amount ELSE 0 END) as net_revenue")
            ->value('net_revenue') ?? 0;

        $salesBreakdown = GeneralLedger::where('reference_type', 'invoices')
            ->join('invoices', 'general_ledger.reference_id', '=', 'invoices.id')
            ->whereHas('account', function ($q) {
                $q->where('account_type', 'Revenue');
            })
            ->select('invoices.payment_type')
            ->selectRaw("SUM(CASE WHEN general_ledger.entry_type = 'CREDIT' THEN general_ledger.amount ELSE -general_ledger.amount END) as total_value")
            ->selectRaw('COUNT(DISTINCT invoices.id) as total_count')
            ->groupBy('invoices.payment_type')
            ->get()
            ->mapWithKeys(function ($item) {
                return [$item->payment_type ?? 'cash' => [
                    'value' => (float) $item->total_value,
                    'count' => (int) $item->total_count,
                ]];
            })
            ->toArray();

        $todaysSales = GeneralLedger::whereHas('account', function ($q) {
                $q->where('account_type', 'Revenue');
            })
            ->whereDate('voucher_date', $today)
            ->selectRaw("SUM(CASE WHEN entry_type = 'CREDIT' THEN amount ELSE 0 END) - SUM(CASE WHEN entry_type = 'DEBIT' THEN amount ELSE 0 END) as net_revenue")
            ->value('net_revenue') ?? 0;

        $todayBreakdown = GeneralLedger::where('reference_type', 'invoices')
            ->join('invoices', 'general_ledger.reference_id', '=', 'invoices.id')
            ->whereDate('general_ledger.voucher_date', $today)
            ->whereHas('account', function ($q) {
                $q->where('account_type', 'Revenue');
            })
            ->select('invoices.payment_type')
            ->selectRaw("SUM(CASE WHEN general_ledger.entry_type = 'CREDIT' THEN general_ledger.amount ELSE -general_ledger.amount END) as total")
            ->groupBy('invoices.payment_type')
            ->get()
            ->mapWithKeys(function ($item) {
                return [$item->payment_type ?? 'cash' => (float) $item->total];
            })
            ->toArray();

        $todayDate = $today;

        $totalProducts = Product::count();
        $lowStockCount = Product::where('stock_quantity', '<', 10)->count();
        $lowStockProducts = Product::where('stock_quantity', '<', 10)
            ->orderBy('stock_quantity')
            ->limit(10)
            ->get(['id', 'name', 'stock_quantity']);

        $expiringProducts = Purchase::whereBetween('expiry_date', [now(), now()->addDays(30)])
            ->whereNotNull('expiry_date')
            ->with('product')
            ->distinct('product_id')
            ->get()
            ->map(function ($purchase) {
                return [
                    'product_id' => $purchase->product_id,
                    'product_name' => $purchase->product->name,
                    'expiry_date' => $purchase->expiry_date,
                ];
            });

        $totalExpenses = GeneralLedger::whereHas('account', function ($q) {
                $q->where('account_type', 'Expense');
            })
            ->selectRaw("SUM(CASE WHEN entry_type = 'DEBIT' THEN amount ELSE 0 END) - SUM(CASE WHEN entry_type = 'CREDIT' THEN amount ELSE 0 END) as net_expense")
            ->value('net_expense') ?? 0;

        $todaysExpenses = GeneralLedger::whereHas('account', function ($q) {
                $q->where('account_type', 'Expense');
            })
            ->whereDate('voucher_date', $todayDate)
            ->selectRaw("SUM(CASE WHEN entry_type = 'DEBIT' THEN amount ELSE 0 END) - SUM(CASE WHEN entry_type = 'CREDIT' THEN amount ELSE 0 END) as net_expense")
            ->value('net_expense') ?? 0;

        $totalRevenues = GeneralLedger::whereHas('account', function ($q) {
                $q->where('account_type', 'Revenue');
            })
            ->selectRaw("SUM(CASE WHEN entry_type = 'CREDIT' THEN amount ELSE 0 END) - SUM(CASE WHEN entry_type = 'DEBIT' THEN amount ELSE 0 END) as net_revenue")
            ->value('net_revenue') ?? 0;

        $todaysRevenues = GeneralLedger::whereHas('account', function ($q) {
                $q->where('account_type', 'Revenue');
            })
            ->whereDate('voucher_date', $todayDate)
            ->selectRaw("SUM(CASE WHEN entry_type = 'CREDIT' THEN amount ELSE 0 END) - SUM(CASE WHEN entry_type = 'DEBIT' THEN amount ELSE 0 END) as net_revenue")
            ->value('net_revenue') ?? 0;

        $totalAssets = GeneralLedger::whereHas('account', function ($q) {
                $q->where('account_type', 'Asset');
            })
            ->selectRaw("SUM(CASE WHEN entry_type = 'DEBIT' THEN amount ELSE 0 END) - SUM(CASE WHEN entry_type = 'CREDIT' THEN amount ELSE 0 END) as net_assets")
            ->value('net_assets') ?? 0;

        $recentSales = Invoice::with(['user', 'customer'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($invoice) {
                return [
                    'id' => $invoice->id,
                    'invoice_number' => $invoice->invoice_number,
                    'total_amount' => $invoice->total_amount,
                    'payment_type' => $invoice->payment_type,
                    'customer_name' => $invoice->customer?->name,
                    'created_at' => $invoice->created_at,
                ];
            });

        $pendingRequests = \App\Domains\SupplyChain\Procurement\Models\PurchaseRequest::where('status', 'pending')
            ->with(['product', 'user'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return [
            'todays_sales' => (float) $todaysSales,
            'total_sales' => (float) $totalSales,
            'low_stock_count' => $lowStockCount,
            'low_stock_products' => $lowStockProducts,
            'expiring_products' => $expiringProducts,
            'recent_sales' => $recentSales,
            'pending_requests' => $pendingRequests,
            'sales_breakdown' => $salesBreakdown,
            'today_breakdown' => $todayBreakdown,
            'total_products' => $totalProducts,
            'total_expenses' => (float) $totalExpenses,
            'todays_expenses' => (float) $todaysExpenses,
            'total_revenues' => (float) $totalRevenues,
            'todays_revenues' => (float) $todaysRevenues,
            'total_assets' => (float) $totalAssets,
        ];
    }
}

