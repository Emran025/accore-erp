<?php

namespace App\Domains\HumanCapital\ServicesWellness\Actions;

use App\Domains\HumanCapital\ServicesWellness\Models\EhsIncident;

class CreateEhsIncidentAction
{
    public function execute(array $data): array
    {
        $data['incident_number'] = 'INC-' . date('Ymd') . '-' . str_pad(EhsIncident::count() + 1, 4, '0', STR_PAD_LEFT);
        $data['status'] = 'reported';
        $data['reported_by'] = auth()->id();

        $incident = EhsIncident::create($data);

        return $incident->load('employee')->toArray();
    }
}


