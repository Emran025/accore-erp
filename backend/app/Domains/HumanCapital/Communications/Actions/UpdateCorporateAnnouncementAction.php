<?php

namespace App\Domains\HumanCapital\Communications\Actions;

use App\Domains\HumanCapital\Communications\Models\CorporateAnnouncement;

class UpdateCorporateAnnouncementAction
{
    public function execute(int|string $id, array $data): array
    {
        $announcement = CorporateAnnouncement::findOrFail($id);
        $announcement->update($data);
        return $announcement->toArray();
    }
}
