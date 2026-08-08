<?php

namespace App\Http\Resources\Intelligence\BusinessIntelligence;

use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\Commercial\SalesLifecycle\InvoiceResource;
use App\Http\Resources\SupplyChain\Procurement\PurchaseRequestResource;
use Illuminate\Support\Collection;

class DashboardResource extends JsonResource
{
    public function toArray($request): array
    {
        // If the action returned a list collection of items (detail mode)
        if ($this->resource instanceof Collection) {
            if ($this->resource->isEmpty() || is_int($this->resource->keys()->first())) {
                return $this->resource->toArray();
            }
        }
        if (is_array($this->resource) && (isset($this->resource[0]) || empty($this->resource))) {
            return $this->resource;
        }

        return [
            'kpis' => [
                'todays_sales'    => (float) ($this->resource['todays_sales'] ?? 0),
                'total_sales'     => (float) ($this->resource['total_sales'] ?? 0),
                'total_expenses'  => (float) ($this->resource['total_expenses'] ?? 0),
                'todays_expenses' => (float) ($this->resource['todays_expenses'] ?? 0),
                'total_revenues'  => (float) ($this->resource['total_revenues'] ?? 0),
                'todays_revenues' => (float) ($this->resource['todays_revenues'] ?? 0),
                'total_assets'    => (float) ($this->resource['total_assets'] ?? 0),
                'total_products'  => (int)   ($this->resource['total_products'] ?? 0),
                'low_stock_count' => (int)   ($this->resource['low_stock_count'] ?? 0),
            ],
            'breakdown' => [
                'sales' => $this->resource['sales_breakdown'] ?? [],
                'today' => $this->resource['today_breakdown'] ?? [],
            ],
            'recent_sales'      => InvoiceResource::collection($this->resource['recent_sales'] ?? []),
            'pending_requests'  => PurchaseRequestResource::collection($this->resource['pending_requests'] ?? []),
            'low_stock_items'   => $this->resource['low_stock_products'] ?? [],
            'expiring_products' => $this->resource['expiring_products'] ?? [],
        ];
    }
}
