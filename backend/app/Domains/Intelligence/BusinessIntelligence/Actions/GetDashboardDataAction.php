<?php
namespace App\Domains\Intelligence\BusinessIntelligence\Actions;

use App\Domains\Commercial\SalesLifecycle\Models\Invoice;
use App\Domains\SupplyChain\Inventory\Models\Product;
use App\Domains\SupplyChain\Procurement\Models\Purchase;
use App\Domains\Finance\GeneralLedger\Models\GeneralLedger;
use App\Domains\SupplyChain\Procurement\Models\PurchaseRequest;
use Illuminate\Support\Collection;

class GetDashboardDataAction
{
    public function execute(array $data): Collection
    {
        $detail = $data['detail'] ?? null;

        if ($detail === 'low_stock') {
            return Product::where('stock_quantity', '<', 10)
                ->orderBy('stock_quantity')
                ->get(['id', 'name', 'stock_quantity as stock']);
        }

        if ($detail === 'expiring_soon') {
            return Purchase::whereBetween('expiry_date', [now(), now()->addDays(30)])
                ->whereNotNull('expiry_date')
                ->with('product')
                ->get()
                ->map(fn($p) => [
                    'id' => $p->product_id,
                    'name' => $p->product?->name,
                    'expiry_date' => $p->expiry_date,
                    'stock' => $p->product?->stock_quantity,
                ]);
        }

        $today = now()->format('Y-m-d');

        // Financial KPIs from GL (Single Source of Truth)
        $totalSales = GeneralLedger::whereHas('account', fn($q) => $q->where('account_type', 'Revenue'))
            ->selectRaw("SUM(CASE WHEN entry_type = 'CREDIT' THEN amount ELSE 0 END) - SUM(CASE WHEN entry_type = 'DEBIT' THEN amount ELSE 0 END) as net")
            ->value('net') ?? 0;

        $todaysSales = GeneralLedger::whereHas('account', fn($q) => $q->where('account_type', 'Revenue'))
            ->whereDate('voucher_date', $today)
            ->selectRaw("SUM(CASE WHEN entry_type = 'CREDIT' THEN amount ELSE 0 END) - SUM(CASE WHEN entry_type = 'DEBIT' THEN amount ELSE 0 END) as net")
            ->value('net') ?? 0;

        $totalExpenses = GeneralLedger::whereHas('account', fn($q) => $q->where('account_type', 'Expense'))
            ->selectRaw("SUM(CASE WHEN entry_type = 'DEBIT' THEN amount ELSE 0 END) - SUM(CASE WHEN entry_type = 'CREDIT' THEN amount ELSE 0 END) as net")
            ->value('net') ?? 0;

        $totalAssets = GeneralLedger::whereHas('account', fn($q) => $q->where('account_type', 'Asset'))
            ->selectRaw("SUM(CASE WHEN entry_type = 'DEBIT' THEN amount ELSE 0 END) - SUM(CASE WHEN entry_type = 'CREDIT' THEN amount ELSE 0 END) as net")
            ->value('net') ?? 0;

        // Breakdown
        $salesBreakdown = GeneralLedger::where('reference_type', 'invoices')
            ->join('invoices', 'general_ledger.reference_id', '=', 'invoices.id')
            ->whereHas('account', fn($q) => $q->where('account_type', 'Revenue'))
            ->select('invoices.payment_type')
            ->selectRaw("SUM(CASE WHEN general_ledger.entry_type = 'CREDIT' THEN general_ledger.amount ELSE -general_ledger.amount END) as value")
            ->selectRaw('COUNT(DISTINCT invoices.id) as count')
            ->groupBy('invoices.payment_type')
            ->get()
            ->mapWithKeys(fn($i) => [$i->payment_type ?? 'cash' => ['value' => (float)$i->value, 'count' => (int)$i->count]])
            ->all();

        // Operational KPIs
        $totalProducts = Product::count();
        $lowStockCount = Product::where('stock_quantity', '<', 10)->count();
        $recentSales = Invoice::with(['user', 'customer'])->orderBy('created_at', 'desc')->limit(10)->get();
        $pendingRequests = PurchaseRequest::where('status', 'pending')->with(['product', 'user'])->orderBy('created_at', 'desc')->limit(10)->get();

        return collect([
            'todays_sales' => (float)$todaysSales,
            'total_sales' => (float)$totalSales,
            'total_expenses' => (float)$totalExpenses,
            'total_assets' => (float)$totalAssets,
            'low_stock_count' => $lowStockCount,
            'sales_breakdown' => $salesBreakdown,
            'recent_sales' => $recentSales,
            'pending_requests' => $pendingRequests,
            'total_products' => $totalProducts,
        ]);
    }
}
