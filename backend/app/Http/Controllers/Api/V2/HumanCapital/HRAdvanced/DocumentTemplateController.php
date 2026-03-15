<?php

namespace App\Http\Controllers\Api\V2\HumanCapital\HRAdvanced;

use App\Http\Controllers\Controller;
use App\Domains\HumanCapital\HRAdvanced\Services\TemplateRegistry;
use App\Http\Requests\HumanCapital\HRAdvanced\StoreDocumentTemplateRequest;
use App\Http\Requests\HumanCapital\HRAdvanced\UpdateDocumentTemplateRequest;
use App\Http\Requests\HumanCapital\HRAdvanced\RenderDocumentTemplateRequest;
use App\Http\Requests\HumanCapital\HRAdvanced\ListDocumentTemplatesRequest;
use App\Domains\HumanCapital\HRAdvanced\Actions\CreateHrDocumentTemplateAction;
use App\Domains\HumanCapital\HRAdvanced\Actions\DeleteHrDocumentTemplateAction;
use App\Domains\HumanCapital\HRAdvanced\Actions\GetHrDocumentTemplateApprovedKeysAction;
use App\Domains\HumanCapital\HRAdvanced\Actions\ListHrDocumentTemplatesAction;
use App\Domains\HumanCapital\HRAdvanced\Actions\RenderHrDocumentTemplateAction;
use App\Domains\HumanCapital\HRAdvanced\Actions\ShowHrDocumentTemplateAction;
use App\Domains\HumanCapital\HRAdvanced\Actions\UpdateHrDocumentTemplateAction;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Domains\EnterpriseCore\OrganizationGovernance\Models\DocumentTemplate;
use App\Http\Resources\EnterpriseCore\OrganizationGovernance\DocumentTemplateResource;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;

class DocumentTemplateController extends Controller
{
    use BaseApiController;

    protected TemplateRegistry $registry;

    protected array $hrTypes = [
        'contract', 'clearance', 'warning', 'id_card', 
        'handover', 'certificate', 'memo', 'other',
        'employee_certificate', 'employee_contract'
    ];

    public function __construct(TemplateRegistry $registry)
    {
        $this->registry = $registry;
    }

    public function index(ListDocumentTemplatesRequest $request, ListHrDocumentTemplatesAction $action): JsonResponse
    {
        if ($request->filled('type')) {
            $this->validateHrType($request->type);
        }

        $result = $action->execute($request->validated());
        
        $data = $result['data'] ?? $result;

        return $this->successResponse(DocumentTemplateResource::collection($data));
    }

    public function store(StoreDocumentTemplateRequest $request, CreateHrDocumentTemplateAction $action): JsonResponse
    {
        $validated = $request->validated();
        $this->validateHrType($validated['template_type']);

        $result = $action->execute($validated);
        $template = DocumentTemplate::find($result['id'] ?? $result);
        return $this->successResponse(new DocumentTemplateResource($template), 'Template created successfully', 201);
    }

    public function show($id, ShowHrDocumentTemplateAction $action): JsonResponse
    {
        $template = DocumentTemplate::findOrFail($id);
        $this->validateHrType($template->template_type);
        
        $result = $action->execute((int)$id);
        $template = DocumentTemplate::find($result['id'] ?? $id);
        return $this->successResponse(new DocumentTemplateResource($template));
    }

    public function update(UpdateDocumentTemplateRequest $request, $id, UpdateHrDocumentTemplateAction $action): JsonResponse
    {
        $template = DocumentTemplate::findOrFail($id);
        $this->validateHrType($template->template_type);

        $result = $action->execute((int)$id, $request->validated());
        $template = DocumentTemplate::find($result['id'] ?? $id);
        return $this->successResponse(new DocumentTemplateResource($template), 'Template updated successfully');
    }

    public function destroy($id, DeleteHrDocumentTemplateAction $action): JsonResponse
    {
        $template = DocumentTemplate::findOrFail($id);
        $this->validateHrType($template->template_type);
        
        $action->execute((int)$id);
        return $this->successResponse([], 'Template deactivated successfully');
    }

    public function render(RenderDocumentTemplateRequest $request, $id, RenderHrDocumentTemplateAction $action): JsonResponse
    {
        $template = DocumentTemplate::findOrFail($id);
        $this->validateHrType($template->template_type);

        $result = $action->execute((int)$id, $request->validated());
        return $this->successResponse($result, 'Template rendered successfully');
    }

    public function getApprovedKeys(Request $request, GetHrDocumentTemplateApprovedKeysAction $action): JsonResponse
    {
        $request->validate(['type' => 'required|string']);
        $this->validateHrType($request->type);

        $result = $action->execute($request->type);
        return $this->successResponse($result, 'Approved keys fetched');
    }

    protected function validateHrType(string $type): void
    {
        if (!in_array($type, $this->hrTypes) || !$this->registry->isApprovedType($type)) {
            abort(400, "Template type '{$type}' is not an approved HR template type");
        }
    }
}
