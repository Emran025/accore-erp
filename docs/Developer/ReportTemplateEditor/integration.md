# Integration & Usage Guide

Integrating the Template Editor into a new module is a straightforward process. This guide covers how to set up the component and handle data persistence.

## 1. Define Your Data Model

First, define the "Approved Keys" that your template will have access to. These are the data points the backend will eventually inject.

```typescript
const HR_KEYS = [
    { key: "employee_name", description: "Full Name", type: "string" },
    { key: "salary_amount", description: "Monthly Salary", type: "number" },
    { key: "join_date", description: "Date of Joining", type: "date" },
    { key: "department", description: "Department Name", type: "string" },
];
```

## 2. Set Up Mock Context

The mock context is used to show the user what the document looks like with real data.

```typescript
const MOCK_DATA = {
    employee_name: "Yasmine Ahmed",
    salary_amount: "15,500.00",
    join_date: "2023-10-01",
    department: "Human Capital",
};
```

## 3. Implement the Editor

Import and use the `TemplateEditor` component. It handles its own internal state, so you only need to provide the initial data and a save handler.

```tsx
import { TemplateEditor } from "@/components/template-editor";

function ReportEditorPage({ existingTemplate }) {
    const handleSave = async (data) => {
        try {
            await api.post('/templates', data);
            showToast("Saved!", "success");
        } catch (err) {
            showToast("Failed to save", "error");
        }
    };

    return (
        <TemplateEditor
            template={existingTemplate}
            moduleName="Human Resources"
            approvedKeys={HR_KEYS}
            mockContext={MOCK_DATA}
            onSave={handleSave}
            onCancel={() => router.back()}
        />
    );
}
```

## 4. Backend Integration (PHP/Laravel)

On the backend, your `Template` model should store the `body_html`. To render it for the end-user:

1. Fetch the Template.
2. Replace the keys:
   ```php
   $rendered = str_replace('{{employee_name}}', $employee->name, $template->body_html);
   ```
3. Use a DomPDF or similar library to convert the rendered HTML to PDF if needed.

## Best Practices

- **Categories**: When working with many keys, organize them by adding a `category` property to your keys array (if supported in the future) or prefixing.
- **CSS Scoping**: Always use a wrapper class in your template HTML (e.g., `<div class="report-container">`) to manage global styles within the document.
- **Base Styles**: We provide a standard `base-report.css` that is usually injected into the preview for consistent ERP-wide document looks.

---

> [!IMPORTANT]
> Always ensure that the `template_key` is unique across the system to avoid conflicts during automated generation.
