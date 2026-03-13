<?php
namespace App\Domains\Finance\Revenues\Actions;

use App\Domains\Finance\Revenues\Models\Revenue;
use App\Domains\Finance\GeneralLedger\Services\LedgerService;
use App\Domains\DigitalPlatform\Automation\Services\TelescopeService;

use App\Domains\EnterpriseCore\IAM\Services\PermissionService;

class DeleteRevenueAction
{
    public function __construct(
        private readonly LedgerService $ledgerService
    ) {}

    public function execute(int $id): void
    {
        PermissionService::requirePermission('revenues', 'delete');

        $revenue = Revenue::findOrFail($id);
        $oldValues = $revenue->toArray();

        // Reverse GL entries if voucher exists
        if ($revenue->voucher_number) {
            $this->ledgerService->reverseTransaction(
                $revenue->voucher_number,
                "Reversal for deleted Revenue #{$revenue->id}"
            );
        }

        $revenue->delete();

        TelescopeService::logOperation('DELETE', 'revenues', $id, $oldValues, null);
    }
}
