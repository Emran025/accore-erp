# ADR-009: Server Headless Silent Windows Distribution

**Status:** Proposed
**Date:** 2026-08-22
**Decision owner:** Distribution, platform, and operations architecture

## Context

The published `desktop-v0.0.1` release contains a graphical **Server Desktop** installer and a Client installer. It does not contain a separately packaged Server Headless product. The Server Agent already models `server-headless` ownership, but that ownership model is not a distributable non-interactive Windows Server installation.

This distinction is operationally material. A terminal, virtual private server, or enterprise software-deployment environment needs an installation entry point that registers and starts the protected Windows service without launching a Tauri window, a browser-like control surface, or an interactive first-run flow. The packaging lane must remain separate from Server Desktop so an administrator can select an explicit operational model rather than receiving a hidden behavioral variant of the graphical application.

Tauri documents that Windows setup executables are built with NSIS and support non-interactive invocation; a Tauri Desktop installer is not, by itself, a sufficient Headless product boundary.[1] The existing Windows Agent lifecycle decision also requires the service and its durable data to be protected with machine-level permissions.[2]

## Decision

ACCORE will deliver **Server Headless** as a distinct Windows x64 distribution product with its own installer artifact, release-manifest descriptor, product identifier, and acceptance contract. It is not an option, command-line switch, or reduced visual mode of Server Desktop.

| Product         | Delivery surface                           | Runtime owner             | User-interface behavior                       | Update lane                                                                        |
| --------------- | ------------------------------------------ | ------------------------- | --------------------------------------------- | ---------------------------------------------------------------------------------- |
| Server Desktop  | Tauri Windows installer                    | `server-desktop`          | Local graphical operations surface            | Signed Tauri updater and Server Desktop release assets                             |
| Server Headless | Dedicated NSIS setup executable            | `server-headless`         | No application window; service-only operation | Signed Headless package/release contract, activated through elevated setup tooling |
| Client Desktop  | Tauri Windows, Linux, and macOS installers | No local server ownership | Graphical client surface                      | Signed Client updater and release assets                                           |

The Headless installer must be explicitly executable with `/S`, request Windows elevation, and run no Tauri binary. It installs the verified FrankenPHP, MariaDB, Laravel, and ACCORE Server Agent runtime beneath a protected machine program directory. It invokes the Agent with `claim --owner server-headless`; the Agent creates its protected ProgramData configuration and reconciles the Windows service. The installed service becomes the only long-lived process.

The installer must preserve customer-owned ProgramData on repair, update, and uninstall. It may remove only its executable and registration material through an explicit owner-aware Agent removal operation. It must never expose generated secrets in arguments, command output, release manifests, or public status files.

The initial Headless package binds the API to loopback until a separately reviewed remote-listener enrollment policy is supplied. Silent installation must not implicitly expose a LAN or public API listener.

## Acceptance Contract

The Windows release pipeline must create and test the Headless artifact independently of the Server Desktop matrix. The CI contract runs the Headless setup executable with `/S` in an elevated Windows context and verifies all of the following through public interfaces only:

1. No Tauri Desktop executable or webview process is launched by setup.
2. `ACCOREServerAgent` is registered as an Automatic Windows service whose service command references the installed Agent runtime.
3. The public receipt reports `ownerProduct: "server-headless"` and an active durable instance identity.
4. The public runtime status reaches `ready` and exposes no configuration path, password, private manifest, or backup catalog.
5. A non-owner Server Desktop attachment remains passive, while an authorized transition remains explicit.
6. Headless uninstall removes its service registration but preserves durable customer data and publishes a removed public receipt.
7. The produced release assets and signed manifest classify Headless separately from Server Desktop and Client products.

## Consequences

The build and release automation must gain a Headless Windows matrix entry rather than relabel the existing Server Desktop artifact. It must stage a dedicated installer asset and signed metadata entry, and it must not enroll this machine-level product in the graphical Tauri updater channel.

The existing `server-headless` Agent state-machine tests remain necessary but are insufficient. They must be complemented by a package-level silent-install contract. The separate Headless deliverable is release-blocking until those package and lifecycle contracts succeed.

## References

[1] [Tauri, Windows Installer](https://v2.tauri.app/distribute/windows-installer/)

[2] [ADR-005: Server Desktop Service Lifecycle and Operator Control](ADR-005-server-desktop-service-lifecycle.md)
