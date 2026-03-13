<?php

namespace App\Domains\Commercial\SalesRepresentatives\Actions;

use App\Domains\Commercial\Sales\Models\SalesRepresentative;
use App\Domains\Commercial\Sales\Models\SalesRepresentativeTransaction;
use Illuminate\Support\Facades\DB;

class DeleteSalesRepresentativeTransactionAction
{
    public function execute(int $id): array
    {
        $transaction = SalesRepresentativeTransaction::findOrFail($id);

        if ($transaction->type === 'commission' || $transaction->type === 'return') {
            throw new \Exception('Cannot delete commission or return transactions from here. Please use the Invoices module.', 400);
        }

        return DB::transaction(function () use ($transaction) {
            $amount = $transaction->amount;
            
            // Reverse balance change
            // If it was a payment, balance was decremented, so we increment it back.
            // If it was an adjustment, balance was incremented, so we decrement it back.
            $balanceChange = ($transaction->type === 'payment') ? $amount : -$amount;
            
            SalesRepresentative::where('id', $transaction->sales_representative_id)
                ->increment('current_balance', $balanceChange);

            $oldValues = $transaction->toArray();
            
            $transaction->update([
                'is_deleted' => true,
                'deleted_at' => now(),
            ]);

            return $oldValues;
        });
    }
}
