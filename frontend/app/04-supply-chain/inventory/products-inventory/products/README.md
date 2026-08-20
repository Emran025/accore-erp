# Products and inventory import

The products screen now exposes a reusable **DataImportWorkspace** beside manual product entry. The workspace accepts `.xlsx`, `.xls`, `.csv`, and `.tsv` files, detects the first worksheet header row, suggests external-to-internal links from aliases, and keeps the source data available for correction.

The import model deliberately treats `item_type` as the first-class discriminator. Dependent fields such as inventory tracking and sellability are shown only when the selected class makes them meaningful. Each normalized row is validated before the review step; the gallery shows the interpreted product class, stock, and price, while the raw grid keeps the mapped values editable.

After review, rows are sent to `POST /v2/inventory/products/import`. The backend validates a maximum of 1,000 canonical rows and reuses `CreateProductAction`, including initial-stock costing layers and operation logging. The persisted `catalog_code` is exposed to the existing frontend as the barcode alias.

Inventory balance reports expose the same report-template vocabulary through the `inventory_report` template type. Users can choose a saved inventory template and select the visible report fields before previewing or exporting CSV.
