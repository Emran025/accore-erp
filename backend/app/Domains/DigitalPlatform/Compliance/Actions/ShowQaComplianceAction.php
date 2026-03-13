<?php

namespace App\Domains\DigitalPlatform\Compliance\Actions;

use App\Domains\Manufacturing\Models\QaCompliance;

class ShowQaComplianceAction
{
    public function execute(int|string $id): array
    {
        $compliance = QaCompliance::with(['employee', 'capas'])->findOrFail($id);
        return $compliance->toArray();
    }
}
