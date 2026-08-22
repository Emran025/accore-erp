<?php

namespace App\Console\Commands;

use App\Domains\EnterpriseCore\DesktopDistribution\Services\DesktopDistributionService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class AccoreDesktopIssueEnrollmentEvidenceCommand extends Command
{
    protected $signature = 'accore:desktop:issue-enrollment-evidence
                            {--label= : Optional device or operator label for the audit record}
                            {--expires-in= : Minutes before the evidence expires}
                            {--purpose=standard : standard or primary_claim}
                            {--output= : Write a protected JSON pairing package instead of printing evidence}';

    protected $description = 'Issue short-lived, single-use enrollment evidence for an Accore Client device.';

    public function handle(DesktopDistributionService $desktopDistribution): int
    {
        $minutes = $this->option('expires-in');
        $expiresAt = null;
        $purpose = (string) $this->option('purpose');

        if (! in_array($purpose, ['standard', 'primary_claim'], true)) {
            $this->error('The --purpose option must be standard or primary_claim.');

            return self::INVALID;
        }

        if ($minutes !== null) {
            if (! ctype_digit((string) $minutes) || (int) $minutes < 1 || (int) $minutes > 60) {
                $this->error('The --expires-in option must be an integer between 1 and 60 minutes.');

                return self::INVALID;
            }

            $expiresAt = now()->addMinutes((int) $minutes);
        }

        $output = $this->option('output');
        if (is_string($output) && $output !== '') {
            $apiBase = (string) config('desktop_distribution.public_api_base');
            $fingerprint = config('desktop_distribution.certificate_fingerprint');
            if ($apiBase === '' || ! is_string($fingerprint) || preg_match('/^[a-f0-9]{64}$/i', $fingerprint) !== 1) {
                $this->error('A protected pairing package requires ACCORE_DESKTOP_PUBLIC_API_BASE and a 64-character certificate fingerprint.');

                return self::FAILURE;
            }
        }

        $evidence = $desktopDistribution->issueEnrollmentEvidence(
            $this->option('label'),
            'local-administrator',
            $expiresAt,
            $purpose,
        );

        if (is_string($output) && $output !== '') {
            File::ensureDirectoryExists(dirname($output));
            File::put($output, json_encode([
                'schema_version' => 1,
                'api_base' => $apiBase,
                'server_id' => (string) config('desktop_distribution.server_id'),
                'server_name' => (string) config('desktop_distribution.server_name'),
                'certificate_fingerprint' => strtolower($fingerprint),
                'enrollment_evidence' => $evidence,
                'purpose' => $purpose,
                'expires_at' => ($expiresAt ?: now()->addMinutes((int) config('desktop_distribution.enrollment_evidence_ttl_minutes')))->toIso8601String(),
            ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES).PHP_EOL);
            $this->info("Enrollment package written to {$output}.");

            return self::SUCCESS;
        }

        $this->warn('Share this enrollment evidence only through an approved channel. It is displayed once and is not recoverable.');
        $this->line($evidence);

        return self::SUCCESS;
    }
}
