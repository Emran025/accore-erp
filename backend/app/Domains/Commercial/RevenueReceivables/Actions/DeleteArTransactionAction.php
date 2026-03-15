<?php

namespace App\Domains\Commercial\RevenueReceivables\Actions;

use App\Domains\Commercial\CRM\Models\ArCustomer;
use App\Domains\Commercial\RevenueReceivables\Models\ArTransaction;
use App\Domains\Finance\GeneralLedger\Models\GeneralLedger;
use App\Domains\Finance\GeneralLedger\Models\ChartOfAccount;
use App\Domains\Finance\GeneralLedger\Services\LedgerService;
use App\Domains\Finance\GeneralLedger\Services\ChartOfAccountsMappingService;
use Illuminate\Support\Facades\DB;

class DeleteArTransactionAction
{
    public function __construct(
        private readonly LedgerService $ledgerService,
        private readonly ChartOfAccountsMappingService $coaService
    ) {}

    public function execute(int $id): void
    {
        $transaction = ArTransaction::findOrFail($id);

        if ($transaction->type === 'invoice') {
            throw new \Exception('Cannot delete invoice transactions from here. Please use the Invoices module.', 400);
        }

        DB::transaction(function () use ($transaction) {
            if ($transaction->voucher_number) {
                $this->ledgerService->reverseTransaction(
                    $transaction->voucher_number,
                    "Reversal of AR Transaction #{$transaction->id}"
                );
            }

            $transaction->update([
                'is_deleted' => true,
                'deleted_at' => now(),
            ]);

            $this->updateCustomerBalance($transaction->customer_id);
        });
    }

    private function updateCustomerBalance(int $customerId): void
    {
        $customer = ArCustomer::findOrFail($customerId);
        $accounts = $this->coaService->getStandardAccounts();
        $arAccountId = ChartOfAccount::where('account_code', $accounts['accounts_receivable'])->value('id');

        $vouchers = ArTransaction::where('customer_id', $customerId)
            ->where('is_deleted', false)
            ->whereNotNull('voucher_number')
            ->pluck('voucher_number')
            ->toArray();

        $debits = GeneralLedger::whereIn('voucher_number', $vouchers)
            ->where('account_id', $arAccountId)
            ->where('entry_type', 'DEBIT')
            ->sum('amount');

        $credits = GeneralLedger::whereIn('voucher_number', $vouchers)
            ->where('account_id', $arAccountId)
            ->where('entry_type', 'CREDIT')
            ->sum('amount');

        $customer->update(['current_balance' => $debits - $credits]);
    }
}
