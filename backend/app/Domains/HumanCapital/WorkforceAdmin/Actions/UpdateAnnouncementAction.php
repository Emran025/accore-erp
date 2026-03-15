<?php
namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;
use App\Domains\Shared\Actions\Action;
use App\Domains\HumanCapital\HRCompliance\Models\CorporateAnnouncement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
class UpdateAnnouncementAction extends Action
{
    public function __construct(private readonly Request $request, private readonly int $id) {}
    public function __invoke(): JsonResponse
    {
        $announcement = CorporateAnnouncement::findOrFail($this->id);
        $validated = $this->request->validate([
            'title' => 'string|max:255', 'content' => 'string',
            'is_published' => 'boolean', 'expiry_date' => 'nullable|date',
        ]);
        $announcement->update($validated);
        return $this->successResponse($announcement->toArray());
    }
}
