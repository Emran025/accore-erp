<?php

namespace Database\Factories;

use App\Models\NrGroupIntervalAssignment;
use App\Models\NrObject;
use App\Models\NrGroup;
use App\Models\NrInterval;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\NrGroupIntervalAssignment>
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
