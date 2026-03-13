<?php

namespace App\Domains\DigitalPlatform\Automation\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\Finance\JournalVouchers\Models\RecurringTransaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CreateRecurringTransactionAction extends Action
{
    public function __construct(private readonly Request $request) {}

    public function __invoke(): JsonResponse
    {
        $validated = $this->request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string',
            'frequency' => 'required|string',
            'next_due_date' => 'required|date',
            'template_data' => 'required|array',
        ]);

        $template = RecurringTransaction::create($validated);

        return $this->successResponse(['id' => $template->id]);
    }
}

