<?php

namespace Database\Factories;

use App\Domains\EnterpriseCore\NumberRanges\Models\NrGroupIntervalAssignment;
use App\Domains\EnterpriseCore\NumberRanges\Models\NrObject;
use App\Domains\EnterpriseCore\NumberRanges\Models\NrGroup;
use App\Domains\EnterpriseCore\NumberRanges\Models\NrInterval;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Domains\EnterpriseCore\NumberRanges\Models\NrGroupIntervalAssignment>
 */
class NrGroupIntervalAssignmentFactory extends Factory
{
    protected $model = NrGroupIntervalAssignment::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $object = NrObject::factory()->create();
        
        return [
            'nr_object_id' => $object->id,
            'nr_group_id' => NrGroup::factory()->create(['nr_object_id' => $object->id])->id,
            'nr_interval_id' => NrInterval::factory()->create(['nr_object_id' => $object->id])->id,
            'is_active' => true,
        ];
    }
}
