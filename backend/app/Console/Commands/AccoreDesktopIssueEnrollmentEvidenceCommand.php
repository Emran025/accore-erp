<?php

namespace App\Console\Commands;

use App\Domains\EnterpriseCore\DesktopDistribution\Services\DesktopDistributionService;
use Illuminate\Console\Command;

class AccoreDesktopIssueEnrollmentEvidenceCommand extends Command
{
    protected $signature = 'accore:desktop:issue-enrollment-evidence
                            {--label= : Optional device or operator label for the audit record}
                            {--expires-in= : Minutes before the evidence expires}';

    protected $description = 'Issue short-lived, single-use enrollment evidence for an Accore Client device.';

    public function handle(DesktopDistributionService $desktopDistribution): int
    {
        $minutes = $this->option('expires-in');
        $expiresAt = null;

        if ($minutes !== null) {
            if (! ctype_digit((string) $minutes) || (int) $minutes < 1 || (int) $minutes > 60) {
                $this->error('The --expires-in option must be an integer between 1 and 60 minutes.');

                return self::INVALID;
            }

            $expiresAt = now()->addMinutes((int) $minutes);
        }

        $evidence = $desktopDistribution->issueEnrollmentEvidence(
            $this->option('label'),
            'local-administrator',
            $expiresAt,
        );

        $this->warn('Share this enrollment evidence only through an approved channel. It is displayed once and is not recoverable.');
        $this->line($evidence);

        return self::SUCCESS;
    }
}
