<?php

namespace App\Domains\HumanCapital\HRCompliance\Actions;

use App\Domains\HumanCapital\HRCompliance\Models\KnowledgeBase;

class CreateKnowledgeBaseEntryAction
{
    public function execute(array $data): array
    {
        $data['view_count'] = 0;
        $data['helpful_count'] = 0;
        $data['created_by'] = auth()->id();
        $data['is_published'] = $data['is_published'] ?? false;

        $kb = KnowledgeBase::create($data);

        return $kb->toArray();
    }
}
