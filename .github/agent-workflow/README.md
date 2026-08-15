# Agent Team Workflow

This directory is the repository-native coordination system for the agent team. It uses **versioned task records, pull requests, review records, and continuous validation**. It deliberately does **not** use GitHub Issues as a work-management dependency. Every task has one canonical Markdown record, and that record travels through the workflow with the implementation it governs.

> A task is a bounded change with an explicit acceptance contract. A review is an independent quality decision against that contract. Neither is a substitute for the other.

## Operating model

Each task record is named `<TASK-ID>--<slug>.md` and is stored in exactly one state directory. A task begins in `backlog/`, becomes `active/` when implementation starts, and enters `review/` in the same pull request that submits its code. If either review agent finds a material defect, it moves to `revision/`; the implementation team corrects the recorded findings and resubmits it to `review/`. The final-decision agent alone moves a task to `accepted/` or to the administrative `rejected/` archive.

| State | Meaning | Permitted actor | Required evidence before leaving |
| --- | --- | --- | --- |
| `backlog/` | A scoped and ready task awaiting execution. | Planning agent | Complete task contract and boundary declaration. |
| `active/` | A team member is implementing the task on its own branch. | Implementation agent | Progress note and implementation branch or pull request reference. |
| `review/` | The implementation team has submitted a self-reviewed change. | Implementation agent | Passing checks, test evidence, and both review records. |
| `revision/` | A reviewer identified a material, reproducible issue that must be corrected. | Review agent | Precise findings, affected files or paths, expected correction, and retest instructions. |
| `accepted/` | The final decision confirms the task meets its full contract and has no known material improvement required. | Final-decision agent | Complete evidence bundle and an explicit completion attestation. |
| `rejected/` | A terminal administrative closure, such as duplicate, obsolete, invalid, or superseded scope. It is **not** a code-quality rejection. | Final-decision agent | Closure rationale, successor task if applicable, and confirmation that no implementable acceptance contract remains open. |

A normal quality rejection is therefore never silently closed: it is represented by `revision/`. This preserves a clear distinction between “needs improvement” and “terminally closed,” and prevents an incomplete implementation from being mistaken for a completed task.

## Team-member files

The files in [`../agents/`](../agents/) are the source of truth for role boundaries, inputs, outputs, and authority. Attach each configured assistant to its matching role file before it begins work. The default team contains an intake and planning agent, an implementation agent, two independent review agents, a revision and validation agent, and a final-decision agent.

| Role | Primary responsibility | May modify production code? | May make the final decision? |
| --- | --- | ---: | ---: |
| Intake and planning | Decompose work into atomic, contract-driven task records. | No | No |
| Implementation | Build the approved task only within its declared boundaries. | Yes | No |
| Architecture and code review | Independently assess architecture, boundaries, correctness, security, performance, and maintainability. | No | No |
| Interface and data review | Independently assess design, structure, data, accessibility, RTL/LTR, and component reuse. | No | No |
| Revision and validation | Apply approved corrections and rerun required validation. | Yes | No |
| Final decision | Confirm evidence, resolve review status, and authorize acceptance or terminal closure. | No | Yes |

The two review roles must remain independent. They may read each other’s completed records only after recording their own initial conclusion, and neither may approve or edit the implementation under review.

## Task separation and component boundaries

A task must address **one independently testable outcome**. It cannot mix unrelated domains, backend and frontend changes without an explicit API contract, or several interface concerns simply because they appear on the same page. When a change is too broad, the planning agent must split it into linked task records with ordered dependencies.

Every interface-related task must declare separate contracts for **design**, **structure**, and **data**. A task may alter more than one contract only when it names each one, explains the dependency, and provides separate acceptance criteria.

| Contract | Owns | Must not absorb |
| --- | --- | --- |
| Design contract | Visual tokens, spacing, typography, responsive behavior, RTL/LTR behavior, interaction states, and accessibility presentation. | API fetching, business rules, persistence, or page-level orchestration. |
| Structural contract | Component hierarchy, public props, slots/composition boundaries, route composition, and ownership location. | Arbitrary visual changes or data-fetching logic concealed inside a reusable component. |
| Data contract | Type definitions, API-client calls, loading/error/empty states, state ownership, transformations, and cache/update behavior. | Layout styling or undocumented component-structure changes. |

The team must use the repository’s existing reusable components before creating a new one. A “pre-built component” is an approved reusable UI primitive or composed component with a clear public interface. It is not a reason to paste pre-built code, bypass local conventions, or duplicate an existing component. New reusable components require a documented reuse case, explicit props, focused tests, and placement in the appropriate component directory.

## Required task record sections

Use [`templates/task.md`](templates/task.md) without deleting required headings. A record is valid only if its metadata and body identify the task identity, state, owner role, scope, dependencies, design/structure/data boundaries, acceptance criteria, verification plan, and evidence links. The task must also state which files or directories are expected to change and which are explicitly out of scope.

The immutable `task_id` is the only cross-reference key. Use it in the branch name, pull-request title, commits where practical, review-record filename, and task metadata. Do not use an issue number or an issue-closing keyword.

## Review and improvement gate

The implementation agent must complete the self-review evidence before requesting review. The architecture-and-code reviewer and the interface-and-data reviewer each create a review record from [`templates/review.md`](templates/review.md). Findings are classified as `blocker`, `required`, `advisory`, or `not-applicable`.

| Outcome | Condition | Next action |
| --- | --- | --- |
| Ready for final decision | Both reviewers return `approved` and all automated checks are passing. | Final-decision agent examines the evidence bundle. |
| Revision required | Either reviewer records a `blocker` or `required` finding, or required checks fail. | Move the task to `revision/` and correct every finding before resubmission. |
| Advisory improvement | Only advisory findings remain. | Final-decision agent decides whether the advice is material enough to require revision; the decision is documented. |
| Terminal rejection | The task is duplicate, obsolete, invalid, or superseded, and has no remaining implementable acceptance contract. | Final-decision agent archives it in `rejected/` with a closure record. |

A task cannot be accepted on a statement of intent. The final-decision agent must verify the full acceptance contract, passing required checks, test evidence, completion of required review findings, repository placement, documentation impact, and any relevant RTL/LTR or accessibility evidence. The acceptance record must state that the completed scope is **functionally complete, technically sound, professionally maintainable, and has no known material improvement outstanding**.

## Pull-request convention

Use a short-lived branch that includes the task ID, for example `feat/ACC-042-payroll-overtime`. The pull-request title begins with the same ID. The pull request must include the task record move, the implementation, required tests, and the evidence links. It must not reference or close a GitHub Issue.

The repository’s existing contribution rules remain in force. The code must respect the Laravel domain boundaries, frontend component hierarchy, typed contracts, test requirements, internationalization and RTL/LTR obligations, security controls, and documentation expectations defined in [`../CONTRIBUTING.md`](../CONTRIBUTING.md).

## Automation

The `agent-task-governance` workflow validates task-record metadata, state placement, mandatory sections, task-ID naming, and evidence references on pull requests. It is intentionally deterministic: it verifies the process artifacts but does not pretend to replace expert review or automatically approve code.

Run the same validation locally before opening a pull request:

```bash
node scripts/validate-agent-tasks.mjs
```

## File ownership and lifecycle

Task records and review records are permanent engineering evidence. Do not delete them after merge. Move records with `git mv` so that history remains explicit. The record’s state directory is authoritative; the YAML `state` field must always match that directory. Review records live beside their task in the `review/` or `revision/` state directory and use the format `<TASK-ID>--<reviewer-role>.review.md`.

The `.gitkeep` files preserve empty state directories but do not represent tasks.
