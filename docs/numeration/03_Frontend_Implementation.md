# Frontend Implementation

The Numeration frontend is designed to be a "Self-Service Administration" portal, providing a sophisticated UI for managing complex numbering policies.

## Main Component: `NumberRangeManager`
This is a high-level, reusable component that handles the entire NR lifecycle for a given entity.

### Props
- `objectType` (string): The unique entity key (e.g., "employees"). **Required**.
- `title` (string): The title to display in the header.
- `allowObjectCreation` (boolean): Whether to show the "Setup" screen if the object isn't found.
- `defaultConfig` (object): Initial settings for auto-setup (length, prefix).

### Usage Example:
```tsx
import { NumberRangeManager } from "@/components/number-range";

export default function EmployeeNumberingPage() {
    return (
        <NumberRangeManager 
            objectType="employees"
            title="Employee Code Management"
            defaultConfig={{
                name: "Employee Numbering",
                number_length: 8,
                prefix: "EMP-"
            }}
        />
    );
}
```

## UI Features
1. **Tabbed Navigation:** Separates management into (Groups, Intervals, Assignments, Fullness Analysis) to reduce cognitive load.
2. **Fullness Analysis Panel:** A visual dashboard using progress bars and color codes (Green, Amber, Red) to show how much of a range has been consumed.
3. **Proactive Validation:** The UI prevents overlapping ranges, prevents deleting used ranges, and enforces number length constraints before API calls.
4. **Expansion Interface:** A dedicated dialog for expanding upper boundaries with mandatory audit reasoning.

## Sub-Components
- `NrObjectHeader`: Displays high-level stats (Total Capacity, Usage %, Global Status).
- `DomainFullnessPanel`: The interactive dashboard for range consumption monitoring.
- `ExpansionLogsPanel`: A historical table of all range modifications.
- `useNumberRange`: A custom React Hook for other application screens to fetch or preview next numbers.
