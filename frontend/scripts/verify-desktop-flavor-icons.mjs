import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const flavor = process.argv.slice(2).find((argument) => argument !== '--');
const configurations = {
  client: {
    config: 'src-tauri/tauri.client.conf.json',
    ico: 'icons/flavors/accore-client.ico',
  },
  server: {
    config: 'src-tauri/tauri.server.conf.json',
    ico: 'icons/flavors/accore-server.ico',
  },
};

const target = configurations[flavor];
if (!target) {
  throw new Error('usage: verify-desktop-flavor-icons.mjs <client|server>');
}

const configPath = resolve(target.config);
const config = JSON.parse(await readFile(configPath, 'utf8'));
const configuredIcons = config.bundle?.icon ?? [];
const nsis = config.bundle?.windows?.nsis;

if (!configuredIcons.includes(target.ico)) {
  throw new Error(`${flavor} bundle icon list must include ${target.ico}`);
}
if (nsis?.installerIcon !== target.ico) {
  throw new Error(
    `${flavor} NSIS installerIcon must reference ${target.ico}`,
  );
}
if (nsis?.uninstallerIcon !== target.ico) {
  throw new Error(
    `${flavor} NSIS uninstallerIcon must reference ${target.ico}`,
  );
}

const ico = await readFile(resolve('src-tauri', target.ico));
if (ico.length < 22 || ico.readUInt16LE(0) !== 0 || ico.readUInt16LE(2) !== 1 || ico.readUInt16LE(4) < 1) {
  throw new Error(`${flavor} installer icon is not a valid ICO resource: ${target.ico}`);
}

console.log(`verified ${flavor} NSIS installer and uninstaller icons: ${target.ico}`);
