<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class AccoreRuntimeHealthCommand extends Command
{
    protected $signature = 'accore:runtime:health {--json : Emit machine-readable JSON}';

    protected $description = 'Report non-secret Accore runtime diagnostics.';

    public function handle(): int
    {
        $checks = [
            'database' => $this->checkDatabase(),
            'cache' => $this->checkCache(),
            'storage' => $this->checkStorage(),
            'queue' => ['status' => config('queue.default') ? 'configured' : 'unconfigured'],
            'schema' => ['status' => app()->isDownForMaintenance() ? 'maintenance' : 'available'],
        ];
        $healthy = collect($checks)->every(fn (array $check) => in_array($check['status'], ['ok', 'configured', 'available'], true));
        $payload = ['healthy' => $healthy, 'checks' => $checks];
        if ($this->option('json')) {
            $this->line(json_encode($payload, JSON_THROW_ON_ERROR));
        } else {
            $this->table(['Component', 'Status'], collect($checks)->map(fn ($check, $name) => [$name, $check['status']])->all());
        }
        return $healthy ? self::SUCCESS : self::FAILURE;
    }

    private function checkDatabase(): array
    {
        try { DB::select('select 1'); return ['status' => 'ok']; }
        catch (\Throwable) { return ['status' => 'unavailable']; }
    }

    private function checkCache(): array
    {
        try { Cache::put('accore-runtime-health', true, 1); return ['status' => Cache::get('accore-runtime-health') ? 'ok' : 'unavailable']; }
        catch (\Throwable) { return ['status' => 'unavailable']; }
    }

    private function checkStorage(): array
    {
        return ['status' => is_writable(storage_path()) ? 'ok' : 'unavailable'];
    }
}
