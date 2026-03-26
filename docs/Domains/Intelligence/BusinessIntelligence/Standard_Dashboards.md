---
title: "Standard Dashboards"
domain: "Intelligence"
subdomain: "BusinessIntelligence"
tier: 1
status: draft
task_id: "INT-002"
template: "domain-standard"
version: "1.0.0"
created: "2026-03-26"
last_updated: "2026-03-26"
word_count: 543
---

# Standard Dashboards

## Business Context & Objective

The BusinessIntelligence subdomain delivers the executive and operational dashboards that senior management and department heads use to monitor organizational health in real time. Rather than requiring users to navigate individual transactional screens or run manual reports, the dashboard aggregates metrics from across the Finance, Commercial, and SupplyChain domains into a single structured response. Business leaders need an at-a-glance view of revenue performance, cost position, receivables exposure, and operational risk indicators such as stock-outs and product expiry. The dashboard is designed as a single API endpoint with a detail parameter that enables drill-down into specific operational segments.

## Domain Entities

The BusinessIntelligence subdomain contains no persistent entities of its own. All data is derived from transactional records owned by other domains and computed at query time.

## Dashboard Metrics

The executive dashboard returns the following metric groups in a single response:

| Metric Group | Description | Source |
|-------------|-------------|--------|
| Total Net Revenue | Cumulative net credit-minus-debit sum on Revenue GL accounts | Finance / GeneralLedger |
| Today's Sales | Revenue GL entries posted on today's date | Finance / GeneralLedger |
| Total Expenses | Cumulative net debit-minus-credit sum on Expense GL accounts | Finance / GeneralLedger |
| Net Profit | Total Net Revenue minus Total Expenses | Derived |
| AR Balance | Sum of open accounts receivable transactions | Commercial / RevenueReceivables |
| AP Balance | Sum of open accounts payable transactions | Finance / AP |
| Invoice Count | Count of invoices in a defined period | Commercial / SalesLifecycle |
| Low Stock Alerts | Products with stock_quantity below 10 units | SupplyChain / Inventory |
| Expiring Soon | Purchases with an expiry_date within the next 30 days | SupplyChain / Procurement |

## Detail Drill-Down Endpoints

Two detail-mode responses are available by passing a `detail` parameter:

| detail Value | Response Content |
|-------------|-----------------|
| `low_stock` | Product list ordered by ascending stock_quantity for all items below the 10-unit threshold |
| `expiring_soon` | Purchase-linked product list with expiry_date within the next 30 calendar days |

## Key Operations

**GetDashboardDataAction** computes and returns the core multi-metric dashboard payload. Permissions are not explicitly required for this action, making it available to authenticated users with reporting access. All financial metrics are derived from the General Ledger as the single source of truth.

**ShowExecutiveDashboardAction** is an enhanced version of the dashboard that adds a sales breakdown by payment type (cash, credit, and other methods), sourced from GL entries joined to Invoice records by reference_id. It requires the `reports → view` permission.

## Business Rules & Constraints

1. All financial metrics are derived from the General Ledger; invoice-level data is not the source of truth for revenue or expense figures. This ensures that revenue is recognized only when GL entries are posted, not merely when an invoice is issued.
2. The low-stock threshold of 10 units is defined in the application logic, not in a configurable setting; changing the threshold requires a code change.
3. The expiring_soon window of 30 calendar days is also application-defined and not configurable at runtime.

## Assumptions & Open Questions

<!-- [ASSUMPTION] -->
The AP balance metric is inferred from the dashboard structure and GL account type patterns; no explicit AP balance query was identified in the GetDashboardDataAction source reviewed. Business confirmation of the AP balance computation method is required.
