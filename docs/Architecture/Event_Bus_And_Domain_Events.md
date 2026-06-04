---
title: "ADR-004: Event Bus & Domain Events"
domain: "cross-cutting"
subdomain: ""
tier: 2
status: approved
task_id: "ARCH-004"
template: "architecture-decision-record"
version: "1.0.0"
created: "2026-03-18"
last_updated: "2026-03-18"
word_count: 575
---

# ADR-004: Event Bus & Domain Events

## Context
accore ERP's Bounded Context Map (documented in `SYS-002`) requires a mechanism for domains to notify others of significant state changes without creating direct, tightly-coupled dependencies. For instance, when the `Commercial` domain finalizes a sales invoice, the `Finance` domain may need to update the General Ledger, while the `Intelligence` domain may need to refresh its real-time analytics dashboards. Standard Laravel applications often rely on synchronous "Service Observers," but this approach can lead to performance bottlenecks and makes it difficult to manage complex, multi-domain side effects.

## Decision
We have decided to implement a robust, event-driven architecture based on an **Asynchronous Event Bus**. This architecture distinguishes between two types of events:

1.  **Domain Events (Internal)**: Events emitted and consumed within the same Bounded Context (e.g., within `GeneralLedger`). These may be synchronous for immediate secondary tasks.
2.  **Integration Events (Cross-Domain)**: Events emitted by a Bounded Context to be consumed by other, distant domains. These MUST be dispatched via the shared **Event Bus** and MUST be processed asynchronously.

The Event Bus will be the primary mechanism for all non-financial, non-transactional cross-domain communication.

## Rationale
*   **Decoupling**: The publishing domain (e.g., `SupplyChain`) does not need to know which or how many domains are interested in its events. This allows for horizontal scaling of the development team and the system itself.
*   **Fault Tolerance**: By using an asynchronous bus (backed by a persistent queue such as Redis or a database-backed Job log), we ensure that a failure in a subscriber (e.g., a dashboard update) does not block the primary business process (e.g., confirming a shipment).
*   **Audit-Ready Architecture**: Every Integration Event becomes a canonical record of a business transition, facilitating high-level auditing and the creation of "temporal" reports (Event Sourcing potential).
*   **System Performance**: Offloading non-critical work to background listeners preserves the responsiveness of the stateless API, crucial for a high-performance ERP interface.

## Alternatives Considered
*   **Synchronous Observers**: Rejected as the primary cross-domain mechanism. While effective for simple intra-domain side effects, they create brittle, cross-context dependencies that violate DDD boundaries.
*   **Direct Service Injections**: Rejected for cross-domain notifications. Leads to circular dependencies and makes the system increasingly difficult to test.

## Consequences
### Positive
*   True architectural decoupling between Bounded Contexts.
*   Improved user experience through asynchronous processing of side effects.
*   Established standard for horizontal system expansion (adding new subscribers without touching publishers).
*   Simplified auditing of inter-domain workflows.

### Negative / Trade-offs
*   **Eventual Consistency**: Developers must account for the fact that secondary side effects may not be visible immediately after an Action returns.
*   **Infrastructure Complexity**: Requires the setup and monitoring of a queue-driven background worker system (e.g., Laravel Horizon).
*   **Error Handling Complexity**: Requires standardized retry policies and dead-letter queues for failed subscribers.

## Implementation Standard
All events in accore must extend a base `EnterpriseEvent` class to ensure consistent metadata (tenant identification, audit context, and correlation IDs). Integration Events MUST be dispatched using a dedicated `EventBus` interface to allow for future swaps between different messaging backends (e.g., Redis, RabbitMQ, or NATS). <!-- [ASSUMPTION] -->

## Status
`accepted`

## Related Decisions
*   **SYS-005**: Cross-Domain Integration Patterns (The conceptual use of these events).
*   **ARCH-002**: Domain-Driven Design in Laravel (Events as a mechanism for crossing domain boundaries).
*   **ARCH-003**: Action & Service Layer (Actions as the primary publishers of events).
