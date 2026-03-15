<?php
namespace App\Domains\Finance\ManagementAccounting\Actions;
use App\Domains\Finance\ManagementAccounting\Models\Expense;
use App\Domains\Finance\GeneralLedger\Services\LedgerService;
use App\Domains\Finance\GeneralLedger\Services\ChartOfAccountsMappingService;
use App\Domains\EnterpriseCore\Automation\Services\TelescopeService;
use Illuminate\Support\Facades\DB;
use App\Domains\EnterpriseCore\IdentityAccess\Services\PermissionService;

class CreateExpenseAction
{
    public function __construct(
        private readonly LedgerService $ledgerService,
        private readonly ChartOfAccountsMappingService $coaService
    ) {}

    public function execute(array $data): array
    {
        PermissionService::requirePermission('expenses', 'create');

        return DB::transaction(function () use ($data) {
            $category = $data['category'];
            $accountCode = $data['account_code'] ?? null;
            $amount = $data['amount']; // Used for GL only
            
            if (!$accountCode) {
                // Try to find a leaf account matching the category
                $mapping = [
                    'rent' => 'إيجار',
                    'utilities' => 'مرافق',
                    'salaries' => 'رواتب',
                    'maintenance' => 'صيانة',
                    'supplies' => 'مستلزمات',
                    'marketing' => 'تسويق',
                    'transport' => 'نقل',
                ];
                
                if (isset($mapping[$category])) {
                    $accountCode = $this->coaService->getAccountCode('Expense', $mapping[$category]);
                }
                
                // If still not found, use standard operating expenses leaf
                if (!$accountCode) {
                    $accountCode = $this->coaService->getStandardAccounts()['operating_expenses'];
                }
            }
            
            // Validate account code
            if (!$this->coaService->validateAccountCode($accountCode)) {
                throw new \Exception("Invalid account code: $accountCode", 400);
            }

            // Generate voucher number FIRST
            $voucherNumber = $this->ledgerService->getNextVoucherNumber('EXP');

            // Create expense record (operational metadata only — NO amount)
            $expense = Expense::create([
                'category' => $data['category'],
                'account_code' => $accountCode,
                'voucher_number' => $voucherNumber, // Link to GL
                'expense_date' => $data['expense_date'] ?? now(),
                'description' => $data['description'] ?? null,
                'payment_type' => $data['payment_type'] ?? 'cash',
                'supplier_id' => $data['supplier_id'] ?? null,
                'user_id' => auth()->id() ?? session('user_id'),
            ]);

            // Post to GL
            $accounts = $this->coaService->getStandardAccounts();
            $paymentType = $data['payment_type'] ?? 'cash';
            $glEntries = [
                [
                    'account_code' => $accountCode,
                    'entry_type' => 'DEBIT',
                    'amount' => $amount,
                    'description' => "Expense: {$expense->category} - Voucher #$voucherNumber"
                ],
                [
                    'account_code' => $paymentType === 'cash' ? $accounts['cash'] : $accounts['accounts_payable'],
                    'entry_type' => 'CREDIT',
                    'amount' => $amount,
                    'description' => "Expense Payment - Voucher #$voucherNumber"
                ],
            ];

            $this->ledgerService->postTransaction(
                $glEntries,
                'expenses',
                $expense->id,
                $voucherNumber,
                ($data['expense_date'] ?? now()->format('Y-m-d'))
            );

            TelescopeService::logOperation('CREATE', 'expenses', $expense->id, null, $data);

            return [
                'id' => $expense->id,
                'voucher_number' => $voucherNumber,
            ];
        });
    }
}
