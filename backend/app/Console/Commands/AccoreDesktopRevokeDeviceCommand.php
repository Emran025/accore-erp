<?php

namespace App\Console\Commands;

use App\Domains\EnterpriseCore\DesktopDistribution\Services\DesktopDistributionService;
use Illuminate\Console\Command;

class AccoreDesktopRevokeDeviceCommand extends Command
{
    protected $signature = 'accore:desktop:revoke-device
                            {device-id : UUID assigned to the enrolled desktop device}
                            {--reason=administrative-revocation : Non-secret revocation reason for the audit record}';

    protected $description = 'Revoke an Accore Client device so its desktop policy requests are denied.';

    public function handle(DesktopDistributionService $desktopDistribution): int
    {
        $revoked = $desktopDistribution->revokeDevice(
            $this->argument('device-id'),
            $this->option('reason'),
            'local-administrator',
        );

        if (! $revoked) {
            $this->error('No active enrolled desktop device was found for the provided device ID.');

            return self::FAILURE;
        }

        $this->info('Desktop device revoked successfully.');

        return self::SUCCESS;
    }
}
