<?php

namespace App\Domains\SupplyChain\SupplierSourcing\Actions;

use App\Domains\SupplyChain\SupplierSourcing\Models\ApSupplier;
use App\Domains\SupplyChain\PayablesExpenses\Models\ApTransaction;
use App\Domains\Finance\GeneralLedger\Models\GeneralLedger;
use App\Domains\Finance\GeneralLedger\Models\ChartOfAccount;
use App\Domains\Finance\GeneralLedger\Services\ChartOfAccountsMappingService;
use Illuminate\Support\Collection;

class SupplierLedgerAction
{
    public function __construct(private readonly ChartOfAccountsMappingService $coaService) {}

    public function execute(array $filters): Collection
    {
        $supplierId = $filters['supplier_id'];
        $supplier = ApSupplier::findOrFail($supplierId);
        
        $page = max(1, (int) ($filters['page'] ?? 1));
        $perPage = min(100, max(1, (int) ($filters['per_page'] ?? 20)));

        $query = ApTransaction::where('supplier_id', $supplierId);

        if (!empty($filters['show_deleted'])) {
            $query->where('is_deleted', true);
        } else {
            $query->where('is_deleted', false);
        }

        if ($search = ($filters['search'] ?? null)) {
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%$search%")
                  ->orWhere('reference_id', 'like', "%$search%")
                  ->orWhere('voucher_number', 'like', "%$search%");
            });
        }

        if ($type = ($filters['type'] ?? null)) {
            $query->where('type', $type);
        }

        if ($dateFrom = ($filters['date_from'] ?? null)) {
            $query->whereDate('transaction_date', '>=', $dateFrom);
        }

        if ($dateTo = ($filters['date_to'] ?? null)) {
            $query->whereDate('transaction_date', '<=', $dateTo);
        }

        $glStats = ['total_debit' => 0, 'total_credit' => 0, 'total_returns' => 0, 'total_payments' => 0];
        $standardAccounts = $this->coaService->getStandardAccounts();
        $apAccountId = ChartOfAccount::where('account_code', $standardAccounts['accounts_payable'])->value('id');

        $invoiceV = (clone $query)->where('type', 'invoice')->whereNotNull('voucher_number')->pluck('voucher_number')->toArray();
        $paymentV = (clone $query)->where('type', 'payment')->whereNotNull('voucher_number')->pluck('voucher_number')->toArray();
        $returnV = (clone $query)->where('type', 'return')->whereNotNull('voucher_number')->pluck('voucher_number')->toArray();

        if (!empty($invoiceV) && $apAccountId) {
            $glStats['total_debit'] = (float) GeneralLedger::whereIn('voucher_number', $invoiceV)
                ->where('account_id', $apAccountId)
                ->where('entry_type', 'CREDIT')
                ->sum('amount');
        }

        if (!empty($paymentV) && $apAccountId) {
            $glStats['total_payments'] = (float) GeneralLedger::whereIn('voucher_number', $paymentV)
                ->where('account_id', $apAccountId)
                ->where('entry_type', 'DEBIT')
                ->sum('amount');
            $glStats['total_credit'] += $glStats['total_payments'];
        }

        if (!empty($returnV) && $apAccountId) {
            $glStats['total_returns'] = (float) GeneralLedger::whereIn('voucher_number', $returnV)
                ->where('account_id', $apAccountId)
                ->where('entry_type', 'DEBIT')
                ->sum('amount');
            $glStats['total_credit'] += $glStats['total_returns'];
        }

        $total = $query->count();
        $transactions = $query->with('createdBy')
            ->orderBy('transaction_date', 'desc')
            ->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->get();

        $today = now();
        $todayStr = $today->format('Y-m-d');
        $d30 = $today->copy()->subDays(30)->format('Y-m-d');
        $d60 = $today->copy()->subDays(60)->format('Y-m-d');
        $d90 = $today->copy()->subDays(90)->format('Y-m-d');

        $invoiceTxns = ApTransaction::where('supplier_id', $supplierId)
            ->where('is_deleted', false)
            ->where('type', 'invoice')
            ->whereNotNull('voucher_number')
            ->get(['voucher_number', 'transaction_date']);

        $aging = ['current' => 0, '1_30' => 0, '31_60' => 0, '61_90' => 0, 'over_90' => 0];
        foreach ($invoiceTxns as $txn) {
            $txnAmount = $apAccountId ? (float) GeneralLedger::where('voucher_number', $txn->voucher_number)
                ->where('account_id', $apAccountId)
                ->where('entry_type', 'CREDIT')
                ->sum('amount') : 0;
            
            $txnDate = $txn->transaction_date->format('Y-m-d');
            if ($txnDate >= $todayStr) $aging['current'] += $txnAmount;
            elseif ($txnDate >= $d30) $aging['1_30'] += $txnAmount;
            elseif ($txnDate >= $d60) $aging['31_60'] += $txnAmount;
            elseif ($txnDate >= $d90) $aging['61_90'] += $txnAmount;
            else $aging['over_90'] += $txnAmount;
        }

        return collect([
            'supplier' => [
                'id' => $supplier->id,
                'name' => $supplier->name,
                'current_balance' => (float)$supplier->current_balance,
            ],
            'aging' => $aging,
            'data' => $transactions,
            'stats' => [
                'total_debit' => $glStats['total_debit'],
                'total_credit' => $glStats['total_credit'],
                'total_returns' => $glStats['total_returns'],
                'total_payments' => $glStats['total_payments'],
                'balance' => (float)$supplier->current_balance,
                'transaction_count' => $total,
            ],
            'pagination' => [
                'current_page' => $page,
                'per_page' => $perPage,
                'total_records' => $total,
                'total_pages' => ceil($total / $perPage),
            ],
        ]);
    }
}
