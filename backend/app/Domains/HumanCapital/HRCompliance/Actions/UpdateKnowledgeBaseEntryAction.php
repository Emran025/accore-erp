<?php

namespace App\Domains\HumanCapital\HRCompliance\Actions;

use App\Domains\HumanCapital\HRCompliance\Models\KnowledgeBase;

class UpdateKnowledgeBaseEntryAction
{
    public function execute(int $id, array $data): KnowledgeBase
    {
        $kb = KnowledgeBase::findOrFail($id);

        $kb->update($data);

        return $kb;
    }
}
