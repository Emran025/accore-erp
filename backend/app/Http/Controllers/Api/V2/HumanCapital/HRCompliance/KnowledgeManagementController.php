<?php

namespace App\Http\Controllers\Api\V2\HumanCapital\HRCompliance;

use App\Http\Controllers\Controller;
use App\Domains\HumanCapital\HRCompliance\Actions\CreateExpertiseEntryAction;
use App\Domains\HumanCapital\HRCompliance\Actions\CreateKnowledgeBaseEntryAction;
use App\Domains\HumanCapital\HRCompliance\Actions\ListExpertiseEntriesAction;
use App\Domains\HumanCapital\HRCompliance\Actions\ListKnowledgeBaseEntriesAction;
use App\Domains\HumanCapital\HRCompliance\Actions\MarkKnowledgeBaseHelpfulAction;
use App\Domains\HumanCapital\HRCompliance\Actions\ShowKnowledgeBaseEntryAction;
use App\Domains\HumanCapital\HRCompliance\Actions\UpdateExpertiseEntryAction;
use App\Domains\HumanCapital\HRCompliance\Actions\UpdateKnowledgeBaseEntryAction;
use App\Http\Requests\HumanCapital\HRCompliance\StoreKnowledgeBaseRequest;
use App\Http\Requests\HumanCapital\HRCompliance\UpdateKnowledgeBaseRequest;
use App\Http\Requests\HumanCapital\HRCompliance\StoreExpertiseDirectoryRequest;
use App\Http\Requests\HumanCapital\HRCompliance\UpdateExpertiseDirectoryRequest;
use App\Http\Requests\HumanCapital\HRCompliance\ListKnowledgeBaseRequest;
use App\Http\Requests\HumanCapital\HRCompliance\ListExpertiseRequest;
use App\Domains\HumanCapital\HRCompliance\Models\KnowledgeBase;
use App\Domains\HumanCapital\HRCompliance\Models\ExpertiseDirectory;
use App\Http\Resources\HumanCapital\HRCompliance\KnowledgeBaseResource;
use App\Http\Resources\HumanCapital\HRCompliance\ExpertiseDirectoryResource;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;
use Illuminate\Http\JsonResponse;

class KnowledgeManagementController extends Controller
{
    use BaseApiController;

    // Knowledge Base
    public function indexKnowledgeBase(ListKnowledgeBaseRequest $request, ListKnowledgeBaseEntriesAction $action): JsonResponse
    {
        $result = $action->execute($request->validated());
        $data = $result['data'] ?? $result;

        return $this->successResponse(KnowledgeBaseResource::collection($data));
    }

    public function storeKnowledgeBase(StoreKnowledgeBaseRequest $request, CreateKnowledgeBaseEntryAction $action): JsonResponse
    {
        $result = $action->execute($request->validated());
        $kb = KnowledgeBase::find($result['id'] ?? $result);
        
        return $this->successResponse(new KnowledgeBaseResource($kb), 'Knowledge base entry created', 201);
    }

    public function showKnowledgeBase($id, ShowKnowledgeBaseEntryAction $action): JsonResponse
    {
        $result = $action->execute((int)$id);
        $kb = KnowledgeBase::find($id);
        
        return $this->successResponse(new KnowledgeBaseResource($kb));
    }

    public function updateKnowledgeBase(UpdateKnowledgeBaseRequest $request, $id, UpdateKnowledgeBaseEntryAction $action): JsonResponse
    {
        $result = $action->execute((int)$id, $request->validated());
        $kb = KnowledgeBase::find($id);
        
        return $this->successResponse(new KnowledgeBaseResource($kb), 'Knowledge base entry updated');
    }

    public function markHelpful($id, MarkKnowledgeBaseHelpfulAction $action): JsonResponse
    {
        $result = $action->execute((int)$id);
        $kb = KnowledgeBase::find($id);
        return $this->successResponse(new KnowledgeBaseResource($kb), 'Marked as helpful');
    }

    // Expertise Directory
    public function indexExpertise(ListExpertiseRequest $request, ListExpertiseEntriesAction $action): JsonResponse
    {
        $result = $action->execute($request->validated());
        $data = $result['data'] ?? $result;

        return $this->successResponse(ExpertiseDirectoryResource::collection($data));
    }

    public function storeExpertise(StoreExpertiseDirectoryRequest $request, CreateExpertiseEntryAction $action): JsonResponse
    {
        $result = $action->execute($request->validated());
        $expertise = ExpertiseDirectory::find($result['id'] ?? $result);
        
        return $this->successResponse(new ExpertiseDirectoryResource($expertise), 'Expertise entry created', 201);
    }

    public function updateExpertise(UpdateExpertiseDirectoryRequest $request, $id, UpdateExpertiseEntryAction $action): JsonResponse
    {
        $result = $action->execute((int)$id, $request->validated());
        $expertise = ExpertiseDirectory::find($id);
        
        return $this->successResponse(new ExpertiseDirectoryResource($expertise), 'Expertise entry updated');
    }
}
