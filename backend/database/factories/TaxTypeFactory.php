<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Domains\Finance\TaxCompliance\Models\TaxType;
/**
 * @extends Factory<TaxType>
 */
class TaxTypeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'tax_authority_id' => TaxType::factory(),
            'code' => $this->faker->unique()->lexify('TAX-???'),
            'name' => $this->faker->word,
            'calculation_type' => 'percentage',
            'is_active' => true,
        ];
    }
}
