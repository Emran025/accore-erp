<?php

namespace App\Http\Controllers\Api\V2\EnterpriseCore\Governance;

use App\Http\Controllers\Controller;
use App\Domains\EnterpriseCore\Governance\Actions\GetInvoiceSettingsAction;
use App\Domains\EnterpriseCore\Governance\Actions\GetStoreSettingsAction;
use App\Domains\EnterpriseCore\Governance\Actions\GetZatcaSettingsAction;
use App\Domains\EnterpriseCore\Governance\Actions\ListSettingsAction;
use App\Domains\EnterpriseCore\Governance\Actions\OnboardZatcaAction;
use App\Domains\EnterpriseCore\Governance\Actions\UpdateInvoiceSettingsAction;
use App\Domains\EnterpriseCore\Governance\Actions\UpdateSettingsAction;
use App\Domains\EnterpriseCore\Governance\Actions\UpdateStoreSettingsAction;
use App\Domains\EnterpriseCore\Governance\Actions\UpdateZatcaSettingsAction;
use App\Http\Requests\EnterpriseCore\Governance\OnboardZatcaRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;

class SettingsController extends Controller
{
    use BaseApiController;

    public function index(): JsonResponse
    {
        $data = (new ListSettingsAction())->execute();

        return $this->successResponse($data);
    }

    public function getStoreSettings(): JsonResponse
    {
        $settings = (new GetStoreSettingsAction())->execute();

        return response()->json(['success' => true, 'settings' => $settings]);
    }

    public function updateStoreSettings(Request $request): JsonResponse
    {
        (new UpdateStoreSettingsAction())->execute($request->all());

        return $this->successResponse([], 'Store settings updated');
    }

    public function getInvoiceSettings(): JsonResponse
    {
        $settings = (new GetInvoiceSettingsAction())->execute();

        return response()->json(['success' => true, 'settings' => $settings]);
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

        return response()->json(['success' => true, 'settings' => $settings]);
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

        return response()->json($result);
    }
}