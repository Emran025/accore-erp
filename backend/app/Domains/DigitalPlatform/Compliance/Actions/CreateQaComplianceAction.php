<?php

namespace App\Domains\DigitalPlatform\Compliance\Actions;

use App\Domains\Manufacturing\Models\QaCompliance;

class CreateQaComplianceAction
{
    public function execute(array $data): array
    {
        $data['compliance_number'] = 'COMP-' . date('Ymd') . '-' . str_pad(QaCompliance::count() + 1, 4, '0', STR_PAD_LEFT);
        $data['status'] = 'pending';

        $compliance = QaCompliance::create($data);
        return $compliance->load('employee')->toArray();
    }
}
