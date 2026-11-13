<?php

namespace Database\Factories;

use App\Domains\EnterpriseCore\OrganizationGovernance\Models\OrgBlueprint;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * Factory for OrgBlueprint model.
 * Produces a minimal valid blueprint JSON that passes ValidateBlueprintAction:
 * at least one unit with the 'legal_entity' facet and no dangling relationships.
 */
class OrgBlueprintFactory extends Factory
{
    protected $model = OrgBlueprint::class;

    public function definition(): array
    {
        $unitId = 'u_legal_root';

        return [
            'blueprint_uuid'   => (string) Str::uuid(),
            'name'             => $this->faker->company(),
            'status'           => 'staged',
            'complexity_grade' => 1,
            'primary_archetype' => 'SIMPLE_HIERARCHY',
            'blueprint_json'   => [
                'blueprint_id' => (string) Str::uuid(),
                'version'      => '2.0.0',
                'status'       => 'staged',
                'metadata'     => [
                    'complexity_grade'  => 1,
                    'primary_archetype' => 'SIMPLE_HIERARCHY',
                    'confidence_score'  => 0.95,
                ],
                'business_profile' => [
                    'company_name' => $this->faker->company(),
                    'company_code' => strtoupper($this->faker->lexify('????')),
                    'country_code' => 'SA',
                ],
                'units' => [
                    [
                        'temp_id'        => $unitId,
                        'type_id'        => 'COMP_CODE',
                        'code'           => strtoupper($this->faker->lexify('????')),
                        'name_en'        => $this->faker->company(),
                        'name_ar'        => 'شركة اختبار',
                        'facets'         => ['LegalEntityFacet', 'FinancialResponsibilityFacet', 'legal_entity'],
                        'attributes'     => [
                            'country_code' => 'SA',
                            'currency_id'  => '1',
                        ],
                        'is_user_locked' => false,
                    ],
                ],
                'relationships' => [],
                'positions'     => [],
                'capabilities'  => ['activated' => [], 'deferred' => []],
                'explainability' => [],
            ],
            'created_by'    => null,
            'published_at'  => null,
        ];
    }

    /**
     * State: blueprint with status 'validated'.
     */
    public function validated(): static
    {
        return $this->state(['status' => 'validated']);
    }

    /**
     * State: blueprint already published (should be rejected on re-publish).
     */
    public function published(): static
    {
        return $this->state([
            'status'       => 'published',
            'published_at' => now(),
        ]);
    }

    /**
     * State: blueprint with status 'archived'.
     */
    public function archived(): static
    {
        return $this->state(['status' => 'archived']);
    }
}
