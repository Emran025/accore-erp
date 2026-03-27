<?php
namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;

use App\Domains\HumanCapital\WorkforceAdmin\Models\WellnessProgram;
use Illuminate\Pagination\LengthAwarePaginator;

class ListWellnessProgramsAction
{
    public function execute(array $filters = []): LengthAwarePaginator
    {
        $query = WellnessProgram::with(['participations']);

        if (!empty($filters['program_type'])) {
            $query->where('program_type', $filters['program_type']);
        }

        if (!empty($filters['is_active'])) {
             // Incase 'false' string or boolean false
            $query->where('is_active', filter_var($filters['is_active'], FILTER_VALIDATE_BOOLEAN));
        }

        return $query->orderBy('start_date', 'desc')->paginate(15);
    }
}
