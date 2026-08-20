<?php

namespace App\Domains\SupplyChain\Inventory\Actions;

use App\Domains\EnterpriseCore\Automation\Services\TelescopeService;
use App\Domains\SupplyChain\Inventory\Models\ProductImportBatch;
use App\Domains\SupplyChain\Inventory\Services\ProductImportPolicy;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ImportProductsAction
{
    public function __construct(
        private readonly CreateProductAction $createProductAction
    ) {}

    /**
     * @param array<int, array<string, mixed>> $rows
     * @param array<string, mixed> $context
     * @return array{products: array<int, mixed>, batch_id: string, replayed: bool}
     */
    public function execute(array $rows, array $context = []): array
    {
        $normalizedRows = array_map(
            static fn (array $row): array => ProductImportPolicy::normalizeRow($row),
            $rows
        );

        ProductImportPolicy::validateCoherence($normalizedRows);

        $requiredApprovalFieldIds = ProductImportPolicy::requiredApprovalFieldIds($normalizedRows);
        $acknowledgedFieldIds = array_values(array_unique(array_map('strval', $context['approval_field_ids'] ?? [])));
        $missingApprovalFieldIds = array_values(array_diff($requiredApprovalFieldIds, $acknowledgedFieldIds));
        if (!(bool) ($context['approval_acknowledged'] ?? false) || $missingApprovalFieldIds !== []) {
            throw ValidationException::withMessages([
                'approval_acknowledged' => 'Approval acknowledgment is required for all sensitive product fields.',
                'approval_field_ids' => $missingApprovalFieldIds,
            ]);
        }

        $batchId = ProductImportPolicy::batchId($context);
        $batch = ProductImportBatch::query()->where('batch_id', $batchId)->first();
        if ($batch?->status === 'committed') {
            $products = ProductImportBatch::query()->whereKey($batch->id)->firstOrFail()->product_ids ?? [];
            return [
                'products' => \App\Domains\SupplyChain\Inventory\Models\Product::query()->whereIn('id', $products)->get()->all(),
                'batch_id' => $batchId,
                'replayed' => true,
            ];
        }

        $batch = DB::transaction(function () use ($batchId, $context, $normalizedRows): ProductImportBatch {
            return ProductImportBatch::query()->lockForUpdate()->firstOrCreate(
                ['batch_id' => $batchId],
                [
                    'source_file' => $context['source_file'] ?? null,
                    'status' => 'pending',
                    'row_count' => count($normalizedRows),
                    'approval_field_ids' => $requiredApprovalFieldIds,
                    'created_by' => auth()->id() ?? session('user_id'),
                ]
            );
        });

        if ($batch->status !== 'pending') {
            throw ValidationException::withMessages([
                'batch_id' => 'This import batch is already being processed or has been rejected.',
            ]);
        }

        $auditContext = [
            'batch_id' => $batchId,
            'source_file' => $context['source_file'] ?? null,
            'approval_field_ids' => $requiredApprovalFieldIds,
            'row_count' => count($normalizedRows),
        ];

        return DB::transaction(function () use ($normalizedRows, $batch, $batchId, $auditContext): array {
            $products = [];
            foreach ($normalizedRows as $row) {
                $products[] = $this->createProductAction->execute($row);
            }

            $batch->update([
                'status' => 'committed',
                'product_ids' => array_map(static fn ($product): int => (int) $product->id, $products),
                'committed_at' => now(),
            ]);

            TelescopeService::logOperation('IMPORT', 'products', null, null, [
                ...$auditContext,
                'outcome' => 'committed',
            ]);

            return [
                'products' => $products,
                'batch_id' => $batchId,
                'replayed' => false,
            ];
        });
    }
}
