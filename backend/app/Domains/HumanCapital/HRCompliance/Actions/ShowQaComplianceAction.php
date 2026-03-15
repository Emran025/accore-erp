<?php

namespace App\Domains\HumanCapital\HRCompliance\Actions;

use App\Domains\Manufacturing\QualityControl\Models\QaCompliance;

class ShowQaComplianceAction
{
    public function execute(int|string $id): array
    {
        $compliance = QaCompliance::with(['employee', 'capas'])->findOrFail($id);
        return $compliance->toArray();
    }
}
