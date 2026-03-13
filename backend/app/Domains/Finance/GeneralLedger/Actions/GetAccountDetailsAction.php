<?php
namespace App\Domains\Finance\GeneralLedger\Actions;

use App\Domains\Finance\GeneralLedger\Models\GeneralLedger;
use App\Domains\Finance\ChartOfAccounts\Models\ChartOfAccount;
use App\Domains\Finance\GeneralLedger\Services\LedgerService;
class GetAccountDetailsAction
{
    public function __construct(
        private readonly LedgerService $ledgerService
    ) {}

    public function execute(array $filters): array
    {
        $accountCode = $filters['account_code'] ?? null;
        $accountId = $filters['account_id'] ?? null;
        
        if ($accountId) {
            $account = ChartOfAccount::find($accountId);
        } elseif ($accountCode) {
            $account = ChartOfAccount::where('account_code', $accountCode)->first();
        } else {
            throw new \Exception('account_code or account_id is required', 400);
        }
        
        if (!$account) {
            throw new \Exception('Account not found', 404);
        }

        $page = max(1, (int)($filters['page'] ?? 1));
        $perPage = min(100, max(1, (int)($filters['per_page'] ?? 50)));
        $startDate = $filters['start_date'] ?? $filters['date_from'] ?? null;
        $endDate = $filters['end_date'] ?? $filters['date_to'] ?? null;

        $query = GeneralLedger::where('account_id', $account->id)
            ->where('is_closed', false)
            ->with('createdBy');

        if ($startDate) {
            $query->where('voucher_date', '>=', $startDate);
        }

        if ($endDate) {
            $query->where('voucher_date', '<=', $endDate);
        }

        $total = $query->count();
        
        $transactions = $query->orderBy('voucher_date', 'desc')
            ->orderBy('id', 'desc')
            ->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->get()
            ->map(function ($entry) {
                return [
                    'id' => $entry->id,
                    'voucher_number' => $entry->voucher_number,
                    'voucher_date' => $entry->voucher_date,
                    'entry_type' => $entry->entry_type,
                    'amount' => $entry->amount,
                    'description' => $entry->description,
                    'reference_type' => $entry->reference_type,
                    'reference_id' => $entry->reference_id,
                    'created_by' => $entry->createdBy?->username,
                    'created_at' => $entry->created_at,
                ];
            });

        // Calculate running balance
        $balance = $this->ledgerService->getAccountBalance($account->account_code, $endDate);

        return [
            'account' => [
                'code' => $account->account_code,
                'name' => $account->account_name,
                'type' => $account->account_type,
                'current_balance' => $balance,
            ],
            'transactions' => $transactions,
            'pagination' => [
                'current_page' => $page,
                'per_page' => $perPage,
                'total_records' => $total,
                'total_pages' => ceil($total / $perPage),
            ],
        ];
    }
}
