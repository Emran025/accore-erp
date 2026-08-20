# ADR-004: Server Desktop Runtime and Durable Storage

**Status:** Accepted
**Date:** 2026-08-20
**Decision owner:** Desktop, platform, backend, and operations architecture

## Context

`ACCORE ERP Server Desktop` must be a self-contained local ERP server product, not merely a webview configured to call `127.0.0.1`. The first production target is a single Windows x64 workstation. It must operate without XAMPP, a separately installed PHP distribution, Node.js, or an externally installed database server.

The product requires a production PHP application runtime, a MySQL-compatible durable database, isolated machine-scoped data, repeatable Laravel provisioning, and an upgrade path that never treats business data as a release asset.

## Decision

The Windows x64 Server Desktop distribution packages two signed runtime components:

| Component | Decision | Responsibility |
|---|---|---|
| API runtime | FrankenPHP with the ACCORE Laravel application and its production Composer dependencies | Serves the loopback API at `127.0.0.1:8765`; runs approved Laravel maintenance commands. |
| Database runtime | MariaDB ZIP runtime in a private machine-scoped installation | Serves MySQL-compatible storage at `127.0.0.1:3307`; never exposes a LAN listener. |
| Durable data | `%ProgramData%\\ACCORE ERP\\Server` | Stores database files, Laravel storage, runtime logs, backups, generated secrets, and diagnostics. |
| Immutable runtime | `%ProgramFiles%\\ACCORE ERP Server Desktop\\runtime` | Contains versioned executables and application assets only; it is replaceable by signed updates. |

FrankenPHP is chosen because its official distribution provides standalone binaries for Windows, macOS, and Linux and includes PHP in the Windows archive.[1] MariaDB ZIP is chosen for the Windows bootstrap because it supports private initialization with `mariadb-install-db.exe` and direct service execution without a global product installation.[2]

The product does **not** run `php artisan serve`, Node.js, or a developer server in production. Node.js remains a build-time frontend dependency only.

## Storage and provisioning policy

The bootstrapper creates the durable directories before any database or API process starts. It generates an application secret and a non-root local database credential, writes them to a restricted configuration file, initializes the data directory once, creates the `accore_app` principal, and executes only approved Laravel commands: `config:cache`, `migrate`, `migrate:status`, `queue:restart`, and `storage:link`.

Database files, uploaded documents, session data, cache, keys, and backups never reside under the immutable runtime directory or the release cache. A runtime update may be rolled back without replacing customer data.

## Consequences

The first supported self-contained target is Windows x64. Linux and macOS retain the same service and manifest contracts but remain unsupported for self-contained database packaging until their platform resources, service registrations, licensing review, and operational validation are delivered.

The installer and release pipeline must download or build pinned runtime inputs, validate their SHA-256 values, include their licenses and notices, and publish them only as signed ACCORE runtime packages. A desktop UI cannot claim a local server is available until the database and API readiness probes both pass.

## Validation

The release gate must execute a clean-machine bootstrap test: initialize a new data root, start MariaDB, run Laravel migration, start the API, verify `/up`, create a backup, restart the agent, and verify that the persisted data root survives the restart and a runtime replacement.

## References

[1] [FrankenPHP standalone binary documentation](https://frankenphp.dev/docs/)
[2] [MariaDB Windows ZIP package installation](https://mariadb.com/docs/server/server-management/install-and-upgrade-mariadb/installing-mariadb/binary-packages/installing-mariadb-windows-zip-packages)
