<?php

namespace App\Domains\EnterpriseCore\OrganizationGovernance\Actions;

use App\Domains\Finance\TaxCompliance\Services\ZATCAService;

class OnboardZatcaAction
{
    private ZATCAService $zatcaService;

    public function __construct(ZATCAService $zatcaService)
    {
        $this->zatcaService = $zatcaService;
    }

    public function execute(string $otp, array $csrData = [])
    {
        return $this->zatcaService->onboard($otp, $csrData);
    }
}
