<?php

namespace App\Domains\HumanCapital\HRCompliance\Actions;

use App\Domains\HumanCapital\HRCompliance\Models\KnowledgeBase;

class CreateKnowledgeBaseEntryAction
{
    public function execute(array $data): KnowledgeBase
    {
        $data['view_count'] = 0;
        $data['helpful_count'] = 0;
        $data['created_by'] = auth()->id();
        $data['is_published'] = $data['is_published'] ?? false;

        return KnowledgeBase::create($data);
    }
}
