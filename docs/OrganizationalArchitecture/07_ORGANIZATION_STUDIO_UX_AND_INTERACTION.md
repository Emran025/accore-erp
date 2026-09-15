# DOCUMENT 07 — Organization Studio UX & Interaction Architecture

**Domain:** EnterpriseCore / OrganizationGovernance  
**System:** ACCORE ERP  
**Status:** Approved UX/UI & Interaction Specification  
**Author:** Lead UX/Product Designer & Enterprise Frontend Architect  

---

## 1. Executive Summary

Traditional ERP organizational modules present either a lifeless tabular database view or a brittle, one-dimensional organizational chart. When an enterprise grows beyond a single store, users find it impossible to visualize how their physical warehouses relate to legal entities, or how project squads intersect with functional departments.

The **ACCORE Organization Studio** is a state-of-the-art visual modeling workspace built on Next.js 16, React 19, SVG/Canvas rendering, and Tailwind CSS.

Its governing philosophy is: **"One Underlying Organization Graph, Five Purpose-Built Perspectives"**.

Users can switch instantly between:
1. **Legal & Ownership View** (Holding $\to$ Subsidiaries $\to$ Tax entities)
2. **Operational Logistics & Facilities View** (Supply hubs $\to$ Stores $\to$ Depots $\to$ POS)
3. **Workforce & Line Management View** (Reporting chain, positions, staffing)
4. **Financial Responsibility View** (Controlling areas, profit centers, cost center budgets)
5. **Matrix & Project View** (Cross-functional initiatives and dual reporting)

Each perspective filters and projects the identical underlying graph, allowing frictionless inspection and restructuring with drag-and-drop simplicity, instant integrity feedback, and complete historical auditability.

---

## 2. Studio Shell & Layout Architecture

The Studio workspace adheres strictly to the ACCORE Global Shell Architecture (`02_Shell_Architecture.md`) and Visual Design System (`04_Visual_Design_System.md`): **Zero border radius**, **sharp professional contrast**, **layered domain colors**, and **high-density productivity**.

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [≡] ACCORE ERP │ Organization Studio: Al-Amal Group [v2.4 Published]            [Cmd+K] [👤 Admin] [⏱️]│
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ┌─ Perspective Selector ────────────────────────────────────────────────────────┐ ┌─ Studio Controls ──┐│
│ │ [🏢 Legal] [🏭 Facilities & Stock] [👥 People & Reporting] [📊 Financial] [⚡ Matrix] │ │ [🔍 Search] [↩][↪]││
│ └───────────────────────────────────────────────────────────────────────────────┘ │ [Zoom 100% ▾] [Save]││
├─────────────────────────┬───────────────────────────────────────────────────────┬─┴─────────────────────┤
│ 📂 Structure Navigator  │  🎨 Interactive Graph Canvas                          │ ⚙️ Unit Inspector      │
│ ─────────────────────── │  ─────────────────────────────────────────────────── │ ───────────────────── │
│ 🔍 Filter units...     │                                                       │ 🏢 Olaya Store        │
│                         │        ┌────────────────────────────┐                 │ Code: BR-RUH-01       │
│ ▼ 🏢 Al-Amal Retail LLC │        │ Al-Amal Retail LLC (Legal) │                 │ Status: Active        │
│   ├── 🏭 Riyadh Depot   │        └──────────────┬─────────────┘                 │ ───────────────────── │
│   ├── ☕ Olaya Flagship │                       │                               │ Facets:               │
│   │     ├ [POS-01]      │        ┌──────────────┴──────────────┐                │ [x] Commercial Branch │
│   │     └ [POS-02]      │        │                             │                │ [x] Physical Facility │
│   ├── ☕ Tahlia Store   │ ┌──────▼─────────────┐      ┌────────▼──────────────┐ │ [x] Profit Center     │
│   │     └ [POS-01]      │ │ Riyadh Central Hub │      │ Olaya Flagship Store  │ │ ───────────────────── │
│   └── 🌐 Online Store   │ │ (Logistics Depot)  │      │ (Store + 2 POS Desks) │ │ Operating Facility:   │
│                         │ └──────────────┬─────┘      └───────────────────────┘ │ City: Riyadh          │
│ ─────────────────────── │                │ (Stock Replenish)                    │ Address: Olaya Main St│
│ ➕ Add New Unit         │                └──────────────────────────┐           │ Warehouse: WH-OLAYA-01│
│ 📦 Import Blueprint     │                                           ▼           │                       │
│ 📊 View Health (100%)   │                                ┌────────────────────┐ │ Financial Mapping:    │
│                         │                                │ Tahlia Store (JED) │ │ Cost Center: CC-0104  │
│                         │                                └────────────────────┘ │ Profit Center: PC-0204│
├─────────────────────────┴───────────────────────────────────────────────────────┴───────────────────────┤
│ 🟢 System Status: Active • 1 Legal Entity • 3 Operational Facilities • 24 Positions • 0 Integrity Errors│
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. The Five Specialized Perspectives

### 3.1 Legal & Ownership Perspective
- **Focus:** Statutory entities, corporate holding structure, equity ownership percentages, commercial registrations (CRs), and VAT/ZATCA compliance profiles.
- **Node Styling:** Bold legal identity cards showing country flags, registration numbers, and currency badges.
- **Connectors:** Directed arrows indicating equity ownership percentage (e.g. `100% Subsidiary`, `51% Joint Venture`).
- **Use Case:** Corporate secretary, legal counsel, and chief accountant reviewing group consolidation boundaries.

### 3.2 Operational Logistics & Facilities Perspective
- **Focus:** Physical facilities, warehouses, replenishment channels, and retail POS checkout counters.
- **Node Styling:** Inventory cards displaying current stock storage capacity, warehouse codes, and active POS terminal indicators.
- **Connectors:** Stock transfer replenishment routes (e.g. `Riyadh Central Depot` $\xrightarrow{\text{Truck Routes}}$ `Olaya Branch`).
- **Use Case:** Supply chain director, warehouse manager, and retail operations head planning store replenishment and regional distribution.

### 3.3 Workforce & Line Management Perspective
- **Focus:** Human reporting hierarchy, position staffing, vacant positions, headcount quotas, and line manager approval chains.
- **Node Styling:** Staffing cards showing employee avatars, position codes, job titles, and vacancy badges.
- **Connectors:** Solid vertical hierarchy lines representing direct supervisory command (`line_management`).
- **Use Case:** HR director, department heads, and managers conducting workforce planning, approvals routing, and team re-assignments.

### 3.4 Financial Responsibility & Controlling Perspective
- **Focus:** Managerial accounting, cost center rollups, profit center segment tracking, and expense budgets.
- **Node Styling:** Financial cards showing budget allocation bars, revenue targets, and linked general ledger account ranges.
- **Connectors:** Cost allocation rollups into Controlling Areas.
- **Use Case:** Financial controller and budget analysts monitoring department expense vs budget variance and business-unit margins.

### 3.5 Matrix & Project Initiatives Perspective
- **Focus:** Cross-functional squads, dynamic project teams, and dual-boss reporting relationships.
- **Node Styling:** Agility badges showing project deadlines, milestone progress, and percentage employee allocation.
- **Connectors:** Dual wiring: Solid lines for functional practice heads, dashed vibrant lines for project managers (`dotted_line`).
- **Use Case:** PMO directors, agile delivery leads, and consulting partners allocating consultants across client accounts.

---

## 4. Interaction Design & Direct Manipulation

The Studio provides fluid, tactile, direct-manipulation gestures inspired by modern canvas applications (Figma, Miro):

### 4.1 Node Dragging & Visual Relinking
- **Action:** Grabbing a unit card and hovering over another unit.
- **Behavior:**
  - Target unit highlights in glowing cyan/blue.
  - The engine runs a **real-time topology check** in $< 10$ ms.
  - If valid: A green check badge appears: `"Move Olaya Store under Western Region"`.
  - If invalid (e.g. circular loop or cross-country violation): A red warning tooltip appears: `"Invalid link: Saudi store cannot report directly to UAE operating plant per Topology Rule TR-14"`.
- **Temporal Choice Prompt:** When dropping the node, the system asks:
  > *"Would you like this restructuring to take effect immediately (2026-09-15), or schedule for a future date (e.g. Next Fiscal Period 2027-01-01)?"*

### 4.2 On-Canvas Port Handles
Hovering over any unit card exposes interactive micro-handles:
- `[+] Top Handle:` Add parent / holding entity.
- `[+] Bottom Handle:` Add child department, facility, or sub-unit.
- `[+] Right Handle:` Drag connection to establish a matrix dotted-line relationship.
- `[+] Center Badge:` Add a new Position or staff assignment to this unit.

### 4.3 Context Menu & Quick Actions
Right-clicking any canvas card opens a high-productivity contextual action list:
- **Set as Active Operating Context:** Instantly switches the administrator's working session to this branch.
- **View General Ledger Ledger:** Jumps directly to financial journal entries filtered by this unit's cost center.
- **Assign Manager / Head:** Quick search dropdown to appoint an employee as unit supervisor.
- **Split Unit:** Wizard to divide an expanding department into two specialized sub-units.
- **Merge Units:** Wizard to consolidate two redundant branches, automatically migrating historical records and positions.
- **Temporal History:** Opens the timeline slider showing how this unit evolved over past years.

---

## 5. Keyboard Navigation & Productivity Shortcuts

Power users can navigate and configure the entire organization without touching a mouse:

| Key Binding | Command Action |
| :--- | :--- |
| `Cmd / Ctrl + K` | Open Universal Command Palette (Search units, switch perspectives, trigger actions) |
| `Space + Drag` | Pan canvas smoothly |
| `Scroll / Pinch` | Smooth zoom in / zoom out centered at cursor |
| `Tab / Shift + Tab` | Cycle focus to next / previous sibling node |
| `Enter` | Open selected unit in Property Inspector for editing |
| `Cmd / Ctrl + D` | Duplicate selected unit (creates pre-configured sibling branch) |
| `Delete / Backspace`| Delete unit (with dependent child re-assignment prompt) |
| `Cmd / Ctrl + Z` | Undo last canvas operation |
| `Cmd / Ctrl + Shift + Z` | Redo canvas operation |
| `F` | Focus / Fit all nodes into screen viewport |
| `1` through `5` | Instant switch between the 5 Perspectives |

---

## 6. Property Inspector Specification

The right-hand panel adapts dynamically to the selected object:

### Unit Selected:
- **Header:** Unit Code, Status Toggle (`Active`, `Suspended`, `Closed`), and Primary Domain Tag.
- **General Tab:** Name in English & Arabic, Description, Unit Type (`OrgMetaType` selector).
- **Facets Tab:** Checkbox toggles for `Commercial Branch`, `Physical Facility`, `Profit Center`, `Cost Center`. Toggling a facet instantly unfolds its specific operational parameters.
- **Positions Tab:** List of authorized positions under this unit, showing incumbent employee names or `[VACANT]` indicators, with a `[+ Add Position]` button.
- **Governance & Links Tab:** Active parent relationships, valid dates, and priority weighting.

### Position Selected:
- **Header:** Position Code (e.g., `POS-RET-04`), Grade Level, Headcount Quota (FTE).
- **Job Title:** Linked master job title and job family.
- **Role Permissions:** RBAC role inherited by occupants of this position.
- **Direct Manager:** Linked supervisory position.
- **Occupants:** Current active employee(s) assigned to this slot.

---

## 7. Internationalization (RTL/LTR) & Accessibility

1. **Native Arabic (RTL) First-Class Design:**
   - In Arabic mode, canvas layouts, node hierarchies, connector flow, and navigator sidebars reverse with complete typographic elegance.
   - Text boxes support bidirectional mixed text (e.g., English product codes within Arabic branch names).
2. **Accessible Color Contrast:**
   - Node domain colors adhere strictly to WCAG AAA contrast ratios against dark and light canvas backgrounds.
   - Domain identification does not rely solely on color: every domain includes a distinctive icon fingerprint (e.g. `building` for Enterprise, `boxes` for Logistics, `wallet` for Finance) per `04_Visual_Design_System.md`.
3. **Screen Reader Semantic Tree:**
   - The interactive canvas maintains a synchronized hidden DOM tree (`role="tree"` and `role="treeitem"`), allowing visually impaired administrators to inspect and navigate the hierarchy via standard screen reader keys.
