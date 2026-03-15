<?php

namespace App\Domains\HumanCapital\HRCompliance\Actions;

use App\Domains\HumanCapital\HRCompliance\Models\CorporateAnnouncement;

class ListCorporateAnnouncementsAction
{
    public function execute(array $filters = [], $user = null): array
    {
        $query = CorporateAnnouncement::query();

        if (isset($filters['priority']) && $filters['priority'] !== '') {
            $query->where('priority', $filters['priority']);
        }

        if (isset($filters['is_published']) && $filters['is_published'] !== '') {
            $query->where('is_published', $filters['is_published'] === 'true');
        }

        // Filter by target audience
        if (!isset($filters['all']) || empty($filters['all'])) {
            // Apply target audience filtering based on user's department, role, etc.
            // This is simplified - you'd implement full logic based on target_audience field
        }

        $paginated = $query->orderBy('publish_date', 'desc')->paginate(15);
        
        return [
            'data' => $paginated->items(),
            'total' => $paginated->total(),
            'current_page' => $paginated->currentPage(),
            'per_page' => $paginated->perPage()
        ];
    }
}
