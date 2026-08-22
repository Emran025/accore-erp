# ACCORE ERP Server Headless for Windows

**Baseline:** `0.0.1`

**Audience:** Windows Server, terminal-server, and remote-host administrators.

## Purpose

ACCORE ERP Server Headless is the non-interactive Windows x64 distribution of the self-contained ACCORE server. It installs the same verified FrankenPHP, MariaDB, Laravel, queue, protected backup, and `ACCOREServerAgent` service stack as Server Desktop, but it does not launch a Tauri window, browser surface, PowerShell window, or interactive server-setup workflow.

| Property | Server Desktop | Server Headless |
|---|---|---|
| Intended host | A local Windows workstation | Windows Server, terminal server, or Windows VPS |
| UI after installation | Server Desktop UI | No application UI |
| Service | `ACCOREServerAgent` | `ACCOREServerAgent` |
| Data location | `%ProgramData%\ACCORE ERP\Server` | `%ProgramData%\ACCORE ERP\Server` |
| Default API listener | `127.0.0.1:8765` | `127.0.0.1:8765` |
| Database listener | `127.0.0.1:3307` | `127.0.0.1:3307` |
| Remote access | Not enabled by default | Requires an explicit TLS response file |

> The Headless installer never makes MariaDB, service control, backup control, seed control, or update control reachable through the network.

## Standard silent installation

Run the signed Headless installer from an elevated Windows deployment channel. The uppercase `/S` switch is the NSIS silent-install switch. The installer registers the service for automatic start and returns a non-zero process status if the Agent cannot create the protected service configuration.

```powershell
ACCORE.ERP.Server.Headless-<version>-setup.exe /S
```

The normal NSIS installer may be used where an operator needs standard Windows installation prompts. It still does not start a server UI after installation. A normal service installation, repair, update, or uninstall preserves the customer database, application storage, audit logs, and protected backup artifacts.

## Default local-only operation

With no response file, the service operates locally. It generates durable application and database secrets within the ACL-restricted data root, performs migrations and versioned seed revisions, starts the queue worker, and publishes a redacted health status.

```powershell
Get-Service -Name ACCOREServerAgent
Get-Content -LiteralPath 'C:\ProgramData\ACCORE ERP\Server Status\runtime-status.json' -Raw
```

The absence of a remote configuration is intentional. It prevents an administrator from exposing financial data merely by installing the package on a server.

## Direct TLS remote publication

Remote publication is an explicit administrative action. It requires a canonical HTTPS API address, the SHA-256 certificate fingerprint used by Client Desktop pairing, a certificate and private-key source file, a non-reserved TCP port, and an explicit list of permitted remote client addresses or CIDR ranges. The installer copies certificate material to `%ProgramData%\ACCORE ERP\Server\tls` and restricts it to `SYSTEM` and `Administrators`.

Create an ACL-restricted response file on the server. It contains no database, application, administrator, or device credential; it may contain only non-secret deployment choices and paths to protected certificate material.

```json
{
  "serverName": "ACCORE Finance Production",
  "publicApiBase": "https://erp.example.com:9443/api",
  "certificateFingerprint": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
  "tlsCertificatePath": "D:\\ACCORE-Deployment\\tls\\server-certificate.pem",
  "tlsPrivateKeyPath": "D:\\ACCORE-Deployment\\tls\\server-private-key.pem",
  "allowedRemoteAddresses": [
    "203.0.113.0/24",
    "2001:db8:10::/64"
  ],
  "directTlsPort": 9443
}
```

Install or repair with the protected file.

```powershell
ACCORE.ERP.Server.Headless-<version>-setup.exe /S /ACCORE_RESPONSE="D:\ACCORE-Deployment\headless-response.json"
```

The Agent validates that the remote endpoint is HTTPS, requires a complete configuration, copies the supplied TLS material into the protected root, retains a local API on `127.0.0.1:8765`, publishes the remote TLS listener on the chosen port, and creates a Windows Firewall allow rule only for `allowedRemoteAddresses`. Do not use `0.0.0.0/0` or `::/0` unless a documented organizational risk decision explicitly permits Internet-wide exposure.

For a reverse-proxy deployment, keep the embedded API loopback-only and publish the reverse proxy's HTTPS endpoint in `publicApiBase`. The reverse proxy and certificate lifecycle are then administered by the hosting platform; no ACCORE service-control endpoint is proxied.

## First Client Desktop enrollment

When TLS remote publication is configured, the Agent issues one short-lived, single-use pairing package after migrations and seed revisions have completed. The package is written only to the protected administrator path below; its raw enrollment evidence is never included in runtime status, public logs, release assets, or the command line.

```text
C:\ProgramData\ACCORE ERP\Server\enrollment\initial-primary.accorepair
```

Transfer this file to the intended Client Desktop through an approved secure organizational channel. On the client, choose **Connect to an ACCORE Server**, select the pairing-file method, and import the package. The client verifies the HTTPS endpoint, bootstrap server identity, certificate fingerprint, API contract, and the one-time evidence before the server creates its device record.

The first successfully enrolled device is recorded as the **primary administration device**. This is a server-ownership marker only; it does not bypass the normal ACCORE password authentication or onboarding process. The user must still sign in with an authorized ACCORE account and complete setup under the existing role and permission model.

If the pairing package expires before use, a server administrator may issue a replacement only after confirming that no primary device has been claimed:

```powershell
& 'C:\Program Files\ACCORE ERP Server Headless\accore-server-agent.exe' issue-initial-pairing --config 'C:\ProgramData\ACCORE ERP\Server\agent-config.json'
```

## Recovery, maintenance, and removal

The Headless Agent starts automatically with Windows. Restarting or stopping it uses normal service management and does not delete data.

```powershell
Restart-Service -Name ACCOREServerAgent
Get-Service -Name ACCOREServerAgent
```

The signed product update process must wait for the Agent to report ready and must preserve `%ProgramData%\ACCORE ERP\Server`. A normal uninstallation unregisters the Agent service and removes the application runtime. It does **not** delete ERP database files, Laravel storage, enrollment audit records, logs, or backups. Data destruction is a separate, explicitly authorized data-administration procedure and is not part of the installer.

## Operational acceptance checklist

| Check | Expected condition |
|---|---|
| Service | `ACCOREServerAgent` is `Running` and `Automatic` |
| Runtime status | `state`, database, API, queue, and backup all report `ready` |
| Database exposure | MariaDB is only bound to `127.0.0.1:3307` |
| Local API | `http://127.0.0.1:8765/up` returns HTTP 200 locally |
| Remote API | Only present after TLS configuration; reachable from a permitted address and rejected elsewhere by the firewall |
| First pairing | Package resides in the protected enrollment directory and is consumed once |
| Update / removal | Customer data root remains present after normal maintenance |

## Related decisions

- [ADR-004: Server Desktop Runtime and Durable Storage](../Architecture/ADR-004-server-desktop-runtime-and-storage.md)
- [ADR-006: Server Desktop Trust and Network Exposure](../Architecture/ADR-006-server-desktop-trust-and-network-exposure.md)
- [ADR-007: Server Desktop Runtime Package and Update Policy](../Architecture/ADR-007-server-desktop-runtime-package-and-update-policy.md)
- [ADR-009: Headless Server Deployment and First-Client Enrollment](../Architecture/ADR-009-headless-server-deployment-and-first-client-enrollment.md)
