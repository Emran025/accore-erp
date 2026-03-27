<?php

namespace App\Http\Controllers\Api\V2\HumanCapital\WorkforceAdmin;

use App\Http\Controllers\Controller;
use App\Http\Requests\HumanCapital\WorkforceAdmin\StoreWellnessProgramRequest;
use App\Http\Requests\HumanCapital\WorkforceAdmin\StoreWellnessParticipationRequest;
use App\Http\Requests\HumanCapital\WorkforceAdmin\UpdateWellnessParticipationRequest;
use App\Http\Resources\HumanCapital\WorkforceAdmin\WellnessProgramResource;
use App\Http\Resources\HumanCapital\WorkforceAdmin\WellnessParticipationResource;
use App\Http\Requests\HumanCapital\WorkforceAdmin\ListWellnessProgramsRequest;
use App\Http\Requests\HumanCapital\WorkforceAdmin\ListWellnessParticipationsRequest;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;

use App\Domains\HumanCapital\WorkforceAdmin\Actions\ListWellnessProgramsAction;
use App\Domains\HumanCapital\WorkforceAdmin\Actions\CreateWellnessProgramAction;
use App\Domains\HumanCapital\WorkforceAdmin\Actions\ListWellnessParticipationsAction;
use App\Domains\HumanCapital\WorkforceAdmin\Actions\CreateWellnessParticipationAction;
use App\Domains\HumanCapital\WorkforceAdmin\Actions\UpdateWellnessParticipationAction;

class WellnessController extends Controller
{
    use BaseApiController;

    public function indexPrograms(ListWellnessProgramsRequest $request, ListWellnessProgramsAction $action)
    {
        $paginator = $action->execute($request->validated());
        return $this->paginatedResponse(
            WellnessProgramResource::collection($paginator->items()),
            $paginator->total(),
            $paginator->currentPage(),
            $paginator->perPage()
        );
    }

    public function storeProgram(StoreWellnessProgramRequest $request, CreateWellnessProgramAction $action)
    {
        $program = $action->execute($request->validated());
        return $this->successResponse(new WellnessProgramResource($program), 'Wellness program created successfully', 201);
    }

    public function indexParticipations(ListWellnessParticipationsRequest $request, ListWellnessParticipationsAction $action)
    {
        $paginator = $action->execute($request->validated());
        return $this->paginatedResponse(
            WellnessParticipationResource::collection($paginator->items()),
            $paginator->total(),
            $paginator->currentPage(),
            $paginator->perPage()
        );
    }

    public function storeParticipation(StoreWellnessParticipationRequest $request, CreateWellnessParticipationAction $action)
    {
        $participation = $action->execute($request->validated());
        return $this->successResponse(new WellnessParticipationResource($participation), 'Participation recorded successfully', 201);
    }

    public function updateParticipation(UpdateWellnessParticipationRequest $request, $id, UpdateWellnessParticipationAction $action)
    {
        $participation = $action->execute((int)$id, $request->validated());
        return $this->successResponse(new WellnessParticipationResource($participation), 'Participation updated successfully');
    }
}
