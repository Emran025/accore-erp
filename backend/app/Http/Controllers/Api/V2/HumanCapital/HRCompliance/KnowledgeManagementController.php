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
        
        return $this->successResponse($result);
    }

    public function storeKnowledgeBase(StoreKnowledgeBaseRequest $request, CreateKnowledgeBaseEntryAction $action): JsonResponse
    {
        $result = $action->execute($request->validated());
        
        return $this->successResponse($result, 'Knowledge base entry created');
    }

    public function showKnowledgeBase($id, ShowKnowledgeBaseEntryAction $action): JsonResponse
    {
        $result = $action->execute((int)$id);
        
        return $this->successResponse($result);
    }

    public function updateKnowledgeBase(UpdateKnowledgeBaseRequest $request, $id, UpdateKnowledgeBaseEntryAction $action): JsonResponse
    {
        $result = $action->execute((int)$id, $request->validated());
        
        return $this->successResponse($result, 'Knowledge base entry updated');
    }

    public function markHelpful($id, MarkKnowledgeBaseHelpfulAction $action): JsonResponse
    {
        $result = $action->execute((int)$id);
        return $this->successResponse($result, 'Marked as helpful');
    }

    // Expertise Directory
    public function indexExpertise(ListExpertiseRequest $request, ListExpertiseEntriesAction $action): JsonResponse
    {
        $result = $action->execute($request->validated());

        return $this->successResponse($result);
    }

    public function storeExpertise(StoreExpertiseDirectoryRequest $request, CreateExpertiseEntryAction $action): JsonResponse
    {
        $result = $action->execute($request->validated());
        
        return $this->successResponse($result, 'Expertise entry created');
    }

    public function updateExpertise(UpdateExpertiseDirectoryRequest $request, $id, UpdateExpertiseEntryAction $action): JsonResponse
    {
        $result = $action->execute((int)$id, $request->validated());
        
        return $this->successResponse($result, 'Expertise entry updated');
    }
}
