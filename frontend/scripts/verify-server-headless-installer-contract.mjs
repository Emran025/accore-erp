import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const repositoryRoot = resolve(import.meta.dirname, '..', '..');
const installerSource = resolve(
  repositoryRoot,
  'distribution',
  'installer',
  'windows',
  'server-headless.nsi'
);
const source = await readFile(installerSource, 'utf8');

for (const required of [
  'RequestExecutionLevel admin',
  'Name "ACCORE ERP Server Headless"',
  'File /r "${HEADLESS_PAYLOAD_ROOT}\\*.*"',
  'claim --owner server-headless',
  'uninstall --owner server-headless',
  'IfSilent silent_failure interactive_failure',
  'IfSilent silent_uninstall_failure interactive_uninstall_failure',
  'WriteUninstaller "$INSTDIR\\uninstall.exe"',
]) {
  if (!source.includes(required)) {
    throw new Error(`Headless installer is missing required contract clause: ${required}`);
  }
}
if (source.includes('server-desktop') || source.includes('tauri')) {
  throw new Error('Headless installer must not invoke or package a Server Desktop control surface');
}

console.log(
  'Verified Server Headless installer contract: elevated, silent-capable, Agent-only lifecycle.'
);
