<?php

namespace App\Domains\EnterpriseCore\OrganizationGovernance\Actions;

use App\Domains\EnterpriseCore\OrganizationGovernance\Models\OrgBlueprint;
use App\Domains\EnterpriseCore\OrganizationGovernance\Services\BlueprintCompiler;
use Illuminate\Validation\ValidationException;

class PublishBlueprintAction
{
    public function __construct(
        private readonly BlueprintCompiler $compiler
    ) {}

    /**
     * @param string $blueprintUuid
     * @param array<string, mixed> $options
     * @return array<string, mixed>
     */
    public function execute(string $blueprintUuid, array $options = []): array
    {
        $blueprint = OrgBlueprint::where('blueprint_uuid', $blueprintUuid)->first();
        if (!$blueprint) {
            throw ValidationException::withMessages([
                'blueprint_uuid' => "Blueprint with UUID [{$blueprintUuid}] not found.",
            ]);
        }

        $result = $this->compiler->compile($blueprint, $options);

        return [
            'blueprint_uuid' => $blueprint->blueprint_uuid,
            'status'         => 'published',
            'result'         => $result,
        ];
    }
}
