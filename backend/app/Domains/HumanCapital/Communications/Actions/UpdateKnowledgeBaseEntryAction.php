<?php

namespace App\Domains\HumanCapital\Communications\Actions;

use App\Domains\HumanCapital\Communications\Models\KnowledgeBase;

class UpdateKnowledgeBaseEntryAction
{
    public function execute(int $id, array $data): array
    {
        $kb = KnowledgeBase::findOrFail($id);

        $kb->update($data);

        return $kb->toArray();
    }
}
