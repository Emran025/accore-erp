<?php

namespace App\Domains\SupplyChain\Inventory\Services;

use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

final class ProductImportPolicy
{
    public const CURRENT_SCHEMA_VERSION = 'product-import.v1';

    /** @throws ValidationException */
    public static function assertSupportedSchemaVersion(string $schemaVersion): void
    {
        if (!in_array($schemaVersion, [self::CURRENT_SCHEMA_VERSION], true)) {
            throw ValidationException::withMessages(['schema_version' => 'The requested product import schema is not supported.']);
        }
    }

    /** @var array<string, array<string, mixed>> */
    private const CLASS_POLICIES = [
        'product' => [
            'inventory_control' => true,
            'sellable' => true,
            'stock_allowed' => true,
        ],
        'service' => [
            'inventory_control' => false,
            'sellable' => true,
            'stock_allowed' => false,
        ],
        'raw_material' => [
            'inventory_control' => true,
            'sellable' => false,
            'stock_allowed' => true,
        ],
    ];

    /** @param array<string, mixed> $row */
    public static function normalizeRow(array $row): array
    {
        $itemType = self::normalizeClass($row['item_type'] ?? 'product');
        $policy = self::CLASS_POLICIES[$itemType];

        $row['item_type'] = $itemType;
        $row['inventory_control'] = $policy['stock_allowed']
            ? (array_key_exists('inventory_control', $row) ? (bool) $row['inventory_control'] : (bool) $policy['inventory_control'])
            : false;
        $row['sellable'] = $itemType === 'raw_material'
            ? false
            : (array_key_exists('sellable', $row) ? (bool) $row['sellable'] : (bool) $policy['sellable']);
        $row['stock_quantity'] = $policy['stock_allowed'] ? (int) ($row['stock_quantity'] ?? 0) : 0;
        $row['purchase_price'] = (float) ($row['purchase_price'] ?? 0);
        $row['unit_price'] = (float) ($row['unit_price'] ?? 0);
        $row['items_per_unit'] = max(1, (int) ($row['items_per_unit'] ?? 1));
        $row['low_stock_threshold'] = max(0, (int) ($row['low_stock_threshold'] ?? 10));
        $row['taxable'] = array_key_exists('taxable', $row) ? (bool) $row['taxable'] : true;

        return $row;
    }

    /** @param mixed $value */
    public static function normalizeClass($value): string
    {
        $normalized = strtolower(trim((string) $value));
        $normalized = preg_replace('/[\s-]+/', '_', $normalized) ?: 'product';

        return match ($normalized) {
            'service' => 'service',
            'raw_material', 'rawmaterial' => 'raw_material',
            default => 'product',
        };
    }

    /** @param array<int, array<string, mixed>> $rows */
    public static function approvalDigest(array $rows, array $approvalFieldIds, string $schemaVersion = self::CURRENT_SCHEMA_VERSION): string
    {
        $payload = [
            'schema_version' => $schemaVersion,
            'approval_field_ids' => array_values($approvalFieldIds),
            'rows' => array_values($rows),
        ];

        return hash('sha256', json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR));
    }

    /** @param array<int, array<string, mixed>> $rows */
    public static function requiredApprovalFieldIds(array $rows): array
    {
        $fieldIds = [];
        foreach ($rows as $row) {
            foreach (['item_type', 'catalog_code', 'purchase_price', 'stock_quantity', 'inventory_control', 'sellable', 'taxable'] as $fieldId) {
                if (array_key_exists($fieldId, $row) && trim((string) $row[$fieldId]) !== '') {
                    $fieldIds[$fieldId] = true;
                }
            }
        }

        return array_keys($fieldIds);
    }

    /** @param array<int, array<string, mixed>> $rows */
    public static function validateCoherence(array $rows): void
    {
        $seenCatalogCodes = [];
        foreach ($rows as $index => $row) {
            $normalized = self::normalizeRow($row);
            if (trim((string) ($normalized['name'] ?? '')) === '') {
                throw ValidationException::withMessages(["rows.$index.name" => 'Product name is required.']);
            }
            if ((float) $normalized['unit_price'] < 0 || (float) $normalized['purchase_price'] < 0) {
                throw ValidationException::withMessages(["rows.$index.price" => 'Product prices cannot be negative.']);
            }
            $catalogCode = trim((string) ($normalized['catalog_code'] ?? ''));
            if ($catalogCode !== '') {
                if (isset($seenCatalogCodes[$catalogCode])) {
                    throw ValidationException::withMessages(["rows.$index.catalog_code" => 'Catalog code is duplicated within this import batch.']);
                }
                $seenCatalogCodes[$catalogCode] = true;
            }
        }
    }

    /** @param array<int, array<string, mixed>> $rows */
    public static function batchId(array $context): string
    {
        $candidate = trim((string) ($context['batch_id'] ?? ''));
        return $candidate !== '' ? $candidate : (string) Str::uuid();
    }
}
