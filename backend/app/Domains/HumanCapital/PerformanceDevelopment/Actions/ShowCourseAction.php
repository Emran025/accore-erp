<?php

namespace App\Domains\HumanCapital\PerformanceDevelopment\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\HumanCapital\PerformanceDevelopment\Models\LearningCourse;
use Illuminate\Http\JsonResponse;

class ShowCourseAction extends Action
{
    public function __construct(private readonly int $id) {}

    public function __invoke(): JsonResponse
    {
        $course = LearningCourse::with(['enrollments.employee'])->findOrFail($this->id);
        return $this->successResponse($course->toArray());
    }
}
