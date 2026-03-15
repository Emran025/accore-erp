export interface HumanCapitalEndpoints {
    EMPLOYEES: {
        BASE: string;
        withId: (id: string | number) => string;
        SUSPEND: (id: string | number) => string;
        ACTIVATE: (id: string | number) => string;
        DOCUMENTS: (id: string | number) => string;
    };
    DEPARTMENTS: string;
    PAYROLL: {
        CYCLES: string;
        GENERATE: string;
        APPROVE: (id: string | number) => string;
        PROCESS_PAYMENT: (id: string | number) => string;
        CYCLE_ITEMS: (cycleId: string | number) => string;
        ITEM_TRANSACTIONS: (itemId: string | number) => string;
        PAY_ITEM: (itemId: string | number) => string;
        TOGGLE_ITEM: (itemId: string | number) => string;
        UPDATE_ITEM: (itemId: string | number) => string;
    };
    ATTENDANCE: {
        BASE: string;
        BULK_IMPORT: string;
        SUMMARY: string;
    };
    LEAVE: {
        BASE: string;
        withId: (id: string | number) => string;
        APPROVE: (id: string | number) => string;
        CANCEL: (id: string | number) => string;
    };
    EMPLOYEE_PORTAL: {
        PAYSLIPS: string;
        LEAVE_REQUESTS: string;
        ATTENDANCE: string;
    };
    EOSB: {
        PREVIEW: string;
        CALCULATE: (id: string | number) => string;
    };
    COMPONENTS: string;
    EXPAT_MANAGEMENT: {
        BASE: string;
        withId: (id: string | number) => string;
    };
    EMPLOYEE_ASSETS: {
        BASE: string;
        withId: (id: string | number) => string;
    };
    CONTRACTS: {
        BASE: string;
        withId: (id: string | number) => string;
    };
    RECRUITMENT: {
        REQUISITIONS: {
            BASE: string;
            withId: (id: string | number) => string;
        };
        APPLICANTS: {
            BASE: string;
            STATUS: (id: string | number) => string;
        };
        INTERVIEWS: {
            BASE: string;
            withId: (id: string | number) => string;
        };
    };
    ONBOARDING: {
        BASE: string;
        withId: (id: string | number) => string;
        TASK: (workflowId: string | number, taskId: string | number) => string;
        DOCUMENTS: (workflowId: string | number) => string;
    };
    CONTINGENT_WORKERS: {
        BASE: string;
        withId: (id: string | number) => string;
        CONTRACTS: (workerId: string | number) => string;
    };
    QA_COMPLIANCE: {
        BASE: string;
        withId: (id: string | number) => string;
        CAPA: (complianceId: string | number) => string;
    };
    WORKFORCE_SCHEDULING: {
        BASE: string;
        withId: (id: string | number) => string;
        SHIFTS: (scheduleId: string | number) => string;
        SHIFT: (scheduleId: string | number, shiftId: string | number) => string;
    };
    EMPLOYEE_RELATIONS: {
        BASE: string;
        withId: (id: string | number) => string;
        DISCIPLINARY: (caseId: string | number) => string;
    };
    TRAVEL: {
        REQUESTS: {
            BASE: string;
            STATUS: (id: string | number) => string;
        };
        EXPENSES: {
            BASE: string;
            STATUS: (id: string | number) => string;
        };
    };
    EMPLOYEE_LOANS: {
        BASE: string;
        withId: (id: string | number) => string;
        STATUS: (id: string | number) => string;
        REPAYMENT: (id: string | number, repaymentId: string | number) => string;
    };
    PERFORMANCE: {
        GOALS: {
            BASE: string;
            withId: (id: string | number) => string;
        };
        APPRAISALS: {
            BASE: string;
            withId: (id: string | number) => string;
        };
        FEEDBACK: {
            BASE: string;
        };
    };
    LEARNING: {
        COURSES: {
            BASE: string;
            withId: (id: string | number) => string;
        };
        ENROLLMENTS: {
            BASE: string;
            withId: (id: string | number) => string;
        };
    };
    COMMUNICATIONS: {
        ANNOUNCEMENTS: {
            BASE: string;
            withId: (id: string | number) => string;
        };
        SURVEYS: {
            BASE: string;
            RESPONSES: (surveyId: string | number) => string;
        };
    };
    EHS: {
        INCIDENTS: {
            BASE: string;
            withId: (id: string | number) => string;
        };
        HEALTH_RECORDS: {
            BASE: string;
        };
        PPE: {
            BASE: string;
        };
    };
    WELLNESS: {
        PROGRAMS: {
            BASE: string;
        };
        PARTICIPATIONS: {
            BASE: string;
            withId: (id: string | number) => string;
        };
    };
    SUCCESSION: {
        BASE: string;
        withId: (id: string | number) => string;
        CANDIDATES: (planId: string | number) => string;
        CANDIDATE: (planId: string | number, candidateId: string | number) => string;
    };
    COMPENSATION: {
        PLANS: {
            BASE: string;
            withId: (id: string | number) => string;
        };
        ENTRIES: {
            BASE: string;
            STATUS: (id: string | number) => string;
        };
    };
    BENEFITS: {
        PLANS: {
            BASE: string;
            withId: (id: string | number) => string;
        };
        ENROLLMENTS: {
            BASE: string;
            withId: (id: string | number) => string;
        };
    };
    POST_PAYROLL: {
        BASE: string;
        PROCESS: (id: string | number) => string;
        RECONCILE: (id: string | number) => string;
    };
    KNOWLEDGE: {
        BASE: string;
        withId: (id: string | number) => string;
        HELPFUL: (id: string | number) => string;
    };
    EXPERTISE: {
        BASE: string;
        withId: (id: string | number) => string;
    };
    DOCUMENT_TEMPLATES: {
        BASE: string;
        withId: (id: string | number) => string;
        RENDER: (id: string | number) => string;
        APPROVED_KEYS: string;
    };
    BIOMETRIC: {
        DEVICES: string;
        DEVICE_WITH_ID: (id: string | number) => string;
        SYNC: (id: string | number) => string;
        SYNC_LOGS: string;
        IMPORT: string;
    };
    ADMINISTRATION: {
        JOB_TITLES: {
            BASE: string;
            withId: (id: string | number) => string;
        };
        POSITIONS: {
            BASE: string;
            withId: (id: string | number) => string;
            ASSIGN: string;
            UNASSIGN: (employeeId: string | number) => string;
        };
        PERMISSION_TEMPLATES: {
            BASE: string;
            withId: (id: string | number) => string;
            APPLY: string;
        };
    };
    EMPLOYEE_FILES: {
        LIST: (employeeId: string | number) => string;
        UPLOAD: (employeeId: string | number) => string;
        DOWNLOAD: (employeeId: string | number, documentId: string | number) => string;
        UPDATE: (employeeId: string | number, documentId: string | number) => string;
        DELETE: (employeeId: string | number, documentId: string | number) => string;
    };
}

export const HUMAN_CAPITAL: HumanCapitalEndpoints = {
    EMPLOYEES: {
        BASE: "/v2/employees",
        withId: (id: string | number) => `/v2/employees/${id}`,
        SUSPEND: (id: string | number) => `/v2/employees/${id}/suspend`,
        ACTIVATE: (id: string | number) => `/v2/employees/${id}/activate`,
        DOCUMENTS: (id: string | number) => `/v2/employees/${id}/documents`,
    },
    DEPARTMENTS: "/v2/departments",
    PAYROLL: {
        CYCLES: "/v2/payroll/cycles",
        GENERATE: "/v2/payroll/generate",
        APPROVE: (id: string | number) => `/v2/payroll/${id}/approve`,
        PROCESS_PAYMENT: (id: string | number) => `/v2/payroll/${id}/process-payment`,
        CYCLE_ITEMS: (cycleId: string | number) => `/v2/payroll/cycles/${cycleId}/items`,
        ITEM_TRANSACTIONS: (itemId: string | number) => `/v2/payroll/items/${itemId}/transactions`,
        PAY_ITEM: (itemId: string | number) => `/v2/payroll/items/${itemId}/pay`,
        TOGGLE_ITEM: (itemId: string | number) => `/v2/payroll/items/${itemId}/toggle-status`,
        UPDATE_ITEM: (itemId: string | number) => `/v2/payroll/items/${itemId}`,
    },
    ATTENDANCE: {
        BASE: "/v2/attendance",
        BULK_IMPORT: "/v2/attendance/bulk-import",
        SUMMARY: "/v2/attendance/summary",
    },
    LEAVE: {
        BASE: "/v2/leave-requests",
        withId: (id: string | number) => `/v2/leave-requests/${id}`,
        APPROVE: (id: string | number) => `/v2/leave-requests/${id}/approve`,
        CANCEL: (id: string | number) => `/v2/leave-requests/${id}/cancel`,
    },
    EMPLOYEE_PORTAL: {
        PAYSLIPS: "/v2/employee-portal/my-payslips",
        LEAVE_REQUESTS: "/v2/employee-portal/my-leave-requests",
        ATTENDANCE: "/v2/employee-portal/my-attendance",
    },
    EOSB: {
        PREVIEW: "/v2/eosb/preview",
        CALCULATE: (id: string | number) => `/v2/eosb/${id}/calculate`,
    },
    COMPONENTS: "/v2/payroll-components",
    EXPAT_MANAGEMENT: {
        BASE: "/v2/expat-management",
        withId: (id: string | number) => `/v2/expat-management/${id}`,
    },
    EMPLOYEE_ASSETS: {
        BASE: "/v2/employee-assets",
        withId: (id: string | number) => `/v2/employee-assets/${id}`,
    },
    CONTRACTS: {
        BASE: "/v2/contracts",
        withId: (id: string | number) => `/v2/contracts/${id}`,
    },
    RECRUITMENT: {
        REQUISITIONS: {
            BASE: "/v2/recruitment/requisitions",
            withId: (id: string | number) => `/v2/recruitment/requisitions/${id}`,
        },
        APPLICANTS: {
            BASE: "/v2/recruitment/applicants",
            STATUS: (id: string | number) => `/v2/recruitment/applicants/${id}/status`,
        },
        INTERVIEWS: {
            BASE: "/v2/recruitment/interviews",
            withId: (id: string | number) => `/v2/recruitment/interviews/${id}`,
        },
    },
    ONBOARDING: {
        BASE: "/v2/onboarding",
        withId: (id: string | number) => `/v2/onboarding/${id}`,
        TASK: (workflowId: string | number, taskId: string | number) => `/v2/onboarding/${workflowId}/tasks/${taskId}`,
        DOCUMENTS: (workflowId: string | number) => `/v2/onboarding/${workflowId}/documents`,
    },
    CONTINGENT_WORKERS: {
        BASE: "/v2/contingent-workers",
        withId: (id: string | number) => `/v2/contingent-workers/${id}`,
        CONTRACTS: (workerId: string | number) => `/v2/contingent-workers/${workerId}/contracts`,
    },
    QA_COMPLIANCE: {
        BASE: "/v2/qa-compliance",
        withId: (id: string | number) => `/v2/qa-compliance/${id}`,
        CAPA: (complianceId: string | number) => `/v2/qa-compliance/${complianceId}/capa`,
    },
    WORKFORCE_SCHEDULING: {
        BASE: "/v2/workforce-schedules",
        withId: (id: string | number) => `/v2/workforce-schedules/${id}`,
        SHIFTS: (scheduleId: string | number) => `/v2/workforce-schedules/${scheduleId}/shifts`,
        SHIFT: (scheduleId: string | number, shiftId: string | number) => `/v2/workforce-schedules/${scheduleId}/shifts/${shiftId}`,
    },
    EMPLOYEE_RELATIONS: {
        BASE: "/v2/employee-relations",
        withId: (id: string | number) => `/v2/employee-relations/${id}`,
        DISCIPLINARY: (caseId: string | number) => `/v2/employee-relations/${caseId}/disciplinary`,
    },
    TRAVEL: {
        REQUESTS: {
            BASE: "/v2/travel-requests",
            STATUS: (id: string | number) => `/v2/travel-requests/${id}/status`,
        },
        EXPENSES: {
            BASE: "/v2/travel-expenses",
            STATUS: (id: string | number) => `/v2/travel-expenses/${id}/status`,
        },
    },
    EMPLOYEE_LOANS: {
        BASE: "/v2/employee-loans",
        withId: (id: string | number) => `/v2/employee-loans/${id}`,
        STATUS: (id: string | number) => `/v2/employee-loans/${id}/status`,
        REPAYMENT: (id: string | number, repaymentId: string | number) => `/v2/employee-loans/${id}/repayments/${repaymentId}`,
    },
    PERFORMANCE: {
        GOALS: {
            BASE: "/v2/performance/goals",
            withId: (id: string | number) => `/v2/performance/goals/${id}`,
        },
        APPRAISALS: {
            BASE: "/v2/performance/appraisals",
            withId: (id: string | number) => `/v2/performance/appraisals/${id}`,
        },
        FEEDBACK: {
            BASE: "/v2/performance/feedback",
        },
    },
    LEARNING: {
        COURSES: {
            BASE: "/v2/learning/courses",
            withId: (id: string | number) => `/v2/learning/courses/${id}`,
        },
        ENROLLMENTS: {
            BASE: "/v2/learning/enrollments",
            withId: (id: string | number) => `/v2/learning/enrollments/${id}`,
        },
    },
    COMMUNICATIONS: {
        ANNOUNCEMENTS: {
            BASE: "/v2/communications/announcements",
            withId: (id: string | number) => `/v2/communications/announcements/${id}`,
        },
        SURVEYS: {
            BASE: "/v2/communications/surveys",
            RESPONSES: (surveyId: string | number) => `/v2/communications/surveys/${surveyId}/responses`,
        },
    },
    EHS: {
        INCIDENTS: {
            BASE: "/v2/ehs/incidents",
            withId: (id: string | number) => `/v2/ehs/incidents/${id}`,
        },
        HEALTH_RECORDS: {
            BASE: "/v2/ehs/health-records",
        },
        PPE: {
            BASE: "/v2/ehs/ppe",
        },
    },
    WELLNESS: {
        PROGRAMS: {
            BASE: "/v2/wellness/programs",
        },
        PARTICIPATIONS: {
            BASE: "/v2/wellness/participations",
            withId: (id: string | number) => `/v2/wellness/participations/${id}`,
        },
    },
    SUCCESSION: {
        BASE: "/v2/succession",
        withId: (id: string | number) => `/v2/succession/${id}`,
        CANDIDATES: (planId: string | number) => `/v2/succession/${planId}/candidates`,
        CANDIDATE: (planId: string | number, candidateId: string | number) => `/v2/succession/${planId}/candidates/${candidateId}`,
    },
    COMPENSATION: {
        PLANS: {
            BASE: "/v2/compensation/plans",
            withId: (id: string | number) => `/v2/compensation/plans/${id}`,
        },
        ENTRIES: {
            BASE: "/v2/compensation/entries",
            STATUS: (id: string | number) => `/v2/compensation/entries/${id}/status`,
        },
    },
    BENEFITS: {
        PLANS: {
            BASE: "/v2/benefits/plans",
            withId: (id: string | number) => `/v2/benefits/plans/${id}`,
        },
        ENROLLMENTS: {
            BASE: "/v2/benefits/enrollments",
            withId: (id: string | number) => `/v2/benefits/enrollments/${id}`,
        },
    },
    POST_PAYROLL: {
        BASE: "/v2/post-payroll",
        PROCESS: (id: string | number) => `/v2/post-payroll/${id}/process`,
        RECONCILE: (id: string | number) => `/v2/post-payroll/${id}/reconcile`,
    },
    KNOWLEDGE: {
        BASE: "/v2/knowledge-base",
        withId: (id: string | number) => `/v2/knowledge-base/${id}`,
        HELPFUL: (id: string | number) => `/v2/knowledge-base/${id}/helpful`,
    },
    EXPERTISE: {
        BASE: "/v2/expertise",
        withId: (id: string | number) => `/v2/expertise/${id}`,
    },
    DOCUMENT_TEMPLATES: {
        BASE: "/v2/document-templates",
        withId: (id: string | number) => `/v2/document-templates/${id}`,
        RENDER: (id: string | number) => `/v2/document-templates/${id}/render`,
        APPROVED_KEYS: "/v2/document-templates/approved-keys",
    },
    BIOMETRIC: {
        DEVICES: "/v2/biometric/devices",
        DEVICE_WITH_ID: (id: string | number) => `/v2/biometric/devices/${id}`,
        SYNC: (id: string | number) => `/v2/biometric/devices/${id}/sync`,
        SYNC_LOGS: "/v2/biometric/sync-logs",
        IMPORT: "/v2/biometric/import",
    },
    ADMINISTRATION: {
        JOB_TITLES: {
            BASE: "/v2/job-titles",
            withId: (id: string | number) => `/v2/job-titles/${id}`,
        },
        POSITIONS: {
            BASE: "/v2/positions",
            withId: (id: string | number) => `/v2/positions/${id}`,
            ASSIGN: "/v2/positions/assign-employee",
            UNASSIGN: (employeeId: string | number) => `/v2/positions/unassign-employee/${employeeId}`,
        },
        PERMISSION_TEMPLATES: {
            BASE: "/v2/permission-templates",
            withId: (id: string | number) => `/v2/permission-templates/${id}`,
            APPLY: "/v2/permission-templates/apply",
        },
    },
    EMPLOYEE_FILES: {
        LIST: (employeeId: string | number) => `/v2/employee-files/${employeeId}`,
        UPLOAD: (employeeId: string | number) => `/v2/employee-files/${employeeId}`,
        DOWNLOAD: (employeeId: string | number, documentId: string | number) => `/v2/employee-files/${employeeId}/download/${documentId}`,
        UPDATE: (employeeId: string | number, documentId: string | number) => `/v2/employee-files/${employeeId}/${documentId}`,
        DELETE: (employeeId: string | number, documentId: string | number) => `/v2/employee-files/${employeeId}/${documentId}`,
    },
};
