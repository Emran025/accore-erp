# API Documentation Engine

Autonomous, runtime-based OpenAPI 3.x documentation generator for the Laravel enterprise backend.

## How It Works

The engine generates documentation by inspecting the **live running system** — not manual annotations or static YAML files. It derives everything from:

1. **Laravel Router** — all registered routes, methods, URIs, middleware, and controller mappings
2. **FormRequest classes** — real validation rules extracted via PHP Reflection, converted to OpenAPI request body schemas
3. **Controller docblocks** — operation summaries and descriptions parsed from PHP docblock comments
4. **Domain/Sub-domain namespace tree** — controller FQNs map directly to the output `Domains/` directory structure

## Output

OpenAPI 3.x YAML files written to:

```
docs/Domains/
├── Assets/AssetLifecycle/open_api_doc.yaml
├── Commercial/SalesLifecycle/open_api_doc.yaml
├── EnterpriseCore/IdentityAccess/open_api_doc.yaml
├── Finance/GeneralLedger/open_api_doc.yaml
... (43 files total)
```

Each file covers **only** endpoints belonging to that sub-domain and includes:
- All paths (GET, POST, PUT, DELETE, PATCH)
- Path parameters with type hints
- Query parameters extracted from GET FormRequests
- Request body schemas built from validation rules
- Standard success/error response schemas
- Security scheme (`X-Session-Token` header)

## Running the Engine

From the project root:

```bash
./engines/api-doc-engine/run.sh
```

Or via Artisan directly:

```bash
cd backend && php artisan api-docs:generate
```

Preview without writing files:

```bash
cd backend && php artisan api-docs:generate --dry-run
```

## Engine Architecture

```
engines/api-doc-engine/
├── run.sh                              # Shell entry point
├── README.md                           # This file
└── src/
    ├── ApiDocEngineServiceProvider.php # Laravel service provider (registers command)
    ├── Commands/
    │   └── GenerateApiDocsCommand.php  # Artisan command (orchestrator)
    └── Core/
        ├── RouteScanner.php            # Discovers all API routes from Laravel router
        ├── NamespaceMapper.php         # Maps controller FQN → Domain/SubDomain
        ├── FormRequestExtractor.php    # Detects FormRequest classes + extracts rules()
        ├── RulesConverter.php          # Converts Laravel rules → OpenAPI schema
        ├── OpenApiBuilder.php          # Assembles complete OpenAPI 3.x structure
        └── DocWriter.php               # Writes YAML to docs/Domains/** filesystem
```

## Domain Mapping Rules

Controller namespace → output directory:

| Controller Namespace | Output Path |
|---|---|
| `Api\V2\EnterpriseCore\IdentityAccess\*` | `EnterpriseCore/IdentityAccess/` |
| `Api\V2\Commercial\SalesLifecycle\*` | `Commercial/SalesLifecycle/` |
| `Api\V2\Finance\GeneralLedger\*` | `Finance/GeneralLedger/` |
| `Api\V2\Assets\AssetsController` | `Assets/AssetLifecycle/` |
| `Api\V2\EnterpriseCore\OrganizationGovernance\ComplianceProfileController` | `EnterpriseCore/MonitoringCompliance/` |

Sub-domains with no registered routes receive a minimal stub YAML (marked as placeholder).

## Adding New Routes

When new routes are added to the backend, simply re-run the engine. It is **deterministic** — it always regenerates from scratch, so no manual sync is needed.
