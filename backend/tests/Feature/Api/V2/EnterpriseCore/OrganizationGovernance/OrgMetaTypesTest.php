<?php

namespace Tests\Feature\Api\V2\EnterpriseCore\OrganizationGovernance;

use App\Domains\EnterpriseCore\OrganizationGovernance\Models\OrgMetaType;
use App\Domains\EnterpriseCore\OrganizationGovernance\Models\OrgMetaTypeAttribute;
use Tests\TestCase;

class OrgMetaTypesTest extends TestCase
{
    public function test_meta_types_endpoint_exposes_configured_types_domains_and_dynamic_attributes(): void
    {
        $metaType = OrgMetaType::create([
            'id' => 'COMP_CODE',
            'display_name' => 'Company Code',
            'display_name_ar' => 'رمز الشركة',
            'level_domain' => 'Financial',
            'description' => 'Independent accounting entity',
            'is_assignable' => true,
            'sort_order' => 10,
        ]);

        OrgMetaTypeAttribute::create([
            'org_meta_type_id' => $metaType->id,
            'attribute_key' => 'name',
            'attribute_type' => 'text',
            'is_mandatory' => true,
            'validation_rule' => ['max' => 120],
            'sort_order' => 1,
        ]);

        $response = $this->withoutMiddleware()->getJson('/api/v2/org-structure/meta-types');

        $this->assertSuccessResponse($response)
            ->assertJsonPath('data.0.id', 'COMP_CODE')
            ->assertJsonPath('data.0.display_name', 'Company Code')
            ->assertJsonPath('data.0.display_name_ar', 'رمز الشركة')
            ->assertJsonPath('data.0.level_domain', 'Financial')
            ->assertJsonPath('data.0.is_assignable', true)
            ->assertJsonPath('data.0.attributes.0.attribute_key', 'name')
            ->assertJsonPath('data.0.attributes.0.attribute_type', 'text')
            ->assertJsonPath('data.0.attributes.0.is_mandatory', true);
    }
}
