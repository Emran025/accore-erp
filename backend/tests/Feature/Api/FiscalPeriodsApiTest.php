<?php

namespace Tests\Feature\Api;

use Tests\TestCase;
use App\Domains\Finance\GeneralLedger\Models\FiscalPeriod;
use App\Domains\Finance\GeneralLedger\Models\ChartOfAccount;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Carbon\Carbon;

class FiscalPeriodsApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->authenticateUser();
        $this->seedChartOfAccounts();
    }

    public function test_can_list_fiscal_periods()
    {
        FiscalPeriod::factory()->count(2)->create();

        $response = $this->authGet(route('v2.fiscal_periods.index'));

        $response->assertStatus(200)
            ->assertJson(['success' => true])
            ->assertJsonStructure(['success', 'data']);
    }

    public function test_can_create_fiscal_period()
    {
        $data = [
            'period_name' => 'FY2027',
            'start_date' => '2027-01-01',
            'end_date' => '2027-12-31',
        ];

        $response = $this->authPost(route('v2.fiscal_periods.store'), $data);

        $this->assertSuccessResponse($response);
        $this->assertDatabaseHas('fiscal_periods', [
            'period_name' => 'FY2027',
        ]);
    }

    public function test_create_fiscal_period_validates_required_fields()
    {
        $response = $this->authPost(route('v2.fiscal_periods.store'), []);

        $response->assertStatus(422);
    }

    public function test_can_close_fiscal_period()
    {
        $period = FiscalPeriod::factory()->create([
            'is_closed' => false,
            'is_locked' => false,
        ]);

        $response = $this->authPost(route('v2.fiscal_periods.close', ['id' => $period->id]), [
            'id' => $period->id,
        ]);

        $this->assertSuccessResponse($response);
        $this->assertTrue($period->fresh()->is_closed);
    }

    public function test_can_lock_fiscal_period()
    {
        $period = FiscalPeriod::factory()->create([
            'is_closed' => true,
            'is_locked' => false,
        ]);

        $response = $this->authPost(route('v2.fiscal_periods.lock', ['id' => $period->id]), [
            'id' => $period->id,
        ]);

        $this->assertSuccessResponse($response);
        $this->assertTrue($period->fresh()->is_locked);
    }

    public function test_can_unlock_fiscal_period()
    {
        $period = FiscalPeriod::factory()->create([
            'is_closed' => false,
            'is_locked' => true,
        ]);

        $response = $this->authPost(route('v2.fiscal_periods.unlock', ['id' => $period->id]), [
            'id' => $period->id,
        ]);

        $this->assertSuccessResponse($response);
        $this->assertFalse($period->fresh()->is_locked);
    }

    public function test_overlapping_period_is_rejected(): void
    {
        $response1 = $this->authPost(route('v2.fiscal_periods.store'), [
            'period_name' => 'FY2028',
            'start_date'  => '2028-01-01',
            'end_date'    => '2028-12-31',
        ]);
        $this->assertSuccessResponse($response1);

        // Attempt to create a period that fully overlaps
        $response2 = $this->authPost(route('v2.fiscal_periods.store'), [
            'period_name' => 'FY2028-DUP',
            'start_date'  => '2028-01-01',
            'end_date'    => '2028-12-31',
        ]);

        $response2->assertStatus(409);
    }

    public function test_adjacent_non_overlapping_periods_are_allowed(): void
    {
        $response1 = $this->authPost(route('v2.fiscal_periods.store'), [
            'period_name' => 'FY2029-H1',
            'start_date'  => '2029-01-01',
            'end_date'    => '2029-06-30',
        ]);
        $this->assertSuccessResponse($response1);

        // Immediately adjacent — start one day after the previous end
        $response2 = $this->authPost(route('v2.fiscal_periods.store'), [
            'period_name' => 'FY2029-H2',
            'start_date'  => '2029-07-01',
            'end_date'    => '2029-12-31',
        ]);
        $this->assertSuccessResponse($response2);

        $this->assertDatabaseHas('fiscal_periods', ['period_name' => 'FY2029-H1']);
        $this->assertDatabaseHas('fiscal_periods', ['period_name' => 'FY2029-H2']);
    }

    public function test_start_date_equal_to_or_after_end_date_is_rejected(): void
    {
        $response = $this->authPost(route('v2.fiscal_periods.store'), [
            'period_name' => 'FY2030-INVALID',
            'start_date'  => '2030-06-01',
            'end_date'    => '2030-06-01',  // same day — end must be after start
        ]);

        $response->assertStatus(422);
    }
}
