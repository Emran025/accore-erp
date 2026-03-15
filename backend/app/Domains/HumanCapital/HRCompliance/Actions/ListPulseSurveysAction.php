<?php

namespace App\Domains\HumanCapital\HRCompliance\Actions;

use App\Domains\HumanCapital\HRCompliance\Models\PulseSurvey;

class ListPulseSurveysAction
{
    public function execute(array $filters = []): array
    {
        $query = PulseSurvey::with(['responses']);

        if (isset($filters['survey_type']) && $filters['survey_type'] !== '') {
            $query->where('survey_type', $filters['survey_type']);
        }

        if (isset($filters['is_active']) && $filters['is_active'] !== '') {
            $query->where('is_active', $filters['is_active'] === 'true');
        }

        $paginated = $query->orderBy('created_at', 'desc')->paginate(15);
        
        return [
            'data' => $paginated->items(),
            'total' => $paginated->total(),
            'current_page' => $paginated->currentPage(),
            'per_page' => $paginated->perPage()
        ];
    }
}
