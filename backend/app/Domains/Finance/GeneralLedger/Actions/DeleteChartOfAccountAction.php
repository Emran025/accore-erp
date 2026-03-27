<?php

namespace App\Domains\Finance\GeneralLedger\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\Finance\GeneralLedger\Models\ChartOfAccount;
use App\Domains\Finance\GeneralLedger\Models\GeneralLedger;
use App\Domains\EnterpriseCore\Automation\Services\TelescopeService;
use Illuminate\Support\Collection;

class DeleteChartOfAccountAction
{
    public function execute(int $id): Collection
    {
        $account = ChartOfAccount::findOrFail($id);

        // Check if account has transactions
        $hasTransactions = GeneralLedger::where('account_id', $account->id)->exists();

        if ($hasTransactions) {
            // Deactivate instead of delete
            $account->update(['is_active' => false]);
            $message = 'Account deactivated (has transaction history)';
        } else {
            $account->delete();
            $message = 'Account deleted successfully';
        }

        TelescopeService::logOperation('DELETE', 'chart_of_accounts', $id, $account->toArray(), null);

        return collect(['message' => $message]);
    }
}
