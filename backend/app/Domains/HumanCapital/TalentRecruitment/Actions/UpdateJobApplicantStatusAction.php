<?php

namespace App\Domains\HumanCapital\TalentRecruitment\Actions;

use App\Domains\HumanCapital\TalentRecruitment\Models\JobApplicant;

class UpdateJobApplicantStatusAction
{
    public function execute(int|string $id, array $data): array
    {
        $applicant = JobApplicant::findOrFail($id);

        if (isset($data['status'])) {
            if ($data['status'] === 'screened') {
                $data['screened_by'] = auth()->id();
            }

            if ($data['status'] === 'interview') {
                $data['interviewed_by'] = auth()->id();
            }
        }

        $applicant->update($data);
        return $applicant->load('requisition')->toArray();
    }
}
