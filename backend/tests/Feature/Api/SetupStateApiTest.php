<?php

namespace Tests\Feature\Api;

use App\Domains\EnterpriseCore\OrganizationGovernance\Models\Module;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SetupStateApiTest extends TestCase
{
    use RefreshDatabase;

    protected bool $usesFreshModuleSetup = true;

    protected function setUp(): void
    {
        parent::setUp();
        $this->authenticateUser();
    }

    public function test_clean_installation_requires_module_scope_selection(): void
    {
        $response = $this->authGet(route('v2.setup.state'));

        $this->assertSuccessResponse($response);
        $response->assertJsonPath('data.setup_required', true)
            ->assertJsonPath('data.next_action', 'select_modules')
            ->assertJsonPath('data.selected_module_keys', []);
    }

    public function test_module_selection_records_pending_work_without_activating_sales(): void
    {
        $response = $this->authPost(route('v2.setup.modules.select'), [
            'module_keys' => ['sales', 'products'],
        ]);

        $this->assertSuccessResponse($response);
        $response->assertJsonPath('data.setup_required', true)
            ->assertJsonPath('data.next_action', 'complete_organization_setup')
            ->assertJsonPath('data.pending_module_keys', ['sales', 'products']);

        $this->assertDatabaseHas('settings', [
            'setting_key' => 'setup.selected_modules',
            'setting_value' => json_encode(['sales', 'products']),
        ]);
        $this->assertDatabaseHas('modules', [
            'module_key' => 'sales',
            'is_active' => false,
        ]);
    }

    public function test_existing_operational_installation_is_not_forced_into_first_run_setup(): void
    {
        Module::query()->where('module_key', 'sales')->update(['is_active' => true]);

        $response = $this->authGet(route('v2.setup.state'));

        $this->assertSuccessResponse($response);
        $response->assertJsonPath('data.setup_required', false)
            ->assertJsonPath('data.next_action', null);
    }

    public function test_operational_installation_remains_usable_while_a_later_module_is_pending_setup(): void
    {
        Module::query()->where('module_key', 'sales')->update(['is_active' => true]);

        $response = $this->authPost(route('v2.setup.modules.select'), [
            'module_keys' => ['sales', 'products'],
        ]);

        $this->assertSuccessResponse($response);
        $response->assertJsonPath('data.setup_required', false)
            ->assertJsonPath('data.pending_module_setup', true)
            ->assertJsonPath('data.next_action', 'complete_organization_setup')
            ->assertJsonPath('data.pending_module_keys', ['products'])
            ->assertJsonPath('data.active_module_keys', fn (array $keys): bool => in_array('sales', $keys, true));
        $this->assertDatabaseHas('modules', ['module_key' => 'sales', 'is_active' => true]);
        $this->assertDatabaseHas('modules', ['module_key' => 'products', 'is_active' => false]);
    }

    public function test_activation_keeps_sales_pending_when_operating_context_is_missing(): void
    {
        $this->authPost(route('v2.setup.modules.select'), [
            'module_keys' => ['sales'],
        ])->assertSuccessful();

        $response = $this->authPost(route('v2.setup.modules.activate_ready'));

        $this->assertSuccessResponse($response);
        $response->assertJsonPath('data.activation.activated', [])
            ->assertJsonPath('data.state.setup_required', true)
            ->assertJsonPath('data.state.pending_module_keys', ['sales']);
        $this->assertDatabaseHas('modules', ['module_key' => 'sales', 'is_active' => false]);
    }

    public function test_activation_keeps_sales_pending_when_only_a_personal_context_is_ready(): void
    {
        $this->createReadyOperatingContext($this->authenticatedUser);
        $this->authPost(route('v2.setup.modules.select'), [
            'module_keys' => ['sales'],
        ])->assertSuccessful();

        $response = $this->authPost(route('v2.setup.modules.activate_ready'));

        $this->assertSuccessResponse($response);
        $response->assertJsonPath('data.activation.activated', [])
            ->assertJsonPath('data.state.pending_module_keys', ['sales']);
        $this->assertDatabaseHas('modules', ['module_key' => 'sales', 'is_active' => false]);
    }

    public function test_activation_enables_selected_sales_after_global_store_context_is_ready(): void
    {
        $this->createReadyOperatingContext($this->authenticatedUser)
            ->update(['user_id' => null]);
        $this->authPost(route('v2.setup.modules.select'), [
            'module_keys' => ['sales'],
        ])->assertSuccessful();

        $response = $this->authPost(route('v2.setup.modules.activate_ready'));

        $this->assertSuccessResponse($response);
        $response->assertJsonPath('data.activation.activated', ['sales'])
            ->assertJsonPath('data.state.setup_required', false)
            ->assertJsonPath('data.state.pending_module_keys', []);
        $this->assertDatabaseHas('modules', ['module_key' => 'sales', 'is_active' => true]);
    }
}
