# Guided setup revision and conflict contract

## Revision scope

`settings.setup.revision` is a positive integer for the current installation's shared setup state. This matches the repository's existing unscoped `settings.setup.*` profile/module records and its shared organization-structure setup resources. The revision is not a tenant/session token and does not protect unrelated operational APIs, accounting transactions, or generic business records.

The revision row is created on first use in the existing `settings` table; no schema migration or separate persistence model is required. A single shared revision intentionally covers the setup state below. Any new route that reads this state must use `setup.revision:read`; any route that mutates it must use `setup.revision:write` (or `setup.revision:blueprint` for publication). The generic settings update action rejects `setup.*` keys so that they cannot bypass this contract.

## Covered reads and writes

Revision-bearing setup reads are:

- `GET /v2/setup/state` and `GET /v2/setup/organization-templates`.
- `GET /v2/operating-context/readiness`.
- Organization-node and organization-link reads used by setup and administration, including `GET /v2/org-structure/nodes`, `GET /v2/org-structure/nodes/{uuid}`, and `GET /v2/org-structure/links`.
- `GET /v2/org-studio/perspectives/{key}`.
- `GET /v2/setup/blueprint/latest`.

Protected mutations are organization-profile save, organization-template application, module selection and activation, organization-node CRUD and bulk status, organization-link CRUD, operating-context configuration/selection, Org Studio restructuring/facet updates, and blueprint staging/publication. Inference preview/validation and unrelated finance APIs are not setup-state mutations.

## Conditional-write protocol

A successful JSON read exposes `setup_revision` in the response body and `X-Setup-Revision` in the response headers. Send every protected mutation with `If-Match: "<setup_revision>"` using the revision from the state being edited.

The server acquires the revision row lock and compares the supplied integer inside the same database transaction that runs the covered mutation. A successful mutation advances the shared revision once and returns the new `setup_revision` and `X-Setup-Revision`. A failed validation or rejected precondition does not advance it.

- Missing or malformed `If-Match`: HTTP `428`, code `setup_revision_required`, `current_revision`, and `reload_required: true`.
- A stale shared revision: HTTP `409`, code `setup_state_conflict`, `current_revision`, and `reload_required: true`.
- Blueprint publication also requires `blueprint_revision`, an opaque SHA-256 token for the staged blueprint UUID, name, lifecycle status, complexity grade, primary archetype, and JSON content. A missing token returns `428` with `setup_blueprint_revision_required`; a token for different staged content returns `409` with `conflict_scope: "blueprint"` and `current_blueprint_revision`.

Older clients that omit the validator are intentionally rejected rather than treated as current. They must reload authoritative setup state and retry only after the user reconciles the draft.

## Client recovery

Guided setup reloads authoritative state and readiness after a conflict, detects inconsistent revisions across its parallel setup reads and retries that read once, and does not auto-resubmit the failed mutation. User-entered form and inference values remain local editable drafts and are not treated as server-confirmed completion. Blueprint conflicts invalidate only the cached staged UUID/token while retaining the user's local blueprint draft; after refreshing, the user must stage that draft again before publishing.

The existing out-of-order-read protection remains in place. Future setup mutations must preserve the transaction/validator boundary and add focused stale-write and no-side-effect coverage; route-wide guards for unrelated APIs are out of scope.
