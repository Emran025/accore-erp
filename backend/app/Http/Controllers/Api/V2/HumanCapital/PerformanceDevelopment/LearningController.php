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

        return $this->successResponse($courses);
    }

    public function storeCourse(StoreLearningCourseRequest $request, CreateLearningCourseAction $action)
    {
        $validated = $request->validated();
        $course = $action->execute($validated);

        return response()->json(array_merge(['success' => true], $course), 201);
    }

    public function showCourse($id, ShowLearningCourseAction $action)
    {
        $course = $action->execute($id);
        return $this->successResponse($course);
    }

    public function updateCourse(UpdateLearningCourseRequest $request, $id, UpdateLearningCourseAction $action)
    {
        $validated = $request->validated();
        $course = $action->execute($id, $validated);

        return $this->successResponse($course);
    }

    // Enrollments
    public function indexEnrollments(Request $request, ListLearningEnrollmentsAction $action)
    {
        $filters = $request->only(['course_id', 'employee_id', 'status']);
        $enrollments = $action->execute($filters);

        return $this->successResponse($enrollments);
    }

    public function storeEnrollment(StoreLearningEnrollmentRequest $request, CreateLearningEnrollmentAction $action)
    {
        $validated = $request->validated();
        $enrollment = $action->execute($validated);

        return response()->json(array_merge(['success' => true], $enrollment), 201);
    }

    public function updateEnrollment(UpdateLearningEnrollmentRequest $request, $id, UpdateLearningEnrollmentAction $action)
    {
        $validated = $request->validated();
        $enrollment = $action->execute($id, $validated);

        return $this->successResponse($enrollment);
    }
}
