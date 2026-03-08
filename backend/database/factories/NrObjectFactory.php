<?php

namespace Database\Factories;

use App\Models\NrObject;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\NrObject>
 */
class NrObjectFactory extends Factory
{
    protected $model = NrObject::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'object_type' => fake()->unique()->word() . '_' . fake()->randomNumber(4),
            'name' => fake()->word() . ' Numbering',
            'name_en' => fake()->word() . ' Numbering',
            'description' => fake()->sentence(),
            'number_length' => 6,
            'prefix' => fake()->lexify('???-'),
            'is_active' => true,
        ];
    }
}
