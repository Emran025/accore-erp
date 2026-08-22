[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [string]$Installer,
  [Parameter(Mandatory = $true)]
  [string]$PublicStatusRoot
)

$ErrorActionPreference = 'Stop'
$serviceName = 'ACCOREServerAgent'
$installRoot = Join-Path ${env:ProgramFiles} 'ACCORE ERP Server Headless'
$statusPath = Join-Path $PublicStatusRoot 'runtime-status.json'
$receiptPath = Join-Path $PublicStatusRoot 'server-instance.json'

function Assert-Contract {
  param(
    [Parameter(Mandatory = $true)][bool]$Condition,
    [Parameter(Mandatory = $true)][string]$Message
  )
  if (-not $Condition) { throw $Message }
}

function Read-PublicJson {
  param([Parameter(Mandatory = $true)][string]$Path)
  Get-Content -LiteralPath $Path -Raw | ConvertFrom-Json
}

function Wait-ForPublicState {
  param([Parameter(Mandatory = $true)][string]$ExpectedState, [int]$TimeoutSeconds = 180)
  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
  while ((Get-Date) -lt $deadline) {
    if (Test-Path -LiteralPath $statusPath) {
      $status = Read-PublicJson -Path $statusPath
      if ($status.state -eq $ExpectedState) { return $status }
      if ($status.state -eq 'unhealthy') {
        throw "Headless Agent published unhealthy state '$($status.phase)' / '$($status.errorCode)': $($status.detail)"
      }
    }
    Start-Sleep -Seconds 2
  }
  throw "Headless Agent did not publish public state '$ExpectedState' within $TimeoutSeconds seconds"
}

try {
  $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
  $principal = [Security.Principal.WindowsPrincipal]::new($identity)
  Assert-Contract -Condition $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator) -Message 'Silent Headless contract requires an elevated Windows context'
  Assert-Contract -Condition (Test-Path -LiteralPath $Installer) -Message "Headless installer is missing: $Installer"
  Assert-Contract -Condition (-not (Get-Service -Name $serviceName -ErrorAction SilentlyContinue)) -Message 'Worker is not fresh: ACCORE Server Agent already exists'
  Assert-Contract -Condition (-not (Test-Path -LiteralPath $PublicStatusRoot)) -Message 'Worker is not fresh: public Server Status directory already exists'

  $installProcess = Start-Process -FilePath $Installer -ArgumentList '/S' -Wait -PassThru
  Assert-Contract -Condition ($installProcess.ExitCode -eq 0) -Message "Silent Headless installer exited with $($installProcess.ExitCode)"

  $agentPath = Join-Path $installRoot 'accore-server-agent.exe'
  Assert-Contract -Condition (Test-Path -LiteralPath $agentPath) -Message 'Silent Headless installer did not install the Agent executable'
  Assert-Contract -Condition (-not (Test-Path -LiteralPath (Join-Path $installRoot 'accore-server.exe'))) -Message 'Headless installation unexpectedly contains the Server Desktop executable'
  Assert-Contract -Condition (-not (Test-Path -LiteralPath (Join-Path $installRoot 'ACCORE ERP Server Desktop.exe'))) -Message 'Headless installation unexpectedly contains a Server Desktop control surface'

  $ready = Wait-ForPublicState -ExpectedState 'ready'
  Assert-Contract -Condition ($ready.ownerProduct -eq 'server-headless') -Message "Headless runtime published unexpected owner '$($ready.ownerProduct)'"
  Assert-Contract -Condition (-not [string]::IsNullOrWhiteSpace($ready.serverInstanceId)) -Message 'Headless runtime did not publish a durable public instance identity'

  $receipt = Read-PublicJson -Path $receiptPath
  Assert-Contract -Condition ($receipt.ownerProduct -eq 'server-headless') -Message "Headless public receipt published unexpected owner '$($receipt.ownerProduct)'"
  Assert-Contract -Condition ($receipt.state -eq 'active') -Message "Headless public receipt state is '$($receipt.state)'"

  $service = Get-CimInstance Win32_Service -Filter "Name='$serviceName'"
  Assert-Contract -Condition ($null -ne $service) -Message 'Silent Headless installation did not register ACCOREServerAgent'
  Assert-Contract -Condition ($service.StartMode -eq 'Auto') -Message "Headless service start mode is '$($service.StartMode)', not Auto"
  Assert-Contract -Condition ($service.PathName -match [regex]::Escape($agentPath)) -Message 'Headless service command does not reference the installed Agent'

  $uninstallProcess = Start-Process -FilePath (Join-Path $installRoot 'uninstall.exe') -ArgumentList '/S' -Wait -PassThru
  Assert-Contract -Condition ($uninstallProcess.ExitCode -eq 0) -Message "Silent Headless uninstaller exited with $($uninstallProcess.ExitCode)"

  $deadline = (Get-Date).AddSeconds(45)
  while ((Get-Date) -lt $deadline -and $null -ne (Get-Service -Name $serviceName -ErrorAction SilentlyContinue)) {
    Start-Sleep -Milliseconds 500
  }
  Assert-Contract -Condition ($null -eq (Get-Service -Name $serviceName -ErrorAction SilentlyContinue)) -Message 'Silent Headless uninstall did not remove ACCOREServerAgent'
  $removedReceipt = Read-PublicJson -Path $receiptPath
  Assert-Contract -Condition ($removedReceipt.state -eq 'removed') -Message "Headless removal did not publish removed state '$($removedReceipt.state)'"
  Assert-Contract -Condition (-not (Test-Path -LiteralPath $installRoot)) -Message 'Silent Headless uninstaller did not remove executable installation files'

  Write-Host 'Server Headless silent installation contract passed without reading or deleting private ProgramData files.'
}
catch {
  throw $_
}
