<?php

namespace App\Domains\EnterpriseCore\Governance\Actions;

use App\Domains\Finance\Taxation\Services\ZATCAService;

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
