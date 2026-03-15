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

class CorporateCommunicationsController extends Controller
{
    use BaseApiController;

    // Announcements
    public function indexAnnouncements(ListAnnouncementsRequest $request, ListCorporateAnnouncementsAction $action): JsonResponse
    {
        $paginated = $action->execute($request->validated(), auth()->user());

        return $this->paginatedResponse(
            $paginated['data'],
            $paginated['total'],
            $paginated['current_page'],
            $paginated['per_page']
        );
    }

    public function storeAnnouncement(StoreCorporateAnnouncementRequest $request, CreateCorporateAnnouncementAction $action): JsonResponse
    {
        $announcement = $action->execute($request->validated(), auth()->id());

        return $this->successResponse($announcement, 'Announcement created');
    }

    public function updateAnnouncement(UpdateCorporateAnnouncementRequest $request, $id, UpdateCorporateAnnouncementAction $action): JsonResponse
    {
        $announcement = $action->execute((int)$id, $request->validated());

        return $this->successResponse($announcement, 'Announcement updated');
    }

    // Pulse Surveys
    public function indexSurveys(ListSurveysRequest $request, ListPulseSurveysAction $action): JsonResponse
    {
        $paginated = $action->execute($request->validated());

        return $this->paginatedResponse(
            $paginated['data'],
            $paginated['total'],
            $paginated['current_page'],
            $paginated['per_page']
        );
    }

    public function storeSurvey(StorePulseSurveyRequest $request, CreatePulseSurveyAction $action): JsonResponse
    {
        $survey = $action->execute($request->validated(), auth()->id());

        return $this->successResponse($survey, 'Pulse survey created');
    }

    public function storeSurveyResponse(StoreSurveyResponseRequest $request, $surveyId, CreateSurveyResponseAction $action): JsonResponse
    {
        $response = $action->execute((int)$surveyId, $request->validated(), auth()->user());

        return $this->successResponse($response, 'Survey response submitted');
    }
}
