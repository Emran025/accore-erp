[CmdletBinding()]
param(
  [Parameter(Mandatory)]
  [ValidateSet('server-desktop', 'server-headless')]
  [string]$Product,

  [Parameter(Mandatory)]
  [string]$InstallerPath,

  [Parameter(Mandatory)]
  [string]$InstallationDirectory
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$serviceName = 'ACCOREServerAgent'
$dataRoot = Join-Path $env:ProgramData 'ACCORE ERP'
$statusPath = Join-Path $dataRoot 'Server Status\runtime-status.json'
$backupStatusPath = Join-Path $dataRoot 'Server Status\backup-status.json'
$configPath = Join-Path $dataRoot 'Server\agent-config.json'
$agentPath = Join-Path $InstallationDirectory 'accore-server-agent.exe'
$uninstallerPath = Join-Path $InstallationDirectory 'uninstall.exe'
$runtimeProcessNames = @('accore-server-agent', 'mariadbd', 'frankenphp')

function Assert-PristineFixture {
  if (Test-Path $dataRoot) {
    throw "The isolated $Product fixture is not pristine: $dataRoot already exists. CI must not alter protected durable data from a prior product lifecycle."
  }
  if (Get-Service -Name $serviceName -ErrorAction SilentlyContinue) {
    throw "The isolated $Product fixture is not pristine: $serviceName is already registered."
  }
  foreach ($processName in $runtimeProcessNames) {
    if (Get-Process -Name $processName -ErrorAction SilentlyContinue) {
      throw "The isolated $Product fixture is not pristine: $processName is already running."
    }
  }
}

function Write-ReadinessDiagnostics {
  Write-Host "--- $Product public runtime status ---"
  if (Test-Path $statusPath) {
    Get-Content -LiteralPath $statusPath -Raw
  } else {
    Write-Host 'No public runtime status was written.'
  }

  Write-Host "--- $Product public backup status ---"
  if (Test-Path $backupStatusPath) {
    Get-Content -LiteralPath $backupStatusPath -Raw
  } else {
    Write-Host 'No public backup status was written.'
  }

  $provisioningLog = Join-Path $dataRoot 'Server\logs\provisioning.log'
  Write-Host "--- $Product redacted provisioning log tail ---"
  if (-not (Test-Path $provisioningLog)) {
    Write-Host 'No provisioning log was written.'
    return
  }
  try {
    Get-Content -LiteralPath $provisioningLog -Tail 80 | ForEach-Object {
      $_ -replace '(?i)(password|secret|token|app_key)\s*([:=])\s*\S+', '$1$2[REDACTED]'
    }
  } catch {
    Write-Host "Provisioning log could not be read: $($_.Exception.Message)"
  }
}

function Wait-ForReadyStatus {
  param([string]$ExpectedServerId = '')

  # The Agent owns a five-minute provisioning deadline. CI waits beyond that
  # contract so a genuine bootstrap stall is observed as the Agent's explicit
  # unhealthy state rather than as an arbitrary test timeout.
  $deadline = (Get-Date).AddMinutes(6)
  $lastDetail = 'No public status was published.'
  while ((Get-Date) -lt $deadline) {
    $service = Get-Service -Name $serviceName -ErrorAction SilentlyContinue
    if (Test-Path $statusPath) {
      $status = Get-Content -LiteralPath $statusPath -Raw | ConvertFrom-Json
      $lastDetail = $status.detail
      if ($status.state -eq 'unhealthy') {
        throw "$Product Agent reported unhealthy: $($status.detail)"
      }
      if ($service.Status -eq 'Running' -and $status.state -eq 'ready') {
        if ([string]::IsNullOrWhiteSpace($status.serverId)) {
          throw "$Product did not publish a stable public server identity."
        }
        if ($ExpectedServerId -and $status.serverId -ne $ExpectedServerId) {
          throw "$Product replaced the durable server identity during reinstall."
        }
        if ($status.database.state -ne 'ready' -or $status.api.state -ne 'ready' -or $status.queue.state -ne 'ready') {
          throw "$Product published ready while a required local component was not ready."
        }
        return $status
      }
    }
    Start-Sleep -Seconds 2
  }
  Write-ReadinessDiagnostics
  throw "$Product did not publish a ready local-service status within the bounded bootstrap window. Last detail: $lastDetail"
}

function Invoke-ProductInstaller {
  $installerArguments = @('/S')
  if ($Product -eq 'server-headless') {
    $responsePath = Join-Path $env:RUNNER_TEMP 'accore-headless-response.json'
    Set-Content -LiteralPath $responsePath -NoNewline -Value '{"serverName":"CI Headless Acceptance"}'
    $installerArguments += "/ACCORE_RESPONSE=$responsePath"
  }
  $installer = Start-Process -FilePath $InstallerPath -ArgumentList $installerArguments -Wait -PassThru
  if ($installer.ExitCode -ne 0) {
    throw "$Product silent installer exited with $($installer.ExitCode)."
  }
  if ($Product -eq 'server-desktop') {
    if (-not (Test-Path $agentPath)) {
      throw "Server Desktop did not install the Agent at $agentPath."
    }
    & $agentPath install
    if ($LASTEXITCODE -ne 0) {
      throw "Server Desktop Agent installation exited with $LASTEXITCODE."
    }
  }
}

function Invoke-ProductUninstaller {
  if ($Product -eq 'server-desktop') {
    & $agentPath uninstall
    if ($LASTEXITCODE -ne 0) {
      throw "Server Desktop Agent removal exited with $LASTEXITCODE."
    }
  }
  if (-not (Test-Path $uninstallerPath)) {
    throw "$Product uninstaller was not installed at $uninstallerPath."
  }
  $uninstaller = Start-Process -FilePath $uninstallerPath -ArgumentList @('/S') -Wait -PassThru
  if ($uninstaller.ExitCode -ne 0) {
    throw "$Product silent uninstaller exited with $($uninstaller.ExitCode)."
  }
}

function Assert-VerifiedProtectedBackup {
  & $agentPath request-backup --config $configPath
  if ($LASTEXITCODE -ne 0) {
    throw "$Product could not request a protected backup through the packaged Agent."
  }

  $deadline = (Get-Date).AddMinutes(5)
  while ((Get-Date) -lt $deadline) {
    if (Test-Path $backupStatusPath) {
      $backup = Get-Content -LiteralPath $backupStatusPath -Raw | ConvertFrom-Json
      if ($backup.state -eq 'ready' -and $backup.retainedRestorePoints -ge 1 -and $backup.lastVerifiedAtUnix -gt 0) {
        return
      }
    }
    Start-Sleep -Seconds 2
  }
  throw "$Product did not publish a verified protected backup through its redacted public status."
}

function Assert-OrderedRemoval {
  $deadline = (Get-Date).AddSeconds(195)
  while ((Get-Date) -lt $deadline) {
    $service = Get-Service -Name $serviceName -ErrorAction SilentlyContinue
    $processes = Get-Process -Name $runtimeProcessNames -ErrorAction SilentlyContinue
    if ($null -eq $service -and $null -eq $processes) {
      return
    }
    Start-Sleep -Seconds 1
  }
  throw "$Product removal left the Agent service or a managed runtime process active."
}

Assert-PristineFixture
Invoke-ProductInstaller
$firstStatus = Wait-ForReadyStatus
if (Test-Path (Join-Path $InstallationDirectory 'resources\server-runtime\windows-x86_64\app\.env')) {
  throw "$Product package contains a forbidden Laravel environment file."
}
$privateAcl = Get-Acl -LiteralPath $configPath
if ($privateAcl.Access.IdentityReference.Value -match 'Users') {
  throw "$Product Agent configuration grants an ordinary Users ACL entry."
}
Assert-VerifiedProtectedBackup

if ($Product -eq 'server-headless' -and (Get-Process -Name 'accore-server-headless' -ErrorAction SilentlyContinue)) {
  throw 'Server Headless installer unexpectedly launched a desktop process.'
}

Invoke-ProductUninstaller
Assert-OrderedRemoval
if (-not (Test-Path $statusPath)) {
  throw "$Product uninstaller removed the public status that accompanies the durable server data contract."
}

Invoke-ProductInstaller
$secondStatus = Wait-ForReadyStatus -ExpectedServerId $firstStatus.serverId
if ($secondStatus.serverId -ne $firstStatus.serverId) {
  throw "$Product did not preserve the durable server identity across uninstall and reinstall."
}

Invoke-ProductUninstaller
Assert-OrderedRemoval
