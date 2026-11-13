<?php

namespace App\Domains\EnterpriseCore\OrganizationGovernance\Actions;

class ValidateBlueprintAction
{
    /**
     * Validate a blueprint JSON payload against the invariants BlueprintCompiler enforces.
     *
     * Canonical field names (compiler-authoritative):
     *   - Units:         temp_id  (required by compiler for idMap keying)
     *   - Relationships: source_temp_id / target_temp_id (required by compiler for graph wiring)
     *   - Legal-entity check: facets array must contain 'legal_entity' OR type_id equals 'legal_entity'
     *
     * Legacy field names accepted by old tests (id / source / target) are also accepted for
     * backward compatibility with blueprints that use the display-only 'id' field, but a
     * blueprint that only carries 'id' (without 'temp_id') will pass validation yet fail to
     * compile. To surface that gap early, this validator treats missing 'temp_id' as a warning
     * and duplicate 'temp_id' values as errors, mirroring exactly what the compiler would do.
     *
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
        $tempIds = [];    // compiler's authoritative key
        $displayIds = []; // legacy 'id' field — still deduplicated

        foreach ($units as $u) {
            // ── temp_id validation (compiler-authoritative) ──────────────────────
            $tempId = $u['temp_id'] ?? null;
            if ($tempId !== null) {
                if (in_array($tempId, $tempIds, true)) {
                    $errors[] = "Duplicate unit temp_id detected: [{$tempId}].";
                }
                $tempIds[] = $tempId;
            } else {
                // A unit without temp_id will be silently skipped by the compiler.
                $displayId = $u['id'] ?? '(unknown)';
                $warnings[] = "Unit [{$displayId}] is missing 'temp_id'; it will not be compiled.";
            }

            // ── legacy 'id' deduplication ─────────────────────────────────────
            $id = $u['id'] ?? null;
            if ($id !== null) {
                if (in_array($id, $displayIds, true)) {
                    $errors[] = "Duplicate unit ID detected: [{$id}].";
                }
                $displayIds[] = $id;
            }

            // ── legal-entity check ────────────────────────────────────────────
            $facets = $u['facets'] ?? [];
            if (in_array('legal_entity', $facets, true) || ($u['type'] ?? '') === 'legal_entity') {
                $hasLegalEntity = true;
            }
        }

        if (!$hasLegalEntity) {
            $errors[] = 'The blueprint must declare at least one unit with the legal_entity facet.';
        }

        // ── Relationship validation ───────────────────────────────────────────
        // The compiler resolves relationships by source_temp_id / target_temp_id.
        // We validate both the compiler fields AND the legacy source/target display fields
        // so that validation rejects dangling references in either convention.
        $relationships = $blueprint['relationships'] ?? [];
        foreach ($relationships as $idx => $rel) {
            // Compiler convention (authoritative)
            $srcTemp = $rel['source_temp_id'] ?? null;
            $tgtTemp = $rel['target_temp_id'] ?? null;

            if ($srcTemp !== null && !in_array($srcTemp, $tempIds, true)) {
                $errors[] = "Relationship #{$idx} references non-existent source temp_id: [{$srcTemp}].";
            }
            if ($tgtTemp !== null && !in_array($tgtTemp, $tempIds, true)) {
                $errors[] = "Relationship #{$idx} references non-existent target temp_id: [{$tgtTemp}].";
            }

            // Legacy display convention (backward-compat)
            $source = $rel['source'] ?? null;
            $target = $rel['target'] ?? null;

            if ($source !== null && !in_array($source, $displayIds, true)) {
                $errors[] = "Relationship #{$idx} references non-existent source unit: [{$source}].";
            }
            if ($target !== null && !in_array($target, $displayIds, true)) {
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
