<?php

namespace App\Domains\Finance\ChartOfAccounts\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\Finance\ChartOfAccounts\Models\ChartOfAccount;
use App\Domains\Finance\GeneralLedger\Models\GeneralLedger;
use App\Domains\DigitalPlatform\Automation\Services\TelescopeService;
use Illuminate\Http\JsonResponse;

class DeleteChartOfAccountAction
{
    public function execute(int $id): array
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

        return ['message' => $message];
    }
}
