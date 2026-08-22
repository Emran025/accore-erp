import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cp, mkdir, readFile, rename, rm, stat, writeFile } from 'node:fs/promises';
import { basename, join, resolve } from 'node:path';

const [target = 'windows-x86_64', destinationArgument] = process.argv.slice(2);
if (target !== 'windows-x86_64') {
  throw new Error(
    `self-contained Server Desktop runtime is currently supported only for windows-x86_64, received ${target}`
  );
}

const frontendRoot = resolve(import.meta.dirname, '..');
const repositoryRoot = resolve(frontendRoot, '..');
const destinationRoot = resolve(
  destinationArgument ?? join(frontendRoot, 'src-tauri', 'resources', 'server-runtime', target)
);
const cacheRoot = resolve(
  process.env.ACCORE_RUNTIME_DOWNLOAD_CACHE ?? join(repositoryRoot, '.runtime-cache', target)
);

const sources = [
  {
    id: 'frankenphp',
    url: 'https://github.com/php/frankenphp/releases/download/v1.12.7/frankenphp-windows-x86_64.zip',
    sha256: 'c382cf6169d5175c30d918ba7a09d6eb8601c6c339470e7fbb87f0b40d9bf254',
    archive: 'frankenphp-windows-x86_64.zip',
  },
  {
    id: 'mariadb',
    url: 'https://archive.mariadb.org/mariadb-11.4.9/winx64-packages/mariadb-11.4.9-winx64.zip',
    sha256: '802f9f40a9dca774a3ba62f39c21093942954f178d6d7d458dc51453929bcdda',
    archive: 'mariadb-11.4.9-winx64.zip',
  },
];

await mkdir(cacheRoot, { recursive: true });
await rm(destinationRoot, { recursive: true, force: true });
await mkdir(destinationRoot, { recursive: true });

for (const source of sources) {
  const archivePath = await downloadVerified(source);
  await extractZip(archivePath, destinationRoot);
}

const mariadbDirectory = join(destinationRoot, 'mariadb-11.4.9-winx64');
for (const executable of ['mariadbd.exe', 'mariadb.exe', 'mariadb-install-db.exe']) {
  await assertFile(join(mariadbDirectory, 'bin', executable));
}
for (const executable of ['frankenphp.exe', 'php.exe']) {
  await assertFile(join(destinationRoot, executable));
}
const phpExtensions = ['curl', 'fileinfo', 'mbstring', 'mysqli', 'openssl', 'pdo_mysql', 'zip'];
for (const extension of phpExtensions) {
  await assertFile(join(destinationRoot, 'ext', `php_${extension}.dll`));
}
const phpProductionIni = await readFile(join(destinationRoot, 'php.ini-production'), 'utf8');
await writeFile(
  join(destinationRoot, 'php.ini'),
  `${phpProductionIni}\n; ACCORE Server Desktop embedded runtime extensions\nextension_dir = "ext"\n${phpExtensions.map((extension) => `extension=${extension}`).join('\n')}\n`
);

const applicationRoot = join(destinationRoot, 'app');
await assertFile(join(repositoryRoot, 'backend', 'vendor', 'autoload.php'));
await cp(join(repositoryRoot, 'backend'), applicationRoot, {
  recursive: true,
  filter: (source) => {
    const relative = source.slice(join(repositoryRoot, 'backend').length).replaceAll('\\', '/');
    return !['/.env', '/storage', '/tests', '/.phpunit.result.cache', '/node_modules'].some(
      (segment) => relative === segment || relative.startsWith(`${segment}/`)
    );
  },
});

await writeFile(
  join(destinationRoot, 'Caddyfile'),
  `{
  auto_https off
  admin off
  frankenphp
}

http://127.0.0.1:8765 {
  root * "{env.ACCORE_APP_ROOT}/public"
  encode zstd gzip
  php_server
}
`
);

await writeFile(
  join(destinationRoot, 'runtime-source.json'),
  `${JSON.stringify({ target, generatedAt: new Date().toISOString(), sources }, null, 2)}\n`
);

console.log(`Prepared verified Server Desktop runtime in ${destinationRoot}`);

async function downloadVerified(source) {
  const archivePath = join(cacheRoot, source.archive);
  if (await hasExpectedDigest(archivePath, source.sha256)) return archivePath;

  const temporaryPath = `${archivePath}.partial`;
  await rm(temporaryPath, { force: true });
  const response = await fetch(source.url, { redirect: 'follow' });
  if (!response.ok || !response.body) {
    throw new Error(`failed to download ${source.id}: HTTP ${response.status}`);
  }

  const chunks = [];
  for await (const chunk of response.body) chunks.push(chunk);
  await writeFile(temporaryPath, Buffer.concat(chunks));
  if (!(await hasExpectedDigest(temporaryPath, source.sha256))) {
    await rm(temporaryPath, { force: true });
    throw new Error(`SHA-256 mismatch for ${source.id}`);
  }
  await rename(temporaryPath, archivePath);
  return archivePath;
}

async function hasExpectedDigest(path, expected) {
  try {
    const content = await readFile(path);
    return createHash('sha256').update(content).digest('hex') === expected;
  } catch {
    return false;
  }
}

async function extractZip(archivePath, destination) {
  const command = process.platform === 'win32' ? 'powershell.exe' : 'unzip';
  const commandArgs =
    process.platform === 'win32'
      ? [
          '-NoProfile',
          '-NonInteractive',
          '-Command',
          `Expand-Archive -LiteralPath '${archivePath.replaceAll("'", "''")}' -DestinationPath '${destination.replaceAll("'", "''")}' -Force`,
        ]
      : ['-q', archivePath, '-d', destination];
  await new Promise((resolveExtraction, rejectExtraction) => {
    const child = spawn(command, commandArgs, { stdio: 'inherit' });
    child.once('error', rejectExtraction);
    child.once('exit', (code) =>
      code === 0
        ? resolveExtraction()
        : rejectExtraction(
            new Error(`could not extract ${basename(archivePath)} with exit code ${code}`)
          )
    );
  });
}

async function assertFile(path) {
  const details = await stat(path).catch(() => null);
  if (!details?.isFile()) throw new Error(`expected runtime executable is missing: ${path}`);
}
