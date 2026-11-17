<?php

namespace Tests\Feature\Api\V2\EnterpriseCore\OrganizationGovernance;

use App\Domains\EnterpriseCore\OrganizationGovernance\Models\OrgBlueprint;
use App\Domains\EnterpriseCore\OrganizationGovernance\Models\StructureNode;
use App\Domains\Finance\ManagementAccounting\Models\CostCenter;
use Database\Seeders\OrgStructureSeeder;
use Illuminate\Support\Str;
use Tests\TestCase;

/**
 * Feature tests for the blueprint lifecycle endpoints:
 *   POST /api/v2/setup/blueprint/stage
 *   POST /api/v2/setup/blueprint/validate
 *   GET  /api/v2/setup/blueprint/latest
 *   POST /api/v2/setup/blueprint/{uuid}/publish
 *
 * Test groups:
 *   A. Stage
 *   B. Validate — including canonical schema-agreement cases
 *   C. Latest
 *   D. Publish status guards (no compiler dependencies needed)
 *   E. Publish happy path (requires OrgStructureSeeder fixtures)
 *   F. Publish identity integrity
 *   G. Publish failure rollback
 *   H. Republish guard with precise HTTP contract
 *   I. Scope safety (no cross-blueprint node reuse)
 */
class BlueprintLifecycleTest extends TestCase
{
    // ---------------------------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------------------------

    /**
     * Minimal blueprint JSON that passes BOTH validation AND compilation:
     * - Has temp_id (compiler key) on every unit.
     * - Has legal_entity facet.
     * - Relationships use source_temp_id / target_temp_id.
     * - No dangling references.
     */
    private function compilableBlueprintJson(string $unitTempId = 'u_root', string $code = 'TEST-CO'): array
    {
        return [
            'blueprint_id'    => (string) Str::uuid(),
            'version'         => '2.0.0',
            'metadata'        => [
                'complexity_grade'  => 1,
                'primary_archetype' => 'SIMPLE_HIERARCHY',
                'confidence_score'  => 0.95,
            ],
            'business_profile' => [
                'company_name' => 'Test Company',
                'company_code' => $code,
                'country_code' => 'SA',
            ],
            'units' => [
                [
                    'temp_id'        => $unitTempId,
                    'id'             => $unitTempId,       // also set id for validator compat
                    'type_id'        => 'COMP_CODE',
                    'code'           => $code,
                    'name_en'        => 'Test Company',
                    'name_ar'        => 'شركة اختبار',
                    'facets'         => ['legal_entity', 'LegalEntityFacet', 'FinancialResponsibilityFacet'],
                    'attributes'     => ['country_code' => 'SA', 'currency_id' => '1'],
                    'is_user_locked' => false,
                ],
            ],
            'relationships' => [],
            'positions'     => [],
            'capabilities'  => ['activated' => [], 'deferred' => []],
            'explainability' => [],
        ];
    }

    /**
     * Minimal blueprint JSON valid for the validator but NOT for the compiler:
     * uses only 'id' (not 'temp_id') and 'source'/'target' (not 'source_temp_id').
     */
    private function validatorOnlyBlueprintJson(string $unitId = 'u_root'): array
    {
        return [
            'blueprint_id' => (string) Str::uuid(),
            'version'      => '2.0.0',
            'units'        => [
                [
                    'id'     => $unitId,
                    'type_id' => 'COMP_CODE',
                    'code'    => 'TEST-CO',
                    'name_en' => 'Test Company',
                    'name_ar' => 'شركة اختبار',
                    'facets'  => ['legal_entity', 'LegalEntityFacet', 'FinancialResponsibilityFacet'],
                    'is_user_locked' => false,
                ],
            ],
            'relationships' => [],
            'positions'     => [],
        ];
    }

    // ---------------------------------------------------------------------------
    // A. Stage tests
    // ---------------------------------------------------------------------------

    public function test_stage_creates_a_new_blueprint_record(): void
    {
        $response = $this->withoutMiddleware()->postJson('/api/v2/setup/blueprint/stage', [
            'name'           => 'Test Blueprint',
            'archetype_id'   => 'SIMPLE_HIERARCHY',
            'blueprint_json' => $this->compilableBlueprintJson(),
        ]);

        $this->assertSuccessResponse($response);
        $response->assertJsonPath('data.status', 'staged');
        $response->assertJsonPath('data.name', 'Test Blueprint');

        $this->assertDatabaseHas('org_blueprints', ['status' => 'staged', 'name' => 'Test Blueprint']);
    }

    public function test_stage_updates_existing_blueprint_when_uuid_provided(): void
    {
        $existing = OrgBlueprint::factory()->create(['name' => 'Old Name']);

        $response = $this->withoutMiddleware()->postJson('/api/v2/setup/blueprint/stage', [
            'blueprint_uuid' => $existing->blueprint_uuid,
            'name'           => 'Updated Name',
            'archetype_id'   => 'SIMPLE_HIERARCHY',
            'blueprint_json' => $this->compilableBlueprintJson(),
        ]);

        $this->assertSuccessResponse($response);
        $response->assertJsonPath('data.name', 'Updated Name');

        // Must not create a second record — idempotent upsert.
        $this->assertSame(1, OrgBlueprint::count());
        $this->assertDatabaseHas('org_blueprints', [
            'blueprint_uuid' => $existing->blueprint_uuid,
            'name'           => 'Updated Name',
        ]);
    }

    // ---------------------------------------------------------------------------
    // B. Validate tests — including canonical schema-agreement cases
    // ---------------------------------------------------------------------------

    public function test_validate_returns_valid_true_for_compilable_blueprint(): void
    {
        $response = $this->withoutMiddleware()->postJson('/api/v2/setup/blueprint/validate', [
            'blueprint_json' => $this->compilableBlueprintJson(),
        ]);

        // successResponse flat-merges associative arrays: results live at root level.
        $this->assertSuccessResponse($response);
        $response->assertJsonPath('valid', true);
        $response->assertJsonPath('errors', []);
    }

    public function test_validate_emits_warning_for_unit_missing_temp_id(): void
    {
        // A unit with 'id' but no 'temp_id' passes basic validation but cannot be compiled.
        // The validator must surface a warning.
        $json = $this->compilableBlueprintJson();
        unset($json['units'][0]['temp_id']);

        $response = $this->withoutMiddleware()->postJson('/api/v2/setup/blueprint/validate', [
            'blueprint_json' => $json,
        ]);

        $this->assertSuccessResponse($response);
        // Still valid (warnings don't block), but warnings must be non-empty.
        $response->assertJsonPath('valid', true);
        $warnings = $response->json('warnings');
        $this->assertNotEmpty($warnings, 'Expected a warning for a unit missing temp_id.');
        $this->assertStringContainsString('temp_id', implode(' ', $warnings));
    }

    public function test_validate_returns_error_when_no_legal_entity_unit_present(): void
    {
        $json = $this->compilableBlueprintJson();
        $json['units'][0]['facets'] = ['OperationalFacilityFacet']; // remove legal_entity

        $response = $this->withoutMiddleware()->postJson('/api/v2/setup/blueprint/validate', [
            'blueprint_json' => $json,
        ]);

        $this->assertSuccessResponse($response);
        $response->assertJsonPath('valid', false);

        $errors = $response->json('errors');
        $this->assertNotEmpty($errors);
        $this->assertStringContainsString('legal_entity', implode(' ', $errors));
    }

    public function test_validate_returns_error_when_units_array_is_empty(): void
    {
        $response = $this->withoutMiddleware()->postJson('/api/v2/setup/blueprint/validate', [
            'blueprint_json' => ['units' => [], 'relationships' => []],
        ]);

        $this->assertSuccessResponse($response);
        $response->assertJsonPath('valid', false);

        $errors = $response->json('errors');
        $this->assertNotEmpty($errors);
        $this->assertStringContainsString('at least one', implode(' ', $errors));
    }

    public function test_validate_returns_error_for_duplicate_temp_ids(): void
    {
        $unit = [
            'temp_id' => 'u_dup',
            'id'      => 'u_dup',
            'type_id' => 'COMP_CODE',
            'code'    => 'DUP',
            'facets'  => ['legal_entity'],
        ];

        $response = $this->withoutMiddleware()->postJson('/api/v2/setup/blueprint/validate', [
            'blueprint_json' => [
                'units'         => [$unit, $unit], // same temp_id twice
                'relationships' => [],
            ],
        ]);

        $this->assertSuccessResponse($response);
        $response->assertJsonPath('valid', false);

        $errors = $response->json('errors');
        $this->assertNotEmpty($errors);
        $this->assertStringContainsString('Duplicate', implode(' ', $errors));
    }

    public function test_validate_returns_error_for_relationship_with_nonexistent_source_in_compiler_convention(): void
    {
        // Uses source_temp_id / target_temp_id — the compiler-authoritative convention.
        $json = $this->compilableBlueprintJson('u_real');
        $json['relationships'] = [
            ['source_temp_id' => 'u_ghost', 'target_temp_id' => 'u_real'],
        ];

        $response = $this->withoutMiddleware()->postJson('/api/v2/setup/blueprint/validate', [
            'blueprint_json' => $json,
        ]);

        $this->assertSuccessResponse($response);
        $response->assertJsonPath('valid', false);

        $errors = $response->json('errors');
        $this->assertNotEmpty($errors);
        $this->assertStringContainsString('u_ghost', implode(' ', $errors));
    }

    public function test_validate_returns_error_for_relationship_with_nonexistent_source_in_legacy_convention(): void
    {
        // Uses source/target — the legacy display convention.
        $json = $this->compilableBlueprintJson('u_real');
        $json['relationships'] = [
            ['source' => 'u_ghost', 'target' => 'u_real'],
        ];

        $response = $this->withoutMiddleware()->postJson('/api/v2/setup/blueprint/validate', [
            'blueprint_json' => $json,
        ]);

        $this->assertSuccessResponse($response);
        $response->assertJsonPath('valid', false);

        $errors = $response->json('errors');
        $this->assertNotEmpty($errors);
        $this->assertStringContainsString('u_ghost', implode(' ', $errors));
    }

    // ---------------------------------------------------------------------------
    // C. Latest tests
    // ---------------------------------------------------------------------------

    public function test_latest_returns_null_when_no_blueprints_exist(): void
    {
        $response = $this->withoutMiddleware()->getJson('/api/v2/setup/blueprint/latest');

        $this->assertSuccessResponse($response);
        $response->assertJsonPath('data', null);
    }

    public function test_latest_returns_most_recently_updated_blueprint(): void
    {
        $older = OrgBlueprint::factory()->create(['name' => 'Older', 'updated_at' => now()->subMinutes(10)]);
        $newer = OrgBlueprint::factory()->create(['name' => 'Newer', 'updated_at' => now()]);

        $response = $this->withoutMiddleware()->getJson('/api/v2/setup/blueprint/latest');

        $this->assertSuccessResponse($response);
        $response->assertJsonPath('data.name', 'Newer');
        $response->assertJsonPath('data.blueprint_uuid', $newer->blueprint_uuid);
    }

    // ---------------------------------------------------------------------------
    // D. Publish status guards — precise HTTP contract
    // ---------------------------------------------------------------------------

    public function test_publish_rejects_already_published_blueprint_with_422(): void
    {
        $blueprint = OrgBlueprint::factory()->published()->create();

        $response = $this->withoutMiddleware()->postJson(
            "/api/v2/setup/blueprint/{$blueprint->blueprint_uuid}/publish"
        );

        // ValidationException → re-thrown → Laravel renders 422 Unprocessable Entity.
        $response->assertStatus(422);
        $response->assertJsonPath('success', false);
    }

    public function test_publish_rejects_archived_blueprint_with_422(): void
    {
        $blueprint = OrgBlueprint::factory()->archived()->create();

        $response = $this->withoutMiddleware()->postJson(
            "/api/v2/setup/blueprint/{$blueprint->blueprint_uuid}/publish"
        );

        $response->assertStatus(422);
        $response->assertJsonPath('success', false);
    }

    public function test_publish_returns_422_for_nonexistent_uuid(): void
    {
        $fakeUuid = (string) Str::uuid();

        $response = $this->withoutMiddleware()->postJson(
            "/api/v2/setup/blueprint/{$fakeUuid}/publish"
        );

        $response->assertStatus(422);
        $response->assertJsonPath('success', false);
    }

    // ---------------------------------------------------------------------------
    // E. Publish happy path (requires OrgStructureSeeder meta-types + topology rules)
    // ---------------------------------------------------------------------------

    private function seedOrgStructure(): void
    {
        (new OrgStructureSeeder())->run();
    }

    public function test_publish_happy_path_compiles_nodes_and_marks_staged_row_published(): void
    {
        $this->seedOrgStructure();

        $companyCode = strtoupper(substr((string) Str::uuid(), 0, 4)); // unique code per test run
        $blueprintJson = $this->compilableBlueprintJson('u_root', $companyCode);

        // 1. Stage the blueprint
        $staged = OrgBlueprint::factory()->create([
            'blueprint_json' => $blueprintJson,
            'status'         => 'staged',
        ]);
        $stagedUuid = $staged->blueprint_uuid;

        // 2. Publish via API
        $response = $this->withoutMiddleware()->postJson(
            "/api/v2/setup/blueprint/{$stagedUuid}/publish"
        );

        $this->assertSuccessResponse($response);

        // 3. Response must carry the STAGED UUID (not the JSON's internal blueprint_id)
        $response->assertJsonPath('blueprint_uuid', $stagedUuid);
        $response->assertJsonPath('status', 'published');

        // 4. Compiled counts: exactly 1 node and 1 cost_center (FinancialResponsibilityFacet)
        $this->assertSame(
            1,
            (int) $response->json('result.compiled_counts.nodes'),
            'Expected exactly one compiled StructureNode.'
        );
        $this->assertSame(
            1,
            (int) $response->json('result.compiled_counts.cost_centers'),
            'Expected exactly one compiled CostCenter.'
        );

        // 5. The ORIGINAL staged row is now published — same blueprint_uuid, no new row created.
        $this->assertSame(
            1,
            OrgBlueprint::count(),
            'Publish must not create a second OrgBlueprint row.'
        );
        $this->assertDatabaseHas('org_blueprints', [
            'blueprint_uuid' => $stagedUuid,
            'status'         => 'published',
        ]);
        $published = OrgBlueprint::where('blueprint_uuid', $stagedUuid)->first();
        $this->assertNotNull($published->published_at, 'published_at must be set after a successful publish.');

        // 6. A StructureNode for the COMP_CODE unit was created exactly once.
        $this->assertSame(
            1,
            StructureNode::where('node_type_id', 'COMP_CODE')->count(),
            'Expected exactly one COMP_CODE StructureNode.'
        );

        // 7. A CostCenter was created for the FinancialResponsibilityFacet unit.
        $this->assertSame(
            1,
            CostCenter::count(),
            'Expected exactly one CostCenter from the FinancialResponsibilityFacet.'
        );
    }

    // ---------------------------------------------------------------------------
    // F. Identity integrity: published_uuid == staged_uuid, no second row
    // ---------------------------------------------------------------------------

    public function test_publish_response_uuid_matches_staged_database_uuid(): void
    {
        $this->seedOrgStructure();

        $code = strtoupper(substr((string) Str::uuid(), 0, 4));
        $staged = OrgBlueprint::factory()->create([
            'blueprint_json' => $this->compilableBlueprintJson('u_id_check', $code),
            'status'         => 'staged',
        ]);
        $stagedUuid = $staged->blueprint_uuid;
        $jsonInternalId = $staged->blueprint_json['blueprint_id'];

        // The JSON's internal blueprint_id is a different UUID from the database row's blueprint_uuid.
        $this->assertNotSame($stagedUuid, $jsonInternalId,
            'Precondition: factory must produce distinct db-uuid and json-internal-id.');

        $response = $this->withoutMiddleware()->postJson(
            "/api/v2/setup/blueprint/{$stagedUuid}/publish"
        );

        $this->assertSuccessResponse($response);

        // The API response must carry the database UUID.
        $this->assertSame($stagedUuid, $response->json('blueprint_uuid'));

        // No second blueprint row was created under the JSON's internal id.
        $this->assertDatabaseMissing('org_blueprints', ['blueprint_uuid' => $jsonInternalId]);
        $this->assertSame(1, OrgBlueprint::count());
    }

    // ---------------------------------------------------------------------------
    // G. Failure rollback — no partial records, staged row stays staged
    //
    // We force a compile failure by providing a blueprint with a unit whose
    // 'type_id' does NOT exist in org_meta_types. The StructureNode FK will
    // throw a constraint error after the transaction starts, rolling it back.
    // ---------------------------------------------------------------------------

    public function test_failed_compile_leaves_no_partial_nodes_and_keeps_blueprint_staged(): void
    {
        $this->seedOrgStructure();

        // A type_id that is not in org_meta_types → StructureNode::create FK violation.
        $badJson = $this->compilableBlueprintJson('u_root', 'BAD');
        $badJson['units'][0]['type_id'] = 'NONEXISTENT_TYPE_' . Str::random(6);

        $staged = OrgBlueprint::factory()->create([
            'blueprint_json' => $badJson,
            'status'         => 'staged',
        ]);
        $stagedUuid = $staged->blueprint_uuid;
        $nodeCountBefore = StructureNode::count();

        $response = $this->withoutMiddleware()->postJson(
            "/api/v2/setup/blueprint/{$stagedUuid}/publish"
        );

        // Compile failed → non-success response.
        $response->assertJsonPath('success', false);

        // No new StructureNode rows must remain after the rolled-back transaction.
        $this->assertSame(
            $nodeCountBefore,
            StructureNode::count(),
            'Transaction rollback must leave no partial StructureNode records.'
        );

        // The staged blueprint must NOT be marked published.
        $this->assertDatabaseHas('org_blueprints', [
            'blueprint_uuid' => $stagedUuid,
            'status'         => 'staged',
        ]);
        $this->assertNull(
            OrgBlueprint::where('blueprint_uuid', $stagedUuid)->value('published_at'),
            'published_at must remain null after a failed compile.'
        );
    }

    // ---------------------------------------------------------------------------
    // H. Republish guard — precise status and unchanged counts
    // ---------------------------------------------------------------------------

    public function test_republish_does_not_create_duplicate_nodes_and_returns_422(): void
    {
        $this->seedOrgStructure();

        $code = strtoupper(substr((string) Str::uuid(), 0, 4));
        $staged = OrgBlueprint::factory()->create([
            'blueprint_json' => $this->compilableBlueprintJson('u_repub', $code),
            'status'         => 'staged',
        ]);
        $stagedUuid = $staged->blueprint_uuid;

        // First publish succeeds.
        $firstResponse = $this->withoutMiddleware()->postJson(
            "/api/v2/setup/blueprint/{$stagedUuid}/publish"
        );
        $this->assertSuccessResponse($firstResponse);
        $nodeCount = StructureNode::count();

        // Second publish on the same UUID must be rejected.
        $secondResponse = $this->withoutMiddleware()->postJson(
            "/api/v2/setup/blueprint/{$stagedUuid}/publish"
        );
        $secondResponse->assertStatus(422);
        $secondResponse->assertJsonPath('success', false);

        // Node count must be unchanged — no duplicate writes.
        $this->assertSame(
            $nodeCount,
            StructureNode::count(),
            'A republish attempt must not create duplicate StructureNode records.'
        );
    }

    // ---------------------------------------------------------------------------
    // I. Scope safety — this blueprint's compile must not reuse another's records
    //
    // Current limitation: no company/tenant FK on structure_nodes. This test
    // confirms that compilation creates *new* nodes rather than reusing pre-existing
    // ones from a prior unrelated publish. It does NOT assert full tenant isolation
    // (no such scope exists yet in the schema).
    // ---------------------------------------------------------------------------

    public function test_second_blueprint_publish_creates_its_own_nodes_not_reusing_prior(): void
    {
        $this->seedOrgStructure();

        // Publish blueprint A.
        $codeA = strtoupper(substr((string) Str::uuid(), 0, 4));
        $blueprintA = OrgBlueprint::factory()->create([
            'blueprint_json' => $this->compilableBlueprintJson('u_a', $codeA),
            'status'         => 'staged',
        ]);
        $this->withoutMiddleware()->postJson("/api/v2/setup/blueprint/{$blueprintA->blueprint_uuid}/publish");
        $nodesAfterA = StructureNode::count();

        // Publish blueprint B with a different company code.
        $codeB = strtoupper(substr((string) Str::uuid(), 0, 4));
        $blueprintB = OrgBlueprint::factory()->create([
            'blueprint_json' => $this->compilableBlueprintJson('u_b', $codeB),
            'status'         => 'staged',
        ]);
        $responseB = $this->withoutMiddleware()->postJson(
            "/api/v2/setup/blueprint/{$blueprintB->blueprint_uuid}/publish"
        );
        $this->assertSuccessResponse($responseB);

        // Blueprint B must have created at least one additional node.
        $this->assertGreaterThan(
            $nodesAfterA,
            StructureNode::count(),
            'Second blueprint publish must create new nodes, not reuse existing ones.'
        );

        // Verify: a node with codeB's exact company code exists.
        $this->assertDatabaseHas('structure_nodes', ['code' => $codeB]);

        // NOTE: Both compile results share the same CLIENT root (global singleton by design).
        // Full org-level tenant isolation requires a tenancy model not yet present in the schema.
        // That remaining risk is documented in BLUEPRINT_LIFECYCLE_SLICE_REPORT.md.
    }

    public function test_publish_rejects_a_blueprint_revision_changed_after_review(): void
    {
        $this->authenticateUser();
        $blueprintUuid = (string) Str::uuid();
        $stageUrl = route('v2.setup.blueprint.stage');

        $firstStage = $this->authPost($stageUrl, [
            'blueprint_uuid' => $blueprintUuid,
            'name' => 'Reviewed version',
            'archetype_id' => 'SIMPLE_HIERARCHY',
            'blueprint_json' => $this->compilableBlueprintJson('u_reviewed', 'REVIEWED'),
        ]);
        $this->assertSuccessResponse($firstStage);
        $reviewedBlueprintRevision = $firstStage->json('data.blueprint_revision');
        $this->assertIsString($reviewedBlueprintRevision);
        $this->assertSame(64, strlen($reviewedBlueprintRevision));

        $changedJson = $this->compilableBlueprintJson('u_changed', 'CHANGED');
        $secondStage = $this->authPost($stageUrl, [
            'blueprint_uuid' => $blueprintUuid,
            'name' => 'Changed version',
            'archetype_id' => 'SIMPLE_HIERARCHY',
            'blueprint_json' => $changedJson,
        ]);
        $this->assertSuccessResponse($secondStage);
        $currentBlueprintRevision = $secondStage->json('data.blueprint_revision');
        $this->assertNotSame($reviewedBlueprintRevision, $currentBlueprintRevision);

        $nodeCountBefore = StructureNode::count();
        $publish = $this->authPost(route('v2.setup.blueprint.publish', ['uuid' => $blueprintUuid]), [
            'blueprint_revision' => $reviewedBlueprintRevision,
        ]);

        $publish->assertStatus(409)
            ->assertJsonPath('code', 'setup_state_conflict')
            ->assertJsonPath('conflict_scope', 'blueprint')
            ->assertJsonPath('current_blueprint_revision', $currentBlueprintRevision);
        $this->assertSame($nodeCountBefore, StructureNode::count());
        $this->assertDatabaseHas('org_blueprints', [
            'blueprint_uuid' => $blueprintUuid,
            'name' => 'Changed version',
            'status' => 'staged',
        ]);
    }
}
