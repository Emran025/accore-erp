<?php
namespace App\Domains\Finance\JournalVouchers\Actions;
use App\Domains\Finance\GeneralLedger\Models\GeneralLedger;
use App\Domains\EnterpriseCore\IAM\Services\PermissionService;
class ShowJournalVoucherAction
{
    public function execute(string $voucherNumber): array
    {
        PermissionService::requirePermission('journal_vouchers', 'view');

        $entries = GeneralLedger::where('voucher_number', $voucherNumber)
            ->where('entry_source', 'MANUAL')
            ->with(['account', 'createdBy', 'costCenter', 'profitCenter'])
            ->orderBy('id')
            ->get();

        if ($entries->isEmpty()) {
            throw new \Exception('Voucher not found', 404);
        }

        $first = $entries->first();
        return [
            'id' => $voucherNumber,
            'voucher_number' => $voucherNumber,
            'voucher_date' => $first->voucher_date?->format('Y-m-d'),
            'description' => $first->description,
            'total_debit' => (float)$entries->where('entry_type', 'DEBIT')->sum('amount'),
            'total_credit' => (float)$entries->where('entry_type', 'CREDIT')->sum('amount'),
            'status' => 'posted',
            'lines' => $entries->map(fn($e) => [
                'id' => $e->id,
                'account_id' => $e->account_id,
                'account_name' => $e->account?->account_name,
                'debit' => $e->entry_type === 'DEBIT' ? (float)$e->amount : 0,
                'credit' => $e->entry_type === 'CREDIT' ? (float)$e->amount : 0,
                'description' => $e->description,
                'cost_center_id' => $e->cost_center_id,
                'cost_center_name' => $e->costCenter?->name,
                'profit_center_id' => $e->profit_center_id,
                'profit_center_name' => $e->profitCenter?->name,
            ])->toArray(),
        ];
    }
}
