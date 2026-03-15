<?php

namespace App\Domains\SupplyChain\SupplierSourcing\Actions;

use App\Domains\SupplyChain\SupplierSourcing\Models\ApSupplier;
use Illuminate\Support\Facades\DB;

class CreateSupplierAction
{
    public function execute(array $data, int $userId): array
    {
        return DB::transaction(function () use ($data, $userId) {
            $exists = ApSupplier::where('name', $data['name'])
                ->orWhere(function ($q) use ($data) {
                    if (!empty($data['phone'])) {
                        $q->where('phone', $data['phone']);
                    }
                })
                ->exists();

            if ($exists) {
                throw new \Exception('Supplier with this name or phone already exists', 409);
            }

            // Handle Auto Number Generation if not provided
            if (empty($data['supplier_code']) && !empty($data['nr_object_id']) && !empty($data['nr_group_id'])) {
                $nrService = app(\App\Domains\EnterpriseCore\SystemOverview\Services\NumberRangeService::class);
                $data['supplier_code'] = $nrService->getNextNumber($data['nr_object_id'], $data['nr_group_id']);
            }

            $supplier = ApSupplier::create([
                ...$data,
                'created_by' => $userId,
            ]);

            return ['id' => $supplier->id];
        });
    }
}
