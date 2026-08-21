import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const script = resolve(
  dirname(fileURLToPath(import.meta.url)),
  'create-tauri-updater-release-config.mjs'
);

test('generates a quiet Windows updater configuration for the per-user server install', async () => {
  const root = await mkdtemp(join(tmpdir(), 'accore-updater-config-'));
  const output = join(root, 'server-updater.json');

  execFileSync(process.execPath, [script, 'server', output], {
    stdio: 'pipe',
    env: {
      ...process.env,
      ACCORE_TAURI_UPDATER_PUBLIC_KEY: 'RWQTESTPUBLICKEY',
      GITHUB_REPOSITORY: 'Emran025/accore-erp',
    },
  });

  const config = JSON.parse(await readFile(output, 'utf8'));
  assert.equal(config.plugins.updater.windows.installMode, 'quiet');
  assert.deepEqual(config.plugins.updater.endpoints, [
    'https://github.com/Emran025/accore-erp/releases/latest/download/accore-server-updater.json',
  ]);
});
