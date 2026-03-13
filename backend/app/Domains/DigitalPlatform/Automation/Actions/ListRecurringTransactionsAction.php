<?php

namespace App\Domains\DigitalPlatform\Automation\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\Finance\JournalVouchers\Models\RecurringTransaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ListRecurringTransactionsAction extends Action
{
    public function __construct(private readonly Request $request) {}

    public function __invoke(): JsonResponse
    {
        $id = $this->request->query('id');
        if ($id) {
            $template = RecurringTransaction::findOrFail($id);
            return $this->successResponse($template->toArray());
        }

        $limit = $this->request->query('limit', 20);
        $data = RecurringTransaction::orderBy('name')->paginate($limit);

        return response()->json([
            'success' => true,
            'data' => $data->items(),
            'total' => $data->total(),
        ]);
    }
}

