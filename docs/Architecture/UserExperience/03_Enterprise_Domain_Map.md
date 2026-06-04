# Enterprise Domain Map

The accoreructured into **10 distinct vertical domains**. This ensures High Cohesion (related tasks grouped together) and Low Coupling (domains can operate independently).

## 1. The 10-Domain Overview

| ID | Domain Name | Arabic Title | Primary Objective |
| -- | ----------- | ------------ | ----------------- |
| 1 | **Enterprise Core** | الأساس المؤسسي | Governance, IAM, and Automation. |
| 2 | **Commercial Operations** | العمليات التجارية | Sales, CRM, and Revenue. |
| 3 | **Financial Management** | الإدارة المالية | General Ledger, Treasury, and Tax. |
| 4 | **Supply Chain & Logistics** | سلاسل الإمداد | Procurement, Inventory, and Fleet. |
| 5 | **Manufacturing** | التصنيع والإنتاج | Engineering and Production Control. |
| 6 | **Human Capital (HCM)** | رأس المال البشري | Workforce, Payroll, and Performance. |
| 7 | **Projects & Services** | المشاريع والخدمات | WBS, Execution, and Project Finance. |
| 8 | **Asset Management** | إدارة الأصول | Fixed Assets and Maintenance (EAM). |
| 9 | **Data & Intelligence** | البيانات والذكاء | BI, DWH, and AI Analytics. |
| 10 | **Digital Platform** | المنصة الرقمية | Integrations, SDKs, and Low-Code. |

---

## 2. Capability Breakdown (Samples)

### Domain 3: Financial Management
- **General Ledger:** Chart of Accounts, Fiscal Closing, Journal Vouchers.
- **Treasury:** Cash Flow, **Bank Reconciliation**, Currency FX.
- **Tax & Compliance:** VAT, ZATCA (E-Invoicing), Tax Filing.

### Domain 6: Human Capital Management
- **Workforce Admin:** 360 Degree Profiles, Contracts.
- **Payroll:** Salary Sheets, Benefits, End of Service.
- **Time & Attendance:** Biometrics, Shift Scheduling.

---

## 3. Structural Taxonomy

Every domain is mapped to the filesystem to ensure developers can find code as quickly as users find screens.

```bash
Domain (e.g., 03-finance)
   └── Capability (e.g., treasury)
         └── Feature Group (e.g., reconciliation)
               └── Screen Module (e.g., bank-reconciliation)
```

This mapping is absolute. A feature found in "Commercial" navigation must exist in the `02-commercial` directory in the codebase.
