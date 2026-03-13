<?php
namespace App\Domains\Finance\JournalVouchers\Actions;
use App\Domains\Shared\Actions\Action;
use App\Domains\Finance\GeneralLedger\Models\GeneralLedger;
use App\Domains\DigitalPlatform\Automation\Services\TelescopeService;
use Illuminate\Http\JsonResponse;
class DeleteJournalVoucherAction extends Action
{
    public function __construct(private readonly int $id) {}
    public function __invoke(): JsonResponse
    {
        $voucher = GeneralLedger::findOrFail($this->id);
        if ($voucher->is_posted) return $this->errorResponse('Cannot delete a posted journal voucher. Reverse it instead.', 400);
        $oldValues = $voucher->toArray();
        $voucher->lines()->delete();
        $voucher->delete();
        TelescopeService::logOperation('DELETE', 'journal_vouchers', $this->id, $oldValues, null);
        return $this->successResponse(null, 'Journal voucher deleted successfully');
    }
}
