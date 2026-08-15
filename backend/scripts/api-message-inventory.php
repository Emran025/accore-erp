<?php

declare(strict_types=1);

$root = dirname(__DIR__);
$output = $root . '/storage/app/localization/api-message-inventory.json';
$iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($root . '/app/Http/Controllers'));
$findings = [];

foreach ($iterator as $file) {
    if (!$file->isFile() || $file->getExtension() !== 'php') {
        continue;
    }

    $content = file_get_contents($file->getPathname());
    if ($content === false) {
        continue;
    }

    preg_match_all('/(?:successResponse|errorResponse)\s*\([^\n]*?[\'\"]([^\'\"]{3,})[\'\"]/m', $content, $matches, PREG_OFFSET_CAPTURE);
    foreach ($matches[1] as [$message, $offset]) {
        if (str_contains($message, 'api.')) {
            continue;
        }
        $line = substr_count(substr($content, 0, $offset), "\n") + 1;
        $findings[] = [
            'file' => str_replace($root . '/', '', $file->getPathname()),
            'line' => $line,
            'message' => $message,
        ];
    }
}

usort($findings, static fn (array $left, array $right): int => [$left['file'], $left['line']] <=> [$right['file'], $right['line']]);
$summary = [
    'generated_at' => gmdate(DATE_ATOM),
    'legacy_message_count' => count($findings),
    'controller_file_count' => count(array_unique(array_column($findings, 'file'))),
    'findings' => $findings,
];

if (!is_dir(dirname($output))) {
    mkdir(dirname($output), 0775, true);
}
file_put_contents($output, json_encode($summary, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . PHP_EOL);
echo json_encode([
    'legacy_message_count' => $summary['legacy_message_count'],
    'controller_file_count' => $summary['controller_file_count'],
    'report' => str_replace($root . '/', '', $output),
], JSON_PRETTY_PRINT) . PHP_EOL;
