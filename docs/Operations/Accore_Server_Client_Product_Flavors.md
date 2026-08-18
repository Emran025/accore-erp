# Accore Server and Client Product Flavors

**Status:** Implemented build contract
**Date:** 2026-08-18
**Related issues:** #38, #41, #42, #43, #48, #49, #51, #52
**Related ADRs:** ADR-004, ADR-006, ADR-007

## Purpose

Accore ships two separately identifiable desktop products from one Next.js ERP frontend and one Rust/Tauri codebase. **Accore Server** is the operator-facing desktop surface for the machine that will later host the local Server Agent, API runtime, and database runtime. **Accore Client** is the employee-facing desktop surface that must be paired with a verified Accore Server before it can access ERP data.

> The product split is a release and trust boundary, not a fork of the ERP UI. Shared routes, domain code, assets, and application components remain in `frontend/`; only product configuration and product-gated runtime surfaces differ.

## Build Matrix

| Product | Tauri identifier | Update channel | Icon | API posture | Server management surface |
|---|---|---|---|---|---|
| Accore Server | `com.accore.erp.server` | `server-stable` | `icons/flavors/accore-server.png` | Loopback API at `http://127.0.0.1:8765/api` | Compiled only with `server-product`; actual service control arrives in Issue #43. |
| Accore Client | `com.accore.erp.client` | `client-stable` | `icons/flavors/accore-client.png` | No API access until a verified HTTPS server profile exists. | Absent from the compiled client command surface. |
| Development | `com.accore.erp` | `development` | Existing development icon | Existing non-production fallback only. | Not a distributable product. |

The Tauri CLI merges each flavor file over `src-tauri/tauri.conf.json` using its standard configuration-extension mechanism. Flavor files are not replacement projects; they are the release overlay for a shared base configuration.

## Commands

Run commands from `frontend/` after installing the locked Node dependencies.

| Purpose | Command |
|---|---|
| Develop Accore Server | `npm run desktop:server:dev` |
| Develop Accore Client | `npm run desktop:client:dev` |
| Build Accore Server bundle | `npm run desktop:server:build` |
| Build Accore Client bundle | `npm run desktop:client:build` |

Each command passes both a Tauri configuration overlay and one mutually exclusive Rust feature. `build.rs` stops compilation if `server-product` and `client-product` are enabled together or if a requested `ACCORE_PRODUCT_FLAVOR` conflicts with the selected feature.

## Trust Boundary

### Client behavior

A Client release has no silent `127.0.0.1:8000` fallback. In a production Client build, `NEXT_PUBLIC_ACCORE_CLIENT_PROFILE_VERIFIED=true` and a valid HTTPS `NEXT_PUBLIC_ACCORE_CLIENT_API_BASE` are both required to resolve an API base. Otherwise the root product gate replaces ERP routes with a pairing-required screen and `fetchAPI` returns a safe configuration error without sending a request.

The Client CSP permits only same-origin connections during this phase. The verified profile and its outbound connection bridge are introduced through the secure pairing work in Issues #48 and #49; this prevents a compile-time environment value from becoming an unvalidated cross-network privilege.

### Server behavior

A Server build exposes only a discovery command for its intended loopback API base. It does not claim to start, stop, or control a backend service yet. Issue #43 owns the Server Agent and service lifecycle. The server CSP permits only its loopback API origin in addition to application-local assets and explicitly approved Google font origins.

## Capability and Artifact Separation

The server-only `server_runtime_configuration` command is enclosed by the `server-product` Cargo feature. It is not registered in `client-product` builds and cannot be invoked from a Client artifact. Both flavors retain the minimal default Tauri capability (`core:default`) only; no filesystem, shell, process, database, or Server Agent permission is granted by this issue.

Release pipelines must preserve this separation by building each flavor with its documented script and by inspecting the resolved Tauri configuration before signing. A Client artifact must not be retargeted into a Server artifact by changing only a name or icon.

## Verification

The frontend test suite contains resolver tests for missing, unverified, insecure, and verified client API profiles; Server loopback resolution; and development-only fallback behavior. The Rust suite tests the compiled runtime profile. CI must build both flavor configurations on supported release platforms and reject a null release CSP.

## References

[1]: https://v2.tauri.app/develop/configuration-files/ "Tauri v2 Configuration Files"
[2]: https://v2.tauri.app/reference/cli/ "Tauri v2 Command Line Interface"
[3]: ../Architecture/ADR-004-accore-self-contained-distribution-platform.md "ADR-004: Self-Contained Distribution Platform"
[4]: ../Architecture/ADR-006-client-server-trust-and-network-boundary.md "ADR-006: Client–Server Trust and Network Boundary"
