<?php

namespace Tests\Feature\Api;

use App\Domains\EnterpriseCore\OrganizationGovernance\Models\Module;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ModuleOperationalAccessTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config()->set('organization.enforce_module_readiness_in_tests', true);
        Module::query()->where('module_key', 'sales')->update(['is_active' => false]);
    }

    public function test_authorized_user_cannot_access_sales_before_module_selection_and_readiness(): void
    {
        $this->authenticateUser();

        $response = $this->authGet(route('v2.invoices.index'));

        $response->assertStatus(423)
            ->assertJsonPath('success', false)
            ->assertJsonPath('code', 'MODULE_NOT_OPERATIONAL')
            ->assertJsonPath('module', 'sales')
            ->assertJsonPath('lifecycle', 'not_selected');
    }

    public function test_selected_but_pending_sales_module_remains_inaccessible(): void
    {
        $this->authenticateUser();

        $selected = $this->authPost(route('v2.setup.modules.select'), [
            'module_keys' => ['sales'],
        ]);
        $this->assertSuccessResponse($selected);
        $this->assertDatabaseHas('modules', ['module_key' => 'sales', 'is_active' => false]);

        $response = $this->authGet(route('v2.invoices.index'));

        $response->assertStatus(423)
            ->assertJsonPath('success', false)
            ->assertJsonPath('code', 'MODULE_NOT_OPERATIONAL')
            ->assertJsonPath('module', 'sales')
            ->assertJsonPath('lifecycle', 'selected_pending_org_setup');
    }

    public function test_purchases_module_guard_denies_access_when_not_active(): void
    {
        $this->authenticateUser();
        Module::query()->where('module_key', 'purchases')->update(['is_active' => false]);

        $response = $this->authGet(route('v2.purchases.index'));

        $response->assertStatus(423)
            ->assertJsonPath('success', false)
            ->assertJsonPath('code', 'MODULE_NOT_OPERATIONAL')
            ->assertJsonPath('module', 'purchases');
    }
}
