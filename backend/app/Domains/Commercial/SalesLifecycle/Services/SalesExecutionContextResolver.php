<?php

namespace App\Domains\Commercial\SalesLifecycle\Services;

use App\Domains\EnterpriseCore\OrganizationGovernance\Models\OperatingContext;
use App\Domains\EnterpriseCore\OrganizationGovernance\Models\StructureNode;
use App\Exceptions\BusinessLogicException;

/**
 * Resolves the store execution context for a sales transaction.
 *
 * A client may request an approved context, but it cannot supply arbitrary
 * warehouse, terminal, or accounting identifiers. The resolver derives those
 * fields from the selected/default context and validates their live
 * relationships before any invoice, inventory, cost, or ledger side effect.
 */
final class SalesExecutionContextResolver
{
    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    public function resolve(array $data, int $userId): array
    {
        $context = $this->resolveContext($data['operating_context_id'] ?? null, $userId);

        $this->assertContextIsOperational($context);
        $this->assertRequestedIdentifiersMatch($data, $context);

        $data['operating_context_id'] = $context->id;
        $data['warehouse_id'] = $context->warehouse_id;
        $data['pos_terminal_id'] = $context->pos_terminal_id;
        $data['cost_center_id'] = $context->cost_center_id;
        $data['profit_center_id'] = $context->profit_center_id;

        return $data;
    }

    private function resolveContext(mixed $requestedContextId, int $userId): OperatingContext
    {
        $query = OperatingContext::query()->with([
            'warehouse',
            'posTerminal',
            'costCenter',
            'profitCenter',
        ]);

        if ($requestedContextId !== null) {
            $context = $query->find($requestedContextId);

            if (! $context) {
                throw new BusinessLogicException('The requested operating context does not exist.', 422);
            }

            if ($context->user_id !== null && (int) $context->user_id !== $userId) {
                throw new BusinessLogicException('The requested operating context is not available to this user.', 422);
            }

            return $context;
        }

        $context = $query
            ->where('is_default', true)
            ->where(function ($contextQuery) use ($userId) {
                $contextQuery->where('user_id', $userId)->orWhereNull('user_id');
            })
            ->orderByRaw('user_id is null')
            ->first();

        if (! $context) {
            throw new BusinessLogicException('A ready operating context is required before creating a retail sale.', 422);
        }

        return $context;
    }

    private function assertContextIsOperational(OperatingContext $context): void
    {
        $warehouse = $context->warehouse;
        $terminal = $context->posTerminal;
        $costCenter = $context->costCenter;
        $profitCenter = $context->profitCenter;

        if ($context->status !== 'ready' || ! $context->is_default) {
            throw new BusinessLogicException('The selected operating context is not ready for sales.', 422);
        }

        if (! $context->org_node_uuid) {
            throw new BusinessLogicException('The operating context is not linked to an organizational store location.', 422);
        }

        if (! StructureNode::query()
            ->where('node_uuid', $context->org_node_uuid)
            ->where('status', 'active')
            ->exists()) {
            throw new BusinessLogicException('The operating context store location is inactive or unavailable.', 422);
        }

        if (! $warehouse || ! $warehouse->is_active || $warehouse->status !== 'active') {
            throw new BusinessLogicException('The operating context warehouse is inactive or missing.', 422);
        }

        if (! $terminal || ! $terminal->is_active || $terminal->status !== 'active') {
            throw new BusinessLogicException('The operating context POS terminal is inactive or missing.', 422);
        }

        if (! $costCenter || ! $costCenter->is_active || ! $profitCenter || ! $profitCenter->is_active) {
            throw new BusinessLogicException('The operating context accounting centers are inactive or missing.', 422);
        }

        if ($terminal->warehouse_id !== $warehouse->id) {
            throw new BusinessLogicException('The POS terminal does not belong to the operating context warehouse.', 422);
        }

        if ($warehouse->org_node_uuid !== $context->org_node_uuid || $terminal->org_node_uuid !== $context->org_node_uuid) {
            throw new BusinessLogicException('The warehouse and POS terminal must belong to the operating context store location.', 422);
        }

        if (
            $warehouse->cost_center_id !== $costCenter->id
            || $warehouse->profit_center_id !== $profitCenter->id
            || $terminal->cost_center_id !== $costCenter->id
            || $terminal->profit_center_id !== $profitCenter->id
        ) {
            throw new BusinessLogicException('The operating context resources are not aligned with its accounting centers.', 422);
        }
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function assertRequestedIdentifiersMatch(array $data, OperatingContext $context): void
    {
        $expected = [
            'warehouse_id' => $context->warehouse_id,
            'pos_terminal_id' => $context->pos_terminal_id,
            'cost_center_id' => $context->cost_center_id,
            'profit_center_id' => $context->profit_center_id,
        ];

        foreach ($expected as $key => $expectedId) {
            if (array_key_exists($key, $data) && $data[$key] !== null && (int) $data[$key] !== (int) $expectedId) {
                throw new BusinessLogicException("The requested {$key} does not match the approved operating context.", 422);
            }
        }
    }
}
