<?php

namespace Tests\Feature\Api;

use App\Domains\EnterpriseCore\OrganizationGovernance\Models\OrgMetaType;
use App\Domains\EnterpriseCore\OrganizationGovernance\Models\OrgMetaTypeAttribute;
use App\Domains\EnterpriseCore\OrganizationGovernance\Models\StructureLink;
use App\Domains\EnterpriseCore\OrganizationGovernance\Models\StructureNode;
use App\Domains\EnterpriseCore\OrganizationGovernance\Models\TopologyRule;
use App\Domains\EnterpriseCore\OrganizationGovernance\Services\OrgStructureService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class OrgStructureSafetyTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->authenticateUser();
    }

    public function test_node_creation_persists_multiple_selected_relationships_atomically(): void
    {
        foreach (['CLIENT', 'COMP_CODE', 'PLANT', 'PURCH_ORG'] as $type) {
            OrgMetaType::create([
                'id' => $type,
                'display_name' => $type,
                'display_name_ar' => $type,
                'level_domain' => 'Enterprise',
                'is_assignable' => true,
            ]);
        }
        OrgMetaTypeAttribute::create([
            'org_meta_type_id' => 'COMP_CODE',
            'attribute_key' => 'country_code',
            'attribute_type' => 'string',
            'is_mandatory' => true,
            'sort_order' => 1,
        ]);
        OrgMetaTypeAttribute::create([
            'org_meta_type_id' => 'PLANT',
            'attribute_key' => 'country_code',
            'attribute_type' => 'string',
            'is_mandatory' => true,
            'sort_order' => 1,
        ]);

        foreach ([
            ['COMP_CODE', 'CLIENT', 'N:1'],
            ['PLANT', 'COMP_CODE', 'N:1'],
            ['PURCH_ORG', 'COMP_CODE', 'N:1'],
            ['PURCH_ORG', 'PLANT', 'N:M'],
        ] as [$source, $target, $cardinality]) {
            TopologyRule::create([
                'source_node_type_id' => $source,
                'target_node_type_id' => $target,
                'cardinality' => $cardinality,
                'link_direction' => 'source_to_target',
                'is_active' => true,
                'description' => "{$source} to {$target}",
            ]);
        }

        $service = app(OrgStructureService::class);
        $client = $service->createNodeWithLinks(['node_type_id' => 'CLIENT', 'code' => 'CLIENT-1'], [])['node'];
        $company = $service->createNodeWithLinks([
            'node_type_id' => 'COMP_CODE',
            'code' => '1000',
            'attributes' => ['country_code' => 'SA'],
        ], [['target_node_uuid' => $client->node_uuid, 'validate_constraints' => true]])['node'];
        $plant = $service->createNodeWithLinks([
            'node_type_id' => 'PLANT',
            'code' => 'PLANT-1',
            'attributes' => ['country_code' => 'SA'],
        ], [['target_node_uuid' => $company->node_uuid, 'validate_constraints' => true]])['node'];

        $result = $service->createNodeWithLinks([
            'node_type_id' => 'PURCH_ORG',
            'code' => 'PURCH-1',
        ], [
            ['target_node_uuid' => $company->node_uuid, 'validate_constraints' => true],
            ['target_node_uuid' => $plant->node_uuid, 'validate_constraints' => true],
        ]);

        $this->assertCount(2, $result['links']);
        $this->assertDatabaseCount('structure_links', 4);
    }

    public function test_metadata_validation_rejects_an_invalid_primitive_type(): void
    {
        OrgMetaType::create([
            'id' => 'DEPARTMENT',
            'display_name' => 'Department',
            'display_name_ar' => 'Department',
            'level_domain' => 'Enterprise',
            'is_assignable' => true,
        ]);
        OrgMetaTypeAttribute::create([
            'org_meta_type_id' => 'DEPARTMENT',
            'attribute_key' => 'headcount',
            'attribute_type' => 'integer',
            'is_mandatory' => true,
            'sort_order' => 1,
        ]);

        $this->expectException(ValidationException::class);
        app(OrgStructureService::class)->normalizeAndValidateNodeAttributes('DEPARTMENT', ['headcount' => 'not-a-number']);
    }

    public function test_integrity_rejects_an_expired_required_parent_relationship(): void
    {
        foreach (['COMP_CODE', 'CLIENT'] as $type) {
            OrgMetaType::create([
                'id' => $type,
                'display_name' => $type,
                'display_name_ar' => $type,
                'level_domain' => 'Enterprise',
                'is_assignable' => true,
            ]);
        }
        $rule = TopologyRule::create([
            'source_node_type_id' => 'COMP_CODE',
            'target_node_type_id' => 'CLIENT',
            'cardinality' => 'N:1',
            'link_direction' => 'source_to_target',
            'is_active' => true,
            'description' => 'Company Code to Client',
        ]);
        $client = StructureNode::create(['node_type_id' => 'CLIENT', 'code' => 'CLIENT-1', 'status' => 'active']);
        $company = StructureNode::create(['node_type_id' => 'COMP_CODE', 'code' => '1000', 'attributes_json' => ['country_code' => 'SA'], 'status' => 'active']);
        StructureLink::create([
            'source_node_uuid' => $company->node_uuid,
            'target_node_uuid' => $client->node_uuid,
            'topology_rule_id' => $rule->id,
            'link_type' => 'assignment',
            'valid_to' => now()->subDay()->toDateString(),
        ]);

        $issues = app(OrgStructureService::class)->runIntegrityCheck();

        $this->assertTrue(collect($issues)->contains(fn (array $issue) => $issue['category'] === 'missing_parent' && $issue['node_uuid'] === $company->node_uuid));
    }
}
