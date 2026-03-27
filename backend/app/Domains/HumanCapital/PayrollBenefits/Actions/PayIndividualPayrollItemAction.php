<?php

namespace App\Domains\HumanCapital\PayrollBenefits\Actions;

use App\Domains\HumanCapital\PayrollBenefits\Services\PayrollService;
use App\Domains\HumanCapital\PayrollBenefits\Models\PayrollItem;
use App\Domains\HumanCapital\PayrollBenefits\Models\PayrollTransaction;
use Illuminate\Support\Facades\DB;

class PayIndividualPayrollItemAction
{
    protected PayrollService $payrollService;

    public function __construct(PayrollService $payrollService)
    {
        $this->payrollService = $payrollService;
    }

    public function execute(int|string $itemId, array $data): PayrollTransaction
    {
        return DB::transaction(function () use ($itemId, $data) {
            $item = PayrollItem::with('payrollCycle')->findOrFail($itemId);

            if ($item->status === 'on_hold') {
                throw new \Exception('لا يمكن صرف الراتب لموظف تم إيقاف صرفه');
            }

            if ($item->payrollCycle->status !== 'approved') {
                throw new \Exception('لا يمكن صرف الرواتب إلا للدورات المعتمدة');
            }

            $paidAmount = PayrollTransaction::where('payroll_item_id', $itemId)
                ->where('transaction_type', 'payment')
                ->sum('amount');

            $remainingBalance = $item->net_salary - $paidAmount;

            if ($data['amount'] > $remainingBalance + 0.01) {
                throw new \Exception('المبلغ المدخل أكبر من الرصيد المتبقي');
            }

            $transaction = PayrollTransaction::create([
                'payroll_item_id' => $itemId,
                'transaction_type' => 'payment',
                'amount' => $data['amount'],
                'transaction_date' => now(),
                'notes' => $data['notes'] ?? null,
                'created_by' => auth()->id()
            ]);

            $this->payrollService->createPaymentJournalEntry($item, $data['amount'], $transaction->id, $data['account_id']);

            $this->payrollService->checkAndSetPaidStatus($item->payroll_cycle_id);

            return $transaction;
        });
    }
}
