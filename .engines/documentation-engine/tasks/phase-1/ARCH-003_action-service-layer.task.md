# Task: ARCH-003 — Action & Service Layer

---

## Metadata

| Field | Value |
|-------|-------|
| **Task ID** | ARCH-003 |
| **Phase** | 1 |
| **Domain** | Architecture |
| **Tier** | 2 |
| **Template** | `architecture-decision-record` |
| **Output Path** | `/docs/Architecture/Action_And_Service_Layer.md` |
| **Page Count** | 1 |
| **Dependencies** | ARCH-002 |

---

## Objective

Document the Action and Service Layer pattern used across accore. Explain the distinction between Actions (single-responsibility entry points) and Services (reusable business logic), their responsibilities, and the rules governing their usage.

---

## Input Files / Folders

| Type | Path | Purpose |
|------|------|---------|
| Actions | `backend/app/Domains/Finance/GeneralLedger/Actions/` | Representative Action files |
| Services | `backend/app/Domains/Finance/GeneralLedger/Services/` | Representative Service files |
| Shared | `backend/app/Domains/Shared/Actions/` | Shared action patterns |
| Shared | `backend/app/Domains/Shared/Services/` | Shared service patterns |

---

## Forbidden Assumptions

1. Do NOT equate Actions with Controllers — verify the actual execution flow.
2. Do NOT assume Services are stateless — verify from code.
