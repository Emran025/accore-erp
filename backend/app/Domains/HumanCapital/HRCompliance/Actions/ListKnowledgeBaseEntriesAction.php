<?php

namespace App\Domains\HumanCapital\HRCompliance\Actions;

use App\Domains\HumanCapital\HRCompliance\Models\KnowledgeBase;

class ListKnowledgeBaseEntriesAction
{
    public function execute(array $filters): array
    {
        $query = KnowledgeBase::query();

        if (isset($filters['category']) && $filters['category'] !== '') {
            $query->where('category', $filters['category']);
        }

        if (isset($filters['is_published']) && $filters['is_published'] !== '') {
            $query->where('is_published', $filters['is_published'] === 'true' || $filters['is_published'] === true);
        }

        if (isset($filters['search']) && $filters['search'] !== '') {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('content', 'like', "%{$search}%");
            });
        }

        return $query->orderBy('created_at', 'desc')->paginate(15)->toArray();
    }
}
