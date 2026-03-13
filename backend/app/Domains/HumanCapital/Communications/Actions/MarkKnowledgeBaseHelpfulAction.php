<?php

namespace App\Domains\HumanCapital\Communications\Actions;

use App\Domains\HumanCapital\Communications\Models\KnowledgeBase;

class MarkKnowledgeBaseHelpfulAction
{
    public function execute(int $id): array
    {
        $kb = KnowledgeBase::findOrFail($id);
        $kb->increment('helpful_count');

        return $kb->toArray();
    }
}
