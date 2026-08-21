<?php

namespace App\Console\Commands;

use App\Domains\EnterpriseCore\IdentityAccess\Models\User;
use App\Support\DesktopSeedState;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Console\Command;

class AccoreDesktopSeedCommand extends Command
{
    /**
     * Each later entry must name a narrow, idempotent seeder for that revision.
     * Revision 1 is the first-install baseline only.
     *
     * @var array<int, class-string>
     */
    private const SEED_REVISIONS = [
        1 => DatabaseSeeder::class,
    ];

    protected $signature = 'accore:desktop:seed {--state-path= : Durable path for the applied seed revisions}';

    protected $description = 'Apply pending ACCORE Server Desktop seed revisions once without resetting existing customer data.';

    public function handle(): int
    {
        $statePath = trim((string) $this->option('state-path'));
        if ($statePath === '') {
            $this->error('A durable --state-path is required for ACCORE Server Desktop seeding.');
            return self::FAILURE;
        }

        try {
            $state = DesktopSeedState::open($statePath);
        } catch (\Throwable $exception) {
            $this->error($exception->getMessage());
            return self::FAILURE;
        }

        foreach (self::SEED_REVISIONS as $revision => $seeder) {
            if ($state->hasRevision($revision)) {
                continue;
            }

            if ($revision === 1 && User::query()->exists()) {
                $state->markApplied($revision, 'adopted-existing-data');
                $this->info("Desktop seed revision {$revision} was adopted because customer users already exist.");
                continue;
            }

            $this->info("Applying ACCORE Server Desktop seed revision {$revision}.");
            $exitCode = $this->call('db:seed', [
                '--class' => $seeder,
                '--force' => true,
            ]);
            if ($exitCode !== self::SUCCESS) {
                return self::FAILURE;
            }

            $state->markApplied($revision, 'applied');
        }

        return self::SUCCESS;
    }
}
