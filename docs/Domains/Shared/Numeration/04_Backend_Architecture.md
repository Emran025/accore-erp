# Backend Architecture

The backend engine of the Numeration system is powered by a central `NumberRangeService` that manages concurrency, validation, and persistence.

## Generation Logic
The most critical aspect of the system is guaranteeing that no two entities receive the same number, even under high concurrent load (Race Conditions).

### Concurrency Protection (Pessimistic Locking)
The system utilizes database-level `lockForUpdate` when generating a next number:
1. Opens a database Transaction.
2. Selects the `NrInterval` record with a FOR UPDATE lock.
3. Calculates the next number (`current_number + 1`).
4. Updates the record and persists it.
5. Commits the transaction and releases the lock.

### Formatting Engine
Once the raw number is fetched, the service applies the following:
- **Zero Padding:** Prefixes the number with zeros based on `number_length`.
- **Prefix Application:** Prepends the string `prefix` if defined.
- **Example:** Number `45`, Length `6`, Prefix `INV-` results in `INV-000045`.

## `NumberRangeService` API
Key methods available in the service:
- `getNextNumber(objectId, groupId)`: Generates, consumes, and returns the next formatted number.
- `previewNextNumber(objectId, groupId)`: Returns what the next number *would* be without consuming it (read-only).
- `hasOverlap(objectId, from, to)`: Validates that a new proposed range does not conflict with existing intervals.
- `expandInterval(intervalId, newTo)`: Safely updates the upper limit of a range with audit logging.
- `getSystemSummary()`: Generates a comprehensive report of all numbering objects and their current consumption health.

## Fullness Thresholds
The system uses pre-defined thresholds for automatic status reporting:
- **Healthy:** Under 80% consumption.
- **Warning:** 80% to 95% consumption (suggests planning an expansion).
- **Critical:** Over 95% consumption (immediate action required).

## Integration Pattern
To use numbering for a new entity (e.g., "Projects"):
1. Register the `object_type` in the system seeders.
2. Call `NumberRangeService` within the `StoreRequest` or `Controller` of the entity to fetch the code during creation.
