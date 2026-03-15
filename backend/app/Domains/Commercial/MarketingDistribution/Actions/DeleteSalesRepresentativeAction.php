<?php

namespace App\Domains\Commercial\MarketingDistribution\Actions;

use App\Domains\Commercial\SalesLifecycle\Models\SalesRepresentative;

class DeleteSalesRepresentativeAction
{
    public function execute(int $id): array
    {
        $representative = SalesRepresentative::findOrFail($id);
        
        if ($representative->transactions()->where('is_deleted', false)->exists()) {
            throw new \Exception('Cannot delete representative with existing transactions', 422);
        }

        $oldValues = $representative->toArray();
        $representative->delete();

        return $oldValues;
    }
}
