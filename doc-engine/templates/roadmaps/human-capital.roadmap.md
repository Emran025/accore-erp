# HumanCapital Domain Roadmap

> **Domain:** HumanCapital
> **Bounded Context:** `backend/app/Domains/HumanCapital/`
> **Phase:** 3

---

## 1. Subdomains

| Subdomain | Codebase Path | Description |
|-----------|--------------|-------------|
| WorkforceAdmin | `HumanCapital/WorkforceAdmin/` | Employee records, lifecycle management |
| PayrollBenefits | `HumanCapital/PayrollBenefits/` | Payroll execution, salary calculation, benefits |
| TimeProductivity | `HumanCapital/TimeProductivity/` | Timesheets, leave accrual, attendance |
| HRCompliance | `HumanCapital/HRCompliance/` | Labor laws, employment contracts |
| TalentRecruitment | `HumanCapital/TalentRecruitment/` | Hiring workflows, applicant tracking |
| PerformanceDevelopment | `HumanCapital/PerformanceDevelopment/` | KPIs, performance reviews, training |
| KnowledgePortal | `HumanCapital/KnowledgePortal/` | Internal documentation, knowledge base |
| ServicesWellness | `HumanCapital/ServicesWellness/` | Employee self-service, wellness programs |
| HRAdvanced | `HumanCapital/HRAdvanced/` | Advanced HR reporting, analytics |

---

## 2. Task Execution Order

| Order | Task ID | Title | Template | Output Path | Pages |
|-------|---------|-------|----------|-------------|-------|
| 1 | HC-001 | HumanCapital Overview | domain-overview | `/docs/Domains/HumanCapital/Overview.md` | 1 |
| 2 | HC-002 | Employee Lifecycle | lifecycle | `/docs/Domains/HumanCapital/WorkforceAdmin/Employee_Lifecycle.md` | 1 |
| 3 | HC-003 | Payroll Execution & Taxation | domain-standard | `/docs/Domains/HumanCapital/PayrollBenefits/Payroll_Execution_And_Taxation.md` | 1 |
| 4 | HC-004 | Timesheets & Leave Accrual | domain-standard | `/docs/Domains/HumanCapital/TimeProductivity/Timesheets_And_Leave_Accrual.md` | 1 |
| 5 | HC-005 | Labor Laws & Contracts | domain-standard | `/docs/Domains/HumanCapital/HRCompliance/Labor_Laws_And_Contracts.md` | 1 |
| 6 | HC-006 | Hiring Workflows | lifecycle | `/docs/Domains/HumanCapital/TalentRecruitment/Hiring_Workflows.md` | 1 |
| 7 | HC-007 | KPIs & Reviews | domain-standard | `/docs/Domains/HumanCapital/PerformanceDevelopment/KPIs_And_Reviews.md` | 1 |
| 8 | HC-008 | Internal Documentation | domain-standard | `/docs/Domains/HumanCapital/KnowledgePortal/Internal_Documentation.md` | 1 |
| 9 | HC-009 | Employee Self-Service | domain-standard | `/docs/Domains/HumanCapital/ServicesWellness/Employee_Self_Service.md` | 1 |
| 10 | HC-010 | Advanced Reporting | domain-standard | `/docs/Domains/HumanCapital/HRAdvanced/Advanced_Reporting.md` | 1 |

---

## 3. Dependencies

- **Depends on:** `FIN-002` (GL posting for payroll), `EC-003` (RBAC)

## 4. Total Page Count: **10 pages**
