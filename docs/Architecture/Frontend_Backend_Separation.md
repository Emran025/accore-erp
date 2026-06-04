---
title: "ADR-001: Frontend-Backend Separation"
domain: "cross-cutting"
subdomain: ""
tier: 2
status: approved
task_id: "ARCH-001"
template: "architecture-decision-record"
version: "1.0.0"
created: "2026-03-18"
last_updated: "2026-03-18"
word_count: 565
---

# ADR-001: Frontend-Backend Separation

## Context
Traditional enterprise ERP systems often utilized monolithic architectures where the user interface (UI) and business logic were tightly coupled within a single application server. This approach frequently led to "View Pollution," where presentation logic and database queries were mixed, making the system difficult to test, scale, and modernize. As accore ERP aims for a modular, Domain-Driven Design (DDD) compliant architecture capable of supporting diverse client types (web, desktop, mobile), the coupling of UI to the PHP backend was identified as a primary technical risk.

## Decision
We have decided to architect accore ERP as two distinct, decoupled applications:
1.  **Backend**: A stateless Laravel-based API responsible for business logic, financial integrity, and data persistence.
2.  **Frontend**: A Next.js-based contemporary web application responsible for user experience, data visualization, and client-side state management.

All communication between these layers MUST occur via a versioned RESTful API (`/api/v2/`) using JSON as the data exchange format.

## Rationale
The separation was chosen over a monolithic (Blade/Livewire) approach for the following reasons:
*   **Technology Independence**: The backend remains focused on ERP stability and financial correctness using PHP/Laravel, while the frontend can leverage the modern React/Next.js ecosystem for a premium, highly interactive user experience.
*   **Parallel Development**: Development teams can work on the API and the UI simultaneously, provided the API contract (documented in Tier 3) is respected.
*   **Multi-Client Support**: By exposing all capabilities via a stateless API, we enable the addition of mobile apps or third-party integrations (Integration Hub) without modifying the core business logic.
*   **Scalability**: The frontend and backend can be scaled independently. The stateless API is naturally suited for horizontal scaling behind a load balancer.
*   **Deployment Flexibility**: The frontend can be deployed to edge networks (CDN) for global performance, while the backend remains in a secure, audited environment.

## Alternatives Considered
*   **Monolithic Laravel (Blade + Livewire)**: Rejected. While faster to scaffold initially, it tightly couples the UI to the PHP runtime, making it difficult to support non-web clients and creating a "thick" backend that is harder to scale and maintain.
*   **Inertia.js**: Rejected. While Inertia provides a modern SPA feel with Laravel, it still maintains a level of coupling between the two layers that limits true technology independence and third-party API consumption.

## Consequences
### Positive
*   Clearer separation of concerns (Business Logic vs. Presentation).
*   Improved testability; both layers can be unit and integration tested in isolation.
*   Ability to use dedicated tooling for each environment (e.g., Vitest for frontend, PHPUnit for backend).
*   Enforcement of a "Contract-First" mindset across the engineering team.

### Negative / Trade-offs
*   **Initial Overhead**: Requires managing two separate codebases, deployment pipelines, and environment configurations.
*   **CORS & Security**: Introduces requirements for managing Cross-Origin Resource Sharing (CORS) and implementing stateless authentication (JWT/Sanctum).
*   **Data Serialization**: Requires explicit transformation logic (DTOs/Resources) to convert internal domain models into API-friendly JSON structures.

## Status
`accepted`

## Related Decisions
*   **ARCH-002**: DDD in Laravel (Defines the internal structure of the Backend).
*   **ARCH-003**: Action & Service Layer (Defines how the API interacts with Business Logic).
*   **DEV-001**: Frontend Styling Standards (Defines the look and feel of the Next.js app).
