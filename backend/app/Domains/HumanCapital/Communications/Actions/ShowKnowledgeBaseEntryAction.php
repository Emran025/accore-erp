<?php

namespace App\Domains\HumanCapital\Communications\Actions;

use App\Domains\HumanCapital\Communications\Models\KnowledgeBase;

class ShowKnowledgeBaseEntryAction
{
    public function execute(int $id): array
    {
        $kb = KnowledgeBase::findOrFail($id);

        $kb->increment('view_count');

        return $kb->toArray();
    }
}
