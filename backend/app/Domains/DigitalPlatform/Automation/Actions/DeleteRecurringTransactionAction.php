<?php

namespace App\Domains\DigitalPlatform\Automation\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\Finance\JournalVouchers\Models\RecurringTransaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DeleteRecurringTransactionAction extends Action
{
    public function __construct(private readonly Request $request) {}

    public function __invoke(): JsonResponse
    {
        $id = $this->request->query('id');
        $template = RecurringTransaction::findOrFail($id);
        $template->delete();

        return $this->successResponse();
    }
}

