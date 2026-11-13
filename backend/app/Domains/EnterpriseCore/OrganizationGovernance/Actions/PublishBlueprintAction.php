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
     * Publish a staged or validated blueprint by compiling it into live records.
     *
     * Guards:
     * - Blueprint must exist.
     * - Status must be 'staged' or 'validated'; re-publishing an already-published
     *   blueprint is rejected to prevent duplicate node/link records.
     *
     * @param string $blueprintUuid
     * @param array<string, mixed> $options
     * @return array<string, mixed>
     * @throws ValidationException
     */
    public function execute(string $blueprintUuid, array $options = []): array
    {
        $blueprint = OrgBlueprint::where('blueprint_uuid', $blueprintUuid)->first();

        if (!$blueprint) {
            throw ValidationException::withMessages([
                'blueprint_uuid' => "Blueprint with UUID [{$blueprintUuid}] not found.",
            ]);
        }

        // Status guard: only staged or validated blueprints may be compiled.
        // A published blueprint must be explicitly archived before a new one is published.
        if (!in_array($blueprint->status, ['staged', 'validated'], true)) {
            throw ValidationException::withMessages([
                'status' => "Blueprint [{$blueprintUuid}] has status '{$blueprint->status}' and cannot be published. "
                    . "Only blueprints with status 'staged' or 'validated' are eligible for compilation.",
            ]);
        }

        // Pass the blueprint JSON array, the canonical database UUID, and the authenticated
        // user's ID to the compiler. The database UUID ensures the same staged row is updated
        // to 'published' rather than a parallel row being created from the JSON's internal id.
        $result = $this->compiler->compile(
            $blueprint->blueprint_json,
            $blueprint->blueprint_uuid,
            auth()->id()
        );

        return [
            'blueprint_uuid' => $blueprint->blueprint_uuid,
            'status'         => 'published',
            'result'         => $result,
        ];
    }
}
