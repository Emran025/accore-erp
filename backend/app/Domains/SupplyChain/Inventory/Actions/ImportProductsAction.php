<?php

namespace App\Domains\SupplyChain\Inventory\Actions;

use App\Domains\EnterpriseCore\Automation\Services\TelescopeService;
use App\Domains\SupplyChain\Inventory\Models\Product;
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
        $batch = DB::transaction(function () use ($batchId, $context, $normalizedRows, $requiredApprovalFieldIds): ProductImportBatch {
            $batch = ProductImportBatch::query()->lockForUpdate()->where('batch_id', $batchId)->first();
            if ($batch?->status === 'committed') return $batch;
            if ($batch?->status === 'processing') {
                throw ValidationException::withMessages([
                    'batch_id' => 'This import batch is already being processed.',
                ]);
            }

            if (!$batch) {
                $batch = new ProductImportBatch([
                    'batch_id' => $batchId,
                    'source_file' => $context['source_file'] ?? null,
                    'row_count' => count($normalizedRows),
                    'approval_field_ids' => $requiredApprovalFieldIds,
                    'created_by' => auth()->id() ?? session('user_id'),
                ]);
            }

            $batch->fill([
                'source_file' => $context['source_file'] ?? $batch->source_file,
                'status' => 'processing',
                'row_count' => count($normalizedRows),
                'approval_field_ids' => $requiredApprovalFieldIds,
                'failure_reason' => null,
            ])->save();

            return $batch->fresh();
        });

        if ($batch->status === 'committed') {
            $products = $batch->product_ids ?? [];
            return [
                'products' => Product::query()->whereIn('id', $products)->get()->all(),
                'batch_id' => $batchId,
                'replayed' => true,
            ];
        }

        $auditContext = [
            'batch_id' => $batchId,
            'source_file' => $context['source_file'] ?? null,
            'approval_field_ids' => $requiredApprovalFieldIds,
            'row_count' => count($normalizedRows),
        ];

        try {
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
        } catch (\Throwable $exception) {
            ProductImportBatch::query()->whereKey($batch->id)->update([
                'status' => 'failed',
                'failure_reason' => mb_substr($exception->getMessage(), 0, 1000),
            ]);
            TelescopeService::logOperation('IMPORT_FAILED', 'products', null, null, [
                ...$auditContext,
                'outcome' => 'failed',
                'reason' => mb_substr($exception->getMessage(), 0, 1000),
            ]);
            throw $exception;
        }
    }
}
