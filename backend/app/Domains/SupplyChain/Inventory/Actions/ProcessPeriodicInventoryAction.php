<?php
namespace App\Domains\SupplyChain\Inventory\Actions;

use App\Domains\SupplyChain\Inventory\Models\InventoryCount;
use App\Domains\EnterpriseCore\IAM\Services\PermissionService;
use App\Domains\DigitalPlatform\Automation\Services\TelescopeService;
use App\Domains\Finance\GeneralLedger\Services\LedgerService;
use App\Domains\Finance\ChartOfAccounts\Services\ChartOfAccountsMappingService;
use App\Domains\SupplyChain\Inventory\Services\InventoryCostingService;

use Illuminate\Support\Facades\DB;
class ProcessPeriodicInventoryAction
{
    public function __construct(
        private readonly LedgerService $ledgerService,
        private readonly ChartOfAccountsMappingService $coaService,
        private readonly InventoryCostingService $costingService
    ) {}

    public function execute(array $data): array
    {
        PermissionService::requirePermission('products', 'edit');

        $fiscalPeriodId = $data['fiscal_period_id'];

        return DB::transaction(function () use ($fiscalPeriodId) {
            $counts = InventoryCount::where('fiscal_period_id', $fiscalPeriodId)
                ->where('is_processed', false)
                ->with('product')
                ->get();

            if ($counts->isEmpty()) {
                throw new \Exception('No unprocessed inventory counts found for this period', 400);
            }

            $accounts = $this->coaService->getStandardAccounts();
            $voucherNumber = $this->ledgerService->getNextVoucherNumber('INV');

            foreach ($counts as $count) {
                if ($count->variance == 0) {
                    $count->update(['is_processed' => true, 'processed_at' => now()]);
                    continue;
                }

                $product = $count->product;
                $cost = $product->weighted_average_cost ?? 0;
                $adjustmentAmount = abs($count->variance * $cost);

                $product->update(['stock_quantity' => $count->counted_quantity]);

                $glEntries = [];

                if ($count->variance > 0) {
                    $glEntries[] = [
                        'account_code' => $accounts['inventory'],
                        'entry_type' => 'DEBIT',
                        'amount' => $adjustmentAmount,
                        'description' => "Inventory Count Adjustment - Product: {$product->name}",
                    ];
                    $glEntries[] = [
                        'account_code' => $accounts['other_revenue'],
                        'entry_type' => 'CREDIT',
                        'amount' => $adjustmentAmount,
                        'description' => "Inventory Count Adjustment - Product: {$product->name}",
                    ];
                } else {
                    $glEntries[] = [
                        'account_code' => $accounts['cost_of_goods_sold'],
                        'entry_type' => 'DEBIT',
                        'amount' => $adjustmentAmount,
                        'description' => "Inventory Count Adjustment - Product: {$product->name}",
                    ];
                    $glEntries[] = [
                        'account_code' => $accounts['inventory'],
                        'entry_type' => 'CREDIT',
                        'amount' => $adjustmentAmount,
                        'description' => "Inventory Count Adjustment - Product: {$product->name}",
                    ];
                }

                $this->costingService->recordAdjustment($product->id, $count->id, $count->variance);

                $countDate = $count->count_date;
                if ($countDate instanceof \DateTimeInterface) {
                    $countDate = $countDate->format('Y-m-d');
                }

                $this->ledgerService->postTransaction(
                    $glEntries,
                    'inventory_counts',
                    $count->id,
                    $voucherNumber,
                    $countDate
                );

                $count->update([
                    'is_processed' => true,
                    'processed_at' => now(),
                ]);
            }

            TelescopeService::logOperation('UPDATE', 'inventory_counts', null, null, ['fiscal_period_id' => $fiscalPeriodId]);

            return ['message' => 'Inventory counts processed successfully'];
        });
    }
}
