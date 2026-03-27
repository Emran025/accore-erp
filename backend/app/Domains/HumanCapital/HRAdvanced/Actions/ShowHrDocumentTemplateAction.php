<?php

namespace App\Domains\HumanCapital\HRAdvanced\Actions;

use App\Domains\EnterpriseCore\OrganizationGovernance\Models\DocumentTemplate;

class ShowHrDocumentTemplateAction
{
    public function execute(int $id): DocumentTemplate
    {
        return DocumentTemplate::findOrFail($id);
    }
}
