<?php

namespace App\Support;

use RuntimeException;

final class DesktopSeedState
{
    private const FORMAT = 'accore-desktop-seed-state-v1';

    /** @var array<string, array{status: string, appliedAt: string}> */
    private array $revisions;

    private function __construct(private readonly string $path, array $revisions)
    {
        $this->revisions = $revisions;
    }

    public static function open(string $path): self
    {
        if (!is_file($path)) {
            return new self($path, []);
        }

        try {
            $payload = json_decode((string) file_get_contents($path), true, flags: JSON_THROW_ON_ERROR);
        } catch (\Throwable $exception) {
            throw new RuntimeException("Unable to read desktop seed state: {$exception->getMessage()}", previous: $exception);
        }

        if (($payload['format'] ?? null) !== self::FORMAT || !is_array($payload['revisions'] ?? null)) {
            throw new RuntimeException('Desktop seed state has an unsupported format.');
        }

        return new self($path, $payload['revisions']);
    }

    public function hasRevision(int $revision): bool
    {
        return array_key_exists((string) $revision, $this->revisions);
    }

    public function markApplied(int $revision, string $status): void
    {
        $directory = dirname($this->path);
        if (!is_dir($directory) && !mkdir($directory, 0770, true) && !is_dir($directory)) {
            throw new RuntimeException("Unable to create desktop seed-state directory: {$directory}");
        }

        $this->revisions[(string) $revision] = [
            'status' => $status,
            'appliedAt' => now()->toAtomString(),
        ];

        $payload = json_encode([
            'format' => self::FORMAT,
            'revisions' => $this->revisions,
        ], JSON_PRETTY_PRINT | JSON_THROW_ON_ERROR);
        $temporary = "{$this->path}.partial";
        if (file_put_contents($temporary, $payload) === false) {
            throw new RuntimeException("Unable to write desktop seed state: {$temporary}");
        }
        if (is_file($this->path) && !unlink($this->path)) {
            throw new RuntimeException("Unable to replace desktop seed state: {$this->path}");
        }
        if (!rename($temporary, $this->path)) {
            throw new RuntimeException("Unable to publish desktop seed state: {$this->path}");
        }
    }
}
