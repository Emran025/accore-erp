Unicode true
RequestExecutionLevel admin
SetCompressor /SOLID lzma
SetDatablockOptimize on

!include "LogicLib.nsh"
!include "x64.nsh"

!ifndef HEADLESS_PAYLOAD_ROOT
  !error "HEADLESS_PAYLOAD_ROOT must be provided by the Headless packaging command"
!endif

!ifndef HEADLESS_INSTALLER_OUTPUT
  !error "HEADLESS_INSTALLER_OUTPUT must be provided by the Headless packaging command"
!endif

Name "ACCORE ERP Server Headless"
OutFile "${HEADLESS_INSTALLER_OUTPUT}"
InstallDir "$PROGRAMFILES64\ACCORE ERP Server Headless"
InstallDirRegKey HKLM "Software\ACCORE ERP\Server Headless" "InstallDir"
ShowInstDetails nevershow
ShowUninstDetails nevershow

Var AgentExitCode
Var AgentOutput

Function .onInit
  SetRegView 64
  ${IfNot} ${RunningX64}
    SetErrorLevel 1633
    Abort
  ${EndIf}
FunctionEnd

Function ProvisionHeadlessService
  nsExec::ExecToStack '"$INSTDIR\accore-server-agent.exe" claim --owner server-headless'
  Pop $AgentExitCode
  Pop $AgentOutput
  ${If} $AgentExitCode != 0
    IfSilent silent_failure interactive_failure
    silent_failure:
      SetErrorLevel $AgentExitCode
      Abort
    interactive_failure:
      MessageBox MB_ICONSTOP "ACCORE ERP Server Headless provisioning failed (exit code $AgentExitCode).$
$
$AgentOutput"
      SetErrorLevel $AgentExitCode
      Abort
  ${EndIf}
FunctionEnd

Section "Install ACCORE ERP Server Headless"
  SetShellVarContext all
  SetRegView 64
  SetOutPath "$INSTDIR"
  File /r "${HEADLESS_PAYLOAD_ROOT}\*.*"
  WriteRegStr HKLM "Software\ACCORE ERP\Server Headless" "InstallDir" "$INSTDIR"
  Call ProvisionHeadlessService
  WriteUninstaller "$INSTDIR\uninstall.exe"
SectionEnd

Section "Uninstall"
  SetShellVarContext all
  SetRegView 64
  nsExec::ExecToStack '"$INSTDIR\accore-server-agent.exe" uninstall --owner server-headless'
  Pop $AgentExitCode
  Pop $AgentOutput
  ${If} $AgentExitCode != 0
    IfSilent silent_uninstall_failure interactive_uninstall_failure
    silent_uninstall_failure:
      SetErrorLevel $AgentExitCode
      Abort
    interactive_uninstall_failure:
      MessageBox MB_ICONSTOP "ACCORE ERP Server Headless removal failed (exit code $AgentExitCode).$
$
$AgentOutput"
      SetErrorLevel $AgentExitCode
      Abort
  ${EndIf}
  Delete "$INSTDIR\uninstall.exe"
  RMDir /r "$INSTDIR"
  DeleteRegKey HKLM "Software\ACCORE ERP\Server Headless"
SectionEnd
