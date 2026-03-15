<?php

namespace App\Domains\HumanCapital\PerformanceDevelopment\Actions;

use App\Domains\HumanCapital\PerformanceDevelopment\Models\SuccessionCandidate;

class CreateSuccessionCandidateAction
{
    public function execute(array $data): SuccessionCandidate
    {
        return SuccessionCandidate::create($data);
    }
}
