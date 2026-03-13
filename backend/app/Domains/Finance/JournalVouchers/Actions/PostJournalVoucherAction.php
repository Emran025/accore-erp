<?php
namespace App\Domains\Finance\JournalVouchers\Actions;
use App\Domains\Shared\Actions\Action;
use App\Domains\Finance\JournalVouchers\Models\JournalVoucher;
use App\Domains\Finance\GeneralLedger\Services\LedgerService;
use App\Domains\DigitalPlatform\Automation\Services\TelescopeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
class PostJournalVoucherAction extends Action
{
    public function __construct(private readonly int $id, private readonly LedgerService $ledgerService) {}
    public function __invoke(): JsonResponse
    {
        $voucher = JournalVoucher::with('lines.account')->findOrFail($this->id);
        if ($voucher->is_posted) return $this->errorResponse('Voucher is already posted', 400);
        return DB::transaction(function () use ($voucher) {
            $glEntries = $voucher->lines->map(fn($line) => [
                'account_code' => $line->account->account_code, 'entry_type' => $line->entry_type,
                'amount' => $line->amount, 'description' => $line->description ?? $voucher->description,
            ])->toArray();
            $voucherNumber = $this->ledgerService->postTransaction($glEntries, 'journal_vouchers', $voucher->id, null, $voucher->voucher_date->format('Y-m-d'));
            $voucher->update(['is_posted' => true, 'posted_at' => now(), 'posted_by' => auth()->id(), 'gl_voucher_number' => $voucherNumber]);
            TelescopeService::logOperation('POST', 'journal_vouchers', $voucher->id, null, ['gl_voucher_number' => $voucherNumber]);
            return $this->successResponse(['gl_voucher_number' => $voucherNumber], 'Journal voucher posted to GL successfully');
        });
    }
}
