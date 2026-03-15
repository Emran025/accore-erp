<?php

namespace App\Domains\Finance\Treasury\Actions;

use App\Domains\Finance\GeneralLedger\Models\GeneralLedger;
use App\Domains\Finance\GeneralLedger\Services\LedgerService;
use App\Domains\EnterpriseCore\Automation\Services\TelescopeService;

class ReverseJournalVoucherAction
{
    public function __construct(
        private readonly LedgerService $ledgerService,
    ) {}

    public function execute(string $voucherNumber): array
    {
        $voucher = GeneralLedger::where('voucher_number', $voucherNumber)
            ->where('entry_source', 'MANUAL')
            ->first();

        if (!$voucher) {
            throw new \Exception('Voucher not found', 404);
        }

        $reversed = GeneralLedger::where('voucher_number', $voucherNumber)
            ->where('description', 'like', '%Reversal%')
            ->where('entry_source', 'MANUAL')
            ->exists();

        if ($reversed) {
            throw new \Exception('Journal voucher has already been reversed', 400);
        }

        $this->ledgerService->reverseTransaction(
            $voucherNumber,
            "إلغاء قيد يومية رقم {$voucherNumber}"
        );
        
        TelescopeService::logOperation('REVERSE', 'journal_vouchers', null, null, ['voucher_number' => $voucherNumber]);

        return ['message' => 'Journal voucher reversed successfully'];
    }
}

