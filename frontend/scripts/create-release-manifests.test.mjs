import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { generateKeyPairSync } from 'node:crypto';
import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const script = resolve(dirname(fileURLToPath(import.meta.url)), 'create-release-manifests.mjs');
const frontendRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

test('generates manifests and updater URLs from normalized GitHub asset names', async () => {
  const root = await mkdtemp(join(tmpdir(), 'accore-manifest-'));
  const assets = join(root, 'assets');
  const output = join(root, 'output');
  const { privateKey } = generateKeyPairSync('ed25519');
  const releaseVersion = JSON.parse(
    await readFile(join(frontendRoot, 'package.json'), 'utf8')
  ).version;
  const releaseTag = `desktop-v${releaseVersion}`;

  for (const product of ['Client', 'Server']) {
    await writeFixture(assets, `Accore.${product}_${releaseVersion}_amd64.AppImage`);
    await writeFixture(
      assets,
      `Accore.${product}_${releaseVersion}_amd64.AppImage.sig`,
      'linux-signature'
    );
    await writeFixture(assets, `Accore.${product}_aarch64.app.tar.gz`);
    await writeFixture(assets, `Accore.${product}_aarch64.app.tar.gz.sig`, 'arm-signature');
    await writeFixture(assets, `Accore.${product}_x86_64.app.tar.gz`);
    await writeFixture(assets, `Accore.${product}_x86_64.app.tar.gz.sig`, 'intel-signature');
  }

  execFileSync(process.execPath, [script, assets, output], {
    stdio: 'pipe',
    env: {
      ...process.env,
      ACCORE_RELEASE_TAG: releaseTag,
      ACCORE_SOURCE_REVISION: 'a'.repeat(40),
      ACCORE_MANIFEST_KEY_ID: 'test-ed25519',
      ACCORE_MANIFEST_PRIVATE_KEY: privateKey.export({ type: 'pkcs8', format: 'pem' }),
      ACCORE_RELEASE_BASE_URL: `https://example.test/releases/${releaseTag}`,
    },
  });

  const clientManifest = await readJson(join(output, 'accore-client-manifest.json'));
  assert.equal(clientManifest.release_version, releaseVersion);
  assert.equal(clientManifest.artifacts[0].download_url.includes('Accore.Client'), true);

  const clientUpdater = await readJson(join(output, 'accore-client-updater.json'));
  assert.deepEqual(clientUpdater.platforms, {
    'darwin-aarch64': {
      signature: 'arm-signature',
      url: `https://example.test/releases/${releaseTag}/Accore.Client_aarch64.app.tar.gz`,
    },
    'darwin-x86_64': {
      signature: 'intel-signature',
      url: `https://example.test/releases/${releaseTag}/Accore.Client_x86_64.app.tar.gz`,
    },
    'linux-x86_64': {
      signature: 'linux-signature',
      url: `https://example.test/releases/${releaseTag}/Accore.Client_${releaseVersion}_amd64.AppImage`,
    },
  });
});

async function writeFixture(root, relativePath, content = 'fixture') {
  const target = join(root, relativePath);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, content);
}

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}
