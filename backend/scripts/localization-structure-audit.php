<?php

declare(strict_types=1);

$root = dirname(__DIR__);
$checks = [
    'database/seeders/CategorySeeder.php' => ['catalog_code', 'name_ar', 'name_en', 'updateOrCreate'],
    'database/seeders/ProductSeeder.php' => ['catalog_code', 'name_ar', 'name_en', 'description_ar', 'description_en', 'updateOrCreate'],
    'database/seeders/RoleSeeder.php' => ['role_name_ar', 'role_name_en', 'description_ar', 'description_en', 'updateOrCreate'],
    'database/seeders/TaxSeeder.php' => ['name_ar', 'name_en', 'description_ar', 'description_en', 'updateOrCreate'],
    'database/migrations/2026_08_15_000001_add_localized_fields_to_inventory_catalog.php' => ['name_ar', 'name_en', 'description_ar', 'description_en', 'catalog_code'],
    'database/migrations/2026_02_28_000004_add_localized_fields_to_reference_data.php' => ['description_ar', 'description_en', 'name_ar', 'name_en'],
];

$failures = [];
foreach ($checks as $relative => $needles) {
    $path = $root . '/' . $relative;
    if (!is_file($path)) {
        $failures[] = "$relative is missing";
        continue;
    }
    $source = file_get_contents($path);
    foreach ($needles as $needle) {
        if (!str_contains((string) $source, $needle)) {
            $failures[] = "$relative is missing required structure: $needle";
        }
    }
}

$apiInventory = $root . '/storage/app/localization/api-message-inventory.json';
$legacyMessages = 0;
if (is_file($apiInventory)) {
    $report = json_decode((string) file_get_contents($apiInventory), true);
    $legacyMessages = (int) ($report['legacy_message_count'] ?? 0);
}

$result = [
    'status' => $failures === [] ? 'pass' : 'fail',
    'checked_files' => count($checks),
    'legacy_controller_messages_inventory' => $legacyMessages,
    'failures' => $failures,
];

$output = $root . '/storage/app/localization/backend-structure-audit.json';
if (!is_dir(dirname($output))) mkdir(dirname($output), 0775, true);
file_put_contents($output, json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . PHP_EOL);
echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . PHP_EOL;
exit($failures === [] ? 0 : 1);
