<?php

namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;

use App\Domains\HumanCapital\WorkforceAdmin\Models\JobTitle;

class CreateJobTitleAction
{
    public function execute(array $data): array
    {
        $data['created_by'] = auth()->id();
        $title = JobTitle::create($data);

        return $title->load('department')->toArray();
    }
}
