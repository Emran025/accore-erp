<?php

namespace Tests\Feature\Api;

use App\Domains\Finance\GeneralLedger\Models\ChartOfAccount;
use App\Domains\Finance\GeneralLedger\Models\GeneralLedger;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ChartOfAccountsApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->authenticateUser();
        $this->seedChartOfAccounts();
    }

    public function test_can_list_accounts()
    {
        $response = $this->authGet(route('v2.coa.index'));

        $response->assertStatus(200)
            ->assertJson(['success' => true])
            ->assertJsonStructure(['success', 'data']);
    }

    public function test_can_search_accounts()
    {
        $response = $this->authGet(route('v2.coa.index').'?search=Cash');

        $response->assertStatus(200)
            ->assertJson(['success' => true]);
    }

    public function test_can_create_account()
    {
        $data = [
            'code' => '6100',
            'name' => 'Marketing Expense',
            'type' => 'expense',
        ];

        $response = $this->authPost(route('v2.coa.store'), $data);

        $this->assertSuccessResponse($response);
        $this->assertDatabaseHas('chart_of_accounts', [
            'account_code' => '6100',
            'account_name' => 'Marketing Expense',
        ]);
    }

    public function test_create_account_rejects_duplicate_code()
    {
        $data = [
            'code' => '1110', // Cash already seeded
            'name' => 'Duplicate',
            'type' => 'asset',
        ];

        $response = $this->authPost(route('v2.coa.store'), $data);

        $response->assertStatus(422);
    }

    public function test_standard_chart_endpoint_restores_missing_accounts_without_overwriting_existing_accounts(): void
    {
        $cashAccount = ChartOfAccount::where('account_code', '1110')->firstOrFail();
        $cashAccount->update(['account_name' => 'Customized cash account']);
        ChartOfAccount::where('account_code', '5300')->delete();

        $response = $this->authPost(route('v2.coa.standard'));

        $this->assertSuccessResponse($response);
        $response->assertJsonPath('data.account_count', 34);
        $this->assertDatabaseHas('chart_of_accounts', [
            'account_code' => '1110',
            'account_name' => 'Customized cash account',
        ]);
        $this->assertDatabaseHas('chart_of_accounts', [
            'account_code' => '5300',
            'account_name' => 'مصروف الإهلاك',
            'account_type' => 'Expense',
        ]);

        $countAfterFirstEnsure = ChartOfAccount::count();
        $this->authPost(route('v2.coa.standard'))->assertJsonPath('data.account_count', 34);
        $this->assertSame($countAfterFirstEnsure, ChartOfAccount::count());
    }

    public function test_can_update_account()
    {
        $account = ChartOfAccount::where('account_code', '1110')->firstOrFail();

        $data = [
            'name' => 'Cash and Cash Equivalents',
            'type' => 'asset',
        ];

        $response = $this->authPut(route('v2.coa.update', ['id' => $account->id]), $data);

        $this->assertSuccessResponse($response);
        $this->assertDatabaseHas('chart_of_accounts', [
            'id' => $account->id,
            'account_name' => 'Cash and Cash Equivalents',
        ]);
    }

    public function test_delete_account_without_transactions()
    {
        $account = ChartOfAccount::factory()->asset()->create([
            'account_code' => '1999',
            'account_name' => 'Temporary',
        ]);

        $response = $this->authDelete(route('v2.coa.destroy', ['id' => $account->id]));

        $this->assertSuccessResponse($response);
        $this->assertDatabaseMissing('chart_of_accounts', ['id' => $account->id]);
    }

    public function test_delete_account_with_transactions_deactivates()
    {
        $account = ChartOfAccount::where('account_code', '1110')->firstOrFail();

        // Create GL entry referencing this account
        GeneralLedger::factory()->create([
            'account_id' => $account->id,
        ]);

        $response = $this->authDelete(route('v2.coa.destroy', ['id' => $account->id]));

        $this->assertSuccessResponse($response);
        // Account should be deactivated, not deleted
        $this->assertDatabaseHas('chart_of_accounts', [
            'id' => $account->id,
            'is_active' => false,
        ]);
    }

    public function test_can_get_account_balances()
    {
        $response = $this->authGet(route('v2.coa.balances'));

        $response->assertStatus(200)
            ->assertJson(['success' => true])
            ->assertJsonStructure(['success', 'data' => ['accounts', 'totals']]);
    }

    public function test_can_filter_balances_by_type()
    {
        $response = $this->authGet(route('v2.coa.balances').'?account_type=Asset');

        $response->assertStatus(200)
            ->assertJson(['success' => true]);
    }
}
