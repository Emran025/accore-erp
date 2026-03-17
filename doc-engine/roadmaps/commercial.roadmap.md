# Commercial Domain Roadmap

> **Domain:** Commercial
> **Bounded Context:** `backend/app/Domains/Commercial/`
> **Phase:** 2

---

## 1. Subdomains

| Subdomain | Codebase Path | Description |
|-----------|--------------|-------------|
| CRM | `Commercial/CRM/` | Customer management, credit limits, journey tracking |
| MarketingDistribution | `Commercial/MarketingDistribution/` | Pricing tiers, campaigns, distribution channels |
| RevenueReceivables | `Commercial/RevenueReceivables/` | Accounts receivable, dunning, payment matching |
| SalesGovernance | `Commercial/SalesGovernance/` | Sales contracts, policies, approval workflows |
| SalesLifecycle | `Commercial/SalesLifecycle/` | Quote-to-cash process, sales orders, invoicing |

---

## 2. Task Execution Order

| Order | Task ID | Title | Template | Output Path | Pages |
|-------|---------|-------|----------|-------------|-------|
| 1 | COM-001 | Commercial Overview | domain-overview | `/docs/Domains/Commercial/Overview.md` | 1 |
| 2 | COM-002 | Customer Journey & Credit Limits | domain-standard | `/docs/Domains/Commercial/CRM/Customer_Journey_And_Credit_Limits.md` | 1 |
| 3 | COM-003 | Pricing Tiers & Campaigns | domain-standard | `/docs/Domains/Commercial/MarketingDistribution/Pricing_Tiers_And_Campaigns.md` | 1 |
| 4 | COM-004 | Accounts Receivable & Dunning | domain-standard | `/docs/Domains/Commercial/RevenueReceivables/Accounts_Receivable_And_Dunning.md` | 1 |
| 5 | COM-005 | Sales Contracts & Policies | domain-standard | `/docs/Domains/Commercial/SalesGovernance/Sales_Contracts_And_Policies.md` | 1 |
| 6 | COM-006 | Quote-to-Cash Process | lifecycle | `/docs/Domains/Commercial/SalesLifecycle/Quote_To_Cash_Process.md` | 1 |

---

## 3. Dependencies

- **Depends on:** `FIN-002` (GL for AR posting), `EC-003` (RBAC)
- **Blocks:** None in Phase 2

## 4. Total Page Count: **6 pages**
