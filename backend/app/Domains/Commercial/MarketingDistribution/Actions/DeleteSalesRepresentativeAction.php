<?php

namespace App\Domains\Commercial\MarketingDistribution\Actions;

use App\Domains\Commercial\SalesLifecycle\Models\SalesRepresentative;
use Illuminate\Support\Collection;

class DeleteSalesRepresentativeAction
{
    public function execute(int $id): Collection
    {
        $representative = SalesRepresentative::findOrFail($id);
        
        if ($representative->transactions()->where('is_deleted', false)->exists()) {
            throw new \Exception('Cannot delete representative with existing transactions', 422);
        }

        $oldValues = $representative->toArray();
        $representative->delete();

        return collect($oldValues);
    }
}
