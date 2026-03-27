<?php

namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;

use App\Domains\HumanCapital\WorkforceAdmin\Models\JobTitle;

class CreateJobTitleAction
{
    public function execute(array $data): JobTitle
    {
        $data['created_by'] = auth()->id();
        return JobTitle::create($data)->load('department');
    }
}
