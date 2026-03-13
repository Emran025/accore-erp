<?php

namespace Database\Factories;

use App\Domains\EnterpriseCore\NumberRanges\Models\NrInterval;
use App\Domains\EnterpriseCore\NumberRanges\Models\NrObject;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Domains\EnterpriseCore\NumberRanges\Models\NrInterval>
 */
class NrIntervalFactory extends Factory
{
    protected $model = NrInterval::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nr_object_id' => NrObject::factory(),
            'code' => fake()->unique()->lexify('INT-???'),
            'description' => fake()->sentence(),
            'from_number' => 1000,
            'to_number' => 9999,
            'current_number' => 0,
            'is_external' => false,
            'is_active' => true,
        ];
    }
    
    /**
     * Set external numbering
     */
    public function external(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_external' => true,
        ]);
    }
}
