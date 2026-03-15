<?php

namespace App\Domains\HumanCapital\HRCompliance\Actions;

use App\Domains\Manufacturing\QualityControl\Models\Capa;

class CreateCapaAction
{
    public function execute(int|string $complianceId, array $data): array
    {
        $data['compliance_id'] = $complianceId;
        $data['capa_number'] = 'CAPA-' . date('Ymd') . '-' . str_pad(Capa::count() + 1, 4, '0', STR_PAD_LEFT);
        $data['status'] = 'open';

        $capa = Capa::create($data);
        return $capa->load('compliance', 'employee')->toArray();
    }
}
