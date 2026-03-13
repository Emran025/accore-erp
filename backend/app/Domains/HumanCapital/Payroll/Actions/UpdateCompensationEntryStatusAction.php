<?php

namespace App\Domains\HumanCapital\Payroll\Actions;

use App\Domains\HumanCapital\Payroll\Models\CompensationEntry;

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
