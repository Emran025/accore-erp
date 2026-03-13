<?php

namespace App\Domains\DigitalPlatform\Automation\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\Finance\JournalVouchers\Models\RecurringTransaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UpdateRecurringTransactionAction extends Action
{
    public function __construct(private readonly Request $request) {}

    public function __invoke(): JsonResponse
    {
        $id = $this->request->input('id');
        $template = RecurringTransaction::findOrFail($id);

        $validated = $this->request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string',
            'frequency' => 'required|string',
            'next_due_date' => 'required|date',
            'template_data' => 'required|array',
        ]);

        $template->update($validated);

        return $this->successResponse();
    }
}

