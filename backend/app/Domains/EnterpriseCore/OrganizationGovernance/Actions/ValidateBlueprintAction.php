<?php

namespace App\Domains\EnterpriseCore\OrganizationGovernance\Actions;

class ValidateBlueprintAction
{
    /**
     * @param array<string, mixed> $data
     * @return array<string, mixed>
     */
    public function execute(array $data): array
    {
        $blueprint = $data['blueprint_json'] ?? [];
        $errors = [];
        $warnings = [];

        $units = $blueprint['units'] ?? [];
        if (empty($units)) {
            $errors[] = 'The blueprint must contain at least one organizational unit.';
        }

        $hasLegalEntity = false;
        $unitIds = [];
        foreach ($units as $u) {
            $id = $u['id'] ?? null;
            if ($id) {
                if (in_array($id, $unitIds, true)) {
                    $errors[] = "Duplicate unit ID detected: [{$id}].";
                }
                $unitIds[] = $id;
            }

            $facets = $u['facets'] ?? [];
            if (in_array('legal_entity', $facets, true) || ($u['type'] ?? '') === 'legal_entity') {
                $hasLegalEntity = true;
            }
        }

        if (!$hasLegalEntity) {
            $errors[] = 'The blueprint must declare at least one unit with the legal_entity facet.';
        }

        $relationships = $blueprint['relationships'] ?? [];
        foreach ($relationships as $idx => $rel) {
            $source = $rel['source'] ?? null;
            $target = $rel['target'] ?? null;

            if (!in_array($source, $unitIds, true)) {
                $errors[] = "Relationship #{$idx} references non-existent source unit: [{$source}].";
            }
            if (!in_array($target, $unitIds, true)) {
                $errors[] = "Relationship #{$idx} references non-existent target unit: [{$target}].";
            }
        }

        $isValid = count($errors) === 0;

        return [
            'valid'    => $isValid,
            'errors'   => $errors,
            'warnings' => $warnings,
            'summary'  => [
                'total_units'         => count($units),
                'total_relationships' => count($relationships),
                'total_positions'     => count($blueprint['positions'] ?? []),
            ],
        ];
    }
}
