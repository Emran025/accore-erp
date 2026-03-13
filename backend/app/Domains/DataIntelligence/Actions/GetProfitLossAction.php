<?php
namespace App\Domains\DataIntelligence\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\Finance\GeneralLedger\Models\GeneralLedger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Domains\EnterpriseCore\IAM\Services\PermissionService;

class GetProfitLossAction extends Action
{
    public function __construct(private readonly Request $request) {}

    public function __invoke(): JsonResponse
    {
        PermissionService::requirePermission('reports', 'view');
        $start = $this->request->input('start_date', now()->startOfMonth()->format('Y-m-d'));
        $end = $this->request->input('end_date', now()->format('Y-m-d'));

        $revenues = $this->getAccountTypeDetails('Revenue', $start, $end);
        $expenses = $this->getAccountTypeDetails('Expense', $start, $end);

        $totalRev = collect($revenues)->sum('balance');
        $totalExp = collect($expenses)->sum('balance');

        return $this->successResponse([
            'period' => ['start' => $start, 'end' => $end],
            'revenues' => ['accounts' => $revenues, 'total' => $totalRev],
            'expenses' => ['accounts' => $expenses, 'total' => $totalExp],
            'net_income' => $totalRev - $totalExp,
        ]);
    }

    private function getAccountTypeDetails(string $type, string $start, string $end): array
    {
        return GeneralLedger::select('coa.account_code', 'coa.account_name')
            ->selectRaw("SUM(CASE WHEN entry_type = 'CREDIT' THEN amount ELSE -amount END) as balance")
            ->join('chart_of_accounts as coa', 'coa.id', '=', 'general_ledger.account_id')
            ->where('coa.account_type', $type)
            ->whereBetween('voucher_date', [$start, $end])
            ->groupBy('coa.account_code', 'coa.account_name')
            ->get()
            ->toArray();
    }
}
