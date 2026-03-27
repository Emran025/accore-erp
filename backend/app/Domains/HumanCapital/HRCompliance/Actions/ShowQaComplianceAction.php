<?php

namespace App\Domains\HumanCapital\HRCompliance\Actions;

use App\Domains\Manufacturing\QualityControl\Models\QaCompliance;

class ShowQaComplianceAction
{
    public function execute(int|string $id): QaCompliance
    {
        return QaCompliance::with(['employee', 'capas'])->findOrFail($id);
    }
}
