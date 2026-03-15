<?php

namespace App\Domains\HumanCapital\ServicesWellness\Actions;

use App\Domains\HumanCapital\ServicesWellness\Models\EmployeeLoan;
use App\Domains\HumanCapital\ServicesWellness\Models\LoanRepayment;

class RecordLoanRepaymentAction
{
    public function execute(int|string $loanId, int|string $repaymentId, array $data): array
    {
        $repayment = LoanRepayment::where('loan_id', $loanId)->findOrFail($repaymentId);

        $data['status'] = 'paid';
        $repayment->update($data);

        // Update loan remaining balance
        $loan = EmployeeLoan::findOrFail($loanId);
        $paidAmount = $repayment->principal;
        $loan->remaining_balance -= $paidAmount;

        if ($loan->remaining_balance <= 0) {
            $loan->status = 'completed';
        }
        $loan->save();

        return $repayment->load('loan')->toArray();
    }
}
