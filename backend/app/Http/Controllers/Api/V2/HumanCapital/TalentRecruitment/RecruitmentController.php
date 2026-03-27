<?php

namespace App\Http\Controllers\Api\V2\HumanCapital\TalentRecruitment;

use App\Http\Controllers\Controller;
use App\Http\Requests\HumanCapital\TalentRecruitment\StoreRequisitionRequest;
use App\Http\Requests\HumanCapital\TalentRecruitment\UpdateRequisitionRequest;
use App\Http\Requests\HumanCapital\TalentRecruitment\StoreJobApplicantRequest;
use App\Http\Requests\HumanCapital\TalentRecruitment\UpdateJobApplicantStatusRequest;
use App\Http\Requests\HumanCapital\TalentRecruitment\StoreInterviewRequest;
use App\Http\Requests\HumanCapital\TalentRecruitment\UpdateInterviewRequest;
use App\Http\Requests\HumanCapital\TalentRecruitment\ListRequisitionsRequest;
use App\Http\Requests\HumanCapital\TalentRecruitment\ListApplicantsRequest;
use App\Domains\HumanCapital\TalentRecruitment\Actions\ListRequisitionsAction;
use App\Domains\HumanCapital\TalentRecruitment\Actions\CreateRequisitionAction;
use App\Domains\HumanCapital\TalentRecruitment\Actions\ShowRequisitionAction;
use App\Domains\HumanCapital\TalentRecruitment\Actions\UpdateRequisitionAction;
use App\Domains\HumanCapital\TalentRecruitment\Actions\ListJobApplicantsAction;
use App\Domains\HumanCapital\TalentRecruitment\Actions\CreateJobApplicantAction;
use App\Domains\HumanCapital\TalentRecruitment\Actions\UpdateJobApplicantStatusAction;
use App\Domains\HumanCapital\TalentRecruitment\Actions\CreateInterviewAction;
use App\Domains\HumanCapital\TalentRecruitment\Actions\UpdateInterviewAction;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;
use App\Http\Resources\HumanCapital\TalentRecruitment\RecruitmentRequisitionResource;
use App\Http\Resources\HumanCapital\TalentRecruitment\JobApplicantResource;
use App\Http\Resources\HumanCapital\TalentRecruitment\InterviewResource;
use Illuminate\Http\JsonResponse;

class RecruitmentController extends Controller
{
    use BaseApiController;

    // Requisitions
    public function indexRequisitions(ListRequisitionsRequest $request, ListRequisitionsAction $action): JsonResponse
    {
        $paginator = $action->execute($request->validated());
        return $this->successResponse(RecruitmentRequisitionResource::collection($paginator));
    }

    public function storeRequisition(StoreRequisitionRequest $request, CreateRequisitionAction $action): JsonResponse
    {
        try {
            $requisition = $action->execute($request->validated());
            return $this->successResponse(new RecruitmentRequisitionResource($requisition), 'Requisition created');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    public function showRequisition($id, ShowRequisitionAction $action): JsonResponse
    {
        $requisition = $action->execute((int)$id);
        return $this->successResponse(new RecruitmentRequisitionResource($requisition));
    }

    public function updateRequisition(UpdateRequisitionRequest $request, $id, UpdateRequisitionAction $action): JsonResponse
    {
        try {
            $requisition = $action->execute((int)$id, $request->validated());
            return $this->successResponse(new RecruitmentRequisitionResource($requisition), 'Requisition updated');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    // Applicants
    public function indexApplicants(ListApplicantsRequest $request, ListJobApplicantsAction $action): JsonResponse
    {
        $paginator = $action->execute($request->validated());
        return $this->successResponse(JobApplicantResource::collection($paginator));
    }

    public function storeApplicant(StoreJobApplicantRequest $request, CreateJobApplicantAction $action): JsonResponse
    {
        try {
            $applicant = $action->execute($request->validated());
            return $this->successResponse(new JobApplicantResource($applicant), 'Applicant created');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    public function updateApplicantStatus(UpdateJobApplicantStatusRequest $request, $id, UpdateJobApplicantStatusAction $action): JsonResponse
    {
        try {
            $applicant = $action->execute((int)$id, $request->validated());
            return $this->successResponse(new JobApplicantResource($applicant), 'Applicant status updated');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    // Interviews
    public function storeInterview(StoreInterviewRequest $request, CreateInterviewAction $action): JsonResponse
    {
        try {
            $interview = $action->execute($request->validated());
            return $this->successResponse(new InterviewResource($interview), 'Interview scheduled');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    public function updateInterview(UpdateInterviewRequest $request, $id, UpdateInterviewAction $action): JsonResponse
    {
        try {
            $interview = $action->execute((int)$id, $request->validated());
            return $this->successResponse(new InterviewResource($interview), 'Interview updated');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }
}
