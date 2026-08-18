import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const [product, outputPath] = process.argv.slice(2);
if (!['server', 'client'].includes(product) || !outputPath) {
  throw new Error('usage: create-tauri-updater-release-config.mjs <server|client> <output-path>');
}

const publicKey = process.env.ACCORE_TAURI_UPDATER_PUBLIC_KEY?.trim();
const repository = process.env.GITHUB_REPOSITORY?.trim();
if (!publicKey)
  throw new Error('ACCORE_TAURI_UPDATER_PUBLIC_KEY must be supplied by release automation');
if (!repository || !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository)) {
  throw new Error('GITHUB_REPOSITORY must identify the release repository');
}

const config = {
  bundle: {
    createUpdaterArtifacts: true,
  },
  plugins: {
    updater: {
      pubkey: Buffer.from(publicKey, 'utf8').toString('base64'),
      endpoints: [
        `https://github.com/${repository}/releases/latest/download/accore-${product}-updater.json`,
      ],
    },
  },
};

const destination = resolve(outputPath);
await mkdir(dirname(destination), { recursive: true });
await writeFile(destination, `${JSON.stringify(config, null, 2)}\n`, { mode: 0o600 });
