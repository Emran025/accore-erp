<?php

namespace Database\Factories;

use App\Domains\Commercial\Sales\Models\SalesRepresentativeTransaction;
use App\Domains\Commercial\Sales\Models\SalesRepresentative;
use App\Domains\Finance\GeneralLedger\Models\UniversalJournal;

use Illuminate\Database\Eloquent\Factories\Factory;

class SalesRepresentativeTransactionFactory extends Factory
{
    protected $model = SalesRepresentativeTransaction::class;

    public function definition(): array
    {
        return [
            'sales_representative_id' => SalesRepresentative::factory(),
            'type' => $this->faker->randomElement(['commission', 'payment', 'return', 'adjustment']),
            'voucher_number' => function () {
                return UniversalJournal::factory()->create(['voucher_number' => 'SRT-' . fake()->unique()->numerify('#####')])->voucher_number;
            },
            'description' => $this->faker->sentence(),
            'transaction_date' => now(),
            'created_by' => 1,
            'is_deleted' => false,
        ];
    }
}
