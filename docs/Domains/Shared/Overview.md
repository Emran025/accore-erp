---
title: "Shared — Domain Overview"
domain: "Shared"
subdomain: ""
tier: 1
status: draft
task_id: "SHR-001"
template: "domain-overview"
version: "1.0.0"
created: "2026-03-26"
last_updated: "2026-03-26"
word_count: 453
---

# Shared — Domain Overview

## Business Purpose

The Shared domain provides the cross-cutting base classes and utility services that are used by every other domain in ACCSYSTEM. It does not implement any business logic or own any transactional data; its purpose is to establish and enforce architectural contracts that govern how all actions respond, how data is transferred between layers, and how common utility operations such as QR code generation are performed. Domain authors, backend engineers, and technical architects are the primary users. Every new domain and subdomain in the system builds on the Shared foundation.

## Bounded Context Boundaries

The Shared domain owns the abstract base class definitions for Actions and DTOs, and any utility services that are not specific to a single business domain. It does not own any domain entities, does not write to any database tables, and is never a recipient of domain events. All other domains depend on Shared; Shared itself has no upstream domain dependencies.

## Core Components

| Component | Class / Namespace | Role |
|-----------|-------------------|------|
| Action (base) | `Shared\Actions\Action` | Abstract base class for all Single Action Classes (SACs); defines the `__invoke()` contract and provides standardized response helpers. |
| DataTransferObject (base) | `Shared\DTOs\DataTransferObject` | Abstract base class for all domain DTOs; enforces `fromRequest()`, `fromArray()`, and `toArray()` contracts. |
| QRCodeService | `Shared\Services\QRCodeService` | Utility service for generating ZATCA-compliant TLV-encoded QR codes used in e-invoicing. |

## Architectural Contracts

**The Action Contract** establishes that every business operation in the system is a Single Action Class implementing a public `execute(array $data)` method. The base class provides three shared response constructors: `successResponse()` for standard success payloads, `errorResponse()` for structured error payloads with an HTTP status code, and `paginatedResponse()` for list results with pagination metadata.

**The DTO Contract** establishes that inter-layer data exchange uses typed DTO objects rather than raw arrays. Every DTO must implement three factory methods: `fromRequest()` constructs a DTO from an HTTP Request; `fromArray()` constructs a DTO from a plain data array for testing or programmatic use; and `toArray()` serializes the DTO for downstream consumption by models or services.

## Documentation Scope

| Document | Task ID | Status |
|----------|---------|--------|
| Shared Domain Overview | SHR-001 | draft |
| Value Objects (Currencies and Measurements) | SHR-002 | draft |
| Standard DTOs and Responses | SHR-003 | draft |
