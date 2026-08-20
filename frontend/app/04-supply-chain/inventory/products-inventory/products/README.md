# Products and inventory import

The products screen exposes a reusable **DataImportWorkspace** beside manual product entry. The workspace accepts `.xlsx`, `.xls`, `.csv`, and `.tsv` files, detects the first worksheet header row, suggests external-to-internal links from aliases, preserves source headers as evidence, and keeps normalized values editable before commit.

## Canonical model

The reusable field contract lives in `frontend/lib/imports/import-model.ts`. Product-specific semantics live in `frontend/lib/imports/product-field-registry.ts`, which defines the item classes, class defaults, dependent visibility, approval sensitivity, field aliases, and canonical field metadata. Manual product entry and imported rows both pass through `applyProductClassPolicy`, preventing services from gaining stock and raw materials from becoming sellable by accident.

The `item_type` field is the first-class discriminator. Product and raw-material classes expose stock-bearing fields, while services force inventory control and stock quantity off. Raw materials force sellability off. Derived or review-sensitive fields are declared in the registry rather than duplicated in the dialog. The current contract is explicitly versioned as `product-import.v1`; unsupported versions fail closed so future migrations can introduce a new mapper instead of silently changing the meaning of existing files.

## Binding workspace

`DataImportWorkspace` is model-agnostic through optional `normalizeRow`, `validateRow`, and `isFieldVisible` handlers. The current product page supplies its canonical dependency and approval resolver, while future supplier, inventory, or operational imports can provide their own typed descriptors without copying the workspace.

Every source-to-internal mapping is classified as an exact match, alias match, manual link, unresolved link, or conflict. Source headers remain immutable evidence, while the raw review grid is editable. The review stage includes product-card interpretation, row-level validation, searchable and paginated browsing for the complete import set, and a bilingual approval checkpoint for sensitive fields such as class, barcode/catalog code, cost, stock, sellability, inventory control, and taxability. Any mapping or value edit invalidates the prior approval acknowledgment and requires a new review.

## Governed commit contract

After approval, the client sends `POST /v2/inventory/products/import` with normalized rows, a UUID batch identifier, source filename, approval acknowledgment, and the approved field identifiers. The backend independently normalizes class-dependent defaults, verifies coherence and duplicate catalog codes within the batch, requires complete approval-field coverage, and reuses `CreateProductAction` inside a transaction.

Committed imports are recorded in `product_import_batches` with source, status, row count, schema version, approval fields, approval actor/time, approval digest, product IDs, creator, timestamp, and failure metadata. The digest is recomputed server-side from the normalized rows and approved fields, so a changed payload cannot reuse a previous commit identity. A committed batch can be safely replayed by its batch identifier without creating duplicate products, while failed batches can be retried through the controlled recovery state. The batch identifier and approval context are also included in the operation audit event.

## Reporting boundary

Inventory balance reports use the governed `inventory_report` template type. Saved templates and visible fields are selected before preview/export, and report output remains based on the same normalized product data used by the preview. Template compatibility and approval-sensitive export policy are the next natural extension point for the report governance parent issue.

## Verification

The focused product import policy suite covers class normalization, service/raw-material defaults, dependent field visibility, and approval requirement derivation. The existing frontend test suite and production build remain required gates; the repository’s only unrelated full TypeScript failure is the pre-existing desktop credential test fixture missing `schemaVersion`, `deviceAccessToken`, and `deviceId`.
