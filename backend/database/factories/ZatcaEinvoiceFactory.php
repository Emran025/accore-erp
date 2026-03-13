<?php

namespace Database\Factories;

use App\Domains\Finance\Taxation\Models\ZatcaEinvoice;
use App\Domains\Commercial\Sales\Models\Invoice;
use Illuminate\Database\Eloquent\Factories\Factory;

class ZatcaEinvoiceFactory extends Factory
{
    protected $model = ZatcaEinvoice::class;

    public function definition()
    {
        return [
            'invoice_id' => Invoice::factory(),
            'xml_content' => '<Invoice>Mock</Invoice>',
            'hash' => $this->faker->sha256,
            'signed_xml' => '<Invoice>Signed Mock</Invoice>',
            'qr_code' => $this->faker->text(50),
            'zatca_uuid' => $this->faker->uuid,
            'status' => 'submitted',
            'submitted_at' => now(),
        ];
    }
}
