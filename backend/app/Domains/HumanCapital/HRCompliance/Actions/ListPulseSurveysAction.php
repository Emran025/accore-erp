<?php

namespace App\Domains\HumanCapital\HRCompliance\Actions;

use App\Domains\HumanCapital\HRCompliance\Models\PulseSurvey;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ListPulseSurveysAction
{
    public function execute(array $filters = []): LengthAwarePaginator
    {
        $query = PulseSurvey::with(['responses']);

        if (isset($filters['survey_type']) && $filters['survey_type'] !== '') {
            $query->where('survey_type', $filters['survey_type']);
        }

        if (isset($filters['is_active']) && $filters['is_active'] !== '') {
            $query->where('is_active', $filters['is_active'] === 'true');
        }

        $paginated = $query->orderBy('created_at', 'desc')->paginate(15);
        
        return $paginated;
    }
}
