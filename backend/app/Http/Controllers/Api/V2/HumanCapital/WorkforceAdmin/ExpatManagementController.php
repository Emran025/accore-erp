<?php

namespace App\Http\Controllers\Api\V2\HumanCapital\WorkforceAdmin;

use App\Http\Controllers\Controller;
use App\Domains\HumanCapital\WorkforceAdmin\Models\ExpatManagement;
use App\Http\Requests\HumanCapital\WorkforceAdmin\StoreExpatRequest;
use App\Http\Requests\HumanCapital\WorkforceAdmin\UpdateExpatRequest;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;

class ExpatManagementController extends Controller
{
    use BaseApiController;

    public function index(Request $request)
    {
        $query = ExpatManagement::with(['employee', 'documents']);

        if ($request->filled('employee_id')) {
            $query->where('employee_id', $request->employee_id);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('employee', function($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%");
            });
        }

        return $this->successResponse($query->paginate(15)->toArray());
    }

    public function store(StoreExpatRequest $request)
    {
        $validated = $request->validated();
        $validated['created_by'] = auth()->id();
        $expat = ExpatManagement::create($validated);

        return response()->json(array_merge(['success' => true], $expat->load('employee')->toArray()), 201);
    }

    public function show($id)
    {
        $expat = ExpatManagement::with(['employee', 'documents'])->findOrFail($id);
        return $this->successResponse($expat->toArray());
    }

    public function update(UpdateExpatRequest $request, $id)
    {
        $expat = ExpatManagement::findOrFail($id);

        $validated = $request->validated();

        $expat->update($validated);
        return $this->successResponse($expat->load('employee', 'documents')->toArray());
    }

    public function destroy($id)
    {
        $expat = ExpatManagement::findOrFail($id);
        $expat->delete();
        return $this->successResponse(['message' => 'Expat record deleted successfully']);
    }
}
