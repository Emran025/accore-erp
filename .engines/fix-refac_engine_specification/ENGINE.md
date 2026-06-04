# COMPILER-GRADE ARCHITECTURE ENGINE SPECIFICATION (v3.1)

## 0. ENGINE IDENTITY AND PURPOSE
**Identity**: Dynamic Project-Aware Architecture Engine.
**Purpose**: To enforce absolute architectural integrity, state synchronization, and strict standard alignment across the entire accore project. The engine operates on project-wide deterministic loops and is forbidden from performing isolated, partial, or page-based execution without full contextual awareness. 

The Engine's primary mission is to inventory all project assets, iterate through them systematically, and verify that every data exchange is free from structural defects (404, 422, 500 errors).

## 1. DYNAMIC PROJECT INDEXING (DPI) & INTERNAL MANIFEST
Before execution, the Engine generates a Dynamic Project Index (DPI).
The DPI is a mandatory execution manifest containing:
- Every active frontend page/component.
- The corresponding backend `routes/api.php` or `routes/domains/*.php` endpoints.
- Domain/Module classification (e.g., Enterprise Core, Finance, Human Capital, Supply Chain, Commercial).
- Hash-based state locking vectors.

**Failure Condition**: If a page exists in the project but is omitted from or out of sync with the DPI, engine execution aborts immediately. 

## 1.1 PERSISTENT INDEX EPOCH (PIE)

The Engine operates on persistent indexing epochs.

- **Full Project Scan (Epoch-0)**: The engine lists ALL frontend pages and backend endpoints. It performs an initial serial iteration to establish a baseline.
- **Delta-Epoch Updates**: In subsequent iterations, the engine identifies and prioritizes "Modified Pages" via checksums but MUST perform a "Thorough Inspection" of the entire dependency chain (Request -> Controller -> Action -> Resource).
- **Sequential Comparison**: Detects:
  - New pages
  - Modified pages
  - Deprecated pages
  - Orphaned backend endpoints

A DPI is never treated as final. It is only valid within its Epoch.

## 2. STRICT ARCHITECTURAL RULES (THE LAW)
The engine strictly enforces the following layer constraints during its verification cycle. Any deviation is a **HARD FAILURE**.

1. **Routing (`routes/api.php` / `routes/domains/*.php`)**: Must point to specific `Api\V2` controller actions. RESTful compliance is mandatory (ID in path for PUT/DELETE).
2. **FormRequests (`app/Http/Requests`)**: **100% of input validation** lives here. Parameter isolation is absolute ($request->only() or query extractions in controllers are forbidden).
3. **Controllers (`app/Http/Controllers/Api/V2`)**: **ZERO business logic**. Controllers are strictly coordinators mapping Requests to Actions. All responses must be wrapped in `BaseApiController` methods.
4. **Actions (`app/Domains/**/Actions`)**: **100% of business logic**. Actions MUST return Eloquent models or collections. Returning raw arrays or HTTP responses is a violation.
5. **Resources (`app/Http/Resources`)**: **100% of response shaping**. All data transformation, relationship enrichment, and formatting occurs here.
6. **Frontend Synchronization (`frontend/lib/endpoints`, `types`)**: "Any" types are forbidden. Interfaces must map exactly to Backend Resources.

## 3. GLOBAL CONTROL LOOP & CONTINUOUS INSPECTION
The engine operates on a guaranteed deterministic loop over the DPI.

- **Phase A: Inventory & Change Detection**: 
  - List EVERY frontend page in the project.
  - Compare the current project state against the previous known Epoch.
  - Prioritize changed pages for deep inspection.

- **Phase B: Serial Iteration**: Loop over every flagged/changed page in the manifest.
  - For each page, the engine MUST iterate through every API endpoint and its extensions (query params, body, headers).
  - Verify that the backend implementation is free from the architectural errors:
    - **404 (Not Found)**: Missing record handling or incorrect route parameters.
    - **422 (Unprocessable)**: Mismatched optionality (nullable vs required) in FormRequests.
    - **500 (Server Error)**: Type mismatches (passing arrays to collection resources) or logic leaks in controllers.

- **Phase C: Deep Verification**: 
   - Verify Frontend Payload aligns with Backend Route.
   - Route aligns with FormRequest.
   - FormRequest filters payload to Controller.
   - Controller passes data to Action.
   - Action processes and returns back to Controller as ELOKEENT MODEL/COLLECTION.
   - Controller passes data to Resource.
   - Resource shape maps directly to Frontend TypeScript interface.

- **Phase D: State Lock**: Once a page passes deep verification, its structural hash is locked for the current DPI Epoch.

## 4. MANDATORY EXECUTION PHASES
Whenever invoked, the Engine executes the following phases in absolute order:

1. **PHASE -1: Project Discovery & DPI Generation**
   - Recursively scan the full project root.
   - Discover all frontend pages and components.
   - Build a DPI that explicitly links each frontend page to its API calls and backend dependencies.

2. **PHASE 0: Integrity & Error-Free Verification**
   - Iterate through the DPI (Full for First Run, Delta for Subsequent Runs).
   - Ensure every API endpoint and extension is functional and error-free.
   - Verify that data-fetching (read) and data-submission (write) flows are explicitly distinguishable.

3. **PHASE 1: Contract Enforcement & Refactoring**
   - Enforce Rules 1–6 (The Law).
   - Replace any direct `Request` usage with dedicated `FormRequest` classes.
   - Extract all business logic into `Actions` returning models.
   - Ensure `BaseApiController` response standards.

4. **PHASE 2: Bidirectional Data Contract Synchronization**
   - Derive TypeScript interfaces strictly from backend Resources.
   - Ensure frontend request payloads and response consumers adhere exactly to these contracts.
   
5. **PHASE 2.1: BIDIRECTIONAL DATA SHAPE VERIFICATION**
   - Parse exact payload structure (Frontend → Backend) and JSON schema (Backend → Frontend).
   - Verify zero mismatch in parameter names, types, and optionality.

6. **PHASE 3: Engine State Commit & Contract Lock**
   - Persist the verified DPI and contract metadata.
   - Lock the updated DPI Epoch.

## 5. PROHIBITIONS
- **NO PARTIAL RUNS**: You are forbidden from selecting a single page as a starting point without indexing the whole.
- **NO INFERRED TYPES**: Types must be exact matches of backend Resources.
- **NO SILENT OPTIONALITY**: Nullable fields must be explicitly handled in both FormRequests and TS Interfaces.
- **NO MANUAL SCOPE LIMITING**: The Engine may not be instructed to operate on a subset of pages unless the DPI explicitly marks all others as unchanged.

