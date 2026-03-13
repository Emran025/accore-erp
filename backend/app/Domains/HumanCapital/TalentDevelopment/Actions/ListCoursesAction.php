<?php

namespace App\Domains\HumanCapital\TalentDevelopment\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\HumanCapital\TalentDevelopment\Models\LearningCourse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ListCoursesAction extends Action
{
    public function __construct(private readonly Request $request) {}

    public function __invoke(): JsonResponse
    {
        $query = LearningCourse::with(['enrollments']);
        if ($this->request->filled('course_type')) $query->where('course_type', $this->request->course_type);
        if ($this->request->filled('delivery_method')) $query->where('delivery_method', $this->request->delivery_method);
        if ($this->request->filled('is_published')) $query->where('is_published', $this->request->is_published === 'true');
        return $this->successResponse($query->orderBy('created_at', 'desc')->paginate(15)->toArray());
    }
}
