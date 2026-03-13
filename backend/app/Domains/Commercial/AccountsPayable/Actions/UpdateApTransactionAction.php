<?php

namespace App\Domains\Commercial\AccountsPayable\Actions;

use App\Domains\Commercial\AccountsPayable\Models\ApSupplier;
use App\Domains\Commercial\AccountsPayable\Models\ApTransaction;
use App\Domains\Finance\GeneralLedger\Models\GeneralLedger;
use App\Domains\Finance\ChartOfAccounts\Models\ChartOfAccount;
use App\Domains\Finance\ChartOfAccounts\Services\ChartOfAccountsMappingService;
use Illuminate\Support\Facades\DB;

class UpdateApTransactionAction
{
    public function __construct(
        private readonly ChartOfAccountsMappingService $coaService
    ) {}

    public function execute(array $data): ApTransaction
    {
        $transaction = ApTransaction::findOrFail($data['id']);

        return DB::transaction(function () use ($data, $transaction) {
            $transaction->update(collect($data)->only(['description', 'transaction_date', 'is_deleted'])->toArray());

            if (isset($data['is_deleted'])) {
                $this->updateSupplierBalance($transaction->supplier_id);
            }

            return $transaction;
        });
    }

    private function updateSupplierBalance(int $supplierId): void
    {
        $supplier = ApSupplier::findOrFail($supplierId);
        $accounts = $this->coaService->getStandardAccounts();
        $apAccountId = ChartOfAccount::where('account_code', $accounts['accounts_payable'])->value('id');

        $vouchers = ApTransaction::where('supplier_id', $supplierId)
            ->where('is_deleted', false)
            ->whereNotNull('voucher_number')
            ->pluck('voucher_number')
            ->toArray();

        $credits = GeneralLedger::whereIn('voucher_number', $vouchers)
            ->where('account_id', $apAccountId)
            ->where('entry_type', 'CREDIT')
            ->sum('amount');

        $debits = GeneralLedger::whereIn('voucher_number', $vouchers)
            ->where('account_id', $apAccountId)
            ->where('entry_type', 'DEBIT')
            ->sum('amount');

        $supplier->update(['current_balance' => $credits - $debits]);
    }
}
