# accore Documentation Strategy & Governance Policy

> **Version:** 2.0.0
> **Last Updated:** 2026-03-17
> **Authority:** Chief Architect
> **Scope:** Human processes, tooling, contributor rules, and lifecycle governance.
> **Execution Partner:** `/doc-engine/` — All AI-driven documentation generation is delegated to the Documentation Engine.

---

## 1. Relationship to the Documentation Engine

This document governs the **human and organizational** aspects of accore's documentation ecosystem.
The **AI execution engine** located at `/doc-engine/` is the sole authority for:

| Responsibility | Delegated To |
|---------------|-------------|
| What to document | `/doc-engine/roadmaps/*.roadmap.md` |
| How to structure output | `/doc-engine/templates/*.template.md` |
| When to execute tasks | `/doc-engine/ROADMAP.md` + `state/current_phase.md` |
| What terms to use | `/doc-engine/GLOSSARY.md` |
| What tone to maintain | `/doc-engine/STYLE_GUIDE.md` |
| AI behavioral constraints | `/doc-engine/ENGINE.md` |

This Policy covers everything the engine does **not**: tooling decisions, contributor rules, PR governance, deprecation, and localization infrastructure.

---

## 2. The Five-Tier Documentation Framework

To manage the conceptual complexity of an enterprise-grade ERP, all documentation adheres to a strict **Five-Tier Architecture**:

| Tier | Name | Audience | Location |
|------|------|----------|----------|
| 1 | System-Level & Business Domain | Auditors, Business Analysts | `/docs/System/` |
| 2 | Architecture & Technical Strategy | Technical Architects | `/docs/Architecture/` |
| 3 | API, Integration & Contracts | API Consumers, Integrators | `/docs/API/` |
| 4 | Developer & Engineering Academy | Developers, Contributors | `/docs/Developer/` |
| 5 | Operations, Governance & Auditing | DevOps, Compliance Officers | `/docs/Operations/` |

Domain-level documentation resides under `/docs/Domains/{DomainName}/` and is classified by the Tier most relevant to its primary audience.

---

## 3. Portal Generator & Tooling Stack

### 3.1. Documentation Portal
The `/docs/` directory is compiled into a searchable, navigable portal using an enterprise-grade static site generator:

- **Recommended:** VitePress, Docusaurus, or Nextra
- **Integration:** Embedded directly in the monorepo as a workspace package
- **Search:** Algolia or built-in full-text search across all five tiers
- **Build Trigger:** Automated on merge to `main`

### 3.2. Diagrams & Visuals (Docs-as-Code)
ALL architectural and state machine diagrams MUST be written in **Mermaid.js**. External image files (PNG/JPG) for flowcharts or database schemas are strictly prohibited — they cannot be version-controlled, searched, or edited by future contributors.

### 3.3. API Specifications
For the API Tier, **OpenAPI 3.0 (Swagger)** or **Scribe** auto-generates low-level endpoint schemas. These auto-generated specs are embedded within the larger documentation portal alongside the narrative API philosophy, ensuring developers read the governance rules before consuming endpoints.

---

## 4. Versioning & Localization (i18n)

### 4.1. Version Parity
Documentation exists in the exact same Git repository as the application code. Checking out a tagged release (e.g., `v1.2.0`) presents the documentation accurate for that release.

### 4.2. Bilingual Architecture (Arabic & English)
accore targets the MENA region while adhering to global ERP standards:

| Scope | Language |
|-------|----------|
| Tier 2 (Architecture), Tier 3 (API), Tier 4 (Developer) | **English only** |
| Tier 1 (Business Domain) & Tier 5 (Operations) | **English + Arabic** |
| YAML frontmatter & Mermaid syntax | Always English |
| Domain entity names | English with Arabic explanation in parentheses |

The static site generator handles `/docs/en/` and `/docs/ar/` routing seamlessly.

---

## 5. Pull Request (PR) Review Process

In an ERP ecosystem, inaccurate documentation is more dangerous than missing documentation.

### 5.1. The PR Gateway
No code can be merged if it:
- Invalidates existing documentation
- Introduces a new business capability without its accompanying `.md` files

### 5.2. Atomic Commits
Any Pull Request altering core Domain actions, events, database schemas, or financial states **MUST** include the exact corresponding documentation updates in the same commit.

### 5.3. Rigorous Review
The Tech Lead or Chief Architect must review the terminology, Mermaid diagrams, and business logic in documentation with the same rigor applied to a Laravel controller or service layer.

---

## 6. DocOps CI/CD Pipeline

The documentation ecosystem is treated as executable code. The following CI checks run on every PR touching `/docs/`:

| Check | Tool | Action on Failure |
|-------|------|-------------------|
| Broken link verification | CI action | Block merge |
| Markdown linting | markdownlint | Block merge |
| Mermaid syntax validation | mermaid-cli | Block merge |
| Word count enforcement | `doc-engine/scripts/check-word-count.sh` | Block merge |
| Template conformance | `doc-engine/scripts/verify-output-structure.sh` | Block merge |
| Task file validation | `doc-engine/scripts/validate-task.sh` | Block merge |
| Draft watermarking | Portal generator | Display warning banner |

---

## 7. Deprecation & Maintenance Policy

### 7.1. Archival (Never Delete)
When a feature or module is deprecated (e.g., a legacy V1 API endpoint):
1. Documentation is **NOT** deleted immediately
2. It is moved to an `/docs/archive/` folder
3. It is visually tagged as `DEPRECATED` with a link to the superseding document
4. YAML frontmatter is updated: `status: deprecated`

### 7.2. Quarterly Audits
The Chief Architect orchestrates a quarterly "Docs Audit" where Domain leads verify the accuracy of their respective module files. This audit is logged in `/doc-engine/logs/review-log.csv`.

---

## 8. Open Source Contributor Guidelines

External contributors must understand that code is only accepted if the documentation burden is met.

### 8.1. The 1-to-1 Rule
A PR adding a new service, action, or model **must** contain updates to the corresponding `/docs/Domains/` folder.

### 8.2. Language Requirements
- External contributors are only required to provide **English** documentation
- Maintainers coordinate Arabic translations

### 8.3. Template Compliance
Contributors use the templates in `/doc-engine/templates/` to ensure their documentation matches the required format. Non-conforming submissions will be rejected.

---

## 9. Executive Mandate

Maintaining this policy and adhering to these governance principles is a non-negotiable aspect of the accore ERP's lifecycle. It is the singular mechanism that guarantees the platform remains comprehensible to thousands of OSS contributors, while simultaneously facilitating major enterprise adoptions without vendor lock-in or "black box" logic.

> *"Code tells you how the application executes; our documentation tells you why the enterprise exists."*
