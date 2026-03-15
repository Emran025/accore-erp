<?php

namespace App\Http\Controllers\Api\V2\Finance\TaxCompliance;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;
use App\Http\Requests\Finance\TaxCompliance\UpdateTaxAuthorityRequest;
use App\Http\Requests\Finance\TaxCompliance\StoreTaxTypeRequest;
use App\Http\Requests\Finance\TaxCompliance\UpdateTaxTypeRequest;
use App\Domains\Finance\TaxCompliance\Actions\GetTaxSetupAction;
use App\Domains\Finance\TaxCompliance\Actions\UpdateTaxAuthorityAction;
use App\Domains\Finance\TaxCompliance\Actions\CreateTaxTypeAction;
use App\Domains\Finance\TaxCompliance\Actions\UpdateTaxTypeAction;
use App\Domains\Finance\TaxCompliance\Actions\DeleteTaxTypeAction;
use App\Domains\Finance\TaxCompliance\Models\TaxAuthority;
use App\Domains\Finance\TaxCompliance\Models\TaxType;
use App\Http\Resources\Finance\TaxCompliance\TaxAuthorityResource;
use App\Http\Resources\Finance\TaxCompliance\TaxTypeResource;

class TaxEngineController extends Controller
{
    use BaseApiController;

    /**
     * Get the full unified tax setup including Authorities, Types, and their default rates.
     */
    public function getSetup(GetTaxSetupAction $action): JsonResponse
    {
        return $this->successResponse($action->execute());
    }

    /**
     * Update Tax Authority (e.g. ZATCA connection credentials & policies)
     */
    public function updateAuthority(UpdateTaxAuthorityRequest $request, $id, UpdateTaxAuthorityAction $action): JsonResponse
    {
        try {
            $result = $action->execute($request->validated(), (int)$id);
            $authority = TaxAuthority::find($result['id'] ?? $id);
            return $this->successResponse(new TaxAuthorityResource($authority), 'Tax Authority updated successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 500);
        }
    }

    /**
     * Create a new Tax Type
     */
    public function storeTaxType(StoreTaxTypeRequest $request, CreateTaxTypeAction $action): JsonResponse
    {
        try {
            $result = $action->execute($request->validated());
            $taxType = TaxType::find($result['id'] ?? $result);
            return $this->successResponse(new TaxTypeResource($taxType), 'Tax Type created successfully', 201);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 500);
        }
    }

    /**
     * Update a Tax Type
     */
    public function updateTaxType(UpdateTaxTypeRequest $request, $id, UpdateTaxTypeAction $action): JsonResponse
    {
        try {
            $result = $action->execute($request->validated(), (int)$id);
            $taxType = TaxType::find($result['id'] ?? $id);
            return $this->successResponse(new TaxTypeResource($taxType), 'Tax Type updated successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 500);
        }
    }

    /**
     * Delete a Tax Type
     */
    public function destroyTaxType($id, DeleteTaxTypeAction $action): JsonResponse
    {
        try {
            $action->execute((int)$id);
            return $this->successResponse([], 'Tax Type deleted successfully.');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 500);
        }
    }
}
