# Visual Design System

The visual language of ACCSYSTEM is designed for **long-session durability**. It prioritizes readability, instant recognition, and operational efficiency over purely decorative elements.

## 1. Visual Discipline

### 1.1 Geometry & Borders
- **Zero Radius:** All containers and interactive elements use sharp corners to maximize screen real estate and maintain a professional "Enterprise" look.
- **Zero Borders:** Separation is achieved through subtle depth (shadows) and color shifts rather than explicit lines.

### 1.2 Hierarchy via Color
Interaction states are defined by:
- **Active:** Deep contrast or glow.
- **Inactive/Hover:** Transparency shifts.
- **Hierarchy:** Layer-specific color coding (see below).

## 2. The Color Layering Strategy
To prevent the user from getting lost in deep navigation trees, the system uses "Layer Colors" to differentiate the 4-layer hierarchy.

| Layer | Design Logic | Visual Effect |
| ----- | ------------ | ------------- |
| **Domain** | Primary Anchor | Unique color per domain (e.g., Finance = Blue). |
| **Capability** | Sub-Anchor | Lighter shade or related accent. |
| **Feature Group** | Logical Cluster | Muted variant to signify grouping. |
| **Screen** | Functional Unit | Constant neutral color for maximum focus. |

## 3. Iconography: "Visual Fingerprinting"
Every Screen and Folder possesses a unique, purposeful icon.
- **Library Consistency:** All icons are from a unified design library.
- **Cognitive Recognition:** Icons are paired with colors to create a "Visual Fingerprint" in the user's memory, allowing for instant recognition in Search, Recent Tabs, and the Sidebar.

## 4. Typography & Information Density
The platform supports three distinct font size modes to balance readability with data density.

- **Small (sm):** Optimized for data-heavy grids and expert users.
- **Medium (md):** The standard operational size.
- **Large (lg):** Enhanced comfort for oversight or tablet usage.

*These modes are system-wide constraints rather than arbitrary styles, ensuring the UI never "breaks" when font sizes change.*

## 5. UI Templates for Navigation
When a folder/module is clicked, the system doesn't just show a list. It presents:
- **Feature Cards:** Visual blocks with descriptions and icons.
- **Quick Actions:** Direct shortcuts to "Create New" or "View Reports" for that module.
- **Educational Layer:** Short descriptions of the module's business objective.
