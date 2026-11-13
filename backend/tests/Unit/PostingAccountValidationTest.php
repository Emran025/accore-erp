<?php

namespace Tests\Unit;

use App\Domains\EnterpriseCore\OrganizationGovernance\Services\ModuleReadinessService;
use App\Domains\Finance\GeneralLedger\Models\ChartOfAccount;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Unit tests for ModuleReadinessService::validatePostingAccount().
 *
 * Coverage:
 *   - Non-existent account ID → account_not_found
 *   - Inactive account → account_inactive
 *   - Summary/header account (has children) → account_non_postable
 *   - Type mismatch (asset account queried as revenue) → account_type_mismatch
 *   - Valid leaf account with matching capability → valid
 *   - Unknown/unrecognised capability → valid (no type constraint applied)
 */
class PostingAccountValidationTest extends TestCase
{
    use RefreshDatabase;

    private ModuleReadinessService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(ModuleReadinessService::class);
    }

    public function test_non_existent_account_returns_account_not_found(): void
    {
        $result = $this->service->validatePostingAccount(999999, 'revenue_account');

        $this->assertFalse($result['valid']);
        $this->assertSame('account_not_found', $result['reason_code']);
    }

    public function test_inactive_account_returns_account_inactive(): void
    {
        $account = ChartOfAccount::factory()->create([
            'is_active'    => false,
            'account_type' => 'revenue',
            'parent_id'    => null,
        ]);

        $result = $this->service->validatePostingAccount($account->id, 'revenue_account');

        $this->assertFalse($result['valid']);
        $this->assertSame('account_inactive', $result['reason_code']);
    }

    public function test_summary_account_with_children_returns_account_non_postable(): void
    {
        $parent = ChartOfAccount::factory()->create([
            'is_active'    => true,
            'account_type' => 'revenue',
            'parent_id'    => null,
        ]);
        // Create a child so parent becomes a summary/header account
        ChartOfAccount::factory()->create([
            'is_active'    => true,
            'account_type' => 'revenue',
            'parent_id'    => $parent->id,
        ]);

        $result = $this->service->validatePostingAccount($parent->id, 'revenue_account');

        $this->assertFalse($result['valid']);
        $this->assertSame('account_non_postable', $result['reason_code']);
    }

    public function test_account_type_mismatch_returns_account_type_mismatch(): void
    {
        $account = ChartOfAccount::factory()->create([
            'is_active'    => true,
            'account_type' => 'asset',   // asset account
            'parent_id'    => null,
        ]);

        // Queried as a revenue_account capability — type mismatch
        $result = $this->service->validatePostingAccount($account->id, 'revenue_account');

        $this->assertFalse($result['valid']);
        $this->assertSame('account_type_mismatch', $result['reason_code']);
    }

    public function test_valid_leaf_revenue_account_with_matching_capability_returns_valid(): void
    {
        $account = ChartOfAccount::factory()->create([
            'is_active'    => true,
            'account_type' => 'revenue',
            'parent_id'    => null,
        ]);

        $result = $this->service->validatePostingAccount($account->id, 'revenue_account');

        $this->assertTrue($result['valid']);
        $this->assertNull($result['reason_code']);
    }

    public function test_unknown_capability_does_not_apply_type_constraint_and_returns_valid(): void
    {
        // Any active leaf account with an unknown capability should pass through
        $account = ChartOfAccount::factory()->create([
            'is_active'    => true,
            'account_type' => 'asset',
            'parent_id'    => null,
        ]);

        $result = $this->service->validatePostingAccount($account->id, 'some_unknown_capability');

        $this->assertTrue($result['valid']);
        $this->assertNull($result['reason_code']);
    }

    /**
     * @dataProvider capabilityTypeProvider
     */
    public function test_all_recognised_capability_types_are_matched_correctly(
        string $capability,
        string $accountType,
        bool $expectValid
    ): void {
        $account = ChartOfAccount::factory()->create([
            'is_active'    => true,
            'account_type' => $accountType,
            'parent_id'    => null,
        ]);

        $result = $this->service->validatePostingAccount($account->id, $capability);

        $this->assertSame($expectValid, $result['valid']);
        if ($expectValid) {
            $this->assertNull($result['reason_code']);
        } else {
            $this->assertSame('account_type_mismatch', $result['reason_code']);
        }
    }

    public static function capabilityTypeProvider(): array
    {
        return [
            ['revenue_account',   'revenue',   true],
            ['revenue_account',   'expense',   false],
            ['expense_account',   'expense',   true],
            ['expense_account',   'asset',     false],
            ['asset_account',     'asset',     true],
            ['asset_account',     'liability', false],
            ['liability_account', 'liability', true],
            ['liability_account', 'equity',    false],
            ['equity_account',    'equity',    true],
            ['equity_account',    'revenue',   false],
        ];
    }
}
