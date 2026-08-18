<?php

namespace App\Console\Commands;

use App\Domains\EnterpriseCore\DesktopDistribution\Services\DesktopDistributionService;
use Illuminate\Console\Command;

class AccoreDesktopRevokeEnrollmentEvidenceCommand extends Command
{
    protected $signature = 'accore:desktop:revoke-enrollment-evidence
                            {evidence : Enrollment evidence that must be revoked}
                            {--reason=administrative-revocation : Non-secret revocation reason for the audit record}';

    protected $description = 'Revoke unused Accore Client enrollment evidence before it expires.';

    public function handle(DesktopDistributionService $desktopDistribution): int
    {
        $revoked = $desktopDistribution->revokeEnrollmentEvidence(
            $this->argument('evidence'),
            $this->option('reason'),
            'local-administrator',
        );

        if (! $revoked) {
            $this->error('No active unused enrollment evidence was found.');

            return self::FAILURE;
        }

        $this->info('Desktop enrollment evidence revoked successfully.');

        return self::SUCCESS;
    }
}
