<?php

namespace App\Domains\Commercial\CRM\Actions;

use App\Domains\Commercial\CRM\Models\ArCustomer;

class ListCustomersAction
{
    public function execute(array $filters): array
    {
        $page = max(1, (int) ($filters['page'] ?? 1));
        $perPage = min(100, max(1, (int) ($filters['per_page'] ?? 20)));
        $search = $filters['search'] ?? '';

        $query = ArCustomer::query();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%$search%")
                  ->orWhere('phone', 'like', "%$search%")
                  ->orWhere('tax_number', 'like', "%$search%");
            });
        }

        $total = $query->count();
        $customers = $query->orderBy('name')
            ->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->get()
            ->map(function ($customer) {
                $customer->total_debt = $customer->invoices()
                    ->where('payment_type', 'credit')
                    ->get()
                    ->sum('total_amount');
                
                $customer->total_paid = max(0, $customer->total_debt - (float) $customer->current_balance);
                return $customer;
            });

        return [
            'data' => $customers,
            'total' => $total,
            'current_page' => $page,
            'per_page' => $perPage,
        ];
    }
}
