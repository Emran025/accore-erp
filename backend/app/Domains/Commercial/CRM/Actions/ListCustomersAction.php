<?php

namespace App\Domains\Commercial\CRM\Actions;

use App\Domains\Commercial\CRM\Models\ArCustomer;
use Illuminate\Support\Collection;

class ListCustomersAction
{
    public function execute(array $filters): Collection
    {
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

        $paginator = $query->orderBy('name')->paginate($perPage);

        $paginator->getCollection()->transform(function ($customer) {
            $customer->total_debt = $customer->invoices()
                ->where('payment_type', 'credit')
                ->get()
                ->sum('total_amount');
            
            $customer->total_paid = max(0, $customer->total_debt - (float) $customer->current_balance);
            return $customer;
        });

        return collect(['paginator' => $paginator]);
    }
}
