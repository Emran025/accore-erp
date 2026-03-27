<?php
namespace App\Domains\Finance\TaxCompliance\Actions;
use App\Domains\Finance\TaxCompliance\Models\TaxType;
use App\Domains\Finance\TaxCompliance\Models\TaxRate;
use App\Domains\EnterpriseCore\IdentityAccess\Services\PermissionService;
use Illuminate\Support\Facades\DB;

class CreateTaxTypeAction
{
    public function execute(array $data): TaxType
    {
        PermissionService::requirePermission('settings', 'create');

        return DB::transaction(function () use ($data) {
            $data['applicable_areas'] = isset($data['applicable_areas']) 
                ? json_encode($data['applicable_areas']) 
                : json_encode(['sales']);

            $taxType = TaxType::create([
                ...$data,
                'created_by' => auth()->id() ?? session('user_id'),
            ]);

            // Auto-create default active rate
            TaxRate::create([
                'tax_type_id' => $taxType->id,
                'rate' => $data['rate'] ?? 0,
                'fixed_amount' => $data['fixed_amount'] ?? 0,
                'effective_from' => now()->format('Y-m-d'),
                'is_default' => true,
            ]);

            return $taxType->load('taxRates');
        });
    }
}
