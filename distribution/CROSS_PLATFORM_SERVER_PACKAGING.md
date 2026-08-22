# ACCORE ERP server packaging contract

## Product boundary

A server package contains only the server agent, the verified embedded runtime, the Laravel application payload, and its service-manager definition. The client desktop application remains a control surface and never owns the database process. This preserves a single service owner and prevents a desktop update from silently replacing a running server runtime.

| Platform | Server Desktop deliverable | Headless deliverable | Service manager | Durable data root |
|---|---|---|---|---|
| Windows x64 | Signed Tauri MSI/NSIS bundle | NSIS silent installer | Windows Service Control Manager | `%ProgramData%\\ACCORE ERP\\Server` |
| Linux x64 | AppImage, DEB, and RPM Tauri bundle | DEB, RPM, and tarball | systemd | `/var/lib/accore-erp/server` |
| macOS Intel and Apple Silicon | DMG/App bundle | unsigned PKG | launchd | `/Library/Application Support/ACCORE ERP/Server` |

## Security contract

The headless installer is the only component that creates or removes an operating-system service. It installs an agent owned by the system administrator, with private runtime data accessible only to the service account or root. Public status receipts are strictly read-only. Server Desktop delegates lifecycle operations to the agent through an elevation boundary and does not directly start MariaDB, FrankenPHP, or the Laravel queue.

Linux units run as an unprivileged `accore` service account and use a `Type=exec` systemd unit. macOS uses a root-owned `LaunchDaemon` property list with non-writable permissions; the agent stays in the foreground for launchd supervision. Windows retains the existing SCM service model.

## Runtime supply chain

All runtime downloads are versioned and verified with a SHA-256 digest before staging. Linux uses the official FrankenPHP binary and MariaDB systemd binary tarball. macOS uses the official FrankenPHP binary and a MariaDB source build performed in CI from the verified source tarball; the built runtime is bundled, so no compiler, PHP, Node.js, Rust, Homebrew, or database tooling is required on an end-user machine.

macOS packages will remain unsigned and unnotarized until Apple Developer ID and notarization credentials are supplied. The release pipeline must make this state explicit rather than imply Gatekeeper trust.

## References

The systemd reference recommends `Type=exec` for long-running services whose executable and service-user setup must be validated before the unit is considered started. Apple requires global launch daemons to be root owned and not writable by group or world; a launchd-managed process must not daemonize itself.

[1] https://www.freedesktop.org/software/systemd/man/systemd.service.html
[2] https://developer.apple.com/library/archive/documentation/MacOSX/Conceptual/BPSystemStartup/Chapters/CreatingLaunchdJobs.html
[3] https://frankenphp.dev/docs/
[4] https://mariadb.com/docs/server/server-management/install-and-upgrade-mariadb/installing-mariadb/binary-packages/installing-mariadb-binary-tarballs
