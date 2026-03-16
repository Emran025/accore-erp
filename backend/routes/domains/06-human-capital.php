<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\V2\HumanCapital\{
    HRCompliance\CorporateCommunicationsController,
    HRCompliance\KnowledgeManagementController,
    HRCompliance\QaComplianceController,
    HRAdvanced\DocumentTemplateController,
    ServicesWellness\EhsController,
    ServicesWellness\TravelExpenseController,
    ServicesWellness\EmployeeLoansController,
    PayrollBenefits\CompensationController,
    PayrollBenefits\EOSBController,
    PayrollBenefits\PayrollComponentsController,
    PayrollBenefits\PayrollController,
    PayrollBenefits\PostPayrollController,
    TalentRecruitment\OnboardingController,
    TalentRecruitment\RecruitmentController,
    PerformanceDevelopment\LearningController,
    PerformanceDevelopment\PerformanceController,
    PerformanceDevelopment\SuccessionController,
    TimeProductivity\AttendanceController,
    TimeProductivity\BiometricController,
    TimeProductivity\LeaveController,
    TimeProductivity\WorkforceSchedulingController,
    WorkforceAdmin\BenefitsController,
    WorkforceAdmin\ContingentWorkersController,
    WorkforceAdmin\DepartmentsController,
    WorkforceAdmin\EmployeeContractsController,
    WorkforceAdmin\EmployeeRelationsController,
    WorkforceAdmin\EmployeesController,
    WorkforceAdmin\ExpatManagementController,
    WorkforceAdmin\HrAdministrationController,
    WorkforceAdmin\WellnessController,
};

use App\Http\Controllers\Api\V2\Assets\EmployeeAssetsController;

/*
|--------------------------------------------------------------------------
| Domain Routes: 06-HumanCapital (Talent Development)
|--------------------------------------------------------------------------
| Performance, Learning & Succession Planning
*/


// ── Performance Goals
Route::middleware('can:employees,view')->group(function () {
    Route::get('/performance/goals', [PerformanceController::class, 'indexGoals'])->name('v2.talent_dev.goals.index');
    Route::get('/performance/appraisals', [PerformanceController::class, 'indexAppraisals'])->name('v2.talent_dev.appraisals.index');
    Route::get('/performance/feedback', [PerformanceController::class, 'indexFeedback'])->name('v2.talent_dev.feedback.index');
});
Route::middleware(['can:employees,create', 'throttle:api-write'])->group(function () {
    Route::post('/performance/goals', [PerformanceController::class, 'storeGoal'])->name('v2.talent_dev.goals.store');
    Route::post('/performance/appraisals', [PerformanceController::class, 'storeAppraisal'])->name('v2.talent_dev.appraisals.store');
    Route::post('/performance/feedback', [PerformanceController::class, 'storeFeedback'])->name('v2.talent_dev.feedback.store');
});
Route::middleware(['can:employees,edit', 'throttle:api-write'])->group(function () {
    Route::put('/performance/goals/{id}', [PerformanceController::class, 'updateGoal'])->name('v2.talent_dev.goals.update');
    Route::put('/performance/appraisals/{id}', [PerformanceController::class, 'updateAppraisal'])->name('v2.talent_dev.appraisals.update');
});

// ── Learning Management
Route::middleware('can:employees,view')->group(function () {
    Route::get('/learning/courses', [LearningController::class, 'indexCourses'])->name('v2.talent_dev.courses.index');
    Route::get('/learning/courses/{id}', [LearningController::class, 'showCourse'])->name('v2.talent_dev.courses.show');
    Route::get('/learning/enrollments', [LearningController::class, 'indexEnrollments'])->name('v2.talent_dev.enrollments.index');
});
Route::middleware(['can:employees,create', 'throttle:api-write'])->group(function () {
    Route::post('/learning/courses', [LearningController::class, 'storeCourse'])->name('v2.talent_dev.courses.store');
    Route::post('/learning/enrollments', [LearningController::class, 'storeEnrollment'])->name('v2.talent_dev.enrollments.store');
});
Route::middleware(['can:employees,edit', 'throttle:api-write'])->group(function () {
    Route::put('/learning/courses/{id}', [LearningController::class, 'updateCourse'])->name('v2.talent_dev.courses.update');
    Route::put('/learning/enrollments/{id}', [LearningController::class, 'updateEnrollment'])->name('v2.talent_dev.enrollments.update');
});

// ── Succession Planning
Route::middleware('can:employees,view')->group(function () {
    Route::get('/succession', [SuccessionController::class, 'index'])->name('v2.talent_dev.succession.index');
    Route::get('/succession/{id}', [SuccessionController::class, 'show'])->name('v2.talent_dev.succession.show');
});
Route::middleware(['can:employees,create', 'throttle:api-write'])->group(function () {
    Route::post('/succession', [SuccessionController::class, 'store'])->name('v2.talent_dev.succession.store');
    Route::post('/succession/{planId}/candidates', [SuccessionController::class, 'storeCandidate'])->name('v2.talent_dev.succession.candidates.store');
});
Route::middleware(['can:employees,edit', 'throttle:api-write'])->group(function () {
    Route::put('/succession/{id}', [SuccessionController::class, 'update'])->name('v2.talent_dev.succession.update');
    Route::put('/succession/{planId}/candidates/{candidateId}', [SuccessionController::class, 'updateCandidate'])->name('v2.talent_dev.succession.candidates.update');
});



/*
|--------------------------------------------------------------------------
| Domain Routes: 06-HumanCapital (Time & Attendance)
|--------------------------------------------------------------------------
*/


// ── Attendance Management
Route::middleware('can:attendance,view')
    ->get('/attendance', [AttendanceController::class, 'index'])->name('v2.attendance.index');
    
Route::middleware(['can:attendance,create', 'throttle:api-write'])
    ->post('/attendance', [AttendanceController::class, 'store'])->name('v2.attendance.store');
    
Route::middleware(['can:attendance,create', 'throttle:api-critical'])
    ->post('/attendance/bulk-import', [AttendanceController::class, 'bulkImport'])->name('v2.attendance.bulk_import');
    
Route::middleware('can:attendance,view')
    ->get('/attendance/summary', [AttendanceController::class, 'getSummary'])->name('v2.attendance.summary');


// ── Leave Management
Route::middleware('can:leave_requests,view')
    ->get('/leave-requests', [LeaveController::class, 'index'])->name('v2.leave_requests.index');
    
Route::middleware(['can:leave_requests,create', 'throttle:api-write'])
    ->post('/leave-requests', [LeaveController::class, 'store'])->name('v2.leave_requests.store');
    
Route::middleware('can:leave_requests,view')
    ->get('/leave-requests/{id}', [LeaveController::class, 'show'])->name('v2.leave_requests.show');
    
Route::middleware(['can:leave_requests,edit', 'throttle:api-write'])
    ->post('/leave-requests/{id}/approve', [LeaveController::class, 'approve'])->name('v2.leave_requests.approve');
    
Route::middleware(['can:leave_requests,edit', 'throttle:api-write'])
    ->post('/leave-requests/{id}/cancel', [LeaveController::class, 'cancel'])->name('v2.leave_requests.cancel');


// ── Employee Portal Routes (Self-Service)
Route::group(['prefix' => 'employee-portal', 'middleware' => ['can:portal,view']], function () {
    Route::get('/my-payslips', [PayrollController::class, 'myPayslips'])->name('v2.employee_portal.payslips');
    Route::get('/my-leave-requests', [LeaveController::class, 'myLeaveRequests'])->name('v2.employee_portal.leave_requests');
    
    Route::middleware('can:portal,create')->post('/my-leave-requests', [LeaveController::class, 'store'])->name('v2.employee_portal.leave_requests.store');
    
    Route::get('/my-attendance', [AttendanceController::class, 'myAttendance'])->name('v2.employee_portal.attendance');
});


/*
|--------------------------------------------------------------------------
| Domain Routes: 06-HumanCapital (Talent Acquisition)
|--------------------------------------------------------------------------
| Recruitment, ATS & Onboarding/Offboarding
*/


// ── Recruitment Requisitions
Route::middleware('can:employees,view')->group(function () {
    Route::get('/recruitment/requisitions', [RecruitmentController::class, 'indexRequisitions'])->name('v2.talent.requisitions.index');
    Route::get('/recruitment/requisitions/{id}', [RecruitmentController::class, 'showRequisition'])->name('v2.talent.requisitions.show');
    Route::get('/recruitment/applicants', [RecruitmentController::class, 'indexApplicants'])->name('v2.talent.applicants.index');
});
Route::middleware(['can:employees,create', 'throttle:api-write'])->group(function () {
    Route::post('/recruitment/requisitions', [RecruitmentController::class, 'storeRequisition'])->name('v2.talent.requisitions.store');
    Route::post('/recruitment/applicants', [RecruitmentController::class, 'storeApplicant'])->name('v2.talent.applicants.store');
    Route::post('/recruitment/interviews', [RecruitmentController::class, 'storeInterview'])->name('v2.talent.interviews.store');
});
Route::middleware(['can:employees,edit', 'throttle:api-write'])->group(function () {
    Route::put('/recruitment/requisitions/{id}', [RecruitmentController::class, 'updateRequisition'])->name('v2.talent.requisitions.update');
    Route::put('/recruitment/applicants/{id}/status', [RecruitmentController::class, 'updateApplicantStatus'])->name('v2.talent.applicants.status');
    Route::put('/recruitment/interviews/{id}', [RecruitmentController::class, 'updateInterview'])->name('v2.talent.interviews.update');
});

// ── Onboarding / Offboarding
Route::middleware('can:employees,view')->group(function () {
    Route::get('/onboarding', [OnboardingController::class, 'index'])->name('v2.talent.onboarding.index');
    Route::get('/onboarding/{id}', [OnboardingController::class, 'show'])->name('v2.talent.onboarding.show');
});
Route::middleware(['can:employees,create', 'throttle:api-write'])->group(function () {
    Route::post('/onboarding', [OnboardingController::class, 'store'])->name('v2.talent.onboarding.store');
    Route::post('/onboarding/{workflowId}/documents', [OnboardingController::class, 'storeDocument'])->name('v2.talent.onboarding.documents.store');
});
Route::middleware(['can:employees,edit', 'throttle:api-write'])->group(function () {
    Route::put('/onboarding/{workflowId}/tasks/{taskId}', [OnboardingController::class, 'updateTask'])->name('v2.talent.onboarding.tasks.update');
});


/*
|--------------------------------------------------------------------------
| Domain Routes: 06-HumanCapital (Payroll)
|--------------------------------------------------------------------------
*/

// ── Payroll Management
Route::middleware('can:payroll,view')->group(function () {
    Route::get('/payroll/cycles', [PayrollController::class, 'index'])->name('v2.payroll.cycles.index');
    Route::get('/payroll/cycles/{id}/items', [PayrollController::class, 'getCycleItems'])->name('v2.payroll.cycles.items');
    
    Route::get('/payroll/items/{id}/transactions', [PayrollController::class, 'getItemTransactions'])->name('v2.payroll.items.transactions');
});

Route::middleware(['can:payroll,create', 'throttle:api-write'])->group(function () {
    Route::post('/payroll/generate', [PayrollController::class, 'generatePayroll'])->name('v2.payroll.generate');
    Route::post('/payroll/cycles/{id}/approve', [PayrollController::class, 'approve'])->name('v2.payroll.cycles.approve');
    
    Route::post('/payroll/cycles/{id}/pay', [PayrollController::class, 'processPayment'])->name('v2.payroll.cycles.pay');
    
    Route::post('/payroll/items/{id}/pay', [PayrollController::class, 'payIndividualItem'])->name('v2.payroll.items.pay');
});

Route::middleware(['can:payroll,edit', 'throttle:api-write'])->group(function () {
    Route::post('/payroll/items/{id}/toggle-status', [PayrollController::class, 'toggleItemStatus'])->name('v2.payroll.items.toggle_status');
    
    Route::put('/payroll/items/{id}', [PayrollController::class, 'updateItem'])->name('v2.payroll.items.update');
});

// ── EOSB Calculator
Route::middleware(['can:payroll,view', 'throttle:api-sensitive'])->group(function () {
    Route::post('/eosb/preview', [EOSBController::class, 'preview'])->name('v2.payroll.eosb.preview');
    Route::post('/eosb/{employeeId}/calculate', [EOSBController::class, 'calculate'])->name('v2.payroll.eosb.calculate');
});

// ── Payroll Components
Route::middleware('can:payroll,view')->group(function () {
    Route::get('/payroll-components', [PayrollComponentsController::class, 'index'])->name('v2.payroll.components.index');
    Route::get('/payroll-components/{id}', [PayrollComponentsController::class, 'show'])->name('v2.payroll.components.show');
});
Route::middleware(['can:payroll,create', 'throttle:api-write'])->group(function () {
    Route::post('/payroll-components', [PayrollComponentsController::class, 'store'])->name('v2.payroll.components.store');
});
Route::middleware(['can:payroll,edit', 'throttle:api-write'])->group(function () {
    Route::put('/payroll-components/{id}', [PayrollComponentsController::class, 'update'])->name('v2.payroll.components.update');
    Route::delete('/payroll-components/{id}', [PayrollComponentsController::class, 'destroy'])->name('v2.payroll.components.destroy');
});

// ── Post-Payroll Integrations
Route::middleware('can:payroll,view')->get('/post-payroll', [PostPayrollController::class, 'index'])->name('v2.payroll.post.index');
Route::middleware(['can:payroll,create', 'throttle:api-sensitive'])->post('/post-payroll', [PostPayrollController::class, 'store'])->name('v2.payroll.post.store');
Route::middleware(['can:payroll,edit', 'throttle:api-critical'])->group(function () {
    Route::post('/post-payroll/{id}/process', [PostPayrollController::class, 'process'])->name('v2.payroll.post.process');
    Route::post('/post-payroll/{id}/reconcile', [PostPayrollController::class, 'reconcile'])->name('v2.payroll.post.reconcile');
});

// ── Employee Loans
Route::middleware('can:employees,view')->get('/employee-loans', [EmployeeLoansController::class, 'index'])->name('v2.payroll.loans.index');
Route::middleware(['can:employees,create', 'throttle:api-sensitive'])->post('/employee-loans', [EmployeeLoansController::class, 'store'])->name('v2.payroll.loans.store');
Route::middleware('can:employees,view')->get('/employee-loans/{id}', [EmployeeLoansController::class, 'show'])->name('v2.payroll.loans.show');
Route::middleware(['can:employees,edit', 'throttle:api-sensitive'])->group(function () {
    Route::put('/employee-loans/{id}/status', [EmployeeLoansController::class, 'updateStatus'])->name('v2.payroll.loans.status');
    Route::put('/employee-loans/{id}/repayments/{repaymentId}', [EmployeeLoansController::class, 'recordRepayment'])->name('v2.payroll.loans.repayment');
});

// ── Compensation Management
Route::middleware('can:employees,view')->group(function () {
    Route::get('/compensation/plans', [CompensationController::class, 'indexPlans'])->name('v2.payroll.compensation.plans.index');
    Route::get('/compensation/plans/{id}', [CompensationController::class, 'showPlan'])->name('v2.payroll.compensation.plans.show');
    Route::get('/compensation/entries', [CompensationController::class, 'indexEntries'])->name('v2.payroll.compensation.entries.index');
});
Route::middleware(['can:employees,create', 'throttle:api-write'])->group(function () {
    Route::post('/compensation/plans', [CompensationController::class, 'storePlan'])->name('v2.payroll.compensation.plans.store');
    Route::post('/compensation/entries', [CompensationController::class, 'storeEntry'])->name('v2.payroll.compensation.entries.store');
});
Route::middleware(['can:employees,edit', 'throttle:api-write'])->group(function () {
    Route::put('/compensation/plans/{id}', [CompensationController::class, 'updatePlan'])->name('v2.payroll.compensation.plans.update');
    Route::put('/compensation/entries/{id}/status', [CompensationController::class, 'updateEntryStatus'])->name('v2.payroll.compensation.entries.status');
});

// ── Benefits Administration
Route::middleware('can:employees,view')->group(function () {
    Route::get('/benefits/plans', [BenefitsController::class, 'indexPlans'])->name('v2.payroll.benefits.plans.index');
    Route::get('/benefits/plans/{id}', [BenefitsController::class, 'showPlan'])->name('v2.payroll.benefits.plans.show');
    Route::get('/benefits/enrollments', [BenefitsController::class, 'indexEnrollments'])->name('v2.payroll.benefits.enrollments.index');
});
Route::middleware(['can:employees,create', 'throttle:api-write'])->group(function () {
    Route::post('/benefits/plans', [BenefitsController::class, 'storePlan'])->name('v2.payroll.benefits.plans.store');
    Route::post('/benefits/enrollments', [BenefitsController::class, 'storeEnrollment'])->name('v2.payroll.benefits.enrollments.store');
});
Route::middleware(['can:employees,edit', 'throttle:api-write'])->group(function () {
    Route::put('/benefits/plans/{id}', [BenefitsController::class, 'updatePlan'])->name('v2.payroll.benefits.plans.update');
    Route::put('/benefits/enrollments/{id}', [BenefitsController::class, 'updateEnrollment'])->name('v2.payroll.benefits.enrollments.update');
});

/*
|--------------------------------------------------------------------------
| Domain Routes: 06-HumanCapital (Employee Services)
|--------------------------------------------------------------------------
| ER, Travel, Scheduling, QA/Compliance, EHS, Wellness, Communications
*/


// ── Employee Relations
Route::middleware('can:employees,view')->group(function () {
    Route::get('/relations/cases', [EmployeeRelationsController::class, 'index'])->name('v2.relations.cases.index');
    Route::get('/relations/cases/{id}', [EmployeeRelationsController::class, 'show'])->name('v2.relations.cases.show');
});
Route::middleware(['can:employees,create', 'throttle:api-write'])->group(function () {
    Route::post('/relations/cases', [EmployeeRelationsController::class, 'store'])->name('v2.relations.cases.store');
    Route::post('/relations/cases/{caseId}/disciplinary', [EmployeeRelationsController::class, 'storeDisciplinaryAction'])->name('v2.relations.disciplinary.store');
});
Route::middleware(['can:employees,edit', 'throttle:api-write'])->put('/relations/cases/{id}', [EmployeeRelationsController::class, 'update'])->name('v2.relations.cases.update');

// ── Travel & Expense
Route::middleware('can:employees,view')->group(function () {
    Route::get('/travel/requests', [TravelExpenseController::class, 'indexRequests'])->name('v2.travel.requests.index');
    Route::get('/travel/expenses', [TravelExpenseController::class, 'indexExpenses'])->name('v2.travel.expenses.index');
});
Route::middleware(['can:employees,create', 'throttle:api-write'])->group(function () {
    Route::post('/travel/requests', [TravelExpenseController::class, 'storeRequest'])->name('v2.travel.requests.store');
    Route::post('/travel/expenses', [TravelExpenseController::class, 'storeExpense'])->name('v2.travel.expenses.store');
});
Route::middleware(['can:employees,edit', 'throttle:api-write'])->group(function () {
    Route::put('/travel/requests/{id}/status', [TravelExpenseController::class, 'updateRequestStatus'])->name('v2.travel.requests.status');
    Route::put('/travel/expenses/{id}/status', [TravelExpenseController::class, 'updateExpenseStatus'])->name('v2.travel.expenses.status');
});

// ── Workforce Scheduling
Route::middleware('can:employees,view')->group(function () {
    Route::get('/schedules', [WorkforceSchedulingController::class, 'index'])->name('v2.schedules.index');
    Route::get('/schedules/{id}', [WorkforceSchedulingController::class, 'show'])->name('v2.schedules.show');
});
Route::middleware(['can:employees,create', 'throttle:api-write'])->group(function () {
    Route::post('/schedules', [WorkforceSchedulingController::class, 'store'])->name('v2.schedules.store');
    Route::post('/schedules/{scheduleId}/shifts', [WorkforceSchedulingController::class, 'storeShift'])->name('v2.schedules.shifts.store');
});
Route::middleware(['can:employees,edit', 'throttle:api-write'])->group(function () {
    Route::put('/schedules/{id}', [WorkforceSchedulingController::class, 'update'])->name('v2.schedules.update');
    Route::put('/schedules/{scheduleId}/shifts/{shiftId}', [WorkforceSchedulingController::class, 'updateShift'])->name('v2.schedules.shifts.update');
});

// ── QA & Compliance
Route::middleware('can:employees,view')->group(function () {
    Route::get('/compliance', [QaComplianceController::class, 'index'])->name('v2.compliance.index');
    Route::get('/compliance/{id}', [QaComplianceController::class, 'show'])->name('v2.compliance.show');
});
Route::middleware(['can:employees,create', 'throttle:api-write'])->group(function () {
    Route::post('/compliance', [QaComplianceController::class, 'store'])->name('v2.compliance.store');
    Route::post('/compliance/{complianceId}/capa', [QaComplianceController::class, 'storeCapa'])->name('v2.compliance.capa.store');
});
Route::middleware(['can:employees,edit', 'throttle:api-write'])->put('/compliance/{id}', [QaComplianceController::class, 'update'])->name('v2.compliance.update');

// ── EHS (Environment, Health & Safety)
Route::middleware('can:employees,view')->group(function () {
    Route::get('/ehs/incidents', [EhsController::class, 'indexIncidents'])->name('v2.ehs.incidents.index');
    Route::get('/ehs/health-records', [EhsController::class, 'indexHealthRecords'])->name('v2.ehs.health_records.index');
    Route::get('/ehs/ppe', [EhsController::class, 'indexPpe'])->name('v2.ehs.ppe.index');
});
Route::middleware(['can:employees,create', 'throttle:api-write'])->group(function () {
    Route::post('/ehs/incidents', [EhsController::class, 'storeIncident'])->name('v2.ehs.incidents.store');
    Route::post('/ehs/health-records', [EhsController::class, 'storeHealthRecord'])->name('v2.ehs.health_records.store');
    Route::post('/ehs/ppe', [EhsController::class, 'storePpe'])->name('v2.ehs.ppe.store');
});
Route::middleware(['can:employees,edit', 'throttle:api-write'])->put('/ehs/incidents/{id}', [EhsController::class, 'updateIncident'])->name('v2.ehs.incidents.update');

// ── Wellness Programs
Route::middleware('can:employees,view')->group(function () {
    Route::get('/wellness/programs', [WellnessController::class, 'indexPrograms'])->name('v2.wellness.programs.index');
    Route::get('/wellness/participations', [WellnessController::class, 'indexParticipations'])->name('v2.wellness.participations.index');
});
Route::middleware(['can:employees,create', 'throttle:api-write'])->group(function () {
    Route::post('/wellness/programs', [WellnessController::class, 'storeProgram'])->name('v2.wellness.programs.store');
    Route::post('/wellness/participations', [WellnessController::class, 'storeParticipation'])->name('v2.wellness.participations.store');
});
Route::middleware(['can:employees,edit', 'throttle:api-write'])->put('/wellness/participations/{id}', [WellnessController::class, 'updateParticipation'])->name('v2.wellness.participations.update');

// ── Corporate Communications
Route::middleware('can:employees,view')->group(function () {
    Route::get('/communications/announcements', [CorporateCommunicationsController::class, 'indexAnnouncements'])->name('v2.comms.announcements.index');
    Route::get('/communications/surveys', [CorporateCommunicationsController::class, 'indexSurveys'])->name('v2.comms.surveys.index');
});
Route::middleware(['can:employees,create', 'throttle:api-write'])->group(function () {
    Route::post('/communications/announcements', [CorporateCommunicationsController::class, 'storeAnnouncement'])->name('v2.comms.announcements.store');
    Route::post('/communications/surveys', [CorporateCommunicationsController::class, 'storeSurvey'])->name('v2.comms.surveys.store');
    Route::post('/communications/surveys/{surveyId}/responses', [CorporateCommunicationsController::class, 'storeSurveyResponse'])->name('v2.comms.surveys.responses.store');
});
Route::middleware(['can:employees,edit', 'throttle:api-write'])->put('/communications/announcements/{id}', [CorporateCommunicationsController::class, 'updateAnnouncement'])->name('v2.comms.announcements.update');

/*
|--------------------------------------------------------------------------
| Domain Routes: 06-HumanCapital (WorkforceAdmin)
|--------------------------------------------------------------------------
*/


// ── Departments
Route::middleware('can:employees,view')
    ->get('/departments', [DepartmentsController::class, 'index'])
    ->name('v2.departments.index');

Route::middleware('can:employees,view')
    ->get('/departments/{id}', [DepartmentsController::class, 'show'])->name('v2.departments.show');

Route::middleware(['can:employees,create', 'throttle:api-write'])
    ->post('/departments', [DepartmentsController::class, 'store'])
    ->name('v2.departments.store');

Route::middleware(['can:employees,edit', 'throttle:api-write'])
    ->put('/departments/{id}', [DepartmentsController::class, 'update'])->name('v2.departments.update');

Route::middleware(['can:employees,delete', 'throttle:api-delete'])
    ->delete('/departments/{id}', [DepartmentsController::class, 'destroy'])->name('v2.departments.destroy');
    
// ── Employees
Route::middleware('can:employees,view')
    ->get('/employees', [EmployeesController::class, 'index'])
    ->name('v2.employees.index');

Route::middleware(['can:employees,create', 'throttle:api-write'])
    ->post('/employees', [EmployeesController::class, 'store'])
    ->name('v2.employees.store');
    
Route::middleware('can:employees,view')
    ->get('/employees/{id}', [EmployeesController::class, 'show'])->name('v2.employees.show');

Route::middleware(['can:employees,edit', 'throttle:api-write'])
    ->put('/employees/{id}', [EmployeesController::class, 'update'])->name('v2.employees.update');

Route::middleware(['can:employees,delete', 'throttle:api-delete'])
    ->delete('/employees/{id}', [EmployeesController::class, 'destroy'])->name('v2.employees.destroy');

Route::middleware(['can:employees,edit', 'throttle:api-sensitive'])
    ->post('/employees/{id}/suspend', [EmployeesController::class, 'suspend'])->name('v2.employees.suspend');

Route::middleware(['can:employees,edit', 'throttle:api-sensitive'])
    ->post('/employees/{id}/activate', [EmployeesController::class, 'activate'])->name('v2.employees.activate');

// ── Employee Documents (File Management)
Route::middleware(['can:employees,edit', 'throttle:api-write'])
    ->post('/employees/{id}/documents', [EmployeesController::class, 'uploadDocument'])->name('v2.employees.documents.store');

Route::middleware('can:employees,view')
    ->get('/employees/{id}/documents', [EmployeesController::class, 'getDocuments'])->name('v2.employees.documents.index');

// Using employee-files prefix for extended management mimicking legacy routes
Route::middleware('can:employees,view')
    ->get('/employee-files/{employeeId}', [EmployeesController::class, 'getDocuments']);

Route::middleware(['can:employees,create', 'throttle:api-write'])
    ->post('/employee-files/{employeeId}', [EmployeesController::class, 'uploadDocument']);

Route::middleware('can:employees,view')
    ->get('/employee-files/{employeeId}/download/{documentId}', [EmployeesController::class, 'downloadDocument']);

Route::middleware(['can:employees,edit', 'throttle:api-write'])
    ->put('/employee-files/{employeeId}/{documentId}', [EmployeesController::class, 'updateDocument']);

Route::middleware(['can:employees,delete', 'throttle:api-delete'])
    ->delete('/employee-files/{employeeId}/{documentId}', [EmployeesController::class, 'destroyDocument']);

// ── Job Titles
Route::middleware('can:employees,view')
    ->get('/job-titles', [HrAdministrationController::class, 'indexJobTitles'])
    ->name('v2.job_titles.index');

Route::middleware(['can:employees,create', 'throttle:api-write'])
    ->post('/job-titles', [HrAdministrationController::class, 'storeJobTitle'])
    ->name('v2.job_titles.store');

Route::middleware(['can:employees,edit', 'throttle:api-write'])
    ->put('/job-titles/{id}', [HrAdministrationController::class, 'updateJobTitle'])->name('v2.job_titles.update');

Route::middleware(['can:employees,delete', 'throttle:api-delete'])
    ->delete('/job-titles/{id}', [HrAdministrationController::class, 'destroyJobTitle'])->name('v2.job_titles.destroy');

// ── Positions & Hierarchy
Route::middleware('can:employees,view')
    ->get('/positions', [HrAdministrationController::class, 'indexPositions'])
    ->name('v2.positions.index');

Route::middleware('can:employees,view')
    ->get('/positions/{id}', [HrAdministrationController::class, 'showPosition'])->name('v2.positions.show');

Route::middleware(['can:employees,create', 'throttle:api-write'])
    ->post('/positions', [HrAdministrationController::class, 'storePosition'])
    ->name('v2.positions.store');

Route::middleware(['can:employees,edit', 'throttle:api-write'])
    ->put('/positions/{id}', [HrAdministrationController::class, 'updatePosition'])->name('v2.positions.update');

Route::middleware(['can:employees,delete', 'throttle:api-delete'])
    ->delete('/positions/{id}', [HrAdministrationController::class, 'destroyPosition'])->name('v2.positions.destroy');

Route::middleware(['can:employees,edit', 'throttle:api-sensitive'])
    ->post('/positions/assign-employee', [HrAdministrationController::class, 'assignEmployeeToPosition'])
    ->name('v2.positions.assign_employee');

Route::middleware(['can:employees,edit', 'throttle:api-delete'])
    ->delete('/positions/unassign-employee/{employeeId}', [HrAdministrationController::class, 'unassignEmployeeFromPosition'])->name('v2.positions.unassign_employee');

// ── Contracts & Agreements
Route::middleware('can:employees,view')->group(function () {
    Route::get('/contracts', [EmployeeContractsController::class, 'index'])->name('v2.contracts.index');
    Route::get('/contracts/{id}', [EmployeeContractsController::class, 'show'])->name('v2.contracts.show');
});
Route::middleware(['can:employees,create', 'throttle:api-write'])->post('/contracts', [EmployeeContractsController::class, 'store'])->name('v2.contracts.store');
Route::middleware(['can:employees,edit', 'throttle:api-write'])->put('/contracts/{id}', [EmployeeContractsController::class, 'update'])->name('v2.contracts.update');
Route::middleware(['can:employees,delete', 'throttle:api-delete'])->delete('/contracts/{id}', [EmployeeContractsController::class, 'destroy'])->name('v2.contracts.destroy');

// ── Employee Assets & Equipment
Route::middleware('can:employees,view')->group(function () {
    Route::get('/employee-assets', [EmployeeAssetsController::class, 'index'])->name('v2.employee_assets.index');
    Route::get('/employee-assets/{id}', [EmployeeAssetsController::class, 'show'])->name('v2.employee_assets.show');
});
Route::middleware(['can:employees,create', 'throttle:api-write'])->post('/employee-assets', [EmployeeAssetsController::class, 'store'])->name('v2.employee_assets.store');
Route::middleware(['can:employees,edit', 'throttle:api-write'])->put('/employee-assets/{id}', [EmployeeAssetsController::class, 'update'])->name('v2.employee_assets.update');
Route::middleware(['can:employees,delete', 'throttle:api-delete'])->delete('/employee-assets/{id}', [EmployeeAssetsController::class, 'destroy'])->name('v2.employee_assets.destroy');

// ── Global Mobility & Expat Management
Route::middleware('can:employees,view')->group(function () {
    Route::get('/expat-management', [ExpatManagementController::class, 'index'])->name('v2.expat.index');
    Route::get('/expat-management/{id}', [ExpatManagementController::class, 'show'])->name('v2.expat.show');
});
Route::middleware(['can:employees,create', 'throttle:api-write'])->post('/expat-management', [ExpatManagementController::class, 'store'])->name('v2.expat.store');
Route::middleware(['can:employees,edit', 'throttle:api-write'])->put('/expat-management/{id}', [ExpatManagementController::class, 'update'])->name('v2.expat.update');
Route::middleware(['can:employees,delete', 'throttle:api-delete'])->delete('/expat-management/{id}', [ExpatManagementController::class, 'destroy'])->name('v2.expat.destroy');

// ── Contingent Workers
Route::middleware('can:employees,view')->group(function () {
    Route::get('/contingent-workers', [ContingentWorkersController::class, 'index'])->name('v2.contingent.index');
    Route::get('/contingent-workers/{id}', [ContingentWorkersController::class, 'show'])->name('v2.contingent.show');
});
Route::middleware(['can:employees,create', 'throttle:api-write'])->group(function () {
    Route::post('/contingent-workers', [ContingentWorkersController::class, 'store'])->name('v2.contingent.store');
    Route::post('/contingent-workers/{workerId}/contracts', [ContingentWorkersController::class, 'storeContract'])->name('v2.contingent.contracts.store');
});
Route::middleware(['can:employees,edit', 'throttle:api-write'])->put('/contingent-workers/{id}', [ContingentWorkersController::class, 'update'])->name('v2.contingent.update');


/*
|--------------------------------------------------------------------------
| Domain Routes: 06-HumanCapital (Knowledge Base & Expertise Directory)
|--------------------------------------------------------------------------
*/


// ── Knowledge Base
Route::middleware('can:employees,view')->group(function () {
    Route::get('/knowledge-base', [KnowledgeManagementController::class, 'indexKnowledgeBase'])->name('v2.kb.index');
    Route::get('/knowledge-base/{id}', [KnowledgeManagementController::class, 'showKnowledgeBase'])->name('v2.kb.show');
});
Route::middleware(['can:employees,create', 'throttle:api-write'])->group(function () {
    Route::post('/knowledge-base', [KnowledgeManagementController::class, 'storeKnowledgeBase'])->name('v2.kb.store');
});
Route::middleware(['can:employees,edit', 'throttle:api-write'])->group(function () {
    Route::put('/knowledge-base/{id}', [KnowledgeManagementController::class, 'updateKnowledgeBase'])->name('v2.kb.update');
    Route::post('/knowledge-base/{id}/helpful', [KnowledgeManagementController::class, 'markHelpful'])->name('v2.kb.helpful');
});

// ── Expertise Directory
Route::middleware('can:employees,view')->group(function () {
    Route::get('/expertise', [KnowledgeManagementController::class, 'indexExpertise'])->name('v2.expertise.index');
});
Route::middleware(['can:employees,create', 'throttle:api-write'])->group(function () {
    Route::post('/expertise', [KnowledgeManagementController::class, 'storeExpertise'])->name('v2.expertise.store');
});
Route::middleware(['can:employees,edit', 'throttle:api-write'])->group(function () {
    Route::put('/expertise/{id}', [KnowledgeManagementController::class, 'updateExpertise'])->name('v2.expertise.update');
});


/*
|--------------------------------------------------------------------------
| Domain Routes: 06-HumanCapital (HR Document Templates)
|--------------------------------------------------------------------------
*/


Route::group(['prefix' => 'hr-templates', 'middleware' => 'can:employees,view'], function () {
    Route::get('/', [DocumentTemplateController::class, 'index'])->name('v2.hr_templates.index');
    Route::get('/approved-keys', [DocumentTemplateController::class, 'getApprovedKeys'])->name('v2.hr_templates.approved_keys');
    Route::get('/{id}', [DocumentTemplateController::class, 'show'])->name('v2.hr_templates.show');

    Route::middleware(['can:employees,create', 'throttle:api-write'])->post('/', [DocumentTemplateController::class, 'store'])->name('v2.hr_templates.store');
    Route::middleware(['can:employees,edit', 'throttle:api-write'])->put('/{id}', [DocumentTemplateController::class, 'update'])->name('v2.hr_templates.update');
    Route::middleware(['can:employees,delete', 'throttle:api-delete'])->delete('/{id}', [DocumentTemplateController::class, 'destroy'])->name('v2.hr_templates.destroy');
    Route::middleware(['can:employees,edit', 'throttle:api-write'])->post('/{id}/render', [DocumentTemplateController::class, 'render'])->name('v2.hr_templates.render');
});



/*
|--------------------------------------------------------------------------
| Domain Routes: 06-HumanCapital (Biometric Devices)
|--------------------------------------------------------------------------
*/


Route::group(['prefix' => 'biometric', 'middleware' => 'can:attendance,view'], function () {
    Route::get('/devices', [BiometricController::class, 'indexDevices'])->name('v2.biometric.devices.index');

    Route::get('/sync-logs', [BiometricController::class, 'syncLogs'])->name('v2.biometric.sync_logs');

    Route::middleware(['can:attendance,create', 'throttle:api-write'])->post('/devices', [BiometricController::class, 'storeDevice'])->name('v2.biometric.devices.store');

    Route::middleware(['can:attendance,edit', 'throttle:api-write'])->put('/devices/{id}', [BiometricController::class, 'updateDevice'])->name('v2.biometric.devices.update');

    Route::middleware(['can:attendance,delete', 'throttle:api-delete'])->delete('/devices/{id}', [BiometricController::class, 'destroyDevice'])->name('v2.biometric.devices.destroy');

    Route::middleware(['can:attendance,edit', 'throttle:api-critical'])->post('/devices/{id}/sync', [BiometricController::class, 'syncDevice'])->name('v2.biometric.devices.sync');

    Route::middleware(['can:attendance,create', 'throttle:api-critical'])->post('/devices/{id}/import', [BiometricController::class, 'importFromFile'])->name('v2.biometric.devices.import');
    
    // Legacy compatibility
    Route::middleware(['can:attendance,create', 'throttle:api-critical'])->post('/import', [BiometricController::class, 'importFromFile'])->name('v2.biometric.import.legacy');
});

// ── Legacy Compatibility: Employee Files
Route::group(['prefix' => 'employee-files', 'middleware' => 'can:employees,view'], function () {
    Route::get('/{employeeId}', [EmployeesController::class, 'getDocuments'])->name('v2.legacy.employee_files.index');
    Route::post('/{employeeId}', [EmployeesController::class, 'uploadDocument'])->name('v2.legacy.employee_files.store');
    Route::get('/{employeeId}/download/{documentId}', [EmployeesController::class, 'downloadDocument'])->name('v2.legacy.employee_files.download');
    Route::put('/{employeeId}/{documentId}', [EmployeesController::class, 'updateDocument'])->name('v2.legacy.employee_files.update');
    Route::delete('/{employeeId}/{documentId}', [EmployeesController::class, 'destroyDocument'])->name('v2.legacy.employee_files.destroy');
});
