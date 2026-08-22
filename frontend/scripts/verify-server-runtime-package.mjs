import { access, readFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { resolve } from 'node:path';

const runtimeTarget = process.argv[2] ?? hostRuntimeTarget();
const runtimeRoot = resolve(`src-tauri/resources/server-runtime/${runtimeTarget}`);
const caddyfile = resolve(runtimeRoot, 'Caddyfile');
const packagedEnvironment = resolve(runtimeRoot, 'app/.env');

await access(caddyfile, constants.R_OK);
const caddyfileText = await readFile(caddyfile, 'utf8');
if (!caddyfileText.includes('root * "{env.ACCORE_APP_ROOT}/public"')) {
  throw new Error('embedded Caddyfile must quote ACCORE_APP_ROOT so paths containing spaces remain valid');
}

let packagedEnvironmentExists = false;
try {
  await access(packagedEnvironment, constants.F_OK);
  packagedEnvironmentExists = true;
} catch (error) {
  if (error?.code !== 'ENOENT') {
    throw error;
  }
}

if (packagedEnvironmentExists) {
  throw new Error('embedded runtime must not contain a packaged Laravel .env file');
}

console.log(`Verified Server Desktop runtime package contract at ${runtimeRoot}`);

function hostRuntimeTarget() {
  if (process.platform === 'win32' && process.arch === 'x64') return 'windows-x86_64';
  if (process.platform === 'linux' && process.arch === 'x64') return 'linux-x86_64';
  if (process.platform === 'darwin' && process.arch === 'arm64') return 'macos-aarch64';
  if (process.platform === 'darwin' && process.arch === 'x64') return 'macos-x86_64';
  throw new Error(`cannot infer Server Desktop runtime target for ${process.platform}/${process.arch}`);
}
