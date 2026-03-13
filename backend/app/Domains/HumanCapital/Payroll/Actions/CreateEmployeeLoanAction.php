<?php

namespace App\Domains\HumanCapital\Payroll\Actions;

use App\Domains\HumanCapital\Payroll\Models\EmployeeLoan;
use App\Domains\HumanCapital\Payroll\Models\LoanRepayment;
use Illuminate\Support\Facades\DB;

class CreateEmployeeLoanAction
{
    public function execute(array $data): array
    {
        return DB::transaction(function () use ($data) {
            $principal = $data['loan_amount'];
            $interestRate = ($data['interest_rate'] ?? 0) / 100 / 12; // Monthly interest rate
            $installments = $data['installment_count'];

            if ($interestRate > 0) {
                $monthlyInstallment = $principal * ($interestRate * pow(1 + $interestRate, $installments)) / (pow(1 + $interestRate, $installments) - 1);
            } else {
                $monthlyInstallment = $principal / $installments;
            }

            $data['loan_number'] = 'LOAN-' . date('Ymd') . '-' . str_pad(EmployeeLoan::count() + 1, 4, '0', STR_PAD_LEFT);
            $data['monthly_installment'] = round($monthlyInstallment, 2);
            $data['remaining_balance'] = $data['loan_amount'];
            $data['status'] = 'pending';
            $data['end_date'] = \Carbon\Carbon::parse($data['start_date'])->addMonths($installments)->format('Y-m-d');

            $loan = EmployeeLoan::create($data);

            $this->createRepaymentSchedule($loan);

            return $loan->load('employee', 'repayments')->toArray();
        });
    }

    private function createRepaymentSchedule(EmployeeLoan $loan): void
    {
        $startDate = \Carbon\Carbon::parse($loan->start_date);
        $monthlyInstallment = $loan->monthly_installment;
        $remainingBalance = $loan->loan_amount;
        $interestRate = $loan->interest_rate / 100 / 12;

        for ($i = 1; $i <= $loan->installment_count; $i++) {
            $dueDate = $startDate->copy()->addMonths($i);

            if ($interestRate > 0) {
                $interest = $remainingBalance * $interestRate;
                $principal = $monthlyInstallment - $interest;
            } else {
                $interest = 0;
                $principal = $monthlyInstallment;
            }

            LoanRepayment::create([
                'loan_id'            => $loan->id,
                'installment_number' => $i,
                'due_date'           => $dueDate,
                'amount'             => $monthlyInstallment,
                'principal'          => round($principal, 2),
                'interest'           => round($interest, 2),
                'status'             => 'pending',
            ]);

            $remainingBalance -= $principal;
        }
    }
}
