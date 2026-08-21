<?php

namespace Tests\Unit;

use App\Support\DesktopSeedState;
use PHPUnit\Framework\TestCase;

class DesktopSeedStateTest extends TestCase
{
    private string $path;

    protected function setUp(): void
    {
        parent::setUp();
        $this->path = sys_get_temp_dir().DIRECTORY_SEPARATOR.'accore-desktop-seed-state-'.bin2hex(random_bytes(8)).'.json';
    }

    protected function tearDown(): void
    {
        if (is_file($this->path)) {
            unlink($this->path);
        }
        if (is_file("{$this->path}.partial")) {
            unlink("{$this->path}.partial");
        }
        parent::tearDown();
    }

    public function test_a_revision_is_recorded_and_not_pending_after_reopen(): void
    {
        $state = DesktopSeedState::open($this->path);
        $this->assertFalse($state->hasRevision(1));

        $state->markApplied(1, 'applied');

        $reopened = DesktopSeedState::open($this->path);
        $this->assertTrue($reopened->hasRevision(1));
        $this->assertFalse($reopened->hasRevision(2));
    }

    public function test_an_invalid_state_file_is_rejected_without_resetting_it(): void
    {
        file_put_contents($this->path, '{not-valid-json');

        $this->expectException(\RuntimeException::class);
        DesktopSeedState::open($this->path);
    }
}
