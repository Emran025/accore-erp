<?php

namespace App\Domains\HumanCapital\HRCompliance\Actions;

use App\Domains\HumanCapital\HRCompliance\Models\CorporateAnnouncement;

class CreateCorporateAnnouncementAction
{
    public function execute(array $data, int $userId): array
    {
        $data['created_by'] = $userId;
        $data['is_published'] = $data['is_published'] ?? false;

        $announcement = CorporateAnnouncement::create($data);
        return $announcement->toArray();
    }
}
