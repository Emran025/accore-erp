const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT_DIR = 'C:/xampp/htdocs/accore';
const EPOCHS_DIR = path.join(ROOT_DIR, 'doc_engine_specification', 'dpi_epochs');
const MANIFEST_FILE = path.join(ROOT_DIR, 'doc_engine_specification', 'DPI_MANIFEST.md');

const TARGETS = {
    frontendPages: path.join(ROOT_DIR, 'frontend', 'app'),
    frontendComponents: path.join(ROOT_DIR, 'frontend', 'components'),
    backendRoutes: path.join(ROOT_DIR, 'backend', 'routes'),
    backendControllers: path.join(ROOT_DIR, 'backend', 'app', 'Http', 'Controllers', 'Api', 'V2'),
    backendRequests: path.join(ROOT_DIR, 'backend', 'app', 'Http', 'Requests'),
    backendActions: path.join(ROOT_DIR, 'backend', 'app', 'Domains'),
    backendResources: path.join(ROOT_DIR, 'backend', 'app', 'Http', 'Resources'),
};

if (!fs.existsSync(EPOCHS_DIR)) {
    fs.mkdirSync(EPOCHS_DIR, { recursive: true });
}

function walk(dir, extFilter = null, ignoreStr = null) {
    if (!fs.existsSync(dir)) return [];
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            if (ignoreStr && fullPath.includes(ignoreStr)) return;
            results = results.concat(walk(fullPath, extFilter, ignoreStr));
        } else {
            if (!extFilter || fullPath.endsWith(extFilter)) {
                results.push(fullPath);
            }
        }
    });
    return results;
}

function computeHash(content) {
    return crypto.createHash('sha256').update(content).digest('hex').substring(0, 16);
}

console.log("Starting Engine Phase -1: Project Discovery & DPI Epoch Creation...");

let currentEpoch = {
    timestamp: new Date().toISOString(),
    frontend: { pages: {}, components: {} },
    backend: { routes: {}, controllers: {}, requests: {}, actions: {}, resources: {} }
};

// 1. Process Frontend Pages
walk(TARGETS.frontendPages, '.tsx', 'node_modules').forEach(f => {
    const content = fs.readFileSync(f, 'utf8');
    const relPath = path.relative(ROOT_DIR, f).replace(/\\/g, '/');
    const hash = computeHash(content);
    currentEpoch.frontend.pages[relPath] = { path: relPath, hash, size: content.length };
});

// 2. Process Frontend Components
walk(TARGETS.frontendComponents, '.tsx', 'node_modules').forEach(f => {
    const content = fs.readFileSync(f, 'utf8');
    const relPath = path.relative(ROOT_DIR, f).replace(/\\/g, '/');
    currentEpoch.frontend.components[relPath] = { path: relPath, hash: computeHash(content) };
});

// 3. Process Backend Routes
walk(TARGETS.backendRoutes, '.php').forEach(f => {
    const content = fs.readFileSync(f, 'utf8');
    const relPath = path.relative(ROOT_DIR, f).replace(/\\/g, '/');
    currentEpoch.backend.routes[relPath] = { path: relPath, hash: computeHash(content) };
});

// 4. Process Backend Controllers
walk(TARGETS.backendControllers, '.php').forEach(f => {
    const content = fs.readFileSync(f, 'utf8');
    const relPath = path.relative(ROOT_DIR, f).replace(/\\/g, '/');
    currentEpoch.backend.controllers[relPath] = { path: relPath, hash: computeHash(content) };
});

// 5. Process Backend FormRequests
walk(TARGETS.backendRequests, '.php').forEach(f => {
    const content = fs.readFileSync(f, 'utf8');
    const relPath = path.relative(ROOT_DIR, f).replace(/\\/g, '/');
    currentEpoch.backend.requests[relPath] = { path: relPath, hash: computeHash(content) };
});

// 6. Process Backend Actions
walk(TARGETS.backendActions, '.php').filter(f => f.includes('Actions')).forEach(f => {
    const content = fs.readFileSync(f, 'utf8');
    const relPath = path.relative(ROOT_DIR, f).replace(/\\/g, '/');
    currentEpoch.backend.actions[relPath] = { path: relPath, hash: computeHash(content) };
});

// 7. Process Backend Resources
walk(TARGETS.backendResources, '.php').forEach(f => {
    const content = fs.readFileSync(f, 'utf8');
    const relPath = path.relative(ROOT_DIR, f).replace(/\\/g, '/');
    currentEpoch.backend.resources[relPath] = { path: relPath, hash: computeHash(content) };
});

// Read previous epoch
const epochsList = fs.readdirSync(EPOCHS_DIR).filter(f => f.endsWith('.json')).sort();
let previousEpoch = null;
if (epochsList.length > 0) {
    const lastEpochFile = path.join(EPOCHS_DIR, epochsList[epochsList.length - 1]);
    console.log(`Loading previous epoch for comparison: ${epochsList[epochsList.length - 1]}`);
    previousEpoch = JSON.parse(fs.readFileSync(lastEpochFile, 'utf8'));
} else {
    console.log("No previous epoch found. This is an initial run.");
}

// Compare current vs previous
let comparison = {
    newFiles: 0,
    modifiedFiles: 0,
    deprecatedFiles: 0,
    unchangedFiles: 0
};

const compareCategory = (currentCat, prevCat) => {
    if (!prevCat) prevCat = {};
    for (const [key, val] of Object.entries(currentCat)) {
        if (!prevCat[key]) comparison.newFiles++;
        else if (prevCat[key].hash !== val.hash) comparison.modifiedFiles++;
        else comparison.unchangedFiles++;
    }
    for (const key of Object.keys(prevCat)) {
        if (!currentCat[key]) comparison.deprecatedFiles++;
    }
}

['pages', 'components'].forEach(cat => compareCategory(currentEpoch.frontend[cat], previousEpoch?.frontend[cat]));
['routes', 'controllers', 'requests', 'actions', 'resources'].forEach(cat => compareCategory(currentEpoch.backend[cat], previousEpoch?.backend[cat]));

console.log("\n========= EPOCH COMPARISON =========");
console.log(`New Files:        ${comparison.newFiles}`);
console.log(`Changed Files:    ${comparison.modifiedFiles}`);
console.log(`Deprecated Files: ${comparison.deprecatedFiles}`);
console.log(`Unchanged Files:  ${comparison.unchangedFiles}`);
console.log("====================================\n");

// Write new Epoch
const newEpochId = Date.now().toString();
const newEpochFile = path.join(EPOCHS_DIR, `epoch_${newEpochId}.json`);
fs.writeFileSync(newEpochFile, JSON.stringify(currentEpoch, null, 2));

console.log(`Phase -1 Complete: DPI Epoch ${newEpochId} locked and saved.`);

// Update DPI Manifest Preview
let mdContent = `# COMPILER-GRADE ENGINE MANIFEST - EPOCH ${newEpochId}\n\n`;
mdContent += `> Automatically generated Phase -1 Discovery.\n\n`;
mdContent += `**Total Indexed:**\n`;
mdContent += `- Frontend Pages: ${Object.keys(currentEpoch.frontend.pages).length}\n`;
mdContent += `- Frontend Components: ${Object.keys(currentEpoch.frontend.components).length}\n`;
mdContent += `- Backend Routes: ${Object.keys(currentEpoch.backend.routes).length}\n`;
mdContent += `- Backend Controllers: ${Object.keys(currentEpoch.backend.controllers).length}\n`;
mdContent += `- Backend Requests: ${Object.keys(currentEpoch.backend.requests).length}\n`;
mdContent += `- Backend Actions: ${Object.keys(currentEpoch.backend.actions).length}\n`;
mdContent += `- Backend Resources: ${Object.keys(currentEpoch.backend.resources).length}\n`;

fs.writeFileSync(MANIFEST_FILE, mdContent, 'utf8');
console.log("DPI Manifest Markdown updated.");
