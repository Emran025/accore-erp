<?php

namespace App\Domains\SupplyChain\Procurement\Actions;

use App\Domains\SupplyChain\Procurement\Models\PurchaseRequest;
use App\Domains\SupplyChain\Inventory\Models\Product;

class AutoGenerateRequestsAction
{
    public function execute(int $userId): array
    {
        $products = Product::whereRaw('stock_quantity <= low_stock_threshold')->get();
        $generatedCount = 0;

        foreach ($products as $product) {
            $existingRequest = PurchaseRequest::where('product_id', $product->id)
                ->where('status', 'pending')
                ->first();

            if (!$existingRequest) {
                $suggestedQuantity = max(10, $product->low_stock_threshold * 2);
                
                PurchaseRequest::create([
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'quantity' => $suggestedQuantity,
                    'user_id' => $userId,
                    'status' => 'pending',
                    'notes' => 'Auto-generated due to low stock (' . $product->stock_quantity . ' left)',
                ]);
                $generatedCount++;
            }
        }

        return [
            'message' => "Successfully generated {$generatedCount} purchase requests for low stock items.",
            'generated_count' => $generatedCount
        ];
    }
}
