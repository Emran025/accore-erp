<?php

namespace App\Domains\DigitalPlatform\Compliance\Actions;

use App\Domains\Manufacturing\Models\QaCompliance;

class UpdateQaComplianceAction
{
    public function execute(int|string $id, array $data): array
    {
        $compliance = QaCompliance::findOrFail($id);
        
        if (isset($data['status']) && $data['status'] === 'completed' && !$compliance->completed_date) {
            $data['completed_date'] = now();
            $data['completed_by'] = auth()->id();
        }

        $compliance->update($data);
        return $compliance->load('employee', 'capas')->toArray();
    }
}
