#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const repositoryRoot = process.cwd();
const tasksRoot = join(repositoryRoot, '.github', 'agent-workflow', 'tasks');
const validStates = new Set(['backlog', 'active', 'review', 'revision', 'accepted', 'rejected']);
const requiredTaskFields = [
  'task_id',
  'title',
  'state',
  'owner_role',
  'created_by',
  'created_at',
  'updated_at',
  'priority',
  'depends_on',
  'blocks',
  'branch',
  'pull_request',
];
const requiredTaskHeadings = [
  'Outcome and business value',
  'Scope boundaries',
  'Dependencies and assumptions',
  'Interface contracts',
  'Technical contract',
  'Acceptance criteria',
  'Verification plan',
  'Implementation evidence',
  'Review evidence',
  'Change history',
];

const errors = [];
const warnings = [];

function walk(directory) {
  if (!existsSync(directory)) return [];

  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = join(directory, entry.name);
    if (entry.isDirectory()) return walk(entryPath);
    return [entryPath];
  });
}

function parseFrontMatter(content, file) {
  const match = content.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n?/);
  if (!match) {
    errors.push(`${file}: missing YAML front matter delimited by ---`);
    return {};
  }

  return match[1].split(/\r?\n/).reduce((frontMatter, line) => {
    if (!line.trim() || line.trimStart().startsWith('#')) return frontMatter;
    const separator = line.indexOf(':');
    if (separator === -1) {
      errors.push(`${file}: malformed front-matter line "${line}"`);
      return frontMatter;
    }

    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim().replace(/^['"]|['"]$/g, '');
    frontMatter[key] = value;
    return frontMatter;
  }, {});
}

function displayPath(file) {
  return relative(repositoryRoot, file).split(sep).join('/');
}

function stateFromPath(file) {
  const pathParts = relative(tasksRoot, file).split(sep);
  return pathParts[0];
}

function hasHeading(content, heading) {
  const escapedHeading = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^#{1,6}\\s+${escapedHeading}\\s*$`, 'm').test(content);
}

function validateTask(file) {
  const relativePath = displayPath(file);
  const state = stateFromPath(file);
  const content = readFileSync(file, 'utf8');
  const frontMatter = parseFrontMatter(content, relativePath);
  const fileName = file.split(sep).at(-1);
  const expectedName = /^(ACC-\d{3,})--[a-z0-9]+(?:-[a-z0-9]+)*\.md$/;

  if (!expectedName.test(fileName)) {
    errors.push(`${relativePath}: task file name must match ACC-###--kebab-case.md`);
  }

  if (!validStates.has(state)) {
    errors.push(`${relativePath}: task must be directly inside a supported state directory`);
  }

  for (const field of requiredTaskFields) {
    if (!(field in frontMatter)) errors.push(`${relativePath}: missing required front-matter field "${field}"`);
  }

  const taskId = fileName.split('--')[0];
  if (frontMatter.task_id && frontMatter.task_id !== taskId) {
    errors.push(`${relativePath}: task_id "${frontMatter.task_id}" does not match file name "${taskId}"`);
  }

  if (frontMatter.state && frontMatter.state !== state) {
    errors.push(`${relativePath}: state "${frontMatter.state}" does not match directory "${state}"`);
  }

  for (const heading of requiredTaskHeadings) {
    if (!hasHeading(content, heading)) errors.push(`${relativePath}: missing required section "${heading}"`);
  }

  return { file, relativePath, taskId, state, frontMatter };
}

function validateReviewArtifact(file, taskIds) {
  const relativePath = displayPath(file);
  const content = readFileSync(file, 'utf8');
  const frontMatter = parseFrontMatter(content, relativePath);
  const fileName = file.split(sep).at(-1);
  const match = fileName.match(/^(ACC-\d{3,})--(architecture-and-code-review|interface-and-data-review)\.review\.md$/);

  if (!match) {
    errors.push(`${relativePath}: review file name must identify an approved independent reviewer role`);
    return null;
  }

  if (!taskIds.has(match[1])) errors.push(`${relativePath}: review references a task record that does not exist`);
  if (frontMatter.task_id && frontMatter.task_id !== match[1]) {
    errors.push(`${relativePath}: task_id does not match file name`);
  }

  for (const field of ['task_id', 'reviewer_role', 'reviewed_ref', 'decision', 'reviewed_at']) {
    if (!(field in frontMatter)) errors.push(`${relativePath}: missing required review field "${field}"`);
  }

  if (frontMatter.decision && !['approved', 'revision-required', 'not-applicable', 'pending'].includes(frontMatter.decision)) {
    errors.push(`${relativePath}: invalid review decision "${frontMatter.decision}"`);
  }

  return { taskId: match[1], decision: frontMatter.decision, file: relativePath };
}

function validateDecisionArtifact(file, type, taskIds) {
  const relativePath = displayPath(file);
  const content = readFileSync(file, 'utf8');
  const frontMatter = parseFrontMatter(content, relativePath);
  const suffix = type === 'accepted' ? 'acceptance' : 'rejection';
  const match = file.split(sep).at(-1).match(new RegExp(`^(ACC-\\d{3,})--final-decision\\.${suffix}\\.md$`));

  if (!match) {
    errors.push(`${relativePath}: final-decision file name must match ACC-###--final-decision.${suffix}.md`);
    return null;
  }

  if (!taskIds.has(match[1])) errors.push(`${relativePath}: decision references a task record that does not exist`);
  if (frontMatter.task_id && frontMatter.task_id !== match[1]) errors.push(`${relativePath}: task_id does not match file name`);
  if (frontMatter.decision && frontMatter.decision !== (type === 'accepted' ? 'accepted' : 'terminal-rejection')) {
    errors.push(`${relativePath}: decision does not match the enclosing state`);
  }

  const requiredFields = type === 'accepted'
    ? ['task_id', 'decision', 'accepted_by', 'accepted_at', 'reviewed_ref']
    : ['task_id', 'decision', 'rejected_by', 'rejected_at', 'reason', 'successor_task'];
  for (const field of requiredFields) {
    if (!(field in frontMatter)) errors.push(`${relativePath}: missing required final-decision field "${field}"`);
  }

  if (type === 'rejected' && frontMatter.reason && !['duplicate', 'obsolete', 'invalid', 'superseded'].includes(frontMatter.reason)) {
    errors.push(`${relativePath}: invalid terminal-rejection reason "${frontMatter.reason}"`);
  }

  return match[1];
}

if (!existsSync(tasksRoot)) {
  errors.push('.github/agent-workflow/tasks: required task workspace does not exist');
} else {
  const markdownFiles = walk(tasksRoot).filter((file) => file.endsWith('.md'));
  const taskFiles = markdownFiles.filter((file) => !file.endsWith('.review.md') && !file.endsWith('.acceptance.md') && !file.endsWith('.rejection.md'));
  const tasks = taskFiles.map(validateTask);
  const taskIds = new Set(tasks.map((task) => task.taskId));
  const artifacts = markdownFiles.filter((file) => !taskFiles.includes(file));
  const reviews = artifacts.filter((file) => file.endsWith('.review.md')).map((file) => validateReviewArtifact(file, taskIds)).filter(Boolean);
  const accepted = new Set(artifacts.filter((file) => file.endsWith('.acceptance.md')).map((file) => validateDecisionArtifact(file, 'accepted', taskIds)).filter(Boolean));
  const rejected = new Set(artifacts.filter((file) => file.endsWith('.rejection.md')).map((file) => validateDecisionArtifact(file, 'rejected', taskIds)).filter(Boolean));

  for (const task of tasks) {
    const taskReviews = reviews.filter((review) => review.taskId === task.taskId);
    if (task.state === 'review' && taskReviews.length === 0) {
      warnings.push(`${task.relativePath}: no review record exists yet; review evidence is required before final decision`);
    }
    if (task.state === 'revision' && !taskReviews.some((review) => review.decision === 'revision-required')) {
      errors.push(`${task.relativePath}: revision state requires at least one revision-required review record`);
    }
    if (task.state === 'accepted' && !accepted.has(task.taskId)) {
      errors.push(`${task.relativePath}: accepted state requires a final-decision acceptance record`);
    }
    if (task.state === 'rejected' && !rejected.has(task.taskId)) {
      errors.push(`${task.relativePath}: rejected state requires a final-decision rejection record`);
    }
  }

  console.log(`Validated ${tasks.length} task record(s) and ${artifacts.length} evidence record(s).`);
}

for (const warning of warnings) console.warn(`WARNING: ${warning}`);
for (const error of errors) console.error(`ERROR: ${error}`);

if (errors.length > 0) {
  console.error(`Task-governance validation failed with ${errors.length} error(s).`);
  process.exit(1);
}

console.log('Task-governance validation passed.');
