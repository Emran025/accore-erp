<?php

namespace App\Domains\HumanCapital\HRCompliance\Actions;

use App\Domains\HumanCapital\HRCompliance\Models\KnowledgeBase;

class MarkKnowledgeBaseHelpfulAction
{
    public function execute(int $id): KnowledgeBase
    {
        $kb = KnowledgeBase::findOrFail($id);
        $kb->increment('helpful_count');

        return $kb;
    }
}
