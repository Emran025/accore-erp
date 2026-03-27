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

    public function index(ListSettingsAction $action): JsonResponse
    {
        $settings = $action->execute();

        return $this->successResponse(SettingResource::collection($settings));
    }

    public function getStoreSettings(GetStoreSettingsAction $action): JsonResponse
    {
        $settings = $action->execute();

        return $this->successResponse($settings);
    }

    public function updateStoreSettings(Request $request, UpdateStoreSettingsAction $action): JsonResponse
    {
        $action->execute($request->all());

        return $this->successResponse([], 'Store settings updated');
    }

    public function getInvoiceSettings(GetInvoiceSettingsAction $action): JsonResponse
    {
        $settings = $action->execute();

        return $this->successResponse($settings);
    }

    public function updateInvoiceSettings(Request $request, UpdateInvoiceSettingsAction $action): JsonResponse
    {
        $action->execute($request->all());

        return $this->successResponse([], 'Invoice settings updated');
    }

    public function update(Request $request, UpdateSettingsAction $action): JsonResponse
    {
        $action->execute($request->all());

        return $this->successResponse([], 'Settings updated successfully');
    }

    public function getZatcaSettings(GetZatcaSettingsAction $action): JsonResponse
    {
        $settings = $action->execute();

        return $this->successResponse($settings);
    }

    public function updateZatcaSettings(Request $request, UpdateZatcaSettingsAction $action): JsonResponse
    {
        $action->execute($request->all());

        return $this->successResponse([], 'ZATCA settings updated');
    }

    public function onboardZatca(OnboardZatcaRequest $request, OnboardZatcaAction $action): JsonResponse
    {
        $result = $action->execute($request->validated()['otp'], $request->validated()['csr_data'] ?? []);

        return $this->successResponse($result, 'ZATCA onboarding completed successfully');
    }
}