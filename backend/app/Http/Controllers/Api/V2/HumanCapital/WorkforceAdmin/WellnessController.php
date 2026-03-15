<?php

namespace App\Http\Controllers\Api\V2\HumanCapital\WorkforceAdmin;

use App\Http\Controllers\Controller;
use App\Domains\HumanCapital\WorkforceAdmin\Models\WellnessProgram;
use App\Domains\HumanCapital\WorkforceAdmin\Models\WellnessParticipation;
use App\Http\Requests\HumanCapital\WorkforceAdmin\StoreWellnessProgramRequest;
use App\Http\Requests\HumanCapital\WorkforceAdmin\StoreWellnessParticipationRequest;
use App\Http\Requests\HumanCapital\WorkforceAdmin\UpdateWellnessParticipationRequest;
use App\Http\Resources\HumanCapital\WorkforceAdmin\WellnessProgramResource;
use App\Http\Resources\HumanCapital\WorkforceAdmin\WellnessParticipationResource;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;

class WellnessController extends Controller
{
    use BaseApiController;

    public function indexPrograms(Request $request)
    {
        $query = WellnessProgram::with(['participations']);

        if ($request->filled('program_type')) {
            $query->where('program_type', $request->program_type);
        }

        if ($request->filled('is_active')) {
            $query->where('is_active', $request->is_active === 'true');
        }

        $paginated = $query->orderBy('start_date', 'desc')->paginate(15);
        return $this->paginatedResponse(
            WellnessProgramResource::collection($paginated->items()),
            $paginated->total(),
            $paginated->currentPage(),
            $paginated->perPage()
        );
    }

    public function storeProgram(StoreWellnessProgramRequest $request)
    {
        $validated = $request->validated();
        $validated['is_active'] = true;
        $validated['created_by'] = auth()->id();

        $program = WellnessProgram::create($validated);
        return $this->successResponse(new WellnessProgramResource($program), 'Wellness program created successfully', 201);
    }

    public function indexParticipations(Request $request)
    {
        $query = WellnessParticipation::with(['program', 'employee']);

        if ($request->filled('program_id')) {
            $query->where('program_id', $request->program_id);
        }

        if ($request->filled('employee_id')) {
            $query->where('employee_id', $request->employee_id);
        }

        $paginated = $query->orderBy('enrollment_date', 'desc')->paginate(15);
        return $this->paginatedResponse(
            WellnessParticipationResource::collection($paginated->items()),
            $paginated->total(),
            $paginated->currentPage(),
            $paginated->perPage()
        );
    }

    public function storeParticipation(StoreWellnessParticipationRequest $request)
    {
        $validated = $request->validated();

        $validated['enrollment_date'] = now();
        $validated['status'] = 'enrolled';
        $validated['points'] = 0;
        $validated['metrics_data'] = [];

        $participation = WellnessParticipation::create($validated);
        return $this->successResponse(new WellnessParticipationResource($participation->load('program', 'employee')), 'Participation recorded successfully', 201);
    }

    public function updateParticipation(UpdateWellnessParticipationRequest $request, $id)
    {
        $participation = WellnessParticipation::findOrFail($id);

        $validated = $request->validated();

        $participation->update($validated);
        return $this->successResponse(new WellnessParticipationResource($participation->load('program', 'employee')), 'Participation updated successfully');
    }
}
