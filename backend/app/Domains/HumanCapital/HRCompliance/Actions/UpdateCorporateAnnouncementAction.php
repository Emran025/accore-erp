<?php

namespace App\Domains\HumanCapital\HRCompliance\Actions;

use App\Domains\HumanCapital\HRCompliance\Models\CorporateAnnouncement;

class UpdateCorporateAnnouncementAction
{
    public function execute(int|string $id, array $data): CorporateAnnouncement
    {
        $announcement = CorporateAnnouncement::findOrFail($id);
        $announcement->update($data);
        return $announcement;
    }
}
