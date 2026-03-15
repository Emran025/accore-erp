<?php

namespace App\Domains\Finance\Treasury\Actions;

use App\Domains\Finance\GeneralLedger\Models\GeneralLedger;
use App\Domains\EnterpriseCore\Automation\Services\TelescopeService;

class DeleteJournalVoucherAction
{
    public function execute(int $id): array
    {
        $voucher = GeneralLedger::findOrFail($id);

        if ($voucher->is_posted) {
            throw new \Exception('Cannot delete a posted journal voucher. Reverse it instead.', 400);
        }

        $oldValues = $voucher->toArray();

        $voucher->lines()->delete();
        $voucher->delete();

        TelescopeService::logOperation('DELETE', 'journal_vouchers', $id, $oldValues, null);

        return ['message' => 'Journal voucher deleted successfully'];
    }
}

