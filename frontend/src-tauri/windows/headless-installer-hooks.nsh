!include "FileFunc.nsh"
!include "LogicLib.nsh"

!macro NSIS_HOOK_POSTINSTALL
  ; The per-machine installer is already elevated. nsExec suppresses console
  ; windows while the Agent creates its protected configuration and registers
  ; ACCOREServerAgent for automatic service start.
  ${GetParameters} $0
  ${GetOptions} "$0" "/ACCORE_RESPONSE=" $1
  ${If} "$1" == ""
    nsExec::ExecToStack '"$INSTDIR\accore-server-agent.exe" install'
  ${Else}
    nsExec::ExecToStack '"$INSTDIR\accore-server-agent.exe" install --response-file "$1"'
  ${EndIf}
  Pop $1
  Pop $0
  ${If} "$0" != "0"
    FileOpen $2 "$INSTDIR\headless-installer.log" w
    FileWrite $2 "$1$\r$\n"
    FileClose $2
    Abort "ACCORE Server Headless could not register the protected Windows service."
  ${EndIf}
!macroend

!macro NSIS_HOOK_PREUNINSTALL
  ; Normal removal stops and unregisters only the service and binaries. The
  ; Agent never deletes customer data, database files, logs, or backups.
  nsExec::ExecToStack '"$INSTDIR\accore-server-agent.exe" uninstall'
  Pop $1
  Pop $0
  ${If} "$0" != "0"
    Abort "ACCORE Server Headless could not stop and unregister the Windows service."
  ${EndIf}
!macroend
