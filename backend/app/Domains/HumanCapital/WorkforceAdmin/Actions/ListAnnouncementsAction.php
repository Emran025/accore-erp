<?php
namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;
use App\Domains\Shared\Actions\Action;
use App\Domains\HumanCapital\Communications\Models\CorporateAnnouncement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
class ListAnnouncementsAction extends Action
{
    public function __construct(private readonly Request $request) {}
    public function __invoke(): JsonResponse
    {
        $query = CorporateAnnouncement::query();
        if ($this->request->filled('priority')) $query->where('priority', $this->request->priority);
        if ($this->request->filled('is_published')) $query->where('is_published', $this->request->is_published === 'true');
        return $this->successResponse($query->orderBy('publish_date', 'desc')->paginate(15)->toArray());
    }
}
