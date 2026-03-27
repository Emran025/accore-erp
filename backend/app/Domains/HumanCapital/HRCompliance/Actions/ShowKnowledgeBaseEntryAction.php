<?php

namespace App\Domains\HumanCapital\HRCompliance\Actions;

use App\Domains\HumanCapital\HRCompliance\Models\KnowledgeBase;

class ShowKnowledgeBaseEntryAction
{
    public function execute(int $id): KnowledgeBase
    {
        $kb = KnowledgeBase::findOrFail($id);
        
        $kb->increment('view_count');

        return $kb;
    }
}
