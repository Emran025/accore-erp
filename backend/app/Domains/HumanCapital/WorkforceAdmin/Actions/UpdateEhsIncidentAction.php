<?php

namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;

use App\Domains\HumanCapital\WorkforceAdmin\Models\EhsIncident;

class UpdateEhsIncidentAction
{
    public function execute(int $id, array $data): array
    {
        $incident = EhsIncident::findOrFail($id);

        if (isset($data['status']) && $data['status'] === 'under_investigation' && !$incident->investigated_by) {
            $data['investigated_by'] = auth()->id();
        }

        $incident->update($data);

        return $incident->load('employee')->toArray();
    }
}
