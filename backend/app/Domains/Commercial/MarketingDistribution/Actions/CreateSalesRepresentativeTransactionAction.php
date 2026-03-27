<?php

namespace App\Domains\Commercial\MarketingDistribution\Actions;

use App\Domains\Commercial\SalesLifecycle\Models\SalesRepresentative;
use App\Domains\Commercial\SalesLifecycle\Models\SalesRepresentativeTransaction;
use App\Domains\Finance\GeneralLedger\Services\LedgerService;
use App\Domains\Finance\GeneralLedger\Services\ChartOfAccountsMappingService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Collection;

class CreateSalesRepresentativeTransactionAction
{
    public function __construct(
        private readonly LedgerService $ledgerService,
        private readonly ChartOfAccountsMappingService $coaService
    ) {}

    public function execute(array $data, int $userId): Collection
    {
        return DB::transaction(function () use ($data, $userId) {
            $amount = (float)$data['amount'];
            $glEntries = [];

            // Debit/Credit accounts depending on the type of transaction
            if ($data['type'] === 'payment') {
                $glEntries[] = [
                    'account_code' => $this->coaService->getStandardAccounts()['sales_commission_expense'] ?? '5007',
                    'entry_type' => 'DEBIT',
                    'amount' => $amount,
                    'description' => $data['description'] ?? 'Sales Representative Payment'
                ];
                $glEntries[] = [
                    'account_code' => $this->coaService->getStandardAccounts()['cash'],
                    'entry_type' => 'CREDIT',
                    'amount' => $amount,
                    'description' => $data['description'] ?? 'Sales Representative Payment'
                ];
            } else {
                $glEntries[] = [
                    'account_code' => $this->coaService->getStandardAccounts()['sales_commission_expense'] ?? '5007',
                    'entry_type' => 'DEBIT',
                    'amount' => $amount,
                    'description' => $data['description'] ?? 'Sales Representative Adjustment'
                ];
                $glEntries[] = [
                    'account_code' => $this->coaService->getStandardAccounts()['accounts_payable'] ?? '2001',
                    'entry_type' => 'CREDIT',
                    'amount' => $amount,
                    'description' => $data['description'] ?? 'Sales Representative Adjustment'
                ];
            }

            $voucherNumber = $this->ledgerService->postTransaction(
                $glEntries,
                'sales_representative_transactions',
                null,
                null,
                $data['date'] ?? now()->format('Y-m-d'),
                'MANUAL'
            );

            $transaction = SalesRepresentativeTransaction::create([
                'sales_representative_id' => $data['sales_representative_id'],
                'type' => $data['type'],
                'voucher_number' => $voucherNumber,
                'description' => $data['description'] ?? '',
                'transaction_date' => $data['date'] ?? now(),
                'created_by' => $userId,
            ]);

            $balanceChange = ($data['type'] === 'payment') ? -$amount : $amount;
            
            SalesRepresentative::where('id', $data['sales_representative_id'])
                ->increment('current_balance', $balanceChange);

            return collect([
                'id' => $transaction->id,
                'voucher_number' => $voucherNumber
            ]);
        });
    }
}
