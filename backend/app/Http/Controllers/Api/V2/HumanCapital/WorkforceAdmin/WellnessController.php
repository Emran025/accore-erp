<?php

namespace App\Http\Controllers\Api\V2\HumanCapital\WorkforceAdmin;

use App\Http\Controllers\Controller;
use App\Domains\HumanCapital\WorkforceAdmin\Models\WellnessProgram;
use App\Domains\HumanCapital\WorkforceAdmin\Models\WellnessParticipation;
use App\Http\Requests\HumanCapital\WorkforceAdmin\StoreWellnessProgramRequest;
use App\Http\Requests\HumanCapital\WorkforceAdmin\StoreWellnessParticipationRequest;
use App\Http\Requests\HumanCapital\WorkforceAdmin\UpdateWellnessParticipationRequest;
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

        return $this->successResponse($query->orderBy('start_date', 'desc')->paginate(15)->toArray());
    }

    public function storeProgram(StoreWellnessProgramRequest $request)
    {
        $validated = $request->validated();
        $validated['is_active'] = true;
        $validated['created_by'] = auth()->id();

        $program = WellnessProgram::create($validated);
        return response()->json(array_merge(['success' => true], $program->toArray()), 201);
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

        return $this->successResponse($query->orderBy('enrollment_date', 'desc')->paginate(15)->toArray());
    }

    public function storeParticipation(StoreWellnessParticipationRequest $request)
    {
        $validated = $request->validated();

        $validated['enrollment_date'] = now();
        $validated['status'] = 'enrolled';
        $validated['points'] = 0;
        $validated['metrics_data'] = [];

        $participation = WellnessParticipation::create($validated);
        return response()->json(array_merge(['success' => true], $participation->load('program', 'employee')->toArray()), 201);
    }

    public function updateParticipation(UpdateWellnessParticipationRequest $request, $id)
    {
        $participation = WellnessParticipation::findOrFail($id);

        $validated = $request->validated();

        $participation->update($validated);
        return $this->successResponse($participation->load('program', 'employee')->toArray());
    }
}
