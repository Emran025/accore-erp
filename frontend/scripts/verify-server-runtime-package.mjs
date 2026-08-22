import { access, readFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { resolve } from 'node:path';
const runtimeRoot = resolve(process.argv[2] ?? 'src-tauri/resources/server-runtime/windows-x86_64');
const caddyfile = resolve(runtimeRoot, 'Caddyfile');
const packagedEnvironment = resolve(runtimeRoot, 'app/.env');
await access(caddyfile, constants.R_OK);
const caddyfileText = await readFile(caddyfile, 'utf8');
if (!caddyfileText.includes('root * "{env.ACCORE_APP_ROOT}/public"')) {
  throw new Error('embedded Caddyfile must quote ACCORE_APP_ROOT so Program Files paths are valid');
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
