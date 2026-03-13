<?php

namespace Database\Factories;

use App\Domains\Commercial\AccountsPayable\Models\ApSupplier;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Domains\Commercial\AccountsPayable\Models\ApSupplier>
 */
class ApSupplierFactory extends Factory
{
    protected $model = ApSupplier::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'supplier_code' => 'SUP-' . fake()->unique()->numerify('####'),
            'name' => fake()->company(),
            //'contact_person' => fake()->name(),
            'email' => fake()->unique()->companyEmail(),
            'phone' => fake()->phoneNumber(),
            'address' => fake()->address(),
            'tax_number' => fake()->optional()->numerify('###-####-####'),
            'payment_terms' => fake()->numberBetween(15, 60),
            //'is_active' => true,
        ];
    }

    /**
     * Create an inactive supplier
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    /**
     * Create a supplier with short payment terms
     */
    public function quickPayment(): static
    {
        return $this->state(fn (array $attributes) => [
            'payment_terms' => 7,
        ]);
    }
}
