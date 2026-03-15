<?php

namespace App\Http\Controllers\Api\V2\EnterpriseCore\OrganizationGovernance;

use App\Http\Controllers\Controller;
use App\Domains\EnterpriseCore\OrganizationGovernance\Actions\GetInvoiceSettingsAction;
use App\Domains\EnterpriseCore\OrganizationGovernance\Actions\GetStoreSettingsAction;
use App\Domains\EnterpriseCore\OrganizationGovernance\Actions\GetZatcaSettingsAction;
use App\Domains\EnterpriseCore\OrganizationGovernance\Actions\ListSettingsAction;
use App\Domains\EnterpriseCore\OrganizationGovernance\Actions\OnboardZatcaAction;
use App\Domains\EnterpriseCore\OrganizationGovernance\Actions\UpdateInvoiceSettingsAction;
use App\Domains\EnterpriseCore\OrganizationGovernance\Actions\UpdateSettingsAction;
use App\Domains\EnterpriseCore\OrganizationGovernance\Actions\UpdateStoreSettingsAction;
use App\Domains\EnterpriseCore\OrganizationGovernance\Actions\UpdateZatcaSettingsAction;
use App\Http\Resources\EnterpriseCore\OrganizationGovernance\SettingResource;
use App\Http\Requests\EnterpriseCore\OrganizationGovernance\OnboardZatcaRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;

class SettingsController extends Controller
{
    use BaseApiController;

    public function index(): JsonResponse
    {
        $data = (new ListSettingsAction())->execute();
        $settings = $data['data'] ?? $data;

        return $this->successResponse(SettingResource::collection($settings));
    }

    public function getStoreSettings(): JsonResponse
    {
        $settings = (new GetStoreSettingsAction())->execute();

        return $this->successResponse($settings);
    }

    public function updateStoreSettings(Request $request): JsonResponse
    {
        (new UpdateStoreSettingsAction())->execute($request->all());

        return $this->successResponse([], 'Store settings updated');
    }

    public function getInvoiceSettings(): JsonResponse
    {
        $settings = (new GetInvoiceSettingsAction())->execute();

        return $this->successResponse($settings);
    }

    public function updateInvoiceSettings(Request $request): JsonResponse
    {
        (new UpdateInvoiceSettingsAction())->execute($request->all());

        return $this->successResponse([], 'Invoice settings updated');
    }

    public function update(Request $request): JsonResponse
    {
        (new UpdateSettingsAction())->execute($request->all());

        return $this->successResponse([], 'Settings updated successfully');
    }

    public function getZatcaSettings(): JsonResponse
    {
        $settings = (new GetZatcaSettingsAction())->execute();

        return $this->successResponse($settings);
    }

    public function updateZatcaSettings(Request $request): JsonResponse
    {
        (new UpdateZatcaSettingsAction())->execute($request->all());

        return $this->successResponse([], 'ZATCA settings updated');
    }

    public function onboardZatca(OnboardZatcaRequest $request): JsonResponse
    {
        $action = app(OnboardZatcaAction::class);
        $result = $action->execute($request->validated()['otp'], $request->validated()['csr_data'] ?? []);

        return $this->successResponse($result, 'ZATCA onboarding completed successfully');
    }
}