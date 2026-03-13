<?php

namespace App\Domains\Finance\JournalVouchers\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\Finance\GeneralLedger\Models\GeneralLedger;
use App\Domains\Finance\GeneralLedger\Services\LedgerService;
use App\Domains\DigitalPlatform\Automation\Services\TelescopeService;
use Illuminate\Http\JsonResponse;

use App\Domains\EnterpriseCore\IAM\Services\PermissionService;

class ReverseJournalVoucherAction
{
    public function __construct(
        private readonly LedgerService $ledgerService,
    ) {}

    public function execute(string $voucherNumber): void
    {
        PermissionService::requirePermission('journal_vouchers', 'delete');

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
    }
}
