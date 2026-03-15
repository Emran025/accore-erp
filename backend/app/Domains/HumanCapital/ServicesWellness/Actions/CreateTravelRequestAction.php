<?php

namespace App\Domains\HumanCapital\ServicesWellness\Actions;

use App\Domains\HumanCapital\ServicesWellness\Models\TravelRequest;

class CreateTravelRequestAction
{
    public function execute(array $data): TravelRequest
    {
        $data['request_number'] = 'TR-' . date('Ymd') . '-' . str_pad(TravelRequest::count() + 1, 4, '0', STR_PAD_LEFT);
        $data['status'] = 'draft';

        return TravelRequest::create($data);
    }
}
