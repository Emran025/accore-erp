<?php

namespace Tests\Feature\Api;

use App\Domains\EnterpriseCore\OrganizationGovernance\Models\Module;
use App\Domains\EnterpriseCore\OrganizationGovernance\Models\Setting;
use App\Domains\EnterpriseCore\OrganizationGovernance\Services\ModuleAvailabilityService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ModuleAvailabilityApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->authenticateUser();
    }

    public function test_selected_but_inactive_module_is_pending_organization_setup(): void
    {
        Setting::create([
            'setting_key' => ModuleAvailabilityService::SETUP_SELECTED_MODULES_KEY,
            'setting_value' => json_encode(['sales']),
        ]);

        $availability = app(ModuleAvailabilityService::class)->availabilityFor('sales');

        $this->assertFalse($availability['is_operational']);
        $this->assertSame('selected_pending_org_setup', $availability['lifecycle']);
        $this->assertSame('complete_organization_setup', $availability['remediation']);
    }

    public function test_unselected_inactive_module_is_not_selected(): void
    {
        $availability = app(ModuleAvailabilityService::class)->availabilityFor('sales');

        $this->assertFalse($availability['is_operational']);
        $this->assertSame('not_selected', $availability['lifecycle']);
        $this->assertSame('select_module', $availability['remediation']);
    }

    public function test_sales_api_is_blocked_when_sales_module_is_not_operational(): void
    {
        Module::query()->where('module_key', 'sales')->update(['is_active' => false]);

        $response = $this->authGet(route('v2.invoices.index'));

        $response->assertStatus(423)
            ->assertJsonPath('success', false)
            ->assertJsonPath('code', 'MODULE_NOT_OPERATIONAL')
            ->assertJsonPath('module', 'sales')
            ->assertJsonPath('lifecycle', 'not_selected');
    }

    public function test_active_module_is_operational_regardless_of_selection_history(): void
    {
        Module::query()->where('module_key', 'sales')->update(['is_active' => true]);

        $availability = app(ModuleAvailabilityService::class)->availabilityFor('sales');

        $this->assertTrue($availability['is_operational']);
        $this->assertSame('active', $availability['lifecycle']);
        $this->assertSame('none', $availability['remediation']);
    }
}
