<?php
namespace App\Domains\Finance\GeneralLedger\Actions;
use App\Domains\Shared\Actions\Action;
use App\Domains\Finance\GeneralLedger\Models\FiscalPeriod;
use App\Domains\Finance\GeneralLedger\Services\LedgerService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Domains\Finance\GeneralLedger\Models\ChartOfAccount;
use App\Domains\Finance\GeneralLedger\Models\GeneralLedger;
use App\Domains\Finance\GeneralLedger\Services\ChartOfAccountsMappingService;
use App\Domains\EnterpriseCore\IdentityAccess\Services\PermissionService;
use Illuminate\Support\Facades\DB;

class CloseFiscalPeriodAction
{
    public function __construct(
        private readonly LedgerService $ledgerService,
        private readonly ChartOfAccountsMappingService $coaService
    ) {}

    public function execute(int $id): array
    {
        PermissionService::requirePermission('fiscal_periods', 'edit');

        $period = FiscalPeriod::findOrFail($id);

        if ($period->is_closed) {
            throw new \Exception('Period is already closed', 400);
        }

        if ($period->is_locked) {
            throw new \Exception('Cannot close a locked period', 400);
        }

        return DB::transaction(function () use ($period) {
            // Calculate net income for the period
            $netIncome = $this->calculatePeriodNetIncome($period->id);

            // Get retained earnings account
            $accounts = $this->coaService->getStandardAccounts();
            $retainedEarningsCode = $accounts['retained_earnings'] ?? '3200';

            // Close revenue accounts
            $revenueAccounts = ChartOfAccount::where('account_type', 'Revenue')
                ->where('is_active', true)
                ->get();

            $closingEntries = [];

            foreach ($revenueAccounts as $account) {
                $balance = $this->ledgerService->getAccountBalance(
                    $account->account_code,
                    $period->end_date
                );

                if ($balance != 0) {
                    // Debit revenue accounts (to zero them out)
                    $closingEntries[] = [
                        'account_code' => $account->account_code,
                        'entry_type' => 'DEBIT',
                        'amount' => abs($balance),
                        'description' => "Closing entry - {$period->period_name}"
                    ];
                }
            }

            // Close expense accounts
            $expenseAccounts = ChartOfAccount::where('account_type', 'Expense')
                ->where('is_active', true)
                ->get();

            foreach ($expenseAccounts as $account) {
                $balance = $this->ledgerService->getAccountBalance(
                    $account->account_code,
                    $period->end_date
                );

                if ($balance != 0) {
                    // Credit expense accounts (to zero them out)
                    $closingEntries[] = [
                        'account_code' => $account->account_code,
                        'entry_type' => 'CREDIT',
                        'amount' => abs($balance),
                        'description' => "Closing entry - {$period->period_name}"
                    ];
                }
            }

            // Post net income to retained earnings
            if ($netIncome != 0) {
                $closingEntries[] = [
                    'account_code' => $retainedEarningsCode,
                    'entry_type' => $netIncome > 0 ? 'CREDIT' : 'DEBIT',
                    'amount' => abs($netIncome),
                    'description' => "Net income transfer - {$period->period_name}"
                ];
            }

            // Post closing entries
            if (!empty($closingEntries)) {
                $voucherNumber = $this->ledgerService->postTransaction(
                    $closingEntries,
                    'fiscal_periods',
                    $period->id,
                    null,
                    $period->end_date
                );

                $period->update([
                    'closing_voucher_number' => $voucherNumber,
                ]);
            }

            // Mark period as closed
            $period->update([
                'is_closed' => true,
                'closed_at' => now(),
                'closed_by' => auth()->id() ?? session('user_id'),
                'net_income' => $netIncome,
            ]);

            return [
                'message' => 'Fiscal period closed successfully',
                'net_income' => $netIncome,
                'voucher_number' => $period->closing_voucher_number,
            ];
        });
    }

    /**
     * Calculate net income for a period
     */
    private function calculatePeriodNetIncome(int $periodId): float
    {
        $period = FiscalPeriod::findOrFail($periodId);

        // Get total revenue
        $revenueAccounts = ChartOfAccount::where('account_type', 'Revenue')
            ->where('is_active', true)
            ->pluck('id');

        $totalRevenue = GeneralLedger::whereIn('account_id', $revenueAccounts)
            ->where('fiscal_period_id', $periodId)
            ->where('is_closed', false)
            ->selectRaw('
                SUM(CASE WHEN entry_type = "CREDIT" THEN amount ELSE 0 END) -
                SUM(CASE WHEN entry_type = "DEBIT" THEN amount ELSE 0 END) as total
            ')
            ->value('total') ?? 0;

        // Get total expenses
        $expenseAccounts = ChartOfAccount::where('account_type', 'Expense')
            ->where('is_active', true)
            ->pluck('id');

        $totalExpenses = GeneralLedger::whereIn('account_id', $expenseAccounts)
            ->where('fiscal_period_id', $periodId)
            ->where('is_closed', false)
            ->selectRaw('
                SUM(CASE WHEN entry_type = "DEBIT" THEN amount ELSE 0 END) -
                SUM(CASE WHEN entry_type = "CREDIT" THEN amount ELSE 0 END) as total
            ')
            ->value('total') ?? 0;

        return (float)$totalRevenue - (float)$totalExpenses;
    }
}
