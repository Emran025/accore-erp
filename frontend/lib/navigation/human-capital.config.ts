import { catalogMessage } from "@/lib/i18n";
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Domain 6: Human Capital Management (رأس المال البشري)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Vision: Complete workforce lifecycle — from recruitment through payroll,
 * performance management, and end-of-service.
 * 
 * Cross-Domain Integration:
 *  - Finance: Payroll journal entries, EOSB provisions
 *  - Core: User/Role management linkage
 *  - Projects: Resource allocation and timesheets
 */

import { Domain } from "../../types/navigation";

export const HumanCapitalDomain: Domain = {
    id: "human-capital",
    order: 6,
    title: catalogMessage("navigation.humanCapitalConfig.humanCapital"),
    icon: "users",
    description: catalogMessage("navigation.humanCapitalConfig.manageEmployeesRecruitmentAttendancePayrollPerformanceDevelopment"),
    capabilities: [
        // ─────────────────────────────────────────────────────────────
        // Capability: Workforce Admin
        // ─────────────────────────────────────────────────────────────
        {
            id: "workforce-admin",
            title: catalogMessage("navigation.humanCapitalConfig.coreAdministration"),
            icon: "users",
            description: catalogMessage("navigation.humanCapitalConfig.employeeDataContractsAssetsDocuments"),
            groups: [
                {
                    id: "employee-master",
                    title: catalogMessage("navigation.humanCapitalConfig.employeeData"),
                    description: catalogMessage("navigation.humanCapitalConfig.comprehensiveEmployeeFile"),
                    screens: [
                        {
                            id: "employees-list",
                            title: catalogMessage("common.general.employees"),
                            icon: "user",
                            description: catalogMessage("navigation.humanCapitalConfig.employeeDatabase"),
                            href: "/06-human-capital/workforce-admin/employee-master/employees-list",
                            permissions: [],
                            module: "employees",
                        },
                        {
                            id: "expat-management",
                            title: catalogMessage("common.general.foreignWorkforceManagement"),
                            icon: "globe",
                            description: catalogMessage("navigation.humanCapitalConfig.managementDocumentsPermitsForeignEmployees"),
                            href: "/06-human-capital/workforce-admin/employee-master/expat-management",
                            permissions: [],
                            module: "employees",
                        },
                        {
                            id: "employee-assets",
                            title: catalogMessage("common.general.employeeAssets"),
                            icon: "laptop",
                            description: catalogMessage("navigation.humanCapitalConfig.employeeEquipmentAssetManagement"),
                            href: "/06-human-capital/workforce-admin/employee-master/employee-assets",
                            permissions: [],
                            module: "employees",
                        },
                        {
                            id: "contracts",
                            title: catalogMessage("common.general.contractsAgreements"),
                            icon: "file-contract",
                            description: catalogMessage("navigation.humanCapitalConfig.employmentContractsAgreementsManagement"),
                            href: "/06-human-capital/workforce-admin/employee-master/contracts",
                            permissions: [],
                            module: "employees",
                        },
                    ],
                },
                {
                    id: "employee-groups-nr",
                    title: catalogMessage("navigation.humanCapitalConfig.employeeAggregations"),
                    icon: "group",
                    description: catalogMessage("navigation.humanCapitalConfig.employeeNumberingGroupingsRanges"),
                    screens: [
                        {
                            id: "add-employee-group",
                            title: catalogMessage("common.general.aggregationDefinition"),
                            icon: "add",
                            description: catalogMessage("common.general.addNewCollection"),
                            href: "/06-human-capital/workforce-admin/employee-groups-nr/add-employee-group",
                            permissions: [],
                            module: "employees",
                        },
                        {
                            id: "add-employee-nr",
                            title: catalogMessage("common.general.scopeDefinition"),
                            icon: "add",
                            description: catalogMessage("common.general.addNewRange"),
                            href: "/06-human-capital/workforce-admin/employee-groups-nr/add-employee-nr",
                            permissions: [],
                            module: "employees",
                        },
                        {
                            id: "view-employee-groups",
                            title: catalogMessage("common.general.viewEmployeeGroups"),
                            icon: "view",
                            description: catalogMessage("common.general.viewEmployeeGroups"),
                            href: "/06-human-capital/workforce-admin/employee-groups-nr/view-employee-groups",
                            permissions: [],
                            module: "employees",
                        },
                        {
                            id: "view-employee-nr",
                            title: catalogMessage("common.general.viewEmployeeBands"),
                            icon: "view",
                            description: catalogMessage("common.general.viewEmployeeBands"),
                            href: "/06-human-capital/workforce-admin/employee-groups-nr/view-employee-nr",
                            permissions: [],
                            module: "employees",
                        },
                        {
                            id: "employee-nr-assignment",
                            title: catalogMessage("common.general.viewAddAssignments"),
                            icon: "add",
                            description: catalogMessage("navigation.humanCapitalConfig.viewNumberingRangeAssignmentsEmployees"),
                            href: "/06-human-capital/workforce-admin/employee-groups-nr/employee-nr-assignment",
                            permissions: [],
                            module: "employees",
                        },
                    ],
                },
            ],
        },

        // ─────────────────────────────────────────────────────────────
        // Capability: Talent & Recruitment
        // ─────────────────────────────────────────────────────────────
        {
            id: "talent-recruitment",
            title: catalogMessage("navigation.humanCapitalConfig.recruitmentTalent"),
            icon: "user-plus",
            description: catalogMessage("navigation.humanCapitalConfig.applicantTrackingOnboardingTemporaryStaffingSystem"),
            groups: [
                {
                    id: "recruitment",
                    title: catalogMessage("navigation.humanCapitalConfig.recruitment"),
                    description: catalogMessage("navigation.humanCapitalConfig.hiringOnboarding"),
                    screens: [
                        {
                            id: "ats",
                            title: catalogMessage("common.general.recruitmentCandidates"),
                            icon: "user-plus",
                            description: catalogMessage("navigation.humanCapitalConfig.applicantTrackingSystem"),
                            href: "/06-human-capital/talent-recruitment/recruitment/ats",
                            permissions: [],
                            module: "recruitment",
                        },
                        {
                            id: "administration",
                            title: catalogMessage("navigation.humanCapitalConfig.administrationRoles"),
                            icon: "settings",
                            description: catalogMessage("navigation.humanCapitalConfig.jobTitlesPermissionsUserAssignments"),
                            href: "/06-human-capital/talent-recruitment/recruitment/administration",
                            permissions: [],
                            module: "employees",
                        },
                        {
                            id: "onboarding",
                            title: catalogMessage("navigation.humanCapitalConfig.setupTermination"),
                            icon: "user-check",
                            description: catalogMessage("navigation.humanCapitalConfig.recruitmentTermination"),
                            href: "/06-human-capital/talent-recruitment/recruitment/onboarding",
                            permissions: [],
                            module: "onboarding",
                        },
                        {
                            id: "contingent-workers",
                            title: catalogMessage("common.general.temporaryLabor"),
                            icon: "briefcase",
                            description: catalogMessage("navigation.humanCapitalConfig.contractorsConsultantsManagement"),
                            href: "/06-human-capital/talent-recruitment/recruitment/contingent-workers",
                            permissions: [],
                            module: "contingent",
                        },
                    ],
                },
            ],
        },

        // ─────────────────────────────────────────────────────────────
        // Capability: Compliance & Relations
        // ─────────────────────────────────────────────────────────────
        {
            id: "hr-compliance",
            title: catalogMessage("common.general.complianceRelations"),
            icon: "shield-check",
            description: catalogMessage("navigation.humanCapitalConfig.qualityComplianceEmployeeRelationsCommunications"),
            groups: [
                {
                    id: "compliance-relations",
                    title: catalogMessage("common.general.complianceRelations"),
                    description: catalogMessage("navigation.humanCapitalConfig.complaintsDisciplineCommunications"),
                    screens: [
                        {
                            id: "qa-compliance",
                            title: catalogMessage("common.general.qualityCompliance"),
                            icon: "shield-check",
                            description: catalogMessage("navigation.humanCapitalConfig.complianceInternalAuditManagement"),
                            href: "/06-human-capital/hr-compliance/compliance-relations/qa-compliance",
                            permissions: [],
                            module: "compliance",
                        },
                        {
                            id: "employee-relations",
                            title: catalogMessage("navigation.humanCapitalConfig.employeeRelations"),
                            icon: "scale",
                            description: catalogMessage("navigation.humanCapitalConfig.complaintsDisciplineManagement"),
                            href: "/06-human-capital/hr-compliance/compliance-relations/employee-relations",
                            permissions: [],
                            module: "relations",
                        },
                        {
                            id: "communications",
                            title: catalogMessage("common.general.corporateCommunications"),
                            icon: "bullhorn",
                            description: catalogMessage("navigation.humanCapitalConfig.announcementsSurveys"),
                            href: "/06-human-capital/hr-compliance/compliance-relations/communications",
                            permissions: [],
                            module: "communications",
                        },
                    ],
                },
            ],
        },

        // ─────────────────────────────────────────────────────────────
        // Capability: Time & Productivity
        // ─────────────────────────────────────────────────────────────
        {
            id: "time-productivity",
            title: catalogMessage("navigation.humanCapitalConfig.timeAttendance.alternative2"),
            icon: "clock",
            description: catalogMessage("navigation.humanCapitalConfig.attendanceTimeTrackingSchedulingLeave"),
            groups: [
                {
                    id: "attendance-scheduling",
                    title: catalogMessage("navigation.humanCapitalConfig.attendanceManagement"),
                    description: catalogMessage("navigation.humanCapitalConfig.attendanceShiftTracking"),
                    screens: [
                        {
                            id: "attendance",
                            title: catalogMessage("navigation.humanCapitalConfig.timeAttendance"),
                            icon: "clock",
                            description: catalogMessage("navigation.humanCapitalConfig.attendanceTrackingHoursReport"),
                            href: "/06-human-capital/time-productivity/attendance-scheduling/attendance",
                            permissions: [],
                            module: "attendance",
                        },
                        {
                            id: "biometric",
                            title: catalogMessage("navigation.humanCapitalConfig.biometricDevices"),
                            icon: "clock",
                            description: catalogMessage("navigation.humanCapitalConfig.manageBiometricAttendanceDevices"),
                            href: "/06-human-capital/time-productivity/attendance-scheduling/biometric",
                            permissions: [],
                            module: "attendance",
                        },
                        {
                            id: "scheduling",
                            title: catalogMessage("common.general.workforceScheduling"),
                            icon: "calendar-days",
                            description: catalogMessage("navigation.humanCapitalConfig.shiftSchedulingOptimization"),
                            href: "/06-human-capital/time-productivity/attendance-scheduling/scheduling",
                            permissions: [],
                            module: "scheduling",
                        },
                        {
                            id: "leave",
                            title: catalogMessage("navigation.humanCapitalConfig.leaves"),
                            icon: "calendar",
                            description: catalogMessage("navigation.humanCapitalConfig.leaveAbsenceRequestsManagement"),
                            href: "/06-human-capital/time-productivity/attendance-scheduling/leave",
                            permissions: [],
                            module: "leave",
                        },
                    ],
                },
            ],
        },

        // ─────────────────────────────────────────────────────────────
        // Capability: Performance & Development
        // ─────────────────────────────────────────────────────────────
        {
            id: "performance-development",
            title: catalogMessage("navigation.humanCapitalConfig.performanceDevelopment"),
            icon: "chart-line",
            description: catalogMessage("navigation.humanCapitalConfig.performanceEvaluationTrainingSuccessionPlanning"),
            groups: [
                {
                    id: "performance",
                    title: catalogMessage("navigation.humanCapitalConfig.performanceLearning"),
                    description: catalogMessage("navigation.humanCapitalConfig.goalsDevelopmentManagement"),
                    screens: [
                        {
                            id: "performance-kpi",
                            title: catalogMessage("common.general.performanceGoals"),
                            icon: "chart-line",
                            description: catalogMessage("navigation.humanCapitalConfig.goalManagementPerformanceEvaluations"),
                            href: "/06-human-capital/performance-development/performance/performance-kpi",
                            permissions: [],
                            module: "performance",
                        },
                        {
                            id: "learning",
                            title: catalogMessage("common.general.trainingLearning"),
                            icon: "graduation-cap",
                            description: catalogMessage("navigation.humanCapitalConfig.learningManagementSystemLms"),
                            href: "/06-human-capital/performance-development/performance/learning",
                            permissions: [],
                            module: "learning",
                        },
                        {
                            id: "succession",
                            title: catalogMessage("common.general.successionPlanning"),
                            icon: "sitemap",
                            description: catalogMessage("navigation.humanCapitalConfig.successionPlanningCareerPath"),
                            href: "/06-human-capital/performance-development/performance/succession",
                            permissions: [],
                            module: "succession",
                        },
                    ],
                },
            ],
        },

        // ─────────────────────────────────────────────────────────────
        // Capability: Payroll & Benefits
        // ─────────────────────────────────────────────────────────────
        {
            id: "payroll-benefits",
            title: catalogMessage("navigation.humanCapitalConfig.salariesCompensations"),
            icon: "banknote",
            description: catalogMessage("navigation.humanCapitalConfig.payrollRunsCompensationBenefitsBankIntegration"),
            groups: [
                {
                    id: "payroll-management",
                    title: catalogMessage("navigation.humanCapitalConfig.payrollManagement"),
                    description: catalogMessage("navigation.humanCapitalConfig.payrollsComponentsBankIntegration"),
                    screens: [
                        {
                            id: "compensation",
                            title: catalogMessage("common.general.compensationManagement"),
                            icon: "money-bill-wave",
                            description: catalogMessage("navigation.humanCapitalConfig.payrollBenefitsPlanning"),
                            href: "/06-human-capital/payroll-benefits/payroll-management/compensation",
                            permissions: [],
                            module: "compensation",
                        },
                        {
                            id: "benefits",
                            title: catalogMessage("common.general.benefitsEntitlements"),
                            icon: "heart",
                            description: catalogMessage("navigation.humanCapitalConfig.benefitsPlanManagement"),
                            href: "/06-human-capital/payroll-benefits/payroll-management/benefits",
                            permissions: [],
                            module: "benefits",
                        },
                        {
                            id: "payroll",
                            title: catalogMessage("common.general.payroll.alternative2"),
                            icon: "banknote",
                            description: catalogMessage("navigation.humanCapitalConfig.managePayrollRunsApprovals"),
                            href: "/06-human-capital/payroll-benefits/payroll-management/payroll",
                            permissions: [],
                            module: "payroll",
                        },
                        {
                            id: "payroll-components",
                            title: catalogMessage("common.general.payrollComponents"),
                            icon: "settings",
                            description: catalogMessage("navigation.humanCapitalConfig.allowancesDeductionsManagement"),
                            href: "/06-human-capital/payroll-benefits/payroll-management/payroll-components",
                            permissions: [],
                            module: "payroll",
                        },
                        {
                            id: "payroll-integrations",
                            title: catalogMessage("navigation.humanCapitalConfig.bankReconciliation"),
                            icon: "link",
                            description: catalogMessage("navigation.humanCapitalConfig.bankFilesIntegrations"),
                            href: "/06-human-capital/payroll-benefits/payroll-management/payroll-integrations",
                            permissions: [],
                            module: "payroll",
                        },
                    ],
                },
            ],
        },

        // ─────────────────────────────────────────────────────────────
        // Capability: Employee Services & Wellness
        // ─────────────────────────────────────────────────────────────
        {
            id: "services-wellness",
            title: catalogMessage("navigation.humanCapitalConfig.servicesHealth"),
            icon: "heart-pulse",
            description: catalogMessage("navigation.humanCapitalConfig.travelLoansHealthSafetyWellbeing"),
            groups: [
                {
                    id: "employee-services",
                    title: catalogMessage("navigation.humanCapitalConfig.employeeServices"),
                    description: catalogMessage("navigation.humanCapitalConfig.variousEmployeeServices"),
                    screens: [
                        {
                            id: "travel-expenses",
                            title: catalogMessage("common.general.travelExpenses"),
                            icon: "plane",
                            description: catalogMessage("navigation.humanCapitalConfig.travelRequestsExpenseReports"),
                            href: "/06-human-capital/services-wellness/employee-services/travel-expenses",
                            permissions: [],
                            module: "travel",
                        },
                        {
                            id: "loans",
                            title: catalogMessage("navigation.humanCapitalConfig.financialLoans"),
                            icon: "hand-holding-usd",
                            description: catalogMessage("navigation.humanCapitalConfig.employeeLoanManagement"),
                            href: "/06-human-capital/services-wellness/employee-services/loans",
                            permissions: [],
                            module: "loans",
                        },
                        {
                            id: "ehs",
                            title: catalogMessage("navigation.humanCapitalConfig.healthSafety"),
                            icon: "hard-hat",
                            description: catalogMessage("navigation.humanCapitalConfig.incidentSafetyManagement"),
                            href: "/06-human-capital/services-wellness/employee-services/ehs",
                            permissions: [],
                            module: "ehs",
                        },
                        {
                            id: "wellness",
                            title: catalogMessage("navigation.humanCapitalConfig.welfare"),
                            icon: "heart-pulse",
                            description: catalogMessage("navigation.humanCapitalConfig.healthWellnessPrograms"),
                            href: "/06-human-capital/services-wellness/employee-services/wellness",
                            permissions: [],
                            module: "wellness",
                        },
                    ],
                },
            ],
        },

        // ─────────────────────────────────────────────────────────────
        // Capability: Knowledge & Self-Service
        // ─────────────────────────────────────────────────────────────
        {
            id: "knowledge-portal",
            title: catalogMessage("navigation.humanCapitalConfig.knowledgePortal"),
            icon: "book",
            description: catalogMessage("navigation.humanCapitalConfig.knowledgeBaseSelfServicePortalEndService"),
            groups: [
                {
                    id: "self-service",
                    title: catalogMessage("navigation.humanCapitalConfig.selfService"),
                    description: catalogMessage("navigation.humanCapitalConfig.employeePortalKnowledgeBase"),
                    screens: [
                        {
                            id: "knowledge-base",
                            title: catalogMessage("common.general.knowledgeBase"),
                            icon: "book",
                            description: catalogMessage("navigation.humanCapitalConfig.knowledgeBestPracticesLibrary"),
                            href: "/06-human-capital/knowledge-portal/self-service/knowledge-base",
                            permissions: [],
                            module: "knowledge",
                        },
                        {
                            id: "expertise",
                            title: catalogMessage("common.general.expertGuide"),
                            icon: "users-gear",
                            description: catalogMessage("navigation.humanCapitalConfig.internalExpertsDirectory"),
                            href: "/06-human-capital/knowledge-portal/self-service/expertise",
                            permissions: [],
                            module: "expertise",
                        },
                        {
                            id: "employee-portal",
                            title: catalogMessage("navigation.humanCapitalConfig.selfServicePortal"),
                            icon: "user-cog",
                            description: catalogMessage("navigation.humanCapitalConfig.payrollsEmployeeRequests"),
                            href: "/06-human-capital/knowledge-portal/self-service/employee-portal",
                            permissions: [],
                            module: "portal",
                        },
                        {
                            id: "eosb",
                            title: catalogMessage("navigation.humanCapitalConfig.endServiceGratuity"),
                            icon: "calculator",
                            description: catalogMessage("navigation.humanCapitalConfig.endServiceSettlementCalculation"),
                            href: "/06-human-capital/knowledge-portal/self-service/eosb",
                            permissions: [],
                            module: "eosb",
                        },
                    ],
                },
            ],
        },

        // ─────────────────────────────────────────────────────────────
        // Capability: Advanced Features
        // ─────────────────────────────────────────────────────────────
        {
            id: "hr-advanced",
            title: catalogMessage("navigation.humanCapitalConfig.advancedFeatures"),
            icon: "settings",
            description: catalogMessage("navigation.humanCapitalConfig.advancedDocumentsReports"),
            groups: [
                {
                    id: "documents-reports",
                    title: catalogMessage("common.general.documentsReports"),
                    description: catalogMessage("navigation.humanCapitalConfig.documentReportTemplates"),
                    screens: [
                        {
                            id: "hr-documents",
                            title: catalogMessage("common.general.documentsReports"),
                            icon: "file-signature",
                            description: catalogMessage("navigation.humanCapitalConfig.documentTemplatesIdCardsReports"),
                            href: "/06-human-capital/hr-advanced/documents-reports/hr-documents",
                            permissions: [],
                            module: "employees",
                        },
                    ],
                },
            ],
        },
    ],
};
