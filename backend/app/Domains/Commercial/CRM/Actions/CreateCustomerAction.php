<?php

namespace App\Domains\Commercial\CRM\Actions;

use App\Domains\Commercial\CRM\Models\ArCustomer;
use Illuminate\Support\Facades\DB;
use App\Domains\EnterpriseCore\SystemOverview\Services\NumberRangeService;

class CreateCustomerAction
{
    public function execute(array $data, int $userId): ArCustomer
    {
        return DB::transaction(function () use ($data, $userId) {
            $exists = ArCustomer::where(function ($query) use ($data) {
                $query->where('name', $data['name']);
                if (!empty($data['phone'])) {
                    $query->orWhere('phone', $data['phone']);
                }
            })->exists();

            if ($exists) {
                throw new \Exception('Customer with this name or phone already exists', 409);
            }

            // Handle Auto Number Generation
            if (empty($data['customer_code']) && !empty($data['nr_object_id']) && !empty($data['nr_group_id'])) {
                $nrService = app(NumberRangeService::class);
                $data['customer_code'] = $nrService->getNextNumber($data['nr_object_id'], $data['nr_group_id']);
            }

            $customer = ArCustomer::create([
                ...$data,
                'created_by' => $userId,
            ]);

            return $customer;
        });
    }
}
