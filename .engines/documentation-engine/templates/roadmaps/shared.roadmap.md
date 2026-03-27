# Shared Domain Roadmap

> **Domain:** Shared
> **Bounded Context:** `backend/app/Domains/Shared/`
> **Phase:** 3

---

## 1. Subdomains

| Subdomain | Codebase Path | Description |
|-----------|--------------|-------------|
| Actions | `Shared/Actions/` | Cross-domain reusable actions |
| DTOs | `Shared/DTOs/` | Standard data transfer objects |
| Services | `Shared/Services/` | Cross-domain utility services |

---

## 2. Task Execution Order

| Order | Task ID | Title | Template | Output Path | Pages |
|-------|---------|-------|----------|-------------|-------|
| 1 | SHR-001 | Shared Overview | domain-overview | `/docs/Domains/Shared/Overview.md` | 1 |
| 2 | SHR-002 | Value Objects (Currencies & Measurements) | domain-standard | `/docs/Domains/Shared/ValueObjects/Currencies_And_Measurements.md` | 1 |
| 3 | SHR-003 | Standard DTOs & Responses | domain-standard | `/docs/Domains/Shared/DataTransferObjects/Standard_Responses.md` | 1 |

---

## 3. Dependencies

- **Depends on:** `ARCH-003` (Action Layer pattern)

## 4. Total Page Count: **3 pages**
