<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Domains\Finance\Taxation\Models\TaxRate>
 */
class TaxRateFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'tax_type_id' => \App\Domains\Finance\Taxation\Models\TaxType::factory(),
            'rate' => 0.15,
            'fixed_amount' => 0.00,
            'effective_from' => '2000-01-01',
            'effective_to' => null,
            'is_default' => true,
        ];
    }
}
