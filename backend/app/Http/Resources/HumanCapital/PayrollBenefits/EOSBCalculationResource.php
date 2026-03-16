<?php

namespace App\Http\Resources\HumanCapital\PayrollBenefits;

use Illuminate\Http\Resources\Json\JsonResource;

class EOSBCalculationResource extends JsonResource
{
    public static $wrap = null;

    public function toArray($request): array
    {
        // This handles both the result array and any Eloquent models if we ever use them
        $data = is_array($this->resource) ? $this->resource : $this->resource->toArray();

        return [
            'employee_id'        => $data['employee_id'] ?? null,
            'joining_date'       => $data['joining_date'] ?? null,
            'termination_date'   => $data['termination_date'] ?? null,
            'service_period'     => $data['service_period'] ?? null, // years, months, days
            'total_years'        => (float) ($data['total_years'] ?? 0),
            'base_salary'        => (float) ($data['base_salary'] ?? 0),
            'calculation_method' => $data['calculation_method'] ?? 'standard',
            'gratuity_amount'    => (float) ($data['gratuity_amount'] ?? 0),
            'other_allowances'   => (float) ($data['other_allowances'] ?? 0),
            'deductions'         => (float) ($data['deductions'] ?? 0),
            'net_eosb_amount'    => (float) ($data['net_eosb_amount'] ?? 0),
            'breakdown'          => $data['breakdown'] ?? [],
        ];
    }
}
