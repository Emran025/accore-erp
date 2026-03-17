# Assets Domain Roadmap

> **Domain:** Assets
> **Bounded Context:** `backend/app/Domains/Assets/`
> **Phase:** 3

---

## 1. Subdomains

| Subdomain | Codebase Path | Description |
|-----------|--------------|-------------|
| AssetLifecycle | `Assets/AssetLifecycle/` | Acquisition, depreciation, disposal |
| Investments | `Assets/Investments/` | Investment tracking, valuation |

---

## 2. Task Execution Order

| Order | Task ID | Title | Template | Output Path | Pages |
|-------|---------|-------|----------|-------------|-------|
| 1 | AST-001 | Assets Overview | domain-overview | `/docs/Domains/Assets/Overview.md` | 1 |
| 2 | AST-002 | Acquisition, Depreciation & Disposal | lifecycle | `/docs/Domains/Assets/AssetLifecycle/Acquisition_Depreciation_Disposal.md` | 1 |
| 3 | AST-003 | Investment Tracking | domain-standard | `/docs/Domains/Assets/Investments/Investment_Tracking.md` | 1 |

---

## 3. Dependencies

- **Depends on:** `FIN-002` (depreciation posts to GL)

## 4. Total Page Count: **3 pages**
