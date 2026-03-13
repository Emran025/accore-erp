<?php

use Illuminate\Support\Facades\Route;

use App\Domains\HumanCapital\WorkforceAdmin\Actions\{
    // Departments
    ListDepartmentsAction,
    CreateDepartmentAction,
    ShowDepartmentAction,
    UpdateDepartmentAction,
    DeleteDepartmentAction,
    // Employees
    ListEmployeesAction,
    CreateEmployeeAction,
    ShowEmployeeAction,
    UpdateEmployeeAction,
    DeleteEmployeeAction,
    SuspendEmployeeAction,
    ActivateEmployeeAction,
    // Employee Documents
    UploadEmployeeDocumentAction,
    ListEmployeeDocumentsAction,
    DownloadEmployeeDocumentAction,
    UpdateEmployeeDocumentAction,
    DeleteEmployeeDocumentAction,
    // Job Titles
    ListJobTitlesAction,
    CreateJobTitleAction,
    UpdateJobTitleAction,
    DeleteJobTitleAction,
    // Positions
    ListPositionsAction,
    ShowPositionAction,
    CreatePositionAction,
    UpdatePositionAction,
    DeletePositionAction,
    AssignEmployeePositionAction,
    UnassignEmployeePositionAction,
    // Contracts
    ListContractsAction,
    CreateContractAction,
    ShowContractAction,
    UpdateContractAction,
    DeleteContractAction,
    // Employee Assets
    ListEmployeeAssetsAction,
    CreateEmployeeAssetAction,
    ShowEmployeeAssetAction,
    UpdateEmployeeAssetAction,
    DeleteEmployeeAssetAction,
    // Expat Management
    ListExpatRecordsAction,
    CreateExpatRecordAction,
    ShowExpatRecordAction,
    UpdateExpatRecordAction,
    DeleteExpatRecordAction,
    // Contingent Workers
    ListContingentWorkersAction,
    CreateContingentWorkerAction,
    ShowContingentWorkerAction,
    UpdateContingentWorkerAction,
    CreateContingentContractAction,
};
use App\Domains\HumanCapital\WorkforceAdmin\Actions\{
    // Employee Relations
    ListRelationsCasesAction,
    CreateRelationsCaseAction,
    ShowRelationsCaseAction,
    UpdateRelationsCaseAction,
    CreateDisciplinaryActionAction,
    // Travel & Expense
    ListTravelRequestsAction,
    CreateTravelRequestAction,
    UpdateTravelRequestStatusAction,
    ListTravelExpensesAction,
    CreateTravelExpenseAction,
    UpdateTravelExpenseStatusAction,
    // Workforce Scheduling
    ListSchedulesAction,
    CreateScheduleAction,
    ShowScheduleAction,
    UpdateScheduleAction,
    CreateShiftAction,
    UpdateShiftAction,
    // QA & Compliance
    ListComplianceAction,
    CreateComplianceAction,
    ShowComplianceAction,
    UpdateComplianceAction,
    CreateCapaAction,
    // EHS
    ListEhsIncidentsAction,
    CreateEhsIncidentAction,
    UpdateEhsIncidentAction,
    ListHealthRecordsAction,
    CreateHealthRecordAction,
    ListPpeAction,
    CreatePpeAction,
    // Wellness
    ListWellnessProgramsAction,
    CreateWellnessProgramAction,
    ListWellnessParticipationsAction,
    CreateWellnessParticipationAction,
    UpdateWellnessParticipationAction,
    // Corporate Communications
    ListAnnouncementsAction,
    CreateAnnouncementAction,
    UpdateAnnouncementAction,
    ListSurveysAction,
    CreateSurveyAction,
    CreateSurveyResponseAction,
};


use Illuminate\Http\Request;

use App\Domains\HumanCapital\Payroll\Actions\{
    ListPayrollCyclesAction,
    GeneratePayrollCycleAction,
    ApprovePayrollCycleAction,
    ProcessPayrollPaymentAction,
    GetPayrollCycleItemsAction,
    TogglePayrollItemStatusAction,
    PayIndividualPayrollItemAction,
    GetPayrollItemTransactionsAction,
    UpdatePayrollItemAction,
    ListMyPayslipsAction,
    CalculateEOSBAction,
    PreviewEOSBAction,
    ListPayrollComponentsAction,
    CreatePayrollComponentAction,
    ShowPayrollComponentAction,
    UpdatePayrollComponentAction,
    DeletePayrollComponentAction,
    ListPostPayrollIntegrationsAction,
    CreatePostPayrollIntegrationAction,
    ProcessPostPayrollIntegrationAction,
    ReconcilePostPayrollIntegrationAction,
    ListEmployeeLoansAction,
    CreateEmployeeLoanAction,
    ShowEmployeeLoanAction,
    UpdateEmployeeLoanStatusAction,
    RecordLoanRepaymentAction,
    ListCompensationPlansAction,
    CreateCompensationPlanAction,
    ShowCompensationPlanAction,
    UpdateCompensationPlanAction,
    ListCompensationEntriesAction,
    CreateCompensationEntryAction,
    UpdateCompensationEntryStatusAction,
    ListBenefitsPlansAction,
    CreateBenefitsPlanAction,
    ShowBenefitsPlanAction,
    UpdateBenefitsPlanAction,
    ListBenefitsEnrollmentsAction,
    CreateBenefitsEnrollmentAction,
    UpdateBenefitsEnrollmentAction,
};


use App\Domains\HumanCapital\TalentAcquisition\Actions\{
    ListRequisitionsAction,
    CreateRequisitionAction,
    ShowRequisitionAction,
    UpdateRequisitionAction,
    ListApplicantsAction,
    CreateApplicantAction,
    UpdateApplicantStatusAction,
    CreateInterviewAction,
    UpdateInterviewAction,
    ListOnboardingWorkflowsAction,
    CreateOnboardingWorkflowAction,
    ShowOnboardingWorkflowAction,
    UpdateOnboardingTaskAction,
    CreateOnboardingDocumentAction,
};



use App\Domains\HumanCapital\TimeAndAttendance\Actions\{
    // Attendance
    ListAttendanceRecordsAction,
    RecordAttendanceAction,
    BulkImportAttendanceAction,
    GetAttendanceSummaryAction,
    GetMyAttendanceAction,
    // Leave Management
    ListLeaveRequestsAction,
    CreateLeaveRequestAction,
    ShowLeaveRequestAction,
    ProcessLeaveRequestAction,
    CancelLeaveRequestAction,
    ListMyLeaveRequestsAction,
    // Biometric Devices
    CreateBiometricDeviceAction,
    DeleteBiometricDeviceAction,
    GetBiometricSyncLogsAction,
    ImportBiometricAttendanceAction,
    ListBiometricDevicesAction,
    SyncBiometricDeviceAction,
    UpdateBiometricDeviceAction,
};

use App\Domains\HumanCapital\Communications\Actions\{
    CreateExpertiseEntryAction,
    CreateKnowledgeBaseEntryAction,
    ListExpertiseEntriesAction,
    ListKnowledgeBaseEntriesAction,
    MarkKnowledgeBaseHelpfulAction,
    ShowKnowledgeBaseEntryAction,
    UpdateExpertiseEntryAction,
    UpdateKnowledgeBaseEntryAction,
};

use App\Domains\HumanCapital\DocumentManagement\Actions\{
    CreateHrDocumentTemplateAction,
    DeleteHrDocumentTemplateAction,
    GetHrDocumentTemplateApprovedKeysAction,
    ListHrDocumentTemplatesAction,
    RenderHrDocumentTemplateAction,
    ShowHrDocumentTemplateAction,
    UpdateHrDocumentTemplateAction,
};


use App\Domains\HumanCapital\TalentDevelopment\Actions\{
    ListGoalsAction,
    CreateGoalAction,
    UpdateGoalAction,
    ListAppraisalsAction,
    CreateAppraisalAction,
    UpdateAppraisalAction,
    ListFeedbackAction,
    CreateFeedbackAction,
    ListCoursesAction,
    CreateCourseAction,
    ShowCourseAction,
    UpdateCourseAction,
    ListLearningEnrollmentsAction,
    CreateLearningEnrollmentAction,
    UpdateLearningEnrollmentAction,
};
use App\Domains\HumanCapital\TalentDevelopment\Actions\{
    ListSuccessionPlansAction,
    CreateSuccessionPlanAction,
    ShowSuccessionPlanAction,
    UpdateSuccessionPlanAction,
    CreateSuccessionCandidateAction,
    UpdateSuccessionCandidateAction,
};

/*
|--------------------------------------------------------------------------
| Domain Routes: 06-HumanCapital (Talent Development)
|--------------------------------------------------------------------------
| Performance, Learning & Succession Planning
*/

Route::group(['prefix' => 'v2', 'middleware' => ['api.auth', 'throttle:api']], function () {

    // ── Performance Goals
    Route::middleware('can:employees,view')->group(function () {
        Route::get('/performance/goals', ListGoalsAction::class)->name('v2.talent_dev.goals.index');
        Route::get('/performance/appraisals', ListAppraisalsAction::class)->name('v2.talent_dev.appraisals.index');
        Route::get('/performance/feedback', ListFeedbackAction::class)->name('v2.talent_dev.feedback.index');
    });
    Route::middleware(['can:employees,create', 'throttle:api-write'])->group(function () {
        Route::post('/performance/goals', CreateGoalAction::class)->name('v2.talent_dev.goals.store');
        Route::post('/performance/appraisals', CreateAppraisalAction::class)->name('v2.talent_dev.appraisals.store');
        Route::post('/performance/feedback', CreateFeedbackAction::class)->name('v2.talent_dev.feedback.store');
    });
    Route::middleware(['can:employees,edit', 'throttle:api-write'])->group(function () {
        Route::put('/performance/goals/{id}', function (Request $request, $id) {
            return app()->make(UpdateGoalAction::class, ['request' => $request, 'id' => (int) $id])();
        })->name('v2.talent_dev.goals.update');
        Route::put('/performance/appraisals/{id}', function (Request $request, $id) {
            return app()->make(UpdateAppraisalAction::class, ['request' => $request, 'id' => (int) $id])();
        })->name('v2.talent_dev.appraisals.update');
    });

    // ── Learning Management
    Route::middleware('can:employees,view')->group(function () {
        Route::get('/learning/courses', ListCoursesAction::class)->name('v2.talent_dev.courses.index');
        Route::get('/learning/courses/{id}', function ($id) {
            return app()->make(ShowCourseAction::class, ['id' => (int) $id])();
        })->name('v2.talent_dev.courses.show');
        Route::get('/learning/enrollments', ListLearningEnrollmentsAction::class)->name('v2.talent_dev.enrollments.index');
    });
    Route::middleware(['can:employees,create', 'throttle:api-write'])->group(function () {
        Route::post('/learning/courses', CreateCourseAction::class)->name('v2.talent_dev.courses.store');
        Route::post('/learning/enrollments', CreateLearningEnrollmentAction::class)->name('v2.talent_dev.enrollments.store');
    });
    Route::middleware(['can:employees,edit', 'throttle:api-write'])->group(function () {
        Route::put('/learning/courses/{id}', function (Request $request, $id) {
            return app()->make(UpdateCourseAction::class, ['request' => $request, 'id' => (int) $id])();
        })->name('v2.talent_dev.courses.update');
        Route::put('/learning/enrollments/{id}', function (Request $request, $id) {
            return app()->make(UpdateLearningEnrollmentAction::class, ['request' => $request, 'id' => (int) $id])();
        })->name('v2.talent_dev.enrollments.update');
    });

    // ── Succession Planning
    Route::middleware('can:employees,view')->group(function () {
        Route::get('/succession', ListSuccessionPlansAction::class)->name('v2.talent_dev.succession.index');
        Route::get('/succession/{id}', function ($id) {
            return app()->make(ShowSuccessionPlanAction::class, ['id' => (int) $id])();
        })->name('v2.talent_dev.succession.show');
    });
    Route::middleware(['can:employees,create', 'throttle:api-write'])->group(function () {
        Route::post('/succession', CreateSuccessionPlanAction::class)->name('v2.talent_dev.succession.store');
        Route::post('/succession/{planId}/candidates', function (Request $request, $planId) {
            return app()->make(CreateSuccessionCandidateAction::class, ['request' => $request, 'planId' => (int) $planId])();
        })->name('v2.talent_dev.succession.candidates.store');
    });
    Route::middleware(['can:employees,edit', 'throttle:api-write'])->group(function () {
        Route::put('/succession/{id}', function (Request $request, $id) {
            return app()->make(UpdateSuccessionPlanAction::class, ['request' => $request, 'id' => (int) $id])();
        })->name('v2.talent_dev.succession.update');
        Route::put('/succession/{planId}/candidates/{candidateId}', function (Request $request, $planId, $candidateId) {
            return app()->make(UpdateSuccessionCandidateAction::class, ['request' => $request, 'planId' => (int) $planId, 'candidateId' => (int) $candidateId])();
        })->name('v2.talent_dev.succession.candidates.update');
    });
});


/*
|--------------------------------------------------------------------------
| Domain Routes: 06-HumanCapital (Time & Attendance)
|--------------------------------------------------------------------------
*/

Route::group(['prefix' => 'v2', 'middleware' => ['api.auth', 'throttle:api']], function () {
    
    // ── Attendance Management
    Route::middleware('can:attendance,view')
        ->get('/attendance', function (Request $request) {
            return app()->make(ListAttendanceRecordsAction::class, ['request' => $request])();
        })->name('v2.attendance.index');
        
    Route::middleware(['can:attendance,create', 'throttle:api-write'])
        ->post('/attendance', function (Request $request) {
            return app()->make(RecordAttendanceAction::class, ['request' => $request])();
        })->name('v2.attendance.store');
        
    Route::middleware(['can:attendance,create', 'throttle:api-critical'])
        ->post('/attendance/bulk-import', function (Request $request) {
            return app()->make(BulkImportAttendanceAction::class, ['request' => $request])();
        })->name('v2.attendance.bulk_import');
        
    Route::middleware('can:attendance,view')
        ->get('/attendance/summary', function (Request $request) {
            return app()->make(GetAttendanceSummaryAction::class, ['request' => $request])();
        })->name('v2.attendance.summary');


    // ── Leave Management
    Route::middleware('can:leave_requests,view')
        ->get('/leave-requests', function (Request $request) {
            return app()->make(ListLeaveRequestsAction::class, ['request' => $request])();
        })->name('v2.leave_requests.index');
        
    Route::middleware(['can:leave_requests,create', 'throttle:api-write'])
        ->post('/leave-requests', function (Request $request) {
            return app()->make(CreateLeaveRequestAction::class, ['request' => $request])();
        })->name('v2.leave_requests.store');
        
    Route::middleware('can:leave_requests,view')
        ->get('/leave-requests/{id}', function ($id) {
            return app()->make(ShowLeaveRequestAction::class, ['id' => (int) $id])();
        })->name('v2.leave_requests.show');
        
    Route::middleware(['can:leave_requests,edit', 'throttle:api-write'])
        ->post('/leave-requests/{id}/approve', function (Request $request, $id) {
            return app()->make(ProcessLeaveRequestAction::class, ['request' => $request, 'id' => (int) $id])();
        })->name('v2.leave_requests.approve');
        
    Route::middleware(['can:leave_requests,edit', 'throttle:api-write'])
        ->post('/leave-requests/{id}/cancel', function ($id) {
            return app()->make(CancelLeaveRequestAction::class, ['id' => (int) $id])();
        })->name('v2.leave_requests.cancel');


    // ── Employee Portal Routes (Self-Service)
    Route::group(['prefix' => 'employee-portal', 'middleware' => ['can:portal,view']], function () {
        Route::get('/my-leave-requests', function (Request $request) {
            return app()->make(ListMyLeaveRequestsAction::class, ['request' => $request])();
        })->name('v2.employee_portal.leave_requests');
        
        Route::middleware('can:portal,create')->post('/my-leave-requests', function (Request $request) {
            return app()->make(CreateLeaveRequestAction::class, ['request' => $request])();
        })->name('v2.employee_portal.leave_requests.store');
        
        Route::get('/my-attendance', function (Request $request) {
            return app()->make(GetMyAttendanceAction::class, ['request' => $request])();
        })->name('v2.employee_portal.attendance');
    });
});


/*
|--------------------------------------------------------------------------
| Domain Routes: 06-HumanCapital (Talent Acquisition)
|--------------------------------------------------------------------------
| Recruitment, ATS & Onboarding/Offboarding
*/

Route::group(['prefix' => 'v2', 'middleware' => ['api.auth', 'throttle:api']], function () {

    // ── Recruitment Requisitions
    Route::middleware('can:employees,view')->group(function () {
        Route::get('/recruitment/requisitions', ListRequisitionsAction::class)->name('v2.talent.requisitions.index');
        Route::get('/recruitment/requisitions/{id}', function ($id) {
            return app()->make(ShowRequisitionAction::class, ['id' => (int) $id])();
        })->name('v2.talent.requisitions.show');
        Route::get('/recruitment/applicants', ListApplicantsAction::class)->name('v2.talent.applicants.index');
    });
    Route::middleware(['can:employees,create', 'throttle:api-write'])->group(function () {
        Route::post('/recruitment/requisitions', CreateRequisitionAction::class)->name('v2.talent.requisitions.store');
        Route::post('/recruitment/applicants', CreateApplicantAction::class)->name('v2.talent.applicants.store');
        Route::post('/recruitment/interviews', CreateInterviewAction::class)->name('v2.talent.interviews.store');
    });
    Route::middleware(['can:employees,edit', 'throttle:api-write'])->group(function () {
        Route::put('/recruitment/requisitions/{id}', function (Request $request, $id) {
            return app()->make(UpdateRequisitionAction::class, ['request' => $request, 'id' => (int) $id])();
        })->name('v2.talent.requisitions.update');
        Route::put('/recruitment/applicants/{id}/status', function (Request $request, $id) {
            return app()->make(UpdateApplicantStatusAction::class, ['request' => $request, 'id' => (int) $id])();
        })->name('v2.talent.applicants.status');
        Route::put('/recruitment/interviews/{id}', function (Request $request, $id) {
            return app()->make(UpdateInterviewAction::class, ['request' => $request, 'id' => (int) $id])();
        })->name('v2.talent.interviews.update');
    });

    // ── Onboarding / Offboarding
    Route::middleware('can:employees,view')->group(function () {
        Route::get('/onboarding', ListOnboardingWorkflowsAction::class)->name('v2.talent.onboarding.index');
        Route::get('/onboarding/{id}', function ($id) {
            return app()->make(ShowOnboardingWorkflowAction::class, ['id' => (int) $id])();
        })->name('v2.talent.onboarding.show');
    });
    Route::middleware(['can:employees,create', 'throttle:api-write'])->group(function () {
        Route::post('/onboarding', CreateOnboardingWorkflowAction::class)->name('v2.talent.onboarding.store');
        Route::post('/onboarding/{workflowId}/documents', function (Request $request, $workflowId) {
            return app()->make(CreateOnboardingDocumentAction::class, ['request' => $request, 'workflowId' => (int) $workflowId])();
        })->name('v2.talent.onboarding.documents.store');
    });
    Route::middleware(['can:employees,edit', 'throttle:api-write'])->group(function () {
        Route::put('/onboarding/{workflowId}/tasks/{taskId}', function (Request $request, $workflowId, $taskId) {
            return app()->make(UpdateOnboardingTaskAction::class, ['request' => $request, 'workflowId' => (int) $workflowId, 'taskId' => (int) $taskId])();
        })->name('v2.talent.onboarding.tasks.update');
    });
});


/*
|--------------------------------------------------------------------------
| Domain Routes: 06-HumanCapital (Payroll)
|--------------------------------------------------------------------------
*/

Route::group(['prefix' => 'v2', 'middleware' => ['api.auth', 'throttle:api']], function () {
    // ── Payroll Self Service
    Route::get('/my-payslips', ListMyPayslipsAction::class)->name('v2.payroll.my_payslips');

    // ── Payroll Management
    Route::middleware('can:payroll,view')->group(function () {
        Route::get('/payroll/cycles', ListPayrollCyclesAction::class)->name('v2.payroll.cycles.index');
        Route::get('/payroll/cycles/{id}/items', function ($id) {
            return app()->make(GetPayrollCycleItemsAction::class, ['cycleId' => (int) $id])();
        })->name('v2.payroll.cycles.items');
        
        Route::get('/payroll/items/{id}/transactions', function ($id) {
            return app()->make(GetPayrollItemTransactionsAction::class, ['itemId' => (int) $id])();
        })->name('v2.payroll.items.transactions');
    });

    Route::middleware(['can:payroll,create', 'throttle:api-write'])->group(function () {
        Route::post('/payroll/generate', GeneratePayrollCycleAction::class)->name('v2.payroll.generate');
        Route::post('/payroll/cycles/{id}/approve', function ($id) {
            return app()->make(ApprovePayrollCycleAction::class, ['id' => (int) $id])();
        })->name('v2.payroll.cycles.approve');
        
        Route::post('/payroll/cycles/{id}/pay', function (Request $request, $id) {
            return app()->make(ProcessPayrollPaymentAction::class, ['request' => $request, 'id' => (int) $id])();
        })->name('v2.payroll.cycles.pay');
        
        Route::post('/payroll/items/{id}/pay', function (Request $request, $id) {
            return app()->make(PayIndividualPayrollItemAction::class, ['request' => $request, 'itemId' => (int) $id])();
        })->name('v2.payroll.items.pay');
    });

    Route::middleware(['can:payroll,edit', 'throttle:api-write'])->group(function () {
        Route::post('/payroll/items/{id}/toggle-status', function ($id) {
            return app()->make(TogglePayrollItemStatusAction::class, ['itemId' => (int) $id])();
        })->name('v2.payroll.items.toggle_status');
        
        Route::put('/payroll/items/{id}', function (Request $request, $id) {
            return app()->make(UpdatePayrollItemAction::class, ['request' => $request, 'itemId' => (int) $id])();
        })->name('v2.payroll.items.update');
    });

    // ── EOSB Calculator
    Route::middleware(['can:payroll,view', 'throttle:api-sensitive'])->group(function () {
        Route::post('/eosb/preview', PreviewEOSBAction::class)->name('v2.payroll.eosb.preview');
        Route::post('/eosb/{employeeId}/calculate', function (Request $request, $employeeId) {
            return app()->make(CalculateEOSBAction::class, ['request' => $request, 'eosbCalculator' => app(\App\Domains\HumanCapital\Payroll\Services\EOSBCalculatorService::class), 'employeeId' => (int) $employeeId])();
        })->name('v2.payroll.eosb.calculate');
    });

    // ── Payroll Components
    Route::middleware('can:payroll,view')->group(function () {
        Route::get('/payroll-components', ListPayrollComponentsAction::class)->name('v2.payroll.components.index');
        Route::get('/payroll-components/{id}', function ($id) {
            return app()->make(ShowPayrollComponentAction::class, ['id' => (int) $id])();
        })->name('v2.payroll.components.show');
    });
    Route::middleware(['can:payroll,create', 'throttle:api-write'])->group(function () {
        Route::post('/payroll-components', CreatePayrollComponentAction::class)->name('v2.payroll.components.store');
    });
    Route::middleware(['can:payroll,edit', 'throttle:api-write'])->group(function () {
        Route::put('/payroll-components/{id}', function (Request $request, $id) {
            return app()->make(UpdatePayrollComponentAction::class, ['request' => $request, 'id' => (int) $id])();
        })->name('v2.payroll.components.update');
        Route::delete('/payroll-components/{id}', function ($id) {
            return app()->make(DeletePayrollComponentAction::class, ['id' => (int) $id])();
        })->name('v2.payroll.components.destroy');
    });

    // ── Post-Payroll Integrations
    Route::middleware('can:payroll,view')->get('/post-payroll', ListPostPayrollIntegrationsAction::class)->name('v2.payroll.post.index');
    Route::middleware(['can:payroll,create', 'throttle:api-sensitive'])->post('/post-payroll', CreatePostPayrollIntegrationAction::class)->name('v2.payroll.post.store');
    Route::middleware(['can:payroll,edit', 'throttle:api-critical'])->group(function () {
        Route::post('/post-payroll/{id}/process', function ($id) {
            return app()->make(ProcessPostPayrollIntegrationAction::class, ['id' => (int) $id])();
        })->name('v2.payroll.post.process');
        Route::post('/post-payroll/{id}/reconcile', function (Request $request, $id) {
            return app()->make(ReconcilePostPayrollIntegrationAction::class, ['request' => $request, 'id' => (int) $id])();
        })->name('v2.payroll.post.reconcile');
    });

    // ── Employee Loans
    Route::middleware('can:employees,view')->get('/employee-loans', ListEmployeeLoansAction::class)->name('v2.payroll.loans.index');
    Route::middleware(['can:employees,create', 'throttle:api-sensitive'])->post('/employee-loans', CreateEmployeeLoanAction::class)->name('v2.payroll.loans.store');
    Route::middleware('can:employees,view')->get('/employee-loans/{id}', function ($id) {
        return app()->make(ShowEmployeeLoanAction::class, ['id' => (int) $id])();
    })->name('v2.payroll.loans.show');
    Route::middleware(['can:employees,edit', 'throttle:api-sensitive'])->group(function () {
        Route::put('/employee-loans/{id}/status', function (Request $request, $id) {
            return app()->make(UpdateEmployeeLoanStatusAction::class, ['request' => $request, 'id' => (int) $id])();
        })->name('v2.payroll.loans.status');
        Route::put('/employee-loans/{id}/repayments/{repaymentId}', function (Request $request, $id, $repaymentId) {
            return app()->make(RecordLoanRepaymentAction::class, ['request' => $request, 'id' => (int) $id, 'repaymentId' => (int) $repaymentId])();
        })->name('v2.payroll.loans.repayment');
    });

    // ── Compensation Management
    Route::middleware('can:employees,view')->group(function () {
        Route::get('/compensation/plans', ListCompensationPlansAction::class)->name('v2.payroll.compensation.plans.index');
        Route::get('/compensation/plans/{id}', function ($id) {
            return app()->make(ShowCompensationPlanAction::class, ['id' => (int) $id])();
        })->name('v2.payroll.compensation.plans.show');
        Route::get('/compensation/entries', ListCompensationEntriesAction::class)->name('v2.payroll.compensation.entries.index');
    });
    Route::middleware(['can:employees,create', 'throttle:api-write'])->group(function () {
        Route::post('/compensation/plans', CreateCompensationPlanAction::class)->name('v2.payroll.compensation.plans.store');
        Route::post('/compensation/entries', CreateCompensationEntryAction::class)->name('v2.payroll.compensation.entries.store');
    });
    Route::middleware(['can:employees,edit', 'throttle:api-write'])->group(function () {
        Route::put('/compensation/plans/{id}', function (Request $request, $id) {
            return app()->make(UpdateCompensationPlanAction::class, ['request' => $request, 'id' => (int) $id])();
        })->name('v2.payroll.compensation.plans.update');
        Route::put('/compensation/entries/{id}/status', function (Request $request, $id) {
            return app()->make(UpdateCompensationEntryStatusAction::class, ['request' => $request, 'id' => (int) $id])();
        })->name('v2.payroll.compensation.entries.status');
    });

    // ── Benefits Administration
    Route::middleware('can:employees,view')->group(function () {
        Route::get('/benefits/plans', ListBenefitsPlansAction::class)->name('v2.payroll.benefits.plans.index');
        Route::get('/benefits/plans/{id}', function ($id) {
            return app()->make(ShowBenefitsPlanAction::class, ['id' => (int) $id])();
        })->name('v2.payroll.benefits.plans.show');
        Route::get('/benefits/enrollments', ListBenefitsEnrollmentsAction::class)->name('v2.payroll.benefits.enrollments.index');
    });
    Route::middleware(['can:employees,create', 'throttle:api-write'])->group(function () {
        Route::post('/benefits/plans', CreateBenefitsPlanAction::class)->name('v2.payroll.benefits.plans.store');
        Route::post('/benefits/enrollments', CreateBenefitsEnrollmentAction::class)->name('v2.payroll.benefits.enrollments.store');
    });
    Route::middleware(['can:employees,edit', 'throttle:api-write'])->group(function () {
        Route::put('/benefits/plans/{id}', function (Request $request, $id) {
            return app()->make(UpdateBenefitsPlanAction::class, ['request' => $request, 'id' => (int) $id])();
        })->name('v2.payroll.benefits.plans.update');
        Route::put('/benefits/enrollments/{id}', function (Request $request, $id) {
            return app()->make(UpdateBenefitsEnrollmentAction::class, ['request' => $request, 'id' => (int) $id])();
        })->name('v2.payroll.benefits.enrollments.update');
    });
});

/*
|--------------------------------------------------------------------------
| Domain Routes: 06-HumanCapital (Employee Services)
|--------------------------------------------------------------------------
| ER, Travel, Scheduling, QA/Compliance, EHS, Wellness, Communications
*/

Route::group(['prefix' => 'v2', 'middleware' => ['api.auth', 'throttle:api']], function () {

    // ── Employee Relations
    Route::middleware('can:employees,view')->group(function () {
        Route::get('/relations/cases', ListRelationsCasesAction::class)->name('v2.relations.cases.index');
        Route::get('/relations/cases/{id}', function ($id) {
            return app()->make(ShowRelationsCaseAction::class, ['id' => (int) $id])();
        })->name('v2.relations.cases.show');
    });
    Route::middleware(['can:employees,create', 'throttle:api-write'])->group(function () {
        Route::post('/relations/cases', CreateRelationsCaseAction::class)->name('v2.relations.cases.store');
        Route::post('/relations/cases/{caseId}/disciplinary', function (Request $request, $caseId) {
            return app()->make(CreateDisciplinaryActionAction::class, ['request' => $request, 'caseId' => (int) $caseId])();
        })->name('v2.relations.disciplinary.store');
    });
    Route::middleware(['can:employees,edit', 'throttle:api-write'])->put('/relations/cases/{id}', function (Request $request, $id) {
        return app()->make(UpdateRelationsCaseAction::class, ['request' => $request, 'id' => (int) $id])();
    })->name('v2.relations.cases.update');

    // ── Travel & Expense
    Route::middleware('can:employees,view')->group(function () {
        Route::get('/travel/requests', ListTravelRequestsAction::class)->name('v2.travel.requests.index');
        Route::get('/travel/expenses', ListTravelExpensesAction::class)->name('v2.travel.expenses.index');
    });
    Route::middleware(['can:employees,create', 'throttle:api-write'])->group(function () {
        Route::post('/travel/requests', CreateTravelRequestAction::class)->name('v2.travel.requests.store');
        Route::post('/travel/expenses', CreateTravelExpenseAction::class)->name('v2.travel.expenses.store');
    });
    Route::middleware(['can:employees,edit', 'throttle:api-write'])->group(function () {
        Route::put('/travel/requests/{id}/status', function (Request $request, $id) {
            return app()->make(UpdateTravelRequestStatusAction::class, ['request' => $request, 'id' => (int) $id])();
        })->name('v2.travel.requests.status');
        Route::put('/travel/expenses/{id}/status', function (Request $request, $id) {
            return app()->make(UpdateTravelExpenseStatusAction::class, ['request' => $request, 'id' => (int) $id])();
        })->name('v2.travel.expenses.status');
    });

    // ── Workforce Scheduling
    Route::middleware('can:employees,view')->group(function () {
        Route::get('/schedules', ListSchedulesAction::class)->name('v2.schedules.index');
        Route::get('/schedules/{id}', function ($id) {
            return app()->make(ShowScheduleAction::class, ['id' => (int) $id])();
        })->name('v2.schedules.show');
    });
    Route::middleware(['can:employees,create', 'throttle:api-write'])->group(function () {
        Route::post('/schedules', CreateScheduleAction::class)->name('v2.schedules.store');
        Route::post('/schedules/{scheduleId}/shifts', function (Request $request, $scheduleId) {
            return app()->make(CreateShiftAction::class, ['request' => $request, 'scheduleId' => (int) $scheduleId])();
        })->name('v2.schedules.shifts.store');
    });
    Route::middleware(['can:employees,edit', 'throttle:api-write'])->group(function () {
        Route::put('/schedules/{id}', function (Request $request, $id) {
            return app()->make(UpdateScheduleAction::class, ['request' => $request, 'id' => (int) $id])();
        })->name('v2.schedules.update');
        Route::put('/schedules/{scheduleId}/shifts/{shiftId}', function (Request $request, $scheduleId, $shiftId) {
            return app()->make(UpdateShiftAction::class, ['request' => $request, 'scheduleId' => (int) $scheduleId, 'shiftId' => (int) $shiftId])();
        })->name('v2.schedules.shifts.update');
    });

    // ── QA & Compliance
    Route::middleware('can:employees,view')->group(function () {
        Route::get('/compliance', ListComplianceAction::class)->name('v2.compliance.index');
        Route::get('/compliance/{id}', function ($id) {
            return app()->make(ShowComplianceAction::class, ['id' => (int) $id])();
        })->name('v2.compliance.show');
    });
    Route::middleware(['can:employees,create', 'throttle:api-write'])->group(function () {
        Route::post('/compliance', CreateComplianceAction::class)->name('v2.compliance.store');
        Route::post('/compliance/{complianceId}/capa', function (Request $request, $complianceId) {
            return app()->make(CreateCapaAction::class, ['request' => $request, 'complianceId' => (int) $complianceId])();
        })->name('v2.compliance.capa.store');
    });
    Route::middleware(['can:employees,edit', 'throttle:api-write'])->put('/compliance/{id}', function (Request $request, $id) {
        return app()->make(UpdateComplianceAction::class, ['request' => $request, 'id' => (int) $id])();
    })->name('v2.compliance.update');

    // ── EHS (Environment, Health & Safety)
    Route::middleware('can:employees,view')->group(function () {
        Route::get('/ehs/incidents', ListEhsIncidentsAction::class)->name('v2.ehs.incidents.index');
        Route::get('/ehs/health-records', ListHealthRecordsAction::class)->name('v2.ehs.health_records.index');
        Route::get('/ehs/ppe', ListPpeAction::class)->name('v2.ehs.ppe.index');
    });
    Route::middleware(['can:employees,create', 'throttle:api-write'])->group(function () {
        Route::post('/ehs/incidents', CreateEhsIncidentAction::class)->name('v2.ehs.incidents.store');
        Route::post('/ehs/health-records', CreateHealthRecordAction::class)->name('v2.ehs.health_records.store');
        Route::post('/ehs/ppe', CreatePpeAction::class)->name('v2.ehs.ppe.store');
    });
    Route::middleware(['can:employees,edit', 'throttle:api-write'])->put('/ehs/incidents/{id}', function (Request $request, $id) {
        return app()->make(UpdateEhsIncidentAction::class, ['request' => $request, 'id' => (int) $id])();
    })->name('v2.ehs.incidents.update');

    // ── Wellness Programs
    Route::middleware('can:employees,view')->group(function () {
        Route::get('/wellness/programs', ListWellnessProgramsAction::class)->name('v2.wellness.programs.index');
        Route::get('/wellness/participations', ListWellnessParticipationsAction::class)->name('v2.wellness.participations.index');
    });
    Route::middleware(['can:employees,create', 'throttle:api-write'])->group(function () {
        Route::post('/wellness/programs', CreateWellnessProgramAction::class)->name('v2.wellness.programs.store');
        Route::post('/wellness/participations', CreateWellnessParticipationAction::class)->name('v2.wellness.participations.store');
    });
    Route::middleware(['can:employees,edit', 'throttle:api-write'])->put('/wellness/participations/{id}', function (Request $request, $id) {
        return app()->make(UpdateWellnessParticipationAction::class, ['request' => $request, 'id' => (int) $id])();
    })->name('v2.wellness.participations.update');

    // ── Corporate Communications
    Route::middleware('can:employees,view')->group(function () {
        Route::get('/communications/announcements', ListAnnouncementsAction::class)->name('v2.comms.announcements.index');
        Route::get('/communications/surveys', ListSurveysAction::class)->name('v2.comms.surveys.index');
    });
    Route::middleware(['can:employees,create', 'throttle:api-write'])->group(function () {
        Route::post('/communications/announcements', CreateAnnouncementAction::class)->name('v2.comms.announcements.store');
        Route::post('/communications/surveys', CreateSurveyAction::class)->name('v2.comms.surveys.store');
        Route::post('/communications/surveys/{surveyId}/responses', function (Request $request, $surveyId) {
            return app()->make(CreateSurveyResponseAction::class, ['request' => $request, 'surveyId' => (int) $surveyId])();
        })->name('v2.comms.surveys.responses.store');
    });
    Route::middleware(['can:employees,edit', 'throttle:api-write'])->put('/communications/announcements/{id}', function (Request $request, $id) {
        return app()->make(UpdateAnnouncementAction::class, ['request' => $request, 'id' => (int) $id])();
    })->name('v2.comms.announcements.update');
});

/*
|--------------------------------------------------------------------------
| Domain Routes: 06-HumanCapital (WorkforceAdmin)
|--------------------------------------------------------------------------
*/

Route::group(['prefix' => 'v2', 'middleware' => ['api.auth', 'throttle:api']], function () {

    // ── Departments
    Route::middleware('can:employees,view')
        ->get('/departments', ListDepartmentsAction::class)
        ->name('v2.departments.index');

    Route::middleware('can:employees,view')
        ->get('/departments/{id}', function ($id) {
            return app()->make(ShowDepartmentAction::class, ['id' => (int) $id])();
        })->name('v2.departments.show');

    Route::middleware(['can:employees,create', 'throttle:api-write'])
        ->post('/departments', CreateDepartmentAction::class)
        ->name('v2.departments.store');

    Route::middleware(['can:employees,edit', 'throttle:api-write'])
        ->put('/departments/{id}', function (Illuminate\Http\Request $request, $id) {
            return app()->make(UpdateDepartmentAction::class, ['request' => $request, 'id' => (int) $id])();
        })->name('v2.departments.update');

    Route::middleware(['can:employees,delete', 'throttle:api-delete'])
        ->delete('/departments/{id}', function ($id) {
            return app()->make(DeleteDepartmentAction::class, ['id' => (int) $id])();
        })->name('v2.departments.destroy');
        
    // ── Employees
    Route::middleware('can:employees,view')
        ->get('/employees', ListEmployeesAction::class)
        ->name('v2.employees.index');
    
    Route::middleware(['can:employees,create', 'throttle:api-write'])
        ->post('/employees', CreateEmployeeAction::class)
        ->name('v2.employees.store');
        
    Route::middleware('can:employees,view')
        ->get('/employees/{id}', function ($id) {
            return app()->make(ShowEmployeeAction::class, ['id' => (int) $id])();
        })->name('v2.employees.show');
    
    Route::middleware(['can:employees,edit', 'throttle:api-write'])
        ->put('/employees/{id}', function (Illuminate\Http\Request $request, $id) {
            return app()->make(UpdateEmployeeAction::class, ['request' => $request, 'id' => (int) $id])();
        })->name('v2.employees.update');
    
    Route::middleware(['can:employees,delete', 'throttle:api-delete'])
        ->delete('/employees/{id}', function ($id) {
            return app()->make(DeleteEmployeeAction::class, ['id' => (int) $id])();
        })->name('v2.employees.destroy');
    
    Route::middleware(['can:employees,edit', 'throttle:api-sensitive'])
        ->post('/employees/{id}/suspend', function ($id) {
            return app()->make(SuspendEmployeeAction::class, ['id' => (int) $id])();
        })->name('v2.employees.suspend');
    
    Route::middleware(['can:employees,edit', 'throttle:api-sensitive'])
        ->post('/employees/{id}/activate', function ($id) {
            return app()->make(ActivateEmployeeAction::class, ['id' => (int) $id])();
        })->name('v2.employees.activate');

    // ── Employee Documents (File Management)
    Route::middleware(['can:employees,edit', 'throttle:api-write'])
        ->post('/employees/{id}/documents', function (Illuminate\Http\Request $request, $id) {
            return app()->make(UploadEmployeeDocumentAction::class, ['request' => $request, 'id' => (int) $id])();
        })->name('v2.employees.documents.store');
    
    Route::middleware('can:employees,view')
        ->get('/employees/{id}/documents', function ($id) {
            return app()->make(ListEmployeeDocumentsAction::class, ['id' => (int) $id])();
        })->name('v2.employees.documents.index');
    
    // Using employee-files prefix for extended management mimicking legacy routes
    Route::middleware('can:employees,view')
        ->get('/employee-files/{employeeId}', function ($employeeId) {
            return app()->make(ListEmployeeDocumentsAction::class, ['id' => (int) $employeeId])();
        });
    
    Route::middleware(['can:employees,create', 'throttle:api-write'])
        ->post('/employee-files/{employeeId}', function (Illuminate\Http\Request $request, $employeeId) {
            return app()->make(UploadEmployeeDocumentAction::class, ['request' => $request, 'id' => (int) $employeeId])();
        });
    
    Route::middleware('can:employees,view')
        ->get('/employee-files/{employeeId}/download/{documentId}', function ($employeeId, $documentId) {
            return app()->make(DownloadEmployeeDocumentAction::class, ['employeeId' => (int) $employeeId, 'documentId' => (int) $documentId])();
        });
    
    Route::middleware(['can:employees,edit', 'throttle:api-write'])
        ->put('/employee-files/{employeeId}/{documentId}', function (Illuminate\Http\Request $request, $employeeId, $documentId) {
            return app()->make(UpdateEmployeeDocumentAction::class, ['request' => $request, 'employeeId' => (int) $employeeId, 'documentId' => (int) $documentId])();
        });
    
    Route::middleware(['can:employees,delete', 'throttle:api-delete'])
        ->delete('/employee-files/{employeeId}/{documentId}', function ($employeeId, $documentId) {
            return app()->make(DeleteEmployeeDocumentAction::class, ['employeeId' => (int) $employeeId, 'documentId' => (int) $documentId])();
        });

    // ── Job Titles
    Route::middleware('can:employees,view')
        ->get('/job-titles', ListJobTitlesAction::class)
        ->name('v2.job_titles.index');
    
    Route::middleware(['can:employees,create', 'throttle:api-write'])
        ->post('/job-titles', CreateJobTitleAction::class)
        ->name('v2.job_titles.store');
    
    Route::middleware(['can:employees,edit', 'throttle:api-write'])
        ->put('/job-titles/{id}', function (Illuminate\Http\Request $request, $id) {
            return app()->make(UpdateJobTitleAction::class, ['request' => $request, 'id' => (int) $id])();
        })->name('v2.job_titles.update');
    
    Route::middleware(['can:employees,delete', 'throttle:api-delete'])
        ->delete('/job-titles/{id}', function ($id) {
            return app()->make(DeleteJobTitleAction::class, ['id' => (int) $id])();
        })->name('v2.job_titles.destroy');

    // ── Positions & Hierarchy
    Route::middleware('can:employees,view')
        ->get('/positions', ListPositionsAction::class)
        ->name('v2.positions.index');
    
    Route::middleware('can:employees,view')
        ->get('/positions/{id}', function ($id) {
            return app()->make(ShowPositionAction::class, ['id' => (int) $id])();
        })->name('v2.positions.show');
    
    Route::middleware(['can:employees,create', 'throttle:api-write'])
        ->post('/positions', CreatePositionAction::class)
        ->name('v2.positions.store');
    
    Route::middleware(['can:employees,edit', 'throttle:api-write'])
        ->put('/positions/{id}', function (Illuminate\Http\Request $request, $id) {
            return app()->make(UpdatePositionAction::class, ['request' => $request, 'id' => (int) $id])();
        })->name('v2.positions.update');
    
    Route::middleware(['can:employees,delete', 'throttle:api-delete'])
        ->delete('/positions/{id}', function ($id) {
            return app()->make(DeletePositionAction::class, ['id' => (int) $id])();
        })->name('v2.positions.destroy');
    
    Route::middleware(['can:employees,edit', 'throttle:api-sensitive'])
        ->post('/positions/assign-employee', AssignEmployeePositionAction::class)
        ->name('v2.positions.assign_employee');
    
    Route::middleware(['can:employees,edit', 'throttle:api-delete'])
        ->delete('/positions/unassign-employee/{employeeId}', function ($employeeId) {
            return app()->make(UnassignEmployeePositionAction::class, ['employeeId' => (int) $employeeId])();
        })->name('v2.positions.unassign_employee');

    // ── Contracts & Agreements
    Route::middleware('can:employees,view')->group(function () {
        Route::get('/contracts', ListContractsAction::class)->name('v2.contracts.index');
        Route::get('/contracts/{id}', function ($id) {
            return app()->make(ShowContractAction::class, ['id' => (int) $id])();
        })->name('v2.contracts.show');
    });
    Route::middleware(['can:employees,create', 'throttle:api-write'])->post('/contracts', CreateContractAction::class)->name('v2.contracts.store');
    Route::middleware(['can:employees,edit', 'throttle:api-write'])->put('/contracts/{id}', function (Request $request, $id) {
        return app()->make(UpdateContractAction::class, ['request' => $request, 'id' => (int) $id])();
    })->name('v2.contracts.update');
    Route::middleware(['can:employees,delete', 'throttle:api-delete'])->delete('/contracts/{id}', function ($id) {
        return app()->make(DeleteContractAction::class, ['id' => (int) $id])();
    })->name('v2.contracts.destroy');

    // ── Employee Assets & Equipment
    Route::middleware('can:employees,view')->group(function () {
        Route::get('/employee-assets', ListEmployeeAssetsAction::class)->name('v2.employee_assets.index');
        Route::get('/employee-assets/{id}', function ($id) {
            return app()->make(ShowEmployeeAssetAction::class, ['id' => (int) $id])();
        })->name('v2.employee_assets.show');
    });
    Route::middleware(['can:employees,create', 'throttle:api-write'])->post('/employee-assets', CreateEmployeeAssetAction::class)->name('v2.employee_assets.store');
    Route::middleware(['can:employees,edit', 'throttle:api-write'])->put('/employee-assets/{id}', function (Request $request, $id) {
        return app()->make(UpdateEmployeeAssetAction::class, ['request' => $request, 'id' => (int) $id])();
    })->name('v2.employee_assets.update');
    Route::middleware(['can:employees,delete', 'throttle:api-delete'])->delete('/employee-assets/{id}', function ($id) {
        return app()->make(DeleteEmployeeAssetAction::class, ['id' => (int) $id])();
    })->name('v2.employee_assets.destroy');

    // ── Global Mobility & Expat Management
    Route::middleware('can:employees,view')->group(function () {
        Route::get('/expat-management', ListExpatRecordsAction::class)->name('v2.expat.index');
        Route::get('/expat-management/{id}', function ($id) {
            return app()->make(ShowExpatRecordAction::class, ['id' => (int) $id])();
        })->name('v2.expat.show');
    });
    Route::middleware(['can:employees,create', 'throttle:api-write'])->post('/expat-management', CreateExpatRecordAction::class)->name('v2.expat.store');
    Route::middleware(['can:employees,edit', 'throttle:api-write'])->put('/expat-management/{id}', function (Request $request, $id) {
        return app()->make(UpdateExpatRecordAction::class, ['request' => $request, 'id' => (int) $id])();
    })->name('v2.expat.update');
    Route::middleware(['can:employees,delete', 'throttle:api-delete'])->delete('/expat-management/{id}', function ($id) {
        return app()->make(DeleteExpatRecordAction::class, ['id' => (int) $id])();
    })->name('v2.expat.destroy');

    // ── Contingent Workers
    Route::middleware('can:employees,view')->group(function () {
        Route::get('/contingent-workers', ListContingentWorkersAction::class)->name('v2.contingent.index');
        Route::get('/contingent-workers/{id}', function ($id) {
            return app()->make(ShowContingentWorkerAction::class, ['id' => (int) $id])();
        })->name('v2.contingent.show');
    });
    Route::middleware(['can:employees,create', 'throttle:api-write'])->group(function () {
        Route::post('/contingent-workers', CreateContingentWorkerAction::class)->name('v2.contingent.store');
        Route::post('/contingent-workers/{workerId}/contracts', function (Request $request, $workerId) {
            return app()->make(CreateContingentContractAction::class, ['request' => $request, 'workerId' => (int) $workerId])();
        })->name('v2.contingent.contracts.store');
    });
    Route::middleware(['can:employees,edit', 'throttle:api-write'])->put('/contingent-workers/{id}', function (Request $request, $id) {
        return app()->make(UpdateContingentWorkerAction::class, ['request' => $request, 'id' => (int) $id])();
    })->name('v2.contingent.update');
});


/*
|--------------------------------------------------------------------------
| Domain Routes: 06-HumanCapital (Knowledge Base & Expertise Directory)
|--------------------------------------------------------------------------
*/

Route::group(['prefix' => 'v2', 'middleware' => ['api.auth', 'throttle:api']], function () {

    // ── Knowledge Base
    Route::middleware('can:employees,view')->group(function () {
        Route::get('/knowledge-base', ListKnowledgeBaseEntriesAction::class)->name('v2.kb.index');
        Route::get('/knowledge-base/{id}', function ($id) {
            return app()->make(ShowKnowledgeBaseEntryAction::class, ['id' => (int) $id])();
        })->name('v2.kb.show');
    });
    Route::middleware(['can:employees,create', 'throttle:api-write'])->group(function () {
        Route::post('/knowledge-base', CreateKnowledgeBaseEntryAction::class)->name('v2.kb.store');
    });
    Route::middleware(['can:employees,edit', 'throttle:api-write'])->group(function () {
        Route::put('/knowledge-base/{id}', function (Request $request, $id) {
            return app()->make(UpdateKnowledgeBaseEntryAction::class, ['request' => $request, 'id' => (int) $id])();
        })->name('v2.kb.update');
        Route::post('/knowledge-base/{id}/helpful', function ($id) {
            return app()->make(MarkKnowledgeBaseHelpfulAction::class, ['id' => (int) $id])();
        })->name('v2.kb.helpful');
    });

    // ── Expertise Directory
    Route::middleware('can:employees,view')->group(function () {
        Route::get('/expertise', ListExpertiseEntriesAction::class)->name('v2.expertise.index');
    });
    Route::middleware(['can:employees,create', 'throttle:api-write'])->group(function () {
        Route::post('/expertise', CreateExpertiseEntryAction::class)->name('v2.expertise.store');
    });
    Route::middleware(['can:employees,edit', 'throttle:api-write'])->group(function () {
        Route::put('/expertise/{id}', function (Request $request, $id) {
            return app()->make(UpdateExpertiseEntryAction::class, ['request' => $request, 'id' => (int) $id])();
        })->name('v2.expertise.update');
    });
});


/*
|--------------------------------------------------------------------------
| Domain Routes: 06-HumanCapital (HR Document Templates)
|--------------------------------------------------------------------------
*/

Route::group(['prefix' => 'v2', 'middleware' => ['api.auth', 'throttle:api']], function () {

    Route::group(['prefix' => 'hr-templates', 'middleware' => 'can:employees,view'], function () {
        Route::get('/', ListHrDocumentTemplatesAction::class)->name('v2.hr_templates.index');
        Route::get('/approved-keys', GetHrDocumentTemplateApprovedKeysAction::class)->name('v2.hr_templates.approved_keys');
        Route::get('/{id}', function ($id) {
            return app()->make(ShowHrDocumentTemplateAction::class, ['id' => (int) $id])();
        })->name('v2.hr_templates.show');

        Route::middleware(['can:employees,create', 'throttle:api-write'])->post('/', CreateHrDocumentTemplateAction::class)->name('v2.hr_templates.store');
        Route::middleware(['can:employees,edit', 'throttle:api-write'])->put('/{id}', function (Illuminate\Http\Request $request, $id) {
            return app()->make(UpdateHrDocumentTemplateAction::class, ['request' => $request, 'id' => (int) $id])();
        })->name('v2.hr_templates.update');
        Route::middleware(['can:employees,delete', 'throttle:api-delete'])->delete('/{id}', function ($id) {
            return app()->make(DeleteHrDocumentTemplateAction::class, ['id' => (int) $id])();
        })->name('v2.hr_templates.destroy');
        Route::middleware(['can:employees,edit', 'throttle:api-write'])->post('/{id}/render', function (Illuminate\Http\Request $request, $id) {
            return app()->make(RenderHrDocumentTemplateAction::class, ['request' => $request, 'id' => (int) $id])();
        })->name('v2.hr_templates.render');
    });
});


/*
|--------------------------------------------------------------------------
| Domain Routes: 06-HumanCapital (Biometric Devices)
|--------------------------------------------------------------------------
*/

Route::group(['prefix' => 'v2', 'middleware' => ['api.auth', 'throttle:api']], function () {

    Route::group(['prefix' => 'biometric', 'middleware' => 'can:attendance,view'], function () {
        Route::get('/devices', function (Request $request) {
            return response()->json(['success' => true, 'data' => (new ListBiometricDevicesAction())->execute($request)]);
        })->name('v2.biometric.devices.index');

        Route::get('/sync-logs', function (Request $request) {
            return response()->json(['success' => true, 'data' => (new GetBiometricSyncLogsAction())->execute($request)]);
        })->name('v2.biometric.sync_logs');

        Route::middleware(['can:attendance,create', 'throttle:api-write'])->post('/devices', function (Request $request) {
            $validated = $request->validate([
                'device_name' => 'required|string|max:255',
                'ip_address' => 'nullable|string|max:45',
                'port' => 'nullable|integer',
                'location' => 'nullable|string|max:255',
                'model_type' => 'nullable|string|max:100',
            ]);
            return response()->json(['success' => true, 'data' => (new CreateBiometricDeviceAction())->execute($validated)], 201);
        })->name('v2.biometric.devices.store');

        Route::middleware(['can:attendance,edit', 'throttle:api-write'])->put('/devices/{id}', function (Request $request, $id) {
            $validated = $request->validate([
                'device_name' => 'string|max:255',
                'ip_address' => 'nullable|string|max:45',
                'port' => 'nullable|integer',
                'location' => 'nullable|string|max:255',
                'model_type' => 'nullable|string|max:100',
                'status' => 'nullable|string|in:online,offline,error',
            ]);
            return response()->json(['success' => true, 'data' => (new UpdateBiometricDeviceAction())->execute((int) $id, $validated)]);
        })->name('v2.biometric.devices.update');

        Route::middleware(['can:attendance,delete', 'throttle:api-delete'])->delete('/devices/{id}', function ($id) {
            (new DeleteBiometricDeviceAction())->execute((int) $id);
            return response()->json(['success' => true, 'message' => 'Device deleted']);
        })->name('v2.biometric.devices.destroy');

        Route::middleware(['can:attendance,edit', 'throttle:api-critical'])->post('/devices/{id}/sync', function (Request $request, $id) {
            $validated = $request->validate(['records' => 'required|array']);
            $result = (new SyncBiometricDeviceAction())->execute((int) $id, $validated['records']);
            return response()->json(['success' => true, 'data' => $result]);
        })->name('v2.biometric.devices.sync');

        Route::middleware(['can:attendance,create', 'throttle:api-critical'])->post('/devices/{id}/import', function (Request $request, $id) {
            $request->validate(['file' => 'required|file|mimes:csv,txt']);
            $result = (new ImportBiometricAttendanceAction())->execute((int) $id, $request->file('file'));
            return response()->json(['success' => true, 'data' => $result]);
        })->name('v2.biometric.devices.import');
    });
});
