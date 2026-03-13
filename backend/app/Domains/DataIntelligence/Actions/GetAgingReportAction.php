<?php
namespace App\Domains\DataIntelligence\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\Commercial\AccountsReceivable\Models\ArTransaction;
use App\Domains\Commercial\AccountsPayable\Models\ApTransaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Domains\EnterpriseCore\IAM\Services\PermissionService;
use Illuminate\Support\Facades\DB;

class GetAgingReportAction extends Action
{
    public function __construct(private readonly Request $request) {}

    public function __invoke(): JsonResponse
    {
        PermissionService::requirePermission('reports', 'view');
        $type = $this->request->input('type', 'receivables'); // receivables or payables
        $date = $this->request->input('as_of_date', now()->format('Y-m-d'));

        if ($type === 'receivables') {
            $data = $this->getReceivablesAging($date);
        } else {
            $data = $this->getPayablesAging($date);
        }

        return $this->successResponse([
            'as_of_date' => $date,
            'type' => $type,
            'data' => $data,
        ]);
    }

    private function getReceivablesAging(string $date)
    {
        return ArTransaction::select('c.name')
            ->selectRaw("SUM(CASE WHEN DATEDIFF(?, transaction_date) <= 30 THEN amount ELSE 0 END) as '0_30'")
            ->selectRaw("SUM(CASE WHEN DATEDIFF(?, transaction_date) BETWEEN 31 AND 60 THEN amount ELSE 0 END) as '31_60'")
            ->selectRaw("SUM(CASE WHEN DATEDIFF(?, transaction_date) > 60 THEN amount ELSE 0 END) as 'over_60'")
            ->join('ar_customers as c', 'c.id', '=', 'ar_transactions.customer_id')
            ->whereDate('transaction_date', '<=', $date)
            ->groupBy('c.name')
            ->setBindings([$date, $date, $date])
            ->get();
    }

    private function getPayablesAging(string $date)
    {
        return ApTransaction::select('s.name')
            ->selectRaw("SUM(CASE WHEN DATEDIFF(?, transaction_date) <= 30 THEN amount ELSE 0 END) as '0_30'")
            ->selectRaw("SUM(CASE WHEN DATEDIFF(?, transaction_date) BETWEEN 31 AND 60 THEN amount ELSE 0 END) as '31_60'")
            ->selectRaw("SUM(CASE WHEN DATEDIFF(?, transaction_date) > 60 THEN amount ELSE 0 END) as 'over_60'")
            ->join('ap_suppliers as s', 's.id', '=', 'ap_transactions.supplier_id')
            ->whereDate('transaction_date', '<=', $date)
            ->groupBy('s.name')
            ->setBindings([$date, $date, $date])
            ->get();
    }
}
