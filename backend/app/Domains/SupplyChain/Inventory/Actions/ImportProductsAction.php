<?php

namespace App\Domains\SupplyChain\Inventory\Actions;

use Illuminate\Support\Facades\DB;

class ImportProductsAction
{
    public function __construct(
        private readonly CreateProductAction $createProductAction
    ) {}

    /**
     * @param array<int, array<string, mixed>> $rows
     * @return array<int, mixed>
     */
    public function execute(array $rows): array
    {
        return DB::transaction(function () use ($rows): array {
            $products = [];

            foreach ($rows as $row) {
                $products[] = $this->createProductAction->execute($row);
            }

            return $products;
        });
    }
}
