<?php

namespace App\Domains\HumanCapital\DocumentManagement\Actions;

use App\Domains\EnterpriseCore\Governance\Models\DocumentTemplate;

class ShowHrDocumentTemplateAction
{
    public function execute(int $id): array
    {
        $template = DocumentTemplate::findOrFail($id);
        return $template->toArray();
    }
}
