# Technical Architecture: Report Template Editor

The Report Template Editor is built as a high-performance, dependency-free React component designed for the unique requirements of a multi-tenant ERP system.

## Component Structure

The editor is located at `@/components/template-editor` and consists of several tightly integrated parts:

- `TemplateEditor.tsx`: The main container managing the layout and coordination.
- `utils.ts`: Core logic for syntax highlighting, validation, and formatting.
- `styles.css`: Scoped CSS variables and theme definitions.
- `types.ts`: TypeScript definitions for templates, fields, and props.

## Core Logic & Data Flow

### 1. Syntax Highlighting (`highlightHTML`)
Instead of heavy external libraries like Monaco or Prism, we use a custom, optimized regex-based highlighter. This ensures:
- **Zero Latency**: Even with 10k+ lines of HTML.
- **Custom Patterns**: We highlight `{{system_keys}}` with specific validation colors (Green for valid, Red for invalid).
- **CSS Support**: Detects and highlights style attributes and `<style>` blocks.

### 2. Live Preview Engine
The preview is powered by a synchronized `iframe` mechanism:
- The raw HTML is processed through `generatePreviewHtml`.
- Template keys are replaced with mock data from the `mockContext`.
- The resulting string is injected into an iframe's `srcDoc`.
- **Isolation**: prevents the template's styles from "leaking" into the ERP's main UI.

### 3. Real-time Validation
Validation occurs on every keystroke (debounced):
- **Key Validation**: Checks every `{{...}}` pattern against the `approvedKeys` array.
- **Security Audit**: Scans for forbidden tags and attributes using `detectForbiddenElements`.
- **Navigation**: Validation errors provide `line` and `column` data, allowing users to click an error to jump directly to the code.

## Performance Optimizations

- **Debounced Updates**: Preview and validation are debounced (300ms) to ensure smooth typing.
- **Virtual Textarea Overlay**: The editor uses a standard `<textarea>` for input to leverage native browser performance, while overlaying a `pre/code` block for the syntax highlighting.
- **Sync Scroll**: A custom hook or effect ensures that the backdrop highlighting stays perfectly aligned with the transparent textarea's scroll position.

## State Management

The component uses local React state for:
- Current code content.
- Validation results.
- Find & Replace visibility and results.
- Formatting/Prettification status.

---

## File Map

| File | Responsibility |
|------|----------------|
| `TemplateEditor.tsx` | Main UI, Short-cuts, State |
| `utils.ts` | Regex Engines (Highlight, Format, Validate) |
| `styles.css` | Theming, CSS Variables, Animations |
| `types.ts` | Interface definitions |
