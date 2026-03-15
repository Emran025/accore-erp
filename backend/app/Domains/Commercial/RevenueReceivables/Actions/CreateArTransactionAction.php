<?php

namespace App\Domains\Commercial\RevenueReceivables\Actions;

use App\Domains\Commercial\CRM\Models\ArCustomer;
use App\Domains\Commercial\RevenueReceivables\Models\ArTransaction;
use App\Domains\Finance\GeneralLedger\Models\GeneralLedger;
use App\Domains\Finance\GeneralLedger\Models\ChartOfAccount;
use App\Domains\Finance\GeneralLedger\Services\LedgerService;
use App\Domains\Finance\GeneralLedger\Services\ChartOfAccountsMappingService;
use Illuminate\Support\Facades\DB;

class CreateArTransactionAction
{
    public function __construct(
        private readonly LedgerService $ledgerService,
        private readonly ChartOfAccountsMappingService $coaService
    ) {}

    public function execute(array $data, int $userId): ArTransaction
    {
        return DB::transaction(function () use ($data, $userId) {
            $amount = $data['amount'];
            $mappings = $this->coaService->getStandardAccounts();
            $glEntries = [];
            $customer = ArCustomer::findOrFail($data['customer_id']);

            if ($data['type'] === 'payment' || $data['type'] === 'receipt') {
                $glEntries[] = [
                    'account_code' => $mappings['cash'],
                    'entry_type' => 'DEBIT',
                    'amount' => $amount,
                    'description' => "Receipt from customer: {$customer->name} - " . ($data['description'] ?? '')
                ];
                $glEntries[] = [
                    'account_code' => $mappings['accounts_receivable'],
                    'entry_type' => 'CREDIT',
                    'amount' => $amount,
                    'description' => "Receipt from customer: {$customer->name} (AR Update)"
                ];
            } else {
                $glEntries[] = [
                    'account_code' => $mappings['sales_revenue'],
                    'entry_type' => 'DEBIT',
                    'amount' => $amount,
                    'description' => "Return from customer: {$customer->name} - " . ($data['description'] ?? '')
                ];
                $glEntries[] = [
                    'account_code' => $mappings['accounts_receivable'],
                    'entry_type' => 'CREDIT',
                    'amount' => $amount,
                    'description' => "Return from customer: {$customer->name} (AR Update)"
                ];
            }

            $voucherNumber = $this->ledgerService->postTransaction(
                $glEntries,
                'ar_transactions',
                null,
                null,
                $data['date'] ?? now()->format('Y-m-d')
            );

            $transaction = ArTransaction::create([
                'customer_id' => $data['customer_id'],
                'type' => $data['type'],
                'voucher_number' => $voucherNumber,
                'description' => ($data['description'] ?? '') . " [Voucher: $voucherNumber]",
                'transaction_date' => $data['date'] ?? now(),
                'created_by' => $userId,
            ]);

            GeneralLedger::where('voucher_number', $voucherNumber)
                ->where('reference_type', 'ar_transactions')
                ->update(['reference_id' => $transaction->id]);

            $this->updateCustomerBalance($data['customer_id']);

            return $transaction;
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
