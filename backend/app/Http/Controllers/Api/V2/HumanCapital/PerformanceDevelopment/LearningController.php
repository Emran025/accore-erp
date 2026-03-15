<?php

namespace App\Http\Controllers\Api\V2\HumanCapital\PerformanceDevelopment;

use App\Http\Controllers\Controller;
use App\Http\Requests\HumanCapital\PerformanceDevelopment\StoreLearningCourseRequest;
use App\Http\Requests\HumanCapital\PerformanceDevelopment\UpdateLearningCourseRequest;
use App\Http\Requests\HumanCapital\PerformanceDevelopment\StoreLearningEnrollmentRequest;
use App\Http\Requests\HumanCapital\PerformanceDevelopment\UpdateLearningEnrollmentRequest;
use App\Domains\HumanCapital\PerformanceDevelopment\Actions\ListLearningCoursesAction;
use App\Domains\HumanCapital\PerformanceDevelopment\Actions\CreateLearningCourseAction;
use App\Domains\HumanCapital\PerformanceDevelopment\Actions\ShowLearningCourseAction;
use App\Domains\HumanCapital\PerformanceDevelopment\Actions\UpdateLearningCourseAction;
use App\Domains\HumanCapital\PerformanceDevelopment\Actions\ListLearningEnrollmentsAction;
use App\Domains\HumanCapital\PerformanceDevelopment\Actions\CreateLearningEnrollmentAction;
use App\Domains\HumanCapital\PerformanceDevelopment\Actions\UpdateLearningEnrollmentAction;
use App\Domains\HumanCapital\PerformanceDevelopment\Models\LearningCourse;
use App\Domains\HumanCapital\PerformanceDevelopment\Models\LearningEnrollment;
use App\Http\Resources\HumanCapital\PerformanceDevelopment\LearningCourseResource;
use App\Http\Resources\HumanCapital\PerformanceDevelopment\LearningEnrollmentResource;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;

class LearningController extends Controller
{
    use BaseApiController;

    // Courses
    public function indexCourses(Request $request, ListLearningCoursesAction $action)
    {
        $filters = $request->only(['course_type', 'delivery_method', 'is_published']);
        $courses = $action->execute($filters);

        return $this->paginatedResponse(
            LearningCourseResource::collection($courses['data'] ?? $courses),
            $courses['total'] ?? count($courses['data'] ?? $courses),
            $courses['current_page'] ?? 1,
            $courses['per_page'] ?? 15
        );
    }

    public function storeCourse(StoreLearningCourseRequest $request, CreateLearningCourseAction $action)
    {
        $validated = $request->validated();
        $result = $action->execute($validated);
        $course = LearningCourse::find($result['id'] ?? $result);
        return $this->successResponse(new LearningCourseResource($course), 'Course created successfully', 201);
    }

    public function showCourse($id, ShowLearningCourseAction $action)
    {
        $result = $action->execute($id);
        $course = LearningCourse::find($result['id'] ?? $id);
        return $this->successResponse(new LearningCourseResource($course));
    }

    public function updateCourse(UpdateLearningCourseRequest $request, $id, UpdateLearningCourseAction $action)
    {
        $validated = $request->validated();
        $result = $action->execute($id, $validated);
        $course = LearningCourse::find($result['id'] ?? $id);

        return $this->successResponse(new LearningCourseResource($course), 'Course updated successfully');
    }

    // Enrollments
    public function indexEnrollments(Request $request, ListLearningEnrollmentsAction $action)
    {
        $filters = $request->only(['course_id', 'employee_id', 'status']);
        $enrollments = $action->execute($filters);

        return $this->paginatedResponse(
            LearningEnrollmentResource::collection($enrollments['data'] ?? $enrollments),
            $enrollments['total'] ?? count($enrollments['data'] ?? $enrollments),
            $enrollments['current_page'] ?? 1,
            $enrollments['per_page'] ?? 15
        );
    }

    public function storeEnrollment(StoreLearningEnrollmentRequest $request, CreateLearningEnrollmentAction $action)
    {
        $validated = $request->validated();
        $result = $action->execute($validated);
        $enrollment = LearningEnrollment::find($result['id'] ?? $result);
        return $this->successResponse(new LearningEnrollmentResource($enrollment), 'Enrollment recorded successfully', 201);
    }

    public function updateEnrollment(UpdateLearningEnrollmentRequest $request, $id, UpdateLearningEnrollmentAction $action)
    {
        $validated = $request->validated();
        $result = $action->execute($id, $validated);
        $enrollment = LearningEnrollment::find($result['id'] ?? $id);

        return $this->successResponse(new LearningEnrollmentResource($enrollment), 'Enrollment updated successfully');
    }
}
