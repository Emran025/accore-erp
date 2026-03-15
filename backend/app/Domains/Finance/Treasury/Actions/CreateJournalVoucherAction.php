<?php

namespace App\Domains\Finance\Treasury\Actions;

use App\Domains\Finance\GeneralLedger\Models\ChartOfAccount;
use App\Domains\Finance\GeneralLedger\Services\LedgerService;
use App\Domains\EnterpriseCore\Automation\Services\TelescopeService;
use Illuminate\Support\Facades\DB;

class CreateJournalVoucherAction
{
    public function __construct(
        private readonly LedgerService $ledgerService,
    ) {}

    public function execute(array $data): array
    {
        return DB::transaction(function () use ($data) {
            $totalDebits = 0;
            $totalCredits = 0;
            $validatedEntries = [];

            foreach ($data['entries'] as $entry) {
                $account = ChartOfAccount::where('account_code', $entry['account_code'])
                    ->where('is_active', true)
                    ->first();

                if (!$account) {
                    throw new \Exception("Account code '{$entry['account_code']}' not found or inactive", 400);
                }

                $validatedEntries[] = [
                    'account_id' => $account->id,
                    'account_code' => $entry['account_code'],
                    'entry_type' => $entry['entry_type'],
                    'amount' => $entry['amount'],
                    'description' => $entry['description'] ?? $data['description'],
                    'cost_center_id' => $entry['cost_center_id'] ?? null,
                    'profit_center_id' => $entry['profit_center_id'] ?? null,
                ];

                if ($entry['entry_type'] === 'DEBIT') {
                    $totalDebits += $entry['amount'];
                } else {
                    $totalCredits += $entry['amount'];
                }
            }

            // CRITICAL: Double-entry validation
            if (abs($totalDebits - $totalCredits) > 0.01) {
                throw new \Exception("Debits ($totalDebits) must equal Credits ($totalCredits)", 400);
            }

            $voucherNumber = $this->ledgerService->getNextVoucherNumber('JV');

            $glEntries = array_map(fn($entry) => [
                'account_code' => $entry['account_code'],
                'entry_type' => $entry['entry_type'],
                'amount' => $entry['amount'],
                'description' => $entry['description'],
                'cost_center_id' => $entry['cost_center_id'],
                'profit_center_id' => $entry['profit_center_id'],
            ], $validatedEntries);

            $this->ledgerService->postTransaction(
                $glEntries,
                'journal_vouchers',
                null,
                $voucherNumber,
                $data['voucher_date'],
                'MANUAL'
            );

            TelescopeService::logOperation('CREATE', 'journal_vouchers', null, null, $data);

            return ['voucher_number' => $voucherNumber];
        });
    }
}
