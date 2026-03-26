---
title: "External System Integrations"
domain: "API"
subdomain: ""
tier: 3
status: draft
task_id: "API-005"
template: "integration-event"
version: "1.0.0"
created: "2026-03-26"
last_updated: "2026-03-26"
word_count: 451
---

# External System Integrations

## Overview

External system integrations allow ACCSYSTEM to exchange data with third-party platforms such as government regulatory portals, payment gateways, and enterprise partners. At the time of writing, the system's implemented external integration is the ZATCA e-invoicing compliance interface for Saudi Arabia. Future integrations are anticipated through the Platform domain's planned IntegrationHub subdomain, which is not yet implemented.

## ZATCA E-Invoicing Integration

The ZATCA (Zakat, Tax and Customs Authority) integration provides compliance with Saudi Arabia's mandatory e-invoicing regulations. It is implemented within the Finance / TaxCompliance domain.

### Integration Points

| Component | Location | Purpose |
|-----------|----------|---------|
| ZatcaEinvoice model | Finance / TaxCompliance | Stores the e-invoice record, QR code hash, UUID, and submission status |
| QRCodeService | Shared / Services | Generates TLV-encoded QR codes for e-invoice presentation |
| ZatcaEinvoiceFactory | database/factories | Test data generation for ZATCA compliance scenarios |

### TLV QR Code Generation

Each e-invoice includes a ZATCA-compliant QR code encoded using the Tag-Length-Value (TLV) format. The QRCodeService in the Shared domain encodes the required ZATCA fields (seller name, VAT registration number, timestamp, invoice total, VAT amount) as a base64 TLV string. In the current implementation, the backend returns the TLV string and the frontend is responsible for rendering the QR code image. A future enhancement will move QR image generation to the backend using a PHP QR code library.

## Compliance Pull Endpoints

<!-- [ASSUMPTION] -->
The Platform domain README references "External Pull Endpoints" under its Compliance capability. These are inferred to be ZATCA or equivalent regulatory pull endpoints that allow the authority to query invoice data from ACCSYSTEM directly. No implementation of these endpoints was found in the codebase; this capability appears to be planned rather than implemented.

## Future Integrations (Planned)

The following integrations are anticipated in the development roadmap based on the Platform domain README but are not yet implemented:

| Integration Type | Planned Component | Status |
|-----------------|-------------------|--------|
| Outbound webhook dispatching | Platform / IntegrationHub | Future expansion |
| External API gateway | Platform / IntegrationHub | Future expansion |
| SDK for third-party developers | Platform / IntegrationHub | Future expansion |

## Known Constraints

- The QRCodeService `generateImage()` method throws a `not yet implemented` exception; production deployments that require QR image files must implement this method using an approved PHP library.
- There is no retry or dead-letter queue mechanism for failed outbound integrations in the current codebase.
- ZATCA submission status tracking fields exist on the ZatcaEinvoice model but the automated submission client is not visible in the reviewed source.
