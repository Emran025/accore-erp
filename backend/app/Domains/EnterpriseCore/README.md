# Domain 01: Enterprise Core (الأساس المؤسسي)

> Governance, IAM, Automation, and System Configuration.

## Capabilities

| Capability | Feature Groups |
|---|---|
| **IAM** | Authentication, Users, Roles, Sessions, Permissions |
| **Governance** | Settings, Audit Logs, Audit Trail, Number Ranges |
| **DocumentEngine** | System Templates, Document Templates |
| **OrgStructure** | Nodes, Links, Topology, Integration |

## Directory Convention

```
01-EnterpriseCore/
├── IAM/
│   ├── Actions/       ← Single Action Classes
│   ├── DTOs/          ← Data Transfer Objects
│   └── Services/      ← Domain services (migrated)
├── Governance/
│   ├── Actions/
│   ├── DTOs/
│   └── Services/
├── DocumentEngine/
│   ├── Actions/
│   ├── DTOs/
│   └── Services/
└── OrgStructure/
    ├── Actions/
    ├── DTOs/
    └── Services/
```
