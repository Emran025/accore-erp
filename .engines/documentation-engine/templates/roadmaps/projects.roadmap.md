# Projects Domain Roadmap

> **Domain:** Projects
> **Bounded Context:** `backend/app/Domains/Projects/`
> **Phase:** 3

---

## 1. Subdomains

| Subdomain | Codebase Path | Description |
|-----------|--------------|-------------|
| ProjectFinance | `Projects/ProjectFinance/` | WBS, cost tracking, project budgets |
| ProjectPlanning | `Projects/ProjectPlanning/` | Resource allocation, scheduling |
| ExecutionTracking | `Projects/ExecutionTracking/` | Milestones, progress, deliverables |

---

## 2. Task Execution Order

| Order | Task ID | Title | Template | Output Path | Pages |
|-------|---------|-------|----------|-------------|-------|
| 1 | PRJ-001 | Projects Overview | domain-overview | `/docs/Domains/Projects/Overview.md` | 1 |
| 2 | PRJ-002 | WBS & Cost Tracking | domain-standard | `/docs/Domains/Projects/ProjectFinance/WBS_And_Cost_Tracking.md` | 1 |
| 3 | PRJ-003 | Resource Allocation | domain-standard | `/docs/Domains/Projects/ProjectPlanning/Resource_Allocation.md` | 1 |
| 4 | PRJ-004 | Milestones & Progress | domain-standard | `/docs/Domains/Projects/ExecutionTracking/Milestones_And_Progress.md` | 1 |

---

## 3. Dependencies

- **Depends on:** `FIN-006` (Cost Centers), `HC-004` (Timesheets)

## 4. Total Page Count: **4 pages**
