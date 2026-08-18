# Accore Artifact Contract and Shared Runtime Cache

**Status:** Proposed implementation contract
**Date:** 2026-08-18
**Related issues:** #38, #40, #42, #51, #52
**Related ADRs:** ADR-004, ADR-005, ADR-007

## Purpose

This contract defines the only artifacts that an Accore bootstrapper, Server Agent, or desktop installer may download, import, cache, extract, or activate. It provides a single verification path for online installation, resumed download, and externally downloaded offline packages. The contract is deliberately independent of developer tools: a release artifact is a signed immutable object, not an `npm`, Composer, PHP, MySQL, or Node.js installation on the customer device.

> **Invariant:** A cache object is an immutable release dependency. Customer databases, ERP business records, secret keys, connection credentials, access tokens, and private configuration are never cache objects.

## Storage Boundary

The reference Windows layout uses a machine-scoped `ACCORERUNTIME_HOME`; the platform adapter supplies the actual operating-system path. The implementation introduced in `frontend/src-tauri/src/distribution/` creates only the following cache directories.

| Path below `ACCORERUNTIME_HOME` | Contents | Persistence and protection |
|---|---|---|
| `cache/objects/sha256/<digest>` | Verified immutable artifact bytes | Content-addressed; reusable by supported product releases |
| `cache/objects/sha256/<digest>.metadata.json` | Non-secret object metadata | Contains no source URL, credentials, or customer information |
| `cache/staging/<digest>.part` | Incomplete resumable download | Never extracted or activated until size and SHA-256 verification pass |
| `cache/locks/<digest>.lock` | Per-object installation lock | Serialises concurrent imports/downloads of one digest |
| `cache/references/*.json` | Product-to-object reference records | Used only to prevent reclamation of a currently referenced immutable object |

The cache implementation never accepts caller-controlled file paths for objects. It derives object and staging paths solely from a validated lowercase SHA-256 digest. Its reference metadata contains product, artifact identity, version, operating system, and architecture only.

## Manifest Schema

`ReleaseManifest` is JSON and currently supports schema version `1`. A manifest is invalid unless all structural, signature, artifact, and dependency validations succeed before an artifact is extracted or activated.

| Manifest field | Rule |
|---|---|
| `schema_version` | Must equal `1`; an unknown schema is rejected rather than guessed. |
| `channel` | Lowercase release token, such as `stable` or `preview`. |
| `product` | `server` or `client`; every artifact must match it. |
| `release_version` | SemVer release version. |
| `generated_at` and `source_revision` | Required release audit data; source revision must be a 7–64 character hexadecimal revision. |
| `artifacts` | Non-empty, strictly sorted by artifact identifier, unique, and acyclic. |
| `signature` | Trusted `key_id` plus standard Base64 Ed25519 signature. |

Each `ArtifactDescriptor` contains an immutable identity, kind, product, SemVer version, operating system, architecture, HTTPS source URL, lowercase SHA-256 digest, byte size, compatibility constraints, and prerequisite artifact identifiers. The current contract accepts the following kinds: `bootstrapper`, `desktop_application`, `api_runtime`, `database_runtime`, `migration_bundle`, `runtime_dependency`, and `offline_bundle`.

The signed bytes are the canonical JSON serialization of every manifest field except the detached signature. The schema uses ordered arrays—not arbitrary maps—for artifacts and dependencies so the release system can reproduce the exact signing payload deterministically. A bootstrapper selects the public key by `key_id`; an unknown key, non-Base64 key/signature, invalid signature, invalid digest, insecure source URL, missing dependency, duplicate dependency, cycle, or incompatible schema is a hard failure.

## Cache and Download Protocol

An online bootstrapper requests a manifest through a separately trusted release channel, verifies it with the installed public-key set, and selects only artifacts compatible with its product, operating system, architecture, and bootstrapper version. It acquires a lock for the artifact digest before checking the existing object or writing staging bytes. The offset of `<digest>.part` is the only permitted resume offset.

After the downloader receives the required byte range, the cache verifies both exact byte size and SHA-256. Only then does it atomically move the staging file into `objects/sha256`, write non-secret metadata, and add a product reference. If the process stops before verification, the part remains resumable but inactive. If another process wins the object lock and has already activated a verified object, the second process reuses it rather than writing a duplicate object.

| Scenario | Required behaviour |
|---|---|
| First online installation | Verify signed manifest, write staging object, verify size and SHA-256, then atomically activate and reference it. |
| Interrupted download | Preserve `<digest>.part`; request only the remaining range after re-verifying the release manifest. |
| Concurrent installers | Serialize one digest with `<digest>.lock`; reuse a verified object after lock release. |
| Offline package import | Read external bytes into staging and apply exactly the same size/digest verification before activation. |
| Modified package | Reject before activation; no object or reference is created. |
| Cache reclamation | Remove only content-addressed objects that have no valid reference; never traverse into data, database, configuration, or secret roots. |

## Trust and Key Custody

The manifest contract verifies signatures but does not create, export, or store private release keys. Per ADR-007, release private keys remain in approved release automation or a designated secret-management system. Trusted public keys are immutable bootstrapper configuration and are rotated by a separately signed release policy. A successful signature does not waive compatibility, artifact digest, platform, or product checks.

## Implementation Surface

| File | Responsibility |
|---|---|
| `frontend/src-tauri/src/distribution/artifact_contract.rs` | Typed manifest schema, canonical unsigned payload, Ed25519 verification, SemVer compatibility data, SHA-256 verification, dependency graph validation, and adversarial unit tests. |
| `frontend/src-tauri/src/distribution/cache.rs` | Content-addressed cache, deterministic staging paths, locks, offline import, atomic activation, references, and reclamation. |
| `frontend/src-tauri/src/distribution/mod.rs` | Stable module boundary for future bootstrapper and Server Agent integrations. |

The contract does not yet download remote artifacts, create operating-system services, package MySQL/MariaDB, or activate a Laravel runtime. Those responsibilities belong to the following installer, runtime, and release lifecycle issues and must consume this verified contract rather than inventing a second cache or signature path.

## Verification Evidence

The unit suite verifies valid signed manifests, tamper detection, dependency ordering/cycle rejection, SHA-256 mismatch handling, altered offline package rejection, resumable staging, concurrent import serialization, and reference-based cache reclamation. CI must execute `cargo test` for this module on supported platforms before an installer consumes the cache in production.

## References

[1]: ./Accore_Server_Client_Distribution_Plan.md "Accore Server and Client Distribution Plan"
[2]: ../Architecture/ADR-004-accore-self-contained-distribution-platform.md "ADR-004: Self-Contained Distribution Platform"
[3]: ../Architecture/ADR-007-release-signing-service-lifecycle-and-recovery.md "ADR-007: Release Signing, Server Lifecycle, and Recovery Authority"
