<?php

namespace App\Domains\Finance\GeneralLedger\Services;

use App\Domains\EnterpriseCore\SystemOverview\Models\DocumentSequence;
use App\Domains\Finance\GeneralLedger\Models\ChartOfAccount;
use App\Domains\Finance\GeneralLedger\Models\GeneralLedger;
use App\Domains\Finance\GeneralLedger\Models\FiscalPeriod;
use App\Domains\Finance\GeneralLedger\Models\UniversalJournal;
use App\Domains\Finance\GeneralLedger\Models\ViewTrialBalance;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Service for managing general ledger operations, voucher numbering, and fiscal periods.
 * Handles double-entry accounting integrity and transaction posting.
 */
class LedgerService
{
    public function getNextVoucherNumber(string $documentType): string
    {
        return DB::transaction(function () use ($documentType) {
            // Because UniversalJournal generation is the ONLY source of voucher numbers,
            // we create an initial record. We use a UUID to satisfy the unique constraint temporarily.
            $tempVoucherNumber = $documentType . '-' . Str::uuid()->toString();

            $journal = UniversalJournal::create([
                'voucher_number' => $tempVoucherNumber,
                'document_type' => $documentType,
                'document_summary' => 'Pending Document',
            ]);

            // Generate standard format using its incrementing ID
            $voucherNumber = $documentType . '-' . str_pad($journal->id, 6, '0', STR_PAD_LEFT);

            $journal->update([
                'voucher_number' => $voucherNumber
            ]);

            return $voucherNumber;
        });
    }

    /**
     * Post a multi-entry transaction to the General Ledger.
     * Validates double-entry integrity (debits = credits) and fiscal period constraints.
     * 
     * @param array $entries Array of entries, each containing 'account_code', 'entry_type', and 'amount'
     * @param string|null $referenceType Optional reference type for the transaction source
     * @param int|null $referenceId Optional reference ID for the transaction source
     * @param string|null $voucherNumber Optional manual voucher number
     * @param string|null $voucherDate Optional voucher date (defaults to current date)
     * @return string The voucher number assigned to the transaction
     * @throws \Exception If validation fails or the fiscal period is locked/closed
     */
    public function postTransaction(
        array $entries,
        ?string $referenceType = null,
        ?int $referenceId = null,
        ?string $voucherNumber = null,
        ?string $voucherDate = null,
        string $entrySource = 'AUTOMATIC',
        ?int $currencyId = null,
        ?float $exchangeRate = null
    ): string {
        if (empty($entries) || count($entries) < 2) {
            throw new \Exception("At least two entries required for double-entry accounting");
        }

        // Validate debits equal credits
        $totalDebits = 0;
        $totalCredits = 0;

        foreach ($entries as $entry) {
            if (!isset($entry['account_code']) || !isset($entry['entry_type']) || !isset($entry['amount'])) {
                throw new \Exception("Each entry must have account_code, entry_type, and amount");
            }

            $entryType = strtoupper($entry['entry_type']);
            if ($entryType !== 'DEBIT' && $entryType !== 'CREDIT') {
                throw new \Exception("Entry type must be DEBIT or CREDIT");
            }

            $amount = (float)$entry['amount'];
            if ($amount <= 0) {
                throw new \Exception("Amount must be positive");
            }

            if ($entryType === 'DEBIT') {
                $totalDebits += $amount;
            } else {
                $totalCredits += $amount;
            }
        }

        if (abs($totalDebits - $totalCredits) > 0.01) {
            throw new \Exception("Debits ($totalDebits) must equal Credits ($totalCredits)");
        }

        // Get or generate voucher number
        if (!$voucherNumber) {
            $voucherNumber = $this->getNextVoucherNumber('VOU');
        }

        if (!$voucherDate) {
            $voucherDate = now()->format('Y-m-d');
        }

        // Get fiscal period for the voucher date
        $period = $this->getFiscalPeriodForDate($voucherDate);
        
        if (!$period) {
            throw new \Exception("Voucher date ({$voucherDate}) is outside fiscal period");
        }

        if ($period->is_locked) {
            throw new \Exception("Cannot post transactions to a locked fiscal period");
        }
        if ($period->is_closed) {
            throw new \Exception("Cannot post transactions to a closed fiscal period");
        }

        $fiscalPeriodId = $period->id;

        $userId = auth()->id() ?? session('user_id');

        return DB::transaction(function () use ($entries, $voucherNumber, $voucherDate, $referenceType, $referenceId, $fiscalPeriodId, $userId, $entrySource, $currencyId, $exchangeRate) {
            UniversalJournal::updateOrCreate(
                ['voucher_number' => $voucherNumber],
                [
                    'document_type' => $referenceType ?? 'JOURNAL',
                    'document_summary' => "Journal Entry $voucherNumber",
                ]
            );

            foreach ($entries as $entry) {
                $account = ChartOfAccount::where('account_code', $entry['account_code'])->first();
                if (!$account) {
                    throw new \Exception("Account not found: {$entry['account_code']}");
                }

                // Check if account is a summary account (has children)
                if (config('accounting.prevent_posting_to_parent_accounts', true)) {
                    $hasChildren = ChartOfAccount::where('parent_id', $account->id)->exists();
                    if ($hasChildren) {
                        throw new \Exception("Cannot post to a summary account (header): {$account->account_name} ({$account->account_code})");
                    }
                }

                GeneralLedger::create([
                    'voucher_number' => $voucherNumber,
                    'voucher_date' => $voucherDate,
                    'account_id' => $account->id,
                    'entry_type' => strtoupper($entry['entry_type']),
                    'entry_source' => $entrySource,
                    'amount' => $entry['amount'],
                    'description' => $entry['description'] ?? '',
                    'reference_type' => $referenceType,
                    'reference_id' => $referenceId,
                    'fiscal_period_id' => $fiscalPeriodId,
                    'cost_center_id' => $entry['cost_center_id'] ?? null,
                    'profit_center_id' => $entry['profit_center_id'] ?? null,
                    'currency_id' => $currencyId,
                    'exchange_rate' => $exchangeRate,
                    'created_by' => $userId,
                ]);
            }

            return $voucherNumber;
        });
    }

    /**
     * Get fiscal period for a specific date.
     * Selects only the columns required by callers (id, is_locked, is_closed)
     * to keep the result set minimal and use the idx_fiscal_periods_range_closed index.
     */
    public function getFiscalPeriodForDate(string $date): ?FiscalPeriod
    {
        return FiscalPeriod::select(['id', 'is_closed', 'is_locked', 'period_name', 'start_date', 'end_date'])
            ->where('start_date', '<=', $date)
            ->where('end_date', '>=', $date)
            ->where('is_closed', false)
            ->first();
    }

    /**
     * Get account balance for a specific account
     * 
     * @param string $accountCode Account code to get balance for
     * @param string|null $asOfDate Optional date to calculate balance as of (Y-m-d format)
     * @return float Account balance
     */
    public function getAccountBalance(string $accountCode, ?string $asOfDate = null): float
    {
        $account = ChartOfAccount::select(['id', 'account_type'])
            ->where('account_code', $accountCode)
            ->first();

        if (!$account) {
            return 0;
        }

        // Structure the query so MySQL can satisfy it entirely from
        // idx_gl_account_type_closed (equality on account_id + is_closed,
        // filter on entry_type) or idx_gl_account_closed_date (when asOfDate given).
        $baseQuery = GeneralLedger::where('account_id', $account->id)
            ->where('is_closed', false);

        if ($asOfDate) {
            // Uses idx_gl_account_closed_date: (account_id, is_closed, voucher_date)
            $baseQuery->where('voucher_date', '<=', $asOfDate);
        }

        // Single aggregation pass using CASE WHEN to avoid two separate queries
        $result = $baseQuery->selectRaw(
            'SUM(CASE WHEN entry_type = ? THEN amount ELSE 0 END) AS debit_sum,
             SUM(CASE WHEN entry_type = ? THEN amount ELSE 0 END) AS credit_sum',
            ['DEBIT', 'CREDIT']
        )->first();

        $debits  = (float) ($result->debit_sum ?? 0);
        $credits = (float) ($result->credit_sum ?? 0);

        // Asset and Expense accounts carry debit (normal) balances
        $type = strtolower($account->account_type);
        if (in_array($type, ['asset', 'expense'])) {
            return $debits - $credits;
        }

        // Liability, Equity, and Revenue accounts carry credit (normal) balances
        return $credits - $debits;
    }

    /**
     * Reverse a transaction by creating reversing entries
     * 
     * @param string $voucherNumber Voucher number to reverse
     * @param string|null $description Description for reversal entries
     * @return string New voucher number for reversal
     */
    public function reverseTransaction(string $voucherNumber, ?string $description = null): string
    {
        $entries = GeneralLedger::where('voucher_number', $voucherNumber)
            ->with('account')
            ->get();

        if ($entries->isEmpty()) {
            throw new \Exception("Voucher not found: $voucherNumber");
        }

        $reversalEntries = [];
        
        foreach ($entries as $entry) {
            // Reverse entry type (DEBIT becomes CREDIT and vice versa)
            $reversedType = $entry->entry_type === 'DEBIT' ? 'CREDIT' : 'DEBIT';
            
            $reversalEntries[] = [
                'account_code' => $entry->account->account_code,
                'entry_type' => $reversedType,
                'amount' => $entry->amount,
                'description' => $description ?? "Reversal of {$entry->description}"
            ];
        }

        // Post reversal transaction
        return $this->postTransaction(
            $reversalEntries,
            'general_ledger', // or 'journal_vouchers'
            null,
            null,
            now()->format('Y-m-d'),
            $entries->first()->entry_source ?? 'AUTOMATIC'
        );
    }

    /**
     * Get trial balance data for all accounts
     * 
     * @param string|null $asOfDate Optional date to calculate balances as of (Y-m-d format)
     * @return array Trial balance data with debits and credits
     */
    /**
     * Get trial balance data for all accounts.
     *
     * PERFORMANCE REFACTOR (August 2026):
     * The original implementation ran 2 SUM queries per account in a PHP loop
     * (N+1 pattern — 400+ DB round-trips for 200 accounts).
     *
     * This implementation delegates to the v_trial_balance view, which performs
     * a single GROUP BY aggregation in the database engine. The output shape is
     * identical to the original method; no API contracts change.
     *
     * When $asOfDate is provided, the view cannot be used directly (it aggregates
     * all open entries without a date filter). In that case we fall back to a
     * single query with a HAVING-equivalent structure using a GROUP BY on GL.
     *
     * @param string|null $asOfDate Optional date to calculate balances as of (Y-m-d format)
     * @return array Trial balance data with debits, credits, and balance check
     */
    public function getTrialBalanceData(?string $asOfDate = null): array
    {
        $trialBalance = [];
        $totalDebits  = 0;
        $totalCredits = 0;

        if ($asOfDate === null) {
            // ── Fast path: use v_trial_balance view (single SQL aggregation) ───
            $rows = ViewTrialBalance::withActivity()
                ->ordered()
                ->get();

            foreach ($rows as $row) {
                $net = (float) $row->net_balance;

                $type = strtolower($row->account_type);
                if (in_array($type, ['asset', 'expense'])) {
                    $debitBalance  = $net > 0 ? $net : 0;
                    $creditBalance = $net < 0 ? abs($net) : 0;
                } else {
                    $creditBalance = $net > 0 ? $net : 0;
                    $debitBalance  = $net < 0 ? abs($net) : 0;
                }

                $trialBalance[] = [
                    'account_code'  => $row->account_code,
                    'account_name'  => $row->account_name,
                    'account_type'  => $row->account_type,
                    'debit_balance' => $debitBalance,
                    'credit_balance'=> $creditBalance,
                ];

                $totalDebits  += $debitBalance;
                $totalCredits += $creditBalance;
            }
        } else {
            // ── Date-scoped path: single GROUP BY query with CASE WHEN pivot ──
            // Uses idx_gl_account_closed_date: (account_id, is_closed, voucher_date)
            $rows = DB::table('general_ledger as gl')
                ->join('chart_of_accounts as coa', 'coa.id', '=', 'gl.account_id')
                ->where('gl.is_closed', false)
                ->where('gl.voucher_date', '<=', $asOfDate)
                ->where('coa.is_active', true)
                ->selectRaw(
                    'coa.account_code,
                     coa.account_name,
                     coa.account_type,
                     SUM(CASE WHEN gl.entry_type = ? THEN gl.amount ELSE 0 END) AS debit_total,
                     SUM(CASE WHEN gl.entry_type = ? THEN gl.amount ELSE 0 END) AS credit_total',
                    ['DEBIT', 'CREDIT']
                )
                ->groupBy('coa.account_code', 'coa.account_name', 'coa.account_type')
                ->orderBy('coa.account_code')
                ->get();

            foreach ($rows as $row) {
                $debits  = (float) $row->debit_total;
                $credits = (float) $row->credit_total;

                if ($debits == 0 && $credits == 0) {
                    continue; // skip zero-activity accounts
                }

                $type = strtolower($row->account_type);
                if (in_array($type, ['asset', 'expense'])) {
                    $balance       = $debits - $credits;
                    $debitBalance  = $balance > 0 ? $balance : 0;
                    $creditBalance = $balance < 0 ? abs($balance) : 0;
                } else {
                    $balance       = $credits - $debits;
                    $creditBalance = $balance > 0 ? $balance : 0;
                    $debitBalance  = $balance < 0 ? abs($balance) : 0;
                }

                $trialBalance[] = [
                    'account_code'  => $row->account_code,
                    'account_name'  => $row->account_name,
                    'account_type'  => $row->account_type,
                    'debit_balance' => $debitBalance,
                    'credit_balance'=> $creditBalance,
                ];

                $totalDebits  += $debitBalance;
                $totalCredits += $creditBalance;
            }
        }

        return [
            'accounts'    => $trialBalance,
            'total_debits'  => $totalDebits,
            'total_credits' => $totalCredits,
            'is_balanced'   => abs($totalDebits - $totalCredits) < 0.01,
        ];
    }
}

