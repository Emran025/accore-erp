<?php

namespace App\Http\Controllers\Api\V2\HumanCapital\TalentAcquisition;

use App\Http\Controllers\Controller;
use App\Http\Requests\HumanCapital\TalentAcquisition\StoreRequisitionRequest;
use App\Http\Requests\HumanCapital\TalentAcquisition\UpdateRequisitionRequest;
use App\Http\Requests\HumanCapital\TalentAcquisition\StoreJobApplicantRequest;
use App\Http\Requests\HumanCapital\TalentAcquisition\UpdateJobApplicantStatusRequest;
use App\Http\Requests\HumanCapital\TalentAcquisition\StoreInterviewRequest;
use App\Http\Requests\HumanCapital\TalentAcquisition\UpdateInterviewRequest;
use App\Http\Requests\HumanCapital\TalentAcquisition\ListRequisitionsRequest;
use App\Http\Requests\HumanCapital\TalentAcquisition\ListApplicantsRequest;
use App\Domains\HumanCapital\TalentAcquisition\Actions\ListRequisitionsAction;
use App\Domains\HumanCapital\TalentAcquisition\Actions\CreateRequisitionAction;
use App\Domains\HumanCapital\TalentAcquisition\Actions\ShowRequisitionAction;
use App\Domains\HumanCapital\TalentAcquisition\Actions\UpdateRequisitionAction;
use App\Domains\HumanCapital\TalentAcquisition\Actions\ListJobApplicantsAction;
use App\Domains\HumanCapital\TalentAcquisition\Actions\CreateJobApplicantAction;
use App\Domains\HumanCapital\TalentAcquisition\Actions\UpdateJobApplicantStatusAction;
use App\Domains\HumanCapital\TalentAcquisition\Actions\CreateInterviewAction;
use App\Domains\HumanCapital\TalentAcquisition\Actions\UpdateInterviewAction;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;
use Illuminate\Http\JsonResponse;

class RecruitmentController extends Controller
{
    use BaseApiController;

    // Requisitions
    public function indexRequisitions(ListRequisitionsRequest $request, ListRequisitionsAction $action): JsonResponse
    {
        $requisitions = $action->execute($request->validated());

        return $this->successResponse($requisitions);
    }

    public function storeRequisition(StoreRequisitionRequest $request, CreateRequisitionAction $action): JsonResponse
    {
        $requisition = $action->execute($request->validated());

        return $this->successResponse($requisition, 'Requisition created');
    }

    public function showRequisition($id, ShowRequisitionAction $action): JsonResponse
    {
        $requisition = $action->execute((int)$id);
        return $this->successResponse($requisition);
    }

    public function updateRequisition(UpdateRequisitionRequest $request, $id, UpdateRequisitionAction $action): JsonResponse
    {
        $requisition = $action->execute((int)$id, $request->validated());

        return $this->successResponse($requisition, 'Requisition updated');
    }

    // Applicants
    public function indexApplicants(ListApplicantsRequest $request, ListJobApplicantsAction $action): JsonResponse
    {
        $applicants = $action->execute($request->validated());

        return $this->successResponse($applicants);
    }

    public function storeApplicant(StoreJobApplicantRequest $request, CreateJobApplicantAction $action): JsonResponse
    {
        $applicant = $action->execute($request->validated());

        return $this->successResponse($applicant, 'Applicant created');
    }

    public function updateApplicantStatus(UpdateJobApplicantStatusRequest $request, $id, UpdateJobApplicantStatusAction $action): JsonResponse
    {
        $applicant = $action->execute((int)$id, $request->validated());

        return $this->successResponse($applicant, 'Applicant status updated');
    }

    // Interviews
    public function storeInterview(StoreInterviewRequest $request, CreateInterviewAction $action): JsonResponse
    {
        $interview = $action->execute($request->validated());

        return $this->successResponse($interview, 'Interview scheduled');
    }

    public function updateInterview(UpdateInterviewRequest $request, $id, UpdateInterviewAction $action): JsonResponse
    {
        $interview = $action->execute((int)$id, $request->validated());

        return $this->successResponse($interview, 'Interview updated');
    }
}
