<?php
namespace App\Domains\Finance\Revenues\Actions;

use App\Domains\Finance\Revenues\Models\Revenue;
use App\Domains\Finance\GeneralLedger\Services\LedgerService;
use App\Domains\Finance\ChartOfAccounts\Services\ChartOfAccountsMappingService;
use App\Domains\DigitalPlatform\Automation\Services\TelescopeService;
use Illuminate\Support\Facades\DB;
use App\Domains\EnterpriseCore\IAM\Services\PermissionService;

class CreateRevenueAction
{
    public function __construct(
        private readonly LedgerService $ledgerService,
        private readonly ChartOfAccountsMappingService $coaService
    ) {}

    public function execute(array $data): array
    {
        PermissionService::requirePermission('revenues', 'create');

        return DB::transaction(function () use ($data) {
            $amount = $data['amount'];

            // Generate voucher number FIRST
            $voucherNumber = $this->ledgerService->getNextVoucherNumber('REV');

            // Create revenue record
            $revenue = Revenue::create([
                'source' => $data['source'],
                'voucher_number' => $voucherNumber,
                'revenue_date' => $data['revenue_date'] ?? now(),
                'description' => $data['description'] ?? null,
                'user_id' => auth()->id() ?? session('user_id'),
            ]);

            // Post to GL
            $accounts = $this->coaService->getStandardAccounts();
            $glEntries = [
                [
                    'account_code' => $accounts['cash'],
                    'entry_type' => 'DEBIT',
                    'amount' => $amount,
                    'description' => "Revenue: {$revenue->source} - Voucher #$voucherNumber"
                ],
                [
                    'account_code' => $accounts['other_revenue'],
                    'entry_type' => 'CREDIT',
                    'amount' => $amount,
                    'description' => "Other Revenue - Voucher #$voucherNumber"
                ],
            ];

            $this->ledgerService->postTransaction(
                $glEntries,
                'revenues',
                $revenue->id,
                $voucherNumber,
                ($data['revenue_date'] ?? now()->format('Y-m-d'))
            );

            TelescopeService::logOperation('CREATE', 'revenues', $revenue->id, null, $data);

            return [
                'id' => $revenue->id,
                'voucher_number' => $voucherNumber,
            ];
        });
    }
}
