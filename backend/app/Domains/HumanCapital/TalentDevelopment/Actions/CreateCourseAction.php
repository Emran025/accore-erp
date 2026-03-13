<?php

namespace App\Domains\HumanCapital\TalentDevelopment\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\HumanCapital\TalentDevelopment\Models\LearningCourse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CreateCourseAction extends Action
{
    public function __construct(private readonly Request $request) {}

    public function __invoke(): JsonResponse
    {
        $validated = $this->request->validate([
            'course_code' => 'required|string|max:50|unique:learning_courses,course_code',
            'course_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'delivery_method' => 'required|in:in_person,virtual,elearning,blended',
            'course_type' => 'required|in:mandatory,optional,compliance,development',
            'duration_hours' => 'nullable|integer|min:0',
            'scorm_path' => 'nullable|string',
            'video_url' => 'nullable|url',
            'is_recurring' => 'boolean',
            'recurrence_months' => 'nullable|integer|min:1',
            'requires_assessment' => 'boolean',
            'passing_score' => 'nullable|integer|min:0|max:100',
            'notes' => 'nullable|string',
        ]);
        $validated['is_published'] = false;
        $validated['created_by'] = auth()->id();
        $course = LearningCourse::create($validated);
        return response()->json(array_merge(['success' => true], $course->toArray()), 201);
    }
}
