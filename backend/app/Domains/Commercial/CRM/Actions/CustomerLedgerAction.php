<?php

namespace App\Domains\Commercial\CRM\Actions;

use App\Domains\Commercial\CRM\Models\ArCustomer;
use App\Domains\Commercial\RevenueReceivables\Models\ArTransaction;
use App\Domains\Finance\GeneralLedger\Models\GeneralLedger;
use App\Domains\Finance\GeneralLedger\Models\ChartOfAccount;
use App\Domains\Finance\GeneralLedger\Services\ChartOfAccountsMappingService;

class CustomerLedgerAction
{
    public function __construct(private readonly ChartOfAccountsMappingService $coaService) {}

    public function execute(array $filters): array
    {
        $customerId = $filters['customer_id'];
        $customer = ArCustomer::findOrFail($customerId);

        $page = max(1, (int) ($filters['page'] ?? 1));
        $perPage = min(100, max(1, (int) ($filters['per_page'] ?? 20)));

        $query = ArTransaction::where('customer_id', $customerId);

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

        $voucherNumbers = (clone $query)->whereNotNull('voucher_number')->pluck('voucher_number')->toArray();
        $glStats = ['total_debit' => 0, 'total_credit' => 0, 'total_returns' => 0, 'total_receipts' => 0];
        
        $accounts = $this->coaService->getStandardAccounts();
        $arAccountId = ChartOfAccount::where('account_code', $accounts['accounts_receivable'])->value('id');

        if (!empty($voucherNumbers) && $arAccountId) {
            $invoiceVouchers = (clone $query)->where('type', 'invoice')->pluck('voucher_number')->toArray();
            if (!empty($invoiceVouchers)) {
                $glStats['total_debit'] = (float) GeneralLedger::whereIn('voucher_number', $invoiceVouchers)
                    ->where('account_id', $arAccountId)
                    ->where('entry_type', 'DEBIT')
                    ->sum('amount');
            }

            $receiptVouchers = (clone $query)->whereIn('type', ['payment', 'receipt'])->pluck('voucher_number')->toArray();
            if (!empty($receiptVouchers)) {
                $glStats['total_receipts'] = (float) GeneralLedger::whereIn('voucher_number', $receiptVouchers)
                    ->where('account_id', $arAccountId)
                    ->where('entry_type', 'CREDIT')
                    ->sum('amount');
            }

            $returnVouchers = (clone $query)->where('type', 'return')->pluck('voucher_number')->toArray();
            if (!empty($returnVouchers)) {
                $glStats['total_returns'] = (float) GeneralLedger::whereIn('voucher_number', $returnVouchers)
                    ->where('account_id', $arAccountId)
                    ->where('entry_type', 'CREDIT')
                    ->sum('amount');
            }

            $glStats['total_credit'] = $glStats['total_receipts'] + $glStats['total_returns'];
        }

        $total = $query->count();
        $transactions = $query->with('createdBy')
            ->orderBy('transaction_date', 'desc')
            ->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->get();

        return [
            'customer' => [
                'id' => $customer->id,
                'name' => $customer->name,
                'current_balance' => (float)$customer->current_balance,
            ],
            'data' => $transactions,
            'stats' => [
                'total_debit' => $glStats['total_debit'],
                'total_credit' => $glStats['total_credit'],
                'total_returns' => $glStats['total_returns'],
                'total_receipts' => $glStats['total_receipts'],
                'balance' => (float)$customer->current_balance,
                'transaction_count' => $total,
            ],
            'pagination' => [
                'current_page' => $page,
                'per_page' => $perPage,
                'total_records' => $total,
                'total_pages' => ceil($total / $perPage),
            ],
        ];
    }
}
