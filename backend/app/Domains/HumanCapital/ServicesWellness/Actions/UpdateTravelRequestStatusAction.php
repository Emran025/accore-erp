<?php

namespace App\Domains\HumanCapital\ServicesWellness\Actions;

use App\Domains\HumanCapital\ServicesWellness\Models\TravelRequest;

class UpdateTravelRequestStatusAction
{
    public function execute(TravelRequest $travelRequest, array $data): TravelRequest
    {
        if (($data['status'] ?? null) === 'approved') {
            $data['approved_by'] = auth()->id();
            $data['approved_at'] = now();
        }

        $travelRequest->update($data);
        return $travelRequest;
    }
}
