<?php

namespace App\Domains\Finance\Treasury\Actions;

use App\Domains\Finance\GeneralLedger\Models\GeneralLedger;
use App\Domains\Finance\GeneralLedger\Services\LedgerService;
use App\Domains\EnterpriseCore\Automation\Services\TelescopeService;
use Illuminate\Support\Facades\DB;

class PostJournalVoucherAction
{
    public function execute(int $id, LedgerService $ledgerService): \Illuminate\Support\Collection
    {
        $voucher = GeneralLedger::with('lines.account')->findOrFail($id);

        if ($voucher->is_posted) {
            throw new \Exception('Voucher is already posted', 400);
        }

        return DB::transaction(function () use ($voucher, $ledgerService) {
            $glEntries = $voucher->lines->map(fn($line) => [
                'account_code' => $line->account->account_code,
                'entry_type' => $line->entry_type,
                'amount' => $line->amount,
                'description' => $line->description ?? $voucher->description,
            ])->toArray();

            $voucherNumber = $ledgerService->postTransaction(
                $glEntries,
                'journal_vouchers',
                $voucher->id,
                null,
                $voucher->voucher_date->format('Y-m-d')
            );

            $voucher->update([
                'is_posted' => true,
                'posted_at' => now(),
                'posted_by' => auth()->id(),
                'gl_voucher_number' => $voucherNumber
            ]);

            TelescopeService::logOperation('POST', 'journal_vouchers', $voucher->id, null, ['gl_voucher_number' => $voucherNumber]);

            return collect([
                'gl_voucher_number' => $voucherNumber,
                'message' => 'Journal voucher posted to GL successfully'
            ]);
        });
    }
}

