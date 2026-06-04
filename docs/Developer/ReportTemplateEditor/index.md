# Report Template Editor Overview

The **Report Template Editor** is a sophisticated, feature-rich code editor designed specifically for the accore ERP. It enables administrators and developers to create, edit, and manage dynamic HTML templates for various system modules such as Payroll, Sales, Commercial Contracts, and more.

## Purpose

The primary goal of this editor is to provide a safe and bridgeable interface between raw HTML/CSS design and dynamic system data. It allows for the creation of documents that are:
- **Consistent**: Using predefined system styles.
- **Dynamic**: Through a secure "Template Key" injection mechanism (`{{key}}`).
- **Validated**: Ensuring that no malicious scripts or broken references enter the system.

## Key Features

### ✨ Professional Editing Experience
- **Syntax Highlighting**: Custom-built lightning-fast highlighter for HTML, CSS, and Template Keys.
- **Smart Indentation**: Support for `Tab` key (4 spaces) and automatic formatting.
- **Find & Replace**: Built-in utility with case-sensitivity toggle.
- **Line Numbers**: Clickable line numbers that allow for rapid navigation.

### 🎨 Live Interactive Preview
- **Real-time Rendering**: See changes as you type.
- **Mock Data context**: Preview exactly how the template looks when populated with real-world examples.
- **RTL/LTR Toggle**: Full support for both Arabic and English document layouts.

### 🛡️ Security & Validation
- **Forbidden Element Detection**: Automatically blocks `<script>`, `<iframe>`, `<form>`, and inline JS (e.g., `onclick`).
- **Key Validation**: Real-time checking against the "Approved Keys" list for the specific module.
- **Safe Iframe Sandbox**: Preview is rendered within a sandboxed environment to prevent site-wide CSS or JS interference.

### 🎯 Key Management
- **Approved Keys Sidebar**: A searchable categorical list of all available data points for the module.
- **One-Click Injection**: Insert keys directly at the cursor position.
- **Usage Indicators**: Visual badges showing which keys are currently active in the template.

## Visual Design

The editor features a **Premium Dark Theme** optimized for long structural editing sessions, using a custom color palette that differentiates between regular tags, attributes, CSS properties, and the special system keys.

---

> [!TIP]
> Use `Ctrl+K` (or `Cmd+K`) to automatically prettify and format your HTML code at any time.
