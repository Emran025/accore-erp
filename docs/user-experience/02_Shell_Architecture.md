# Global Shell Architecture

The ACCSYSTEM shell (The Outer Framework) is designed as a "permanent roof" for the platform. It provides stability while allowing the workspace to remain flexible and content-focused.

## 1. The 4 Functional Bars
For architectural clarity, the shell is divided into four strictly named components:

### 1.1 SideNavigationBar (Primary Navigation)
The "Backbone" of the experience. It manages the system's structural hierarchy.
- **Divisions:** Opened (Active), System Menu (Full), and Favorites.
- **Behavior:** Expandable horizontally. Provides a "File System" metaphor for screens.
- **Folding Strategy:** Collapsible to preserve workspace. In "Content-Dense" screens, it folds automatically while leaving a persistent "Recall" button.

### 1.2 TopGlobalBar (Header)
The "Ceiling" of the system. It contains high-level global commands.
- **Functional Groups:** Menu, Edit, Extensions, System, Help.
- **Title Focus:** The current screen name is centered in a larger font to act as a mental anchor.
- **Metadata:** Displays user session, active role, and system time/session counter in a consolidated operational group.

### 1.3 SearchNavigationBar (Utility)
Located immediately below the Top Bar. Acts as the primary tool for speed.
- **Interactive Breadcrumbs:** Allows instant navigation to any parent level (Windows Explorer style).
- **Multi-Level Search:** Fast access to screens, settings, and commands (command palette style).
- **Directionals:** Back/Next/Up buttons to reduce cognitive load during multi-tasking.

### 1.4 StatusNotificationBar (Footer)
A permanent bar at the bottom reserved for system feedback.
- **Non-Intrusive:** Displays success, failure, and warning states.
- **Audit Logs:** Provides a glance at background process statuses.

## 2. Interaction Logic

### 2.1 Workspace Fluidity
No borders or radius are used in the shell elements. Interaction is expressed through **Color, Transparency, and Shadow** only. This creates a "Glassmorphism" effect that feels light and modern.

### 2.2 Behavior Preservation
User preferences for sidebar width, folding state, and theme are stored locally. The system remembers how the user likes to work, minimizing setup time on every login.

### 2.3 Visual Anchoring
The workspace background is kept neutral with a subtle, non-distracting floating watermark of the system logo to maintain brand identity without interfering with data density.
