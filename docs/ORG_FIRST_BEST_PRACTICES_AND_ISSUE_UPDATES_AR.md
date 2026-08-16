# مقارنة نهج «الهيكل التنظيمي أولاً» بأفضل الممارسات وتحديثات القضايا المقترحة

**النطاق المقترح للنشر:** تحديث القضايا الحالية **#9 إلى #14** باللغة الإنجليزية، من دون إنشاء قضايا موازية.  
**القرار:** النهج المصحح يتوافق بقوة مع أفضل الممارسات، بشرط تطبيق التحسينات الحاكمة الواردة أدناه وعدم اختزال الإتاحة في فلتر واجهة فقط.

## الحكم المقارن

المبدأ الذي اعتمدتموه — اختيار الوحدات، ثم تهيئة الهيكل التنظيمي المطلوب لها، ثم إظهار كل وحدة بعد تحقق جاهزيتها فقط، مع إبقاء الوحدات الاختيارية مخفية وقابلة للتهيئة لاحقاً — هو اتجاه صحيح ومماثل لما تتبعه منصات ERP الناضجة. تشترط SAP اكتمال مرحلة **Scope and Organizational Structure** قبل تهيئة العمليات التجارية، وتفصل صراحة بين الأنشطة الإلزامية والاختيارية والموصى بها وفق نطاق التطبيق المختار [1]. كما تنشئ Oracle قوائم إعداد مولدة من العروض والوظائف المختارة، مرتبة من المتطلبات المشتركة إلى المتطلبات الخاصة بالمنتج [2]. وتعرض Microsoft الإعداد المساعد للبيانات الأساسية ثم إعداد عمليات الأعمال ثم إعداد التطبيقات كقدرات مستقلة [3].

> **الخلاصة:** لا ينبغي أن تكون تهيئة Accore ERP «صفحة هيكل تنظيمي مصغرة»، بل **محرك عرض موجّه** يعيد استخدام العقد والروابط والقواعد والتحقق وسياق التشغيل الموجودين، ويعرض أقل خطوة صحيحة تالية فقط.

| محور المقارنة | أفضل ممارسة مستقرة | قرار Accore ERP المصحح | التقييم |
| --- | --- | --- | --- |
| ترتيب التهيئة | تحديد النطاق ثم الهيكل المؤسسي ثم إعداد العمليات. [1] | اختيار الوحدات، ثم المتطلبات التنظيمية المشتركة، ثم متطلبات الوحدة. | **متوافق**. |
| توليد المهام | المهام مشتقة من العروض/الوظائف المختارة، والمشتركة أولاً والخاصة أخيراً. [2] | متطلبات الوحدات تشتق من كتالوج requirement descriptors وقواعد الهيكل الحالية. | **متوافق بشرط** ألا تكون الخريطة مخفية أو ثابتة داخل JSX. |
| الإطلاق المرحلي | بدء الوحدات ذات الأولوية ثم إضافة وظائف لاحقاً يقلل المخاطر. [4] | النظام يعرض النواة والوحدات الجاهزة فقط، ثم يضيف المستخدم وحدة لاحقاً عبر المسار نفسه. | **متوافق**. |
| تجربة التهيئة | مراحل قصيرة منطقية، تقدم واضح، ومراحل اختيارية قابلة للتجاوز بوضوح. [5] | شاشة واحدة، قرار واحد، حفظ ثم «التالي»، مع فصل الإلزامي عن الاختياري. | **متوافق بشرط** إتاحة الرجوع والمراجعة وحفظ المرحلة. |
| الحوكمة | النشاط لا يتاح إلا وفق النطاق وحالة التهيئة والصلاحية. [1] | لا تظهر الوحدة قبل اكتمال هيكلها ونجاح التحقق وتفعيلها. | **متوافق بشرط** إنفاذ ذلك من الخادم. |
| الحماية | المنع الافتراضي والتحقق من التفويض في كل طلب؛ لا تكفي قيود الواجهة. [6] | فلترة القائمة وحارس `/setup` بالإضافة إلى middleware/Policy لحالة الوحدة في API. | **ضروري**؛ لا يكفي الجانب الأمامي. |

## التحسينات التي يجب تثبيتها قبل التنفيذ

النهج ممتاز منطقياً، لكنه يحتاج إلى ستة ضوابط حتى يرقى إلى أفضل الممارسات فعلاً.

| الضبط الحاكم | سبب الحاجة | القرار التنفيذي |
| --- | --- | --- |
| فصل **المختار** عن **المفعل** | `Module.is_active` وحدها لا تشرح هل الوحدة غير مختارة أم منتظرة استكمال الهيكل. | يحفظ `setup.selected_modules` في إعدادات النظام، بينما تبقى `Module.is_active` هي علامة الإتاحة التشغيلية النهائية. |
| كتالوج متطلبات معلن ومراجع | لا يجوز أن تقرر الواجهة المتطلبات من نصوص أو شاشات ثابتة؛ ستصبح غير قابلة للمراجعة والاختبار. | إنشاء `ModuleSetupRequirementRegistry` في Enterprise Core، يصف لكل وحدة أنواع العقد والروابط والتحققات وسياق التشغيل المطلوب، ويقرأ الأنواع والقواعد الحقيقية من endpoints الحالية. |
| التحقق الحي قبل التفعيل | لا يكفي أن تتذكر الواجهة أن مستخدماً أكمل خطوة سابقة؛ قد تتغير عقدة أو علاقة لاحقاً. | قبل تغيير `is_active`، يعيد منسق التهيئة استدعاء `integrity-check` و`scope-context` و`operating-context/readiness` عند انطباقها. |
| حارس خادم بالإضافة إلى حارس الواجهة | الرابط المباشر أو استدعاء API لا يجب أن يتجاوز الإخفاء البصري. [6] | `EnsureModuleOperational` middleware أو Policy تقرأ نشاط الوحدة وشرطها التنظيمي قبل routes التشغيلية؛ والمنع هو الافتراضي. |
| حفظ تقدم محدود ومتحقق | endpoint الإعدادات الحالي يقبل مفاتيح عامة؛ لا يصلح مباشرة لتخزين تقدم حساس أو غير متزامن. | allowlist لمفاتيح `setup.*`، تحقق JSON، صلاحية مسؤول، وrevision أو قفل تفاؤلي عند التعديل المتنافس. لا تحفظ العقد أو الروابط من جديد. |
| عدم عرض كل endpoint في البداية | «استخدام جميع الـendpoints» لا يعني عرض كل أدوات الحوكمة للمستخدم الجديد. | تستخدم الرحلة كل endpoint عند الحاجة؛ تظل أدوات الحذف والتحليل الكامل والسجل والتحديث الدفعي مساحة إدارة متقدمة بعد الإطلاق. |

## المبدأ الذي يجب أن يظهر في كل قضية

> **Organizational readiness is a prerequisite for module visibility, not a documentation area. A selected module remains hidden and non-operational until the existing Organization Governance APIs prove that its required structure, relationships, scope, integrations, and operating context are complete.**

## نصوص القضايا الإنجليزية المقترحة

### Issue #9 — title

`[Feature]: First-run setup gate and minimal persisted state using existing Enterprise Core foundations`

### Issue #9 — body

```markdown
## Parent

Parent program: #7

## Objective

Establish the minimal, secure first-run control plane that keeps the normal ERP shell hidden until the required organization-first setup is complete. This work must reuse the existing Enterprise Core settings, `Module` activation state, Organization Governance APIs, and permission model; it must not create a parallel organization, warehouse, operating-context, or onboarding data model.

## Guiding rule

> Organizational readiness is a prerequisite for module visibility. Selecting a module means that its setup work is required; it does not make the module visible or operational.

## Scope

| Concern | Required behavior |
| --- | --- |
| First-run gate | After authentication, a new installation must enter `/setup` before `MainLayout`, the dashboard, navigation, or normal module routes can render. |
| Minimal persisted state | Persist only setup decisions and progress required to resume the guided flow, using an allowlisted `setup.*` namespace in the existing settings foundation. Do not duplicate Organization Governance domain data. |
| Module lifecycle | Keep `setup.selected_modules` separate from `Module.is_active`: selected modules are pending work; only active modules may be visible or operational. |
| Authorized ownership | Preserve the existing secure first-administrator/bootstrap requirement. After ownership is established, only authorized setup administrators may alter setup state. |
| Concurrency and recovery | Use a revision/optimistic-concurrency check or equivalent transactional guard for setup-state writes. Refresh, restart, retry, and multi-tab use must resume from the last server-confirmed state. |
| Auditability | Record setup ownership, selection changes, module activation/deactivation, and failed readiness checks through the existing audit foundation or a narrowly scoped audit extension. |

## Tasks

- [ ] Define the allowlisted settings contract: `setup.version`, `setup.selected_modules`, `setup.current_requirement`, `setup.completed_requirements`, and derived `setup.visible_modules`.
- [ ] Extend the existing settings update path with validation, administrator authorization, JSON normalization, and revision/conflict handling for `setup.*` keys.
- [ ] Implement a small `SetupAccessService` that derives the next allowed setup requirement from existing Organization Governance results; do not embed domain rules in controllers or page components.
- [ ] Preserve or implement one-time first-administrator bootstrap controls with rate limiting, audit logging, and permanent closure after successful claim.
- [ ] Provide a server-readable setup status/overview contract. It may compose existing endpoints but must not persist duplicated organizational data.
- [ ] Add a first-run route gate that redirects unactioned installations to `/setup` before rendering the normal shell, without redirect loops for auth or setup routes.
- [ ] Define an explicit recovery path for existing installations so that a deployment never reopens bootstrap or overwrites operational data.

## Acceptance Criteria

- [ ] A clean installation cannot render the normal ERP shell before the mandatory organization-first setup path is satisfied.
- [ ] Setup progress survives refresh, restart, browser close, network retry, and concurrent tabs without duplicating domain data.
- [ ] A selected module is not treated as active, visible, or routable solely because it was selected.
- [ ] Unauthorized users cannot read or modify protected setup state.
- [ ] Existing installations are recognized safely and are never forced through destructive first-run initialization.

## Dependencies

Consumes #8 readiness outcome. Required by #10 through #13.
```

### Issue #10 — title

`[Feature]: Guided organization-first setup by reordering existing Organization Governance APIs`

### Issue #10 — body

```markdown
## Parent

Parent program: #7

## Objective

Transform the existing Organization Governance capabilities from a broad, documentation-like administration workspace into a concise, organization-first guided setup flow. The implementation must call the existing meta-type, topology-rule, node, link, scope, integrity, and integration APIs in the correct order; it must not recreate the organizational structure engine or its domain tables.

## Guiding rule

> The first-run experience exposes only the next valid organizational decision. Advanced organizational administration remains available after launch, but it is not the first-run interface.

## Existing foundations to reuse

The backend already exposes organizational meta types, topology rules, structure nodes, structure links, scope-context resolution, statistics, integrity checks, change history, bulk status updates, and organization-integration status/issues. These are the source of truth for the guided flow.

## Scope

| Guided stage | Required behavior | Existing API foundation |
| --- | --- | --- |
| Requirement discovery | Read the selected modules, relevant organizational meta types, and topology rules; show only the minimum required organizational objects and relationships. | `GET /v2/org-structure/meta-types`, `GET /v2/org-structure/topology-rules` |
| Structural objects | Let the administrator create, select, rename, or update only the nodes required by the current setup requirement. | `GET/POST/PUT /v2/org-structure/nodes`, `GET /v2/org-structure/nodes/{uuid}` |
| Relationships | Guide the administrator through only the required parent/child or functional relationships. | `GET/POST/PUT /v2/org-structure/links` |
| Scope validation | Resolve the organizational scope where a module needs a concrete business or operating unit. | `GET /v2/org-structure/scope-context/{uuid}` |
| Readiness validation | Explain blocking integrity or integration findings in business language and provide the next repair action. | `GET /v2/org-structure/integrity-check`, `GET /v2/org-integration/status`, `GET /v2/org-integration/issues` |
| Advanced administration | Keep history, full topology tooling, bulk changes, and destructive actions available after launch under normal governance; do not present them as first-run steps. | Existing Organization Governance workspace |

## Tasks

- [ ] Define a versioned `ModuleSetupRequirementRegistry` that maps each selectable module to its required organizational object types, relationships, scope checks, integrations, and conditional operating-context checks.
- [ ] Make the registry consume real meta types and topology rules; do not hard-code a second hierarchy definition in frontend components.
- [ ] Build a guided sequence of short screens: discover requirements, create/select nodes, create relationships, validate scope, repair integrity findings, and confirm readiness.
- [ ] Revalidate the live structure before a module can be activated. A prior completed screen is not sufficient evidence if the structure changed later.
- [ ] Keep drafts and edits in the existing domain model and existing audit/change-history mechanisms; do not create duplicate organization records for setup.
- [ ] Move the current operating-store readiness UI out of the general organization page. It must become a conditional module requirement, not a universal organizational form.
- [ ] Preserve Arabic RTL and English LTR behavior, semantic headings, keyboard access, validation summaries, and clear recovery actions.

## Acceptance Criteria

- [ ] A new administrator sees a guided next step, not the complete multi-tab organization administration workspace.
- [ ] Every organizational object and relationship created during setup is visible in, and governed by, the existing Organization Governance model and APIs.
- [ ] A module cannot pass its organizational requirement when live topology, scope, integrity, or required integration validation fails.
- [ ] Advanced tabs remain available after launch for authorized administrators without being required for a simple first-run configuration.
- [ ] The flow requests only organizational information that is required by the currently selected modules.

## Dependencies

Requires #9. Supplies verified organizational readiness to #11 through #13.
```

### Issue #11 — title

`[Feature]: Module selection, organization-dependent readiness, and activation after verification`

### Issue #11 — body

```markdown
## Parent

Parent program: #7

## Objective

Allow an administrator to select the Accore ERP modules to operate now, derive their common and module-specific organizational setup requirements, and activate each module only after the existing Organization Governance APIs verify that its prerequisites are complete. This is an availability and sequencing feature, not a replacement module-provisioning platform.

## Guiding rule

> Selection creates a setup obligation. Activation creates visibility and operational access. No module may become visible merely because it was selected.

## Scope

| Capability | Required behavior |
| --- | --- |
| Catalog | Reuse the existing `Module` catalog and keys as the canonical selectable-module inventory. |
| Requirement resolution | Resolve common organizational requirements first, then cross-family requirements, then module-specific requirements, following the selected module set. |
| Lifecycle | Support exactly three user-facing states: `not_selected`, `selected_pending_org_setup`, and `active`. `Module.is_active` represents the final operational state. |
| Conditional requirements | Require a warehouse, cost/profit centers, POS terminal, or operating context only when the selected module and operating model require them. |
| Activation | Recheck live organizational readiness, update the module’s active state transactionally, write an audit event, and expose the module to navigation only after success. |
| Later addition | Let administrators add a module after initial launch by re-entering the same guided requirement flow; reuse existing valid structure and request only what is missing. |
| Deactivation | Do not silently deactivate a module with operational data. Treat deactivation as a separate controlled capability. |

## Tasks

- [ ] Define module requirement descriptors with common, family, and module-specific ordering; include conflicts, required route key, and conditional operating-context rules.
- [ ] Read selected module keys from the validated setup settings contract and resolve one ordered, deduplicated requirement queue.
- [ ] Use existing organization endpoints to verify each requirement before activation; do not infer readiness from frontend completion flags.
- [ ] Activate `Module.is_active` only after successful verification and record the outcome in the existing audit foundation.
- [ ] Implement a conditional “Configure first operating location” requirement that uses the existing operating-context endpoints only for commercial/inventory models that need it.
- [ ] Add module-ready and module-pending visibility data for navigation without making navigation the source of truth.
- [ ] Add fixtures for core-only, finance, inventory, retail sales, human-capital, and staged-addition scenarios.

## Acceptance Criteria

- [ ] Selected modules with incomplete organizational requirements are hidden from navigation, search, deep links, and operational APIs.
- [ ] Common organizational requirements are requested once, before module-specific requirements.
- [ ] Finance-only and HR-only paths do not request a warehouse or POS terminal unless their selected configuration genuinely requires one.
- [ ] A later-added module reuses valid existing organizational data and requests only missing requirements.
- [ ] Retrying activation cannot create duplicate operating resources or expose a partially ready module.

## Dependencies

Requires #9 and #10. Supplies module readiness data to #12 and #13.
```

### Issue #12 — title

`[Feature]: Resumable organization-first guided setup UI using existing Enterprise Core endpoints`

### Issue #12 — body

```markdown
## Parent

Parent program: #7

## Objective

Create a full-screen, first-run guided setup experience that presents one valid organizational decision at a time, saves server-confirmed progress, and uses the existing Enterprise Core endpoints as its domain source. The experience must replace the first-run use of the documentation-like organization workspace; it must not duplicate its backend logic in the client.

## UX model

The user selects modules, sees the minimum shared organizational prerequisites first, completes one short screen at a time, and proceeds with “Save and continue”. Optional work is explicitly marked and may be deferred. A normal ERP shell appears only after all mandatory requirements for the selected launch scope are complete.

## Scope

| Experience element | Required behavior |
| --- | --- |
| Standalone shell | `/setup` uses a dedicated shell with language control, setup progress, save state, help text, and no normal sidebar or dashboard. |
| Ordered steps | The step map is derived from the requirement resolver. It may contain organization discovery, nodes, links, scope, conditional operating location, validation, activation, and completion. |
| Minimal disclosure | Each screen exposes only the current decision and at most the relevant recommendation or dependency explanation. It must not expose the full organization administration tab set. |
| Existing endpoints | The client uses the existing settings, organization structure, integration, and operating-context contracts through typed adapters. A composed read-only overview endpoint is optional only if needed for performance; no parallel CRUD API is introduced. |
| Resume | Refresh, restart, browser close, offline recovery, and back/forward resume from the last server-confirmed allowed requirement. |
| Optional work | Optional or deferred modules are clearly labeled, skippable, and remain hidden after launch until their own guided setup succeeds. |
| Accessibility and localization | Support Arabic RTL and English LTR, semantic step headings, keyboard navigation, focus restoration, live status messages, field error summaries, and responsive layouts. |

## Tasks

- [ ] Implement the `/setup` route group and layout separately from `MainLayout`.
- [ ] Build typed client adapters for the existing settings, Organization Governance, integration, and operating-context endpoints.
- [ ] Implement a requirement-driven step map, current-step resolver, Save and continue action, review of completed steps, and safe next-step routing.
- [ ] Convert the existing organization workspace experience into guided node/link/scope/validation screens for first-run use; keep the original advanced workspace for post-launch administration.
- [ ] Implement the conditional operating-location screen only when required by the module requirement registry.
- [ ] Add stale-state detection and a server refresh when another tab or administrator changes setup-relevant state.
- [ ] Add RTL/LTR, keyboard, screen-reader, error-recovery, and responsive tests for the guided flow.

## Acceptance Criteria

- [ ] A new administrator can complete the mandatory selected-module setup without opening advanced tabs, hidden routes, developer tools, or making manual API calls.
- [ ] The UI never marks a requirement complete before the applicable existing API verifies it.
- [ ] The UI makes optional/deferred work explicit and does not block basic launch on it.
- [ ] A refresh or restart returns the user to the correct next organizational requirement with server-confirmed data intact.
- [ ] The normal sidebar and dashboard are absent until the mandatory launch scope has been activated.

## Dependencies

Requires #9 through #11. Hands the activated state to #13.
```

### Issue #13 — title

`[Feature]: Organization-ready module visibility, route guards, and deep-link recovery`

### Issue #13 — body

```markdown
## Parent

Parent program: #7

## Objective

Expose only organization-ready, active, and authorized modules in Accore ERP navigation and routes. The same policy must prevent bypass through direct URLs or API calls and must provide a useful recovery path to the next setup requirement when a selected module is still pending.

## Guiding rule

> Navigation is a presentation of operational entitlement, not its source. A module is available only when it is selected, its live organizational prerequisites are verified, it is active, and the user is authorized.

## Scope

| Capability | Required behavior |
| --- | --- |
| First-run gate | Before setup is complete, normal shell routes resolve to the current `/setup` requirement rather than rendering the dashboard or sidebar. |
| Progressive visibility | Navigation, virtual navigation, global search, and menu cards render only modules whose `Module.is_active` state and readiness policy permit visibility for the current user. |
| Server enforcement | A module-operational middleware or policy rejects operational API access when the module is inactive or required organizational readiness has failed. The policy follows deny-by-default behavior. |
| Route resolution | A single resolver chooses the valid destination in this order: current mandatory setup requirement, requested active destination, permitted module home, then a safe fallback. |
| Deep-link recovery | Bookmarks and direct URLs to pending, unavailable, deleted, or unauthorized destinations recover deterministically without a blank page or redirect loop. |
| Context awareness | When a route requires an operating context, validate that context and route to the repair requirement if it is missing or invalid. |

## Tasks

- [ ] Extend the navigation adapter to filter after RBAC using authoritative active/visible module data, while retaining current configuration files as presentation metadata.
- [ ] Implement `SetupGate` before `MainLayout` and a dedicated resolver for normal routes, setup routes, auth routes, and fallback routes.
- [ ] Implement `EnsureModuleOperational` middleware or equivalent policy for operational API route groups; do not rely on frontend hiding.
- [ ] Define a route-to-module registry and a reason-coded recovery outcome such as `setup_required`, `module_pending`, `context_missing`, `module_inactive`, or `permission_denied`.
- [ ] Preserve a requested deep link and resume it only after its module and context become valid.
- [ ] Add safe telemetry/audit diagnostics for gate and route-denial outcomes without collecting business payloads or secrets.

## Acceptance Criteria

- [ ] A clean installation cannot render `MainLayout`, the dashboard, or a normal module route before mandatory setup activation.
- [ ] A selected but pending module is absent from sidebar, navigation grid, search, and valid direct-route outcomes.
- [ ] An authenticated user cannot invoke an operational API for an inactive or organization-unready module merely by guessing a route.
- [ ] An active, authorized module is discoverable and routable immediately after successful verification and activation.
- [ ] Pending, stale, deleted-context, and unauthorized deep links recover to a declared safe destination without loops.

## Dependencies

Requires #9 through #12. This issue is a release prerequisite for #14.
```

### Issue #14 — title

`[Feature]: Organization-first setup verification, phased-launch certification, and observability`

### Issue #14 — body

```markdown
## Parent

Parent program: #7

## Objective

Prove that organization-first setup, module activation, progressive visibility, and later module addition work repeatedly in clean and existing installations. Certification must verify the existing Organization Governance API flow, not only a visual walkthrough of the new screens.

## Verification principles

The release gate must prove three facts: mandatory organizational requirements are completed before a module appears; optional modules remain hidden until deliberately configured; and server-side authorization prevents bypass of pending or inactive modules.

## Verification matrix

| Layer | Required coverage |
| --- | --- |
| Unit | Requirement registry, common-before-specific ordering, active-versus-selected lifecycle, settings validation/revision handling, route resolver, and readiness decisions. |
| API / integration | Existing node, link, scope, integrity, integration, operating-context, settings, and module-activation paths; plus server-side module-operational guards. |
| End-to-end | Clean first launch, module selection, guided organization setup, conditional operating-location setup, integrity repair, activation, normal-shell release, later module addition, and deep-link recovery. |
| Existing-installation safety | Detect a populated installation without reopening bootstrap, overwriting organization data, or hiding already-operational modules unexpectedly. |
| Security | Deny-by-default route/API behavior for inactive modules, authorization boundaries, direct URL attempts, and stale context. |
| Quality | Arabic RTL and English LTR, keyboard-only operation, screen-reader announcements, progress semantics, responsive layouts, offline/retry/resume, and multi-tab conflicts. |
| Release | Phased rollout using a feature flag or controlled cohort, monitoring, rollback criteria, and independent acceptance evidence. |

## Tasks

- [ ] Create fixtures for core-only, finance-only, inventory, retail sales, human-capital, mixed-module, deferred-module, and existing-installation scenarios.
- [ ] Add contract tests proving that the guided flow uses existing Organization Governance and operating-context endpoints and does not create duplicate organization data.
- [ ] Add end-to-end tests proving that a module remains hidden until live scope, integrity, integration, and conditional operating-context checks pass.
- [ ] Add route and API tests for direct-link and direct-request denial, setup recovery, active-module release, and later module addition.
- [ ] Add accessibility tests for logical step grouping, progress, optional-stage indication, focus restoration, labels, RTL/LTR, and error summaries.
- [ ] Define production-safe observability for step duration, readiness failure type, repair success, activation outcome, route-guard reason, and abandonment, with no business content or secrets.
- [ ] Define release certification, rollback, defect triage, and support runbooks for setup and module-availability incidents.

## Acceptance Criteria

- [ ] Automated evidence proves that no selected-but-unready module is visible or operational through navigation, deep links, or protected APIs.
- [ ] Each representative module profile reaches launch only after its required organizational validations pass.
- [ ] An optional module can be added after initial launch through the same guided flow without re-entering valid organization data.
- [ ] Existing installations are migrated or exempted safely according to a documented policy.
- [ ] Arabic and English accessibility verification passes for the approved browser/device matrix.
- [ ] The staged release produces enough reason-coded evidence to diagnose readiness, activation, and guard failures safely.

## Dependencies

Validates #8 through #13 and is the final closure gate for parent #7.
```

## مراجع المقارنة

[1]: https://help.sap.com/docs/CENTRAL_BUSINESS_CONFIGURATION/55c9333eed324cd284f6c4e5dab8462f/c0f8f66dcd91441391295124ab8df8d6.html "SAP Central Business Configuration — Configure Your Business Processes"
[2]: https://docs.oracle.com/en/cloud/saas/human-resources/faipb/generate-the-setup-task-list-for-hcm.html "Oracle Fusion — Setup Task List for HCM"
[3]: https://learn.microsoft.com/en-us/dynamics365/business-central/setup "Microsoft Dynamics 365 Business Central — Overview of setup tasks"
[4]: https://www.netsuite.com/portal/resource/articles/erp/erp-implementation-phases.shtml "Oracle NetSuite — ERP implementation phases"
[5]: https://www.w3.org/WAI/tutorials/forms/multi-page/ "W3C WAI — Multi-page forms"
[6]: https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html "OWASP — Authorization Cheat Sheet"
