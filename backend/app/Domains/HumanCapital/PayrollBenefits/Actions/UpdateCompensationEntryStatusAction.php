<?php

namespace App\Domains\HumanCapital\PayrollBenefits\Actions;

use App\Domains\HumanCapital\PayrollBenefits\Models\CompensationEntry;

class UpdateCompensationEntryStatusAction
{
    public function execute(int|string $id, array $data): array
    {
        $entry = CompensationEntry::findOrFail($id);

        if (isset($data['status']) && in_array($data['status'], ['approved', 'rejected'])) {
            $data['approved_by'] = auth()->id();
        }

        $entry->update($data);
        return $entry->load('plan', 'employee')->toArray();
    }
}
