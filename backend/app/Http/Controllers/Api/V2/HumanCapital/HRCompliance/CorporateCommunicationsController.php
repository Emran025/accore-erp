<?php

namespace App\Http\Controllers\Api\V2\HumanCapital\HRCompliance;

use App\Http\Controllers\Controller;
use App\Http\Requests\HumanCapital\HRCompliance\StoreCorporateAnnouncementRequest;
use App\Http\Requests\HumanCapital\HRCompliance\UpdateCorporateAnnouncementRequest;
use App\Http\Requests\HumanCapital\HRCompliance\StorePulseSurveyRequest;
use App\Http\Requests\HumanCapital\HRCompliance\StoreSurveyResponseRequest;
use App\Http\Requests\HumanCapital\HRCompliance\ListAnnouncementsRequest;
use App\Http\Requests\HumanCapital\HRCompliance\ListSurveysRequest;
use App\Domains\HumanCapital\HRCompliance\Actions\ListCorporateAnnouncementsAction;
use App\Domains\HumanCapital\HRCompliance\Actions\CreateCorporateAnnouncementAction;
use App\Domains\HumanCapital\HRCompliance\Actions\UpdateCorporateAnnouncementAction;
use App\Domains\HumanCapital\HRCompliance\Actions\ListPulseSurveysAction;
use App\Domains\HumanCapital\HRCompliance\Actions\CreatePulseSurveyAction;
use App\Domains\HumanCapital\HRCompliance\Actions\CreateSurveyResponseAction;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;
use Illuminate\Http\JsonResponse;
use App\Http\Resources\HumanCapital\HRCompliance\CorporateAnnouncementResource;
use App\Http\Resources\HumanCapital\HRCompliance\PulseSurveyResource;
use App\Http\Resources\HumanCapital\HRCompliance\SurveyResponseResource;
use App\Domains\HumanCapital\HRCompliance\Models\CorporateAnnouncement;
use App\Domains\HumanCapital\HRCompliance\Models\PulseSurvey;
use App\Domains\HumanCapital\HRCompliance\Models\SurveyResponse;

class CorporateCommunicationsController extends Controller
{
    use BaseApiController;

    // Announcements
    public function indexAnnouncements(ListAnnouncementsRequest $request, ListCorporateAnnouncementsAction $action): JsonResponse
    {
        $paginated = $action->execute($request->validated(), auth()->user());

        return $this->paginatedResponse(
            CorporateAnnouncementResource::collection($paginated['data']),
            $paginated['total'],
            $paginated['current_page'],
            $paginated['per_page']
        );
    }

    public function storeAnnouncement(StoreCorporateAnnouncementRequest $request, CreateCorporateAnnouncementAction $action): JsonResponse
    {
        $result = $action->execute($request->validated(), auth()->id());
        $announcement = CorporateAnnouncement::find($result['id'] ?? $result);

        return $this->successResponse(new CorporateAnnouncementResource($announcement), 'Announcement created', 201);
    }

    public function updateAnnouncement(UpdateCorporateAnnouncementRequest $request, $id, UpdateCorporateAnnouncementAction $action): JsonResponse
    {
        $result = $action->execute((int)$id, $request->validated());
        $announcement = CorporateAnnouncement::find($id);

        return $this->successResponse(new CorporateAnnouncementResource($announcement), 'Announcement updated');
    }

    // Pulse Surveys
    public function indexSurveys(ListSurveysRequest $request, ListPulseSurveysAction $action): JsonResponse
    {
        $paginated = $action->execute($request->validated());

        return $this->paginatedResponse(
            PulseSurveyResource::collection($paginated['data']),
            $paginated['total'],
            $paginated['current_page'],
            $paginated['per_page']
        );
    }

    public function storeSurvey(StorePulseSurveyRequest $request, CreatePulseSurveyAction $action): JsonResponse
    {
        $result = $action->execute($request->validated(), auth()->id());
        $survey = PulseSurvey::find($result['id'] ?? $result);

        return $this->successResponse(new PulseSurveyResource($survey), 'Pulse survey created', 201);
    }

    public function storeSurveyResponse(StoreSurveyResponseRequest $request, $surveyId, CreateSurveyResponseAction $action): JsonResponse
    {
        $result = $action->execute((int)$surveyId, $request->validated(), auth()->user());
        $response = SurveyResponse::find($result['id'] ?? $result);

        return $this->successResponse(new SurveyResponseResource($response), 'Survey response submitted', 201);
    }
}
