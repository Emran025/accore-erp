<?php

namespace Database\Factories;

use App\Models\NrGroup;
use App\Models\NrObject;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\NrGroup>
 */
class NrGroupFactory extends Factory
{
    protected $model = NrGroup::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nr_object_id' => NrObject::factory(),
            'code' => fake()->unique()->lexify('GRP-???'),
            'name' => fake()->word() . ' Group',
            'name_en' => fake()->word() . ' Group',
            'description' => fake()->sentence(),
            'is_active' => true,
        ];
    }
}
