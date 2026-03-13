<?php

namespace App\Domains\HumanCapital\TalentDevelopment\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\HumanCapital\TalentDevelopment\Models\LearningCourse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UpdateCourseAction extends Action
{
    public function __construct(private readonly Request $request, private readonly int $id) {}

    public function __invoke(): JsonResponse
    {
        $course = LearningCourse::findOrFail($this->id);
        $validated = $this->request->validate([
            'course_name' => 'string|max:255',
            'description' => 'nullable|string',
            'is_published' => 'boolean',
            'notes' => 'nullable|string',
        ]);
        $course->update($validated);
        return $this->successResponse($course->load('enrollments')->toArray());
    }
}
