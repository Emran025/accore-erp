!include "LogicLib.nsh"

!macro NSIS_HOOK_POSTINSTALL
  ; The Server Desktop package may create its own server instance or attach to
  ; a compatible Headless-owned instance. Agent ownership rules decide which
  ; action is authorised; nsExec keeps the installer free of console windows.
  nsExec::ExecToStack '"$INSTDIR\accore-server-agent.exe" install --owner server-desktop'
  Pop $0
  Pop $1
  ${If} "$0" != "0"
    FileOpen $2 "$INSTDIR\server-desktop-installer.log" w
    FileWrite $2 "$1$\r$\n"
    FileClose $2
    Abort "ACCORE Server Desktop could not initialise or attach to the protected Windows service."
  ${EndIf}
!macroend

!macro NSIS_HOOK_PREUNINSTALL
  ; If Desktop is only an attached management console, Agent returns success
  ; without changing the Headless-owned server. A Desktop-owned server is
  ; stopped and unregistered while all durable customer data remains intact.
  nsExec::ExecToStack '"$INSTDIR\accore-server-agent.exe" uninstall --owner server-desktop'
  Pop $0
  Pop $1
  ${If} "$0" != "0"
    Abort "ACCORE Server Desktop could not complete its authorised service removal."
  ${EndIf}
!macroend
