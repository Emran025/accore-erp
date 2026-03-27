# Setup & Configuration Guide

This guide walks administrators through the steps required to initialize and manage numbering for a new system entity.

## Phase 1: Initialization (NRO Setup)
When you first access the Numbering Management page for a new type, you will be prompted to "Setup Numbering System":
1. **Object Name:** A descriptive name (e.g., "Employee Master Data").
2. **Number Length:** Choose a length that covers future growth (e.g., 8 digits allow for 99M records).
3. **Prefix:** A short code to distinguish the entity (e.g., `EMP-`).

## Phase 2: Defining Groups
Segment your entity into logical groups:
- **Example for Employees:** (Permanent, Contract, Intern).
- Give each group a unique identifier (e.g., `PERM`, `CONT`).

## Phase 3: Defining Intervals (Ranges)
Create the actual numeric boundaries:
- **Example:** Create "General Employee Range" From 1 To 100,000.
- **Internal Type:** Selected for automatic generation.
- **External Type:** Selected if you want to enter IDs manually (system will strictly validate them against this range).

## Phase 4: Linking Groups to Intervals
This is the most important step for activation:
1. Select a Group (e.g., Permanent Employee).
2. Select an Interval (e.g., General Employee Range).
3. Save the Assignment. Now, whenever a "Permanent" employee is added, the system knows exactly which range to pull from.

## Best Practices
- **Buffer Your Ranges:** Leave gaps between different intervals to allow for future expansion without causing overlaps.
- **Use Prefixes Wisely:** Prefixes help in quick identification during search and within reports.
- **Monitor Fullness:** Regularly check the "Fullness Analysis" tab to expand ranges before they run out.
- **Planned Expansions:** When expanding, ensure the new upper limit doesn't hit the start of another interval.

## FAQ
**Q: Can I delete a range that has already been used?**
A: No. The system prevents the deletion of any range with a `current_number > 0` to preserve the integrity of existing records.

**Q: Can I change the Number Length after setup?**
A: This is restricted once generation has started, as changing the length would break the formatting of existing records in the database.
