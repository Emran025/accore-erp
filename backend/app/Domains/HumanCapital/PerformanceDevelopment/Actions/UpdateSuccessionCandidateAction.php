<?php

namespace App\Domains\HumanCapital\PerformanceDevelopment\Actions;

use App\Domains\HumanCapital\PerformanceDevelopment\Models\SuccessionCandidate;

class UpdateSuccessionCandidateAction
{
    public function execute(SuccessionCandidate $candidate, array $data): SuccessionCandidate
    {
        $candidate->update($data);
        return $candidate;
    }
}
