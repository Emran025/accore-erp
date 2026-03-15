<?php

namespace App\Domains\SupplyChain\PayablesExpenses\Actions;

use App\Domains\SupplyChain\SupplierSourcing\Models\ApSupplier;
use App\Domains\SupplyChain\PayablesExpenses\Models\ApTransaction;
use App\Domains\Finance\GeneralLedger\Models\GeneralLedger;
use App\Domains\Finance\GeneralLedger\Models\ChartOfAccount;
use App\Domains\Finance\GeneralLedger\Services\LedgerService;
use App\Domains\Finance\GeneralLedger\Services\ChartOfAccountsMappingService;
use Illuminate\Support\Facades\DB;

class DeleteApTransactionAction
{
    public function __construct(
        private readonly LedgerService $ledgerService,
        private readonly ChartOfAccountsMappingService $coaService
    ) {}

    public function execute(int $id): void
    {
        $transaction = ApTransaction::findOrFail($id);

        if ($transaction->type === 'invoice' && $transaction->reference_type === 'purchases') {
            throw new \Exception('Purchase invoices must be voided from the Purchases module.', 403);
        }

        DB::transaction(function () use ($transaction) {
            if ($transaction->voucher_number) {
                $this->ledgerService->reverseTransaction(
                    $transaction->voucher_number,
                    "Voided AP Transaction #{$transaction->id}"
                );
            }

            $transaction->update([
                'is_deleted' => true,
                'deleted_at' => now(),
            ]);

            $this->updateSupplierBalance($transaction->supplier_id);
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
