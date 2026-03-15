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
use App\Domains\HumanCapital\TalentRecruitment\Models\RecruitmentRequisition;
use App\Domains\HumanCapital\TalentRecruitment\Models\JobApplicant;
use App\Domains\HumanCapital\TalentRecruitment\Models\Interview;
use Illuminate\Http\JsonResponse;

class RecruitmentController extends Controller
{
    use BaseApiController;

    // Requisitions
    public function indexRequisitions(ListRequisitionsRequest $request, ListRequisitionsAction $action): JsonResponse
    {
        $requisitions = $action->execute($request->validated());

        return $this->paginatedResponse(
            RecruitmentRequisitionResource::collection($requisitions['data'] ?? $requisitions),
            $requisitions['total'] ?? count($requisitions['data'] ?? $requisitions),
            $requisitions['current_page'] ?? 1,
            $requisitions['per_page'] ?? 15
        );
    }

    public function storeRequisition(StoreRequisitionRequest $request, CreateRequisitionAction $action): JsonResponse
    {
        $requisition = $action->execute($request->validated());

        $model = RecruitmentRequisition::find($requisition['id'] ?? $requisition);
        return $this->successResponse(new RecruitmentRequisitionResource($model), 'Requisition created');
    }

    public function showRequisition($id, ShowRequisitionAction $action): JsonResponse
    {
        $requisition = $action->execute((int)$id);
        $model = RecruitmentRequisition::find($requisition['id'] ?? $id);
        return $this->successResponse(new RecruitmentRequisitionResource($model));
    }

    public function updateRequisition(UpdateRequisitionRequest $request, $id, UpdateRequisitionAction $action): JsonResponse
    {
        $requisition = $action->execute((int)$id, $request->validated());

        $model = RecruitmentRequisition::find($requisition['id'] ?? $id);
        return $this->successResponse(new RecruitmentRequisitionResource($model), 'Requisition updated');
    }

    // Applicants
    public function indexApplicants(ListApplicantsRequest $request, ListJobApplicantsAction $action): JsonResponse
    {
        $applicants = $action->execute($request->validated());

        return $this->paginatedResponse(
            JobApplicantResource::collection($applicants['data'] ?? $applicants),
            $applicants['total'] ?? count($applicants['data'] ?? $applicants),
            $applicants['current_page'] ?? 1,
            $applicants['per_page'] ?? 15
        );
    }

    public function storeApplicant(StoreJobApplicantRequest $request, CreateJobApplicantAction $action): JsonResponse
    {
        $applicant = $action->execute($request->validated());

        $model = JobApplicant::find($applicant['id'] ?? $applicant);
        return $this->successResponse(new JobApplicantResource($model), 'Applicant created');
    }

    public function updateApplicantStatus(UpdateJobApplicantStatusRequest $request, $id, UpdateJobApplicantStatusAction $action): JsonResponse
    {
        $applicant = $action->execute((int)$id, $request->validated());

        $model = JobApplicant::find($applicant['id'] ?? $id);
        return $this->successResponse(new JobApplicantResource($model), 'Applicant status updated');
    }

    // Interviews
    public function storeInterview(StoreInterviewRequest $request, CreateInterviewAction $action): JsonResponse
    {
        $interview = $action->execute($request->validated());

        $model = Interview::find($interview['id'] ?? $interview);
        return $this->successResponse(new InterviewResource($model), 'Interview scheduled');
    }

    public function updateInterview(UpdateInterviewRequest $request, $id, UpdateInterviewAction $action): JsonResponse
    {
        $interview = $action->execute((int)$id, $request->validated());

        $model = Interview::find($interview['id'] ?? $id);
        return $this->successResponse(new InterviewResource($model), 'Interview updated');
    }
}
