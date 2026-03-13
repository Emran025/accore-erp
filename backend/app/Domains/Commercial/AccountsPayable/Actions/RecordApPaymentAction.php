<?php

namespace App\Domains\Commercial\AccountsPayable\Actions;

use App\Domains\Commercial\AccountsPayable\Models\ApSupplier;
use App\Domains\Commercial\AccountsPayable\Models\ApTransaction;
use App\Domains\Finance\GeneralLedger\Models\GeneralLedger;
use App\Domains\Finance\ChartOfAccounts\Models\ChartOfAccount;
use App\Domains\Finance\GeneralLedger\Services\LedgerService;
use App\Domains\Finance\ChartOfAccounts\Services\ChartOfAccountsMappingService;
use Illuminate\Support\Facades\DB;

class RecordApPaymentAction
{
    public function __construct(
        private readonly LedgerService $ledgerService,
        private readonly ChartOfAccountsMappingService $coaService
    ) {}

    public function execute(array $data, int $userId): ApTransaction
    {
        return DB::transaction(function () use ($data, $userId) {
            $accounts = $this->coaService->getStandardAccounts();
            $voucherNumber = $this->ledgerService->getNextVoucherNumber('AP-PAY');

            $entries = [
                ['account_code' => $accounts['accounts_payable'], 'entry_type' => 'DEBIT', 'amount' => $data['amount']],
                ['account_code' => $accounts['cash'], 'entry_type' => 'CREDIT', 'amount' => $data['amount']],
            ];

            $this->ledgerService->postTransaction(
                $entries,
                'ap_transactions',
                null,
                $voucherNumber,
                $data['date'],
                'AUTOMATIC'
            );

            $transaction = ApTransaction::create([
                'supplier_id' => $data['supplier_id'],
                'type' => 'payment',
                'transaction_date' => $data['date'],
                'voucher_number' => $voucherNumber,
                'description' => "Payment via " . $data['payment_method'] . ($data['reference'] ? " (Ref: {$data['reference']})" : ""),
                'created_by' => $userId,
            ]);

            $this->updateSupplierBalance($data['supplier_id']);

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
