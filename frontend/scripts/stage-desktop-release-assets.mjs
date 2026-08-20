import { cp, mkdir, readdir, rm, stat } from 'node:fs/promises';
import { basename, join, resolve } from 'node:path';

const [sourceDirectory, destinationDirectory] = process.argv.slice(2);
if (!sourceDirectory || !destinationDirectory) {
  throw new Error(
    'usage: stage-desktop-release-assets.mjs <downloaded-artifacts-directory> <staging-directory>'
  );
}

const sourceRoot = resolve(sourceDirectory);
const destinationRoot = resolve(destinationDirectory);
const sourceFiles = await findFiles(sourceRoot);
const publishableFiles = sourceFiles.filter(isPublishableReleaseAsset);

if (publishableFiles.length === 0) {
  throw new Error('no publishable desktop release assets were found');
}

await rm(destinationRoot, { recursive: true, force: true });
await mkdir(destinationRoot, { recursive: true });

const stagedNames = new Map();
for (const sourceFile of publishableFiles.sort((left, right) => left.localeCompare(right))) {
  const stagedName = normalizeAssetName(sourceFile);
  const existingSource = stagedNames.get(stagedName);
  if (existingSource) {
    throw new Error(
      `release asset collision for ${stagedName}: ${existingSource} and ${sourceFile}`
    );
  }

  stagedNames.set(stagedName, sourceFile);
  await cp(sourceFile, join(destinationRoot, stagedName));
}

console.log(`Staged ${stagedNames.size} publishable desktop assets in ${destinationRoot}.`);

function isPublishableReleaseAsset(file) {
  const name = basename(file).toLowerCase();
  if (!productFromAssetName(name)) return false;

  return (
    name.endsWith('.appimage') ||
    name.endsWith('.appimage.sig') ||
    name.endsWith('.deb') ||
    name.endsWith('.deb.sig') ||
    name.endsWith('.rpm') ||
    name.endsWith('.rpm.sig') ||
    name.endsWith('.msi') ||
    name.endsWith('.msi.sig') ||
    name.endsWith('.exe') ||
    name.endsWith('.exe.sig') ||
    name.endsWith('.dmg') ||
    name.endsWith('.dmg.sig') ||
    name.endsWith('.app.tar.gz') ||
    name.endsWith('.app.tar.gz.sig')
  );
}

function productFromAssetName(name) {
  const match = /accore(?:[ ._-]+erp)?[ ._-]+(server|client)(?:[ ._-]+desktop)?/i.exec(name);
  return match?.[1].toLowerCase() ?? null;
}

function normalizeAssetName(sourceFile) {
  const name = basename(sourceFile).replaceAll(' ', '.');
  const lower = name.toLowerCase();

  if (lower.endsWith('.app.tar.gz') || lower.endsWith('.app.tar.gz.sig')) {
    const architecture = architectureFromPath(sourceFile);
    return name.replace(/\.app\.tar\.gz(\.sig)?$/i, `_${architecture}.app.tar.gz$1`);
  }

  return name;
}

function architectureFromPath(file) {
  const lower = file.toLowerCase();
  if (lower.includes('aarch64') || lower.includes('arm64')) return 'aarch64';
  if (lower.includes('x86_64') || lower.includes('x64') || lower.includes('amd64')) {
    return 'x86_64';
  }
  throw new Error(`could not determine macOS architecture for ${file}`);
}

async function findFiles(root) {
  const entries = await readdir(root, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(root, entry.name);
    if (entry.isDirectory()) files.push(...(await findFiles(path)));
    else if ((await stat(path)).isFile()) files.push(path);
  }
  return files;
}
