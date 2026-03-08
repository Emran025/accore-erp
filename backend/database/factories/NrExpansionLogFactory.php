<?php

namespace Database\Factories;

use App\Models\NrExpansionLog;
use App\Models\NrInterval;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\NrExpansionLog>
 */
class NrExpansionLogFactory extends Factory
{
    protected $model = NrExpansionLog::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nr_interval_id' => NrInterval::factory(),
            'old_from' => 1,
            'old_to' => 100,
            'new_from' => 1,
            'new_to' => 200,
            'reason' => fake()->sentence(),
        ];
    }
}
