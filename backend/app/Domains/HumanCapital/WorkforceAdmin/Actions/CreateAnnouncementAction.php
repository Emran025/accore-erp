<?php
namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;
use App\Domains\Shared\Actions\Action;
use App\Domains\HumanCapital\HRCompliance\Models\CorporateAnnouncement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
class CreateAnnouncementAction extends Action
{
    public function __construct(private readonly Request $request) {}
    public function __invoke(): JsonResponse
    {
        $validated = $this->request->validate([
            'title' => 'required|string|max:255', 'content' => 'required|string',
            'priority' => 'required|in:low,normal,high,urgent',
            'target_audience' => 'required|in:all,department,role,location,custom',
            'target_departments' => 'nullable|array', 'target_roles' => 'nullable|array',
            'target_locations' => 'nullable|array', 'target_employees' => 'nullable|array',
            'publish_date' => 'required|date', 'expiry_date' => 'nullable|date|after:publish_date',
            'is_published' => 'boolean',
        ]);
        $validated['created_by'] = auth()->id();
        $validated['is_published'] = $validated['is_published'] ?? false;
        $announcement = CorporateAnnouncement::create($validated);
        return response()->json(array_merge(['success' => true], $announcement->toArray()), 201);
    }
}
