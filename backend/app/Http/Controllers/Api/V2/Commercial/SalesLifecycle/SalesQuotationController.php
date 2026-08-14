<?php

namespace App\Http\Controllers\Api\V2\Commercial\SalesLifecycle;

use App\Domains\Commercial\SalesLifecycle\Models\SalesQuotation;
use App\Domains\Commercial\SalesLifecycle\Services\SalesQuotationService;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;
use App\Http\Controllers\Controller;
use App\Http\Requests\Commercial\SalesLifecycle\StoreSalesQuotationRequest;
use App\Http\Resources\Commercial\SalesLifecycle\SalesQuotationResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SalesQuotationController extends Controller
{
    use BaseApiController;

    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'status' => ['nullable', Rule::in(SalesQuotation::STATUSES)],
            'search' => ['nullable', 'string', 'max:100'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $quotations = SalesQuotation::query()
            ->with(['warehouse'])
            ->when($request->filled('status'), fn ($query) => $query->where('status', $request->string('status')->toString()))
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->string('search')->toString();
                $query->where(function ($nested) use ($search) {
                    $nested->where('quote_number', 'like', "%{$search}%")
                        ->orWhere('customer_name', 'like', "%{$search}%")
                        ->orWhere('customer_contact', 'like', "%{$search}%");
                });
            })
            ->latest('id')
            ->paginate($request->integer('per_page', 20));

        return $this->successResponse(SalesQuotationResource::collection($quotations));
    }

    public function store(StoreSalesQuotationRequest $request, SalesQuotationService $service): JsonResponse
    {
        $quotation = $service->create($request->validated(), $request->user()?->id);

        return $this->successResponse(new SalesQuotationResource($quotation), 'Quotation created successfully', 201);
    }

    public function show(int $id): JsonResponse
    {
        $quotation = SalesQuotation::with(['items.product', 'warehouse', 'customer', 'createdBy'])->findOrFail($id);

        return $this->successResponse(new SalesQuotationResource($quotation));
    }

    public function updateStatus(Request $request, int $id, SalesQuotationService $service): JsonResponse
    {
        $data = $request->validate([
            'status' => ['required', Rule::in(SalesQuotation::STATUSES)],
        ]);

        $quotation = SalesQuotation::findOrFail($id);
        $updated = $service->updateStatus($quotation, $data['status']);

        return $this->successResponse(new SalesQuotationResource($updated), 'Quotation status updated successfully');
    }
}
