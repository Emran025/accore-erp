import { cp, mkdir, rm, stat } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { spawn } from 'node:child_process';

const frontendRoot = resolve(import.meta.dirname, '..');
const repositoryRoot = resolve(frontendRoot, '..');
const payloadRoot = resolve(frontendRoot, 'src-tauri', 'target', 'server-headless-payload');
const installerOutput = resolve(
  frontendRoot,
  'src-tauri',
  'target',
  'server-headless',
  'ACCORE.ERP.Server.Headless-x86_64-setup.exe'
);
const agentSource = resolve(
  frontendRoot,
  'src-tauri',
  'binaries',
  'accore-server-agent-x86_64-pc-windows-msvc.exe'
);
const runtimeSource = resolve(
  frontendRoot,
  'src-tauri',
  'resources',
  'server-runtime',
  'windows-x86_64'
);
const installerScript = resolve(
  repositoryRoot,
  'distribution',
  'installer',
  'windows',
  'server-headless.nsi'
);

await assertFile(agentSource, 'Headless Agent sidecar');
await assertFile(join(runtimeSource, 'frankenphp.exe'), 'Headless FrankenPHP runtime');
await assertFile(
  join(runtimeSource, 'mariadb-11.4.9-winx64', 'bin', 'mariadbd.exe'),
  'Headless MariaDB runtime'
);
await assertFile(installerScript, 'Headless NSIS installer source');

await rm(payloadRoot, { recursive: true, force: true });
await rm(installerOutput, { force: true });
await mkdir(payloadRoot, { recursive: true });
await mkdir(dirname(installerOutput), { recursive: true });
await mkdir(dirname(join(payloadRoot, 'resources', 'server-runtime', 'windows-x86_64')), {
  recursive: true,
});

await cp(agentSource, join(payloadRoot, 'accore-server-agent.exe'));
await cp(runtimeSource, join(payloadRoot, 'resources', 'server-runtime', 'windows-x86_64'), {
  recursive: true,
});

await run(process.env.ACCORE_MAKENSIS_EXECUTABLE ?? 'makensis.exe', [
  `/DHEADLESS_PAYLOAD_ROOT=${payloadRoot}`,
  `/DHEADLESS_INSTALLER_OUTPUT=${installerOutput}`,
  installerScript,
]);

await assertFile(installerOutput, 'Headless NSIS setup executable');
console.log(`Built ACCORE Server Headless setup executable at ${installerOutput}`);

async function assertFile(path, description) {
  const details = await stat(path).catch(() => null);
  if (!details?.isFile()) throw new Error(`${description} is missing: ${path}`);
}

async function run(command, args) {
  await new Promise((resolveCommand, rejectCommand) => {
    const child = spawn(command, args, { stdio: 'inherit', windowsHide: true });
    child.once('error', rejectCommand);
    child.once('exit', (code) =>
      code === 0
        ? resolveCommand()
        : rejectCommand(new Error(`${command} exited with code ${code}`))
    );
  });
}
