# Tax Engine: ZATCA Compliance Adapter

The Saudi Arabian Tax Authority (ZATCA) has strict e-invoicing requirements (Phase 1 and Phase 2). The `ZATCATaxAuthority` adapter manages these complexities.

## 1. Compliance Interface
The adapter implements `TaxAuthorityInterface`, which defines methods for:
- `generateCompliancePayload()`: Creating UBL 2.1 XML and QR codes.
- `validateForSubmission()`: Checking business rules before sending to ZATCA.
- `submit()`: Communicating with the ZATCA API.

## 2. QR Code Generation
ZATCA requires a Base64 encoded TLV (Tag-Length-Value) format for QR codes. The adapter handles this automatically:
- **Tag 1**: Seller Name
- **Tag 2**: VAT Registration Number
- **Tag 3**: Timestamp
- **Tag 4**: Invoice Total (with VAT)
- **Tag 5**: VAT Total

## 3. UBL XML Generation (Integration)
The adapter delegates XML creation to the `UBLGeneratorService`.
- It maps the internal `Invoice` and `TaxLine` models to the ZATCA UBL schema.
- It includes the required cryptographic components (Hash, Signature) for Phase 2 compliance.

## 4. Environment & Submission
The adapter supports multiple environments via `config('zatca.environment')`:
- **Sandbox**: Default. Simulates successful submission without hitting ZATCA servers.
- **Simulation**: Hits ZATCA developer portal.
- **Production**: Live submission (Requires Binary Tokens/Certificates).

## 5. Configuration Settings
Required settings in the `settings` table:
- `tax_number`: Company VAT ID.
- `zatca_enabled`: Global toggle.
- `zatca_binary_token`: (Phase 2) Security token for signing.

## 6. How to Add a New Authority (e.g., UAE FTA)
To add a new jurisdiction:
1. Create a new class `App\Services\Tax\FTATaxAuthority`.
2. Implement `TaxAuthorityInterface`.
3. Register the new authority in the `tax_authorities` database table.
4. The `TaxCalculator` will automatically pick up the new adapter based on the `country_code`.
