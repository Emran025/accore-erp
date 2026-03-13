<?php
namespace App\Domains\Finance\Taxation\Actions;
use App\Domains\Finance\Taxation\Models\TaxType;
use App\Domains\EnterpriseCore\IAM\Services\PermissionService;

class UpdateTaxTypeAction
{
    public function execute(array $data, int $id): array
    {
        PermissionService::requirePermission('settings', 'edit');

        $taxType = TaxType::findOrFail($id);

        if (array_key_exists('applicable_areas', $data)) {
            $data['applicable_areas'] = json_encode($data['applicable_areas']);
        }

        $taxType->update($data);

        if (isset($data['rate']) || isset($data['fixed_amount'])) {
            // Update the default rate or create a new effective one
            $defaultRate = $taxType->taxRates()->where('is_default', true)->first();
            if ($defaultRate) {
                $defaultRate->update([
                    'rate' => $data['rate'] ?? $defaultRate->rate,
                    'fixed_amount' => $data['fixed_amount'] ?? $defaultRate->fixed_amount,
                ]);
            }
        }

        return $taxType->fresh('taxRates')->toArray();
    }
}
