<?php

namespace Tests\Feature\Api;

use App\Domains\EnterpriseCore\OrganizationGovernance\Models\Module;
use App\Domains\EnterpriseCore\OrganizationGovernance\Services\ModuleSelectionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SetupStateApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Module::query()->update(['is_active' => false]);
        Module::query()->whereIn('module_key', ModuleSelectionService::CONFIGURATION_MODULES)->update(['is_active' => true]);
        $this->authenticateUser();
    }

    public function test_fresh_installation_requires_explicit_business_module_selection(): void
    {
        $response = $this->authGet(route('v2.setup.state'));

        $this->assertSuccessResponse($response);
        $response->assertJsonPath('data.setup_required', true)
            ->assertJsonPath('data.selected_module_keys', [])
            ->assertJsonPath('data.active_module_keys', []);
    }

    public function test_selected_module_remains_inactive_until_activation_is_requested(): void
    {
        $selected = $this->authPost(route('v2.setup.modules.select'), [
            'module_keys' => ['reports'],
        ]);

        $this->assertSuccessResponse($selected);
        $selected->assertJsonPath('data.setup_required', true)
            ->assertJsonPath('data.selected_module_keys', ['reports']);
        $this->assertDatabaseHas('modules', ['module_key' => 'reports', 'is_active' => false]);

        $activated = $this->authPost(route('v2.setup.modules.activate_selected'));

        $this->assertSuccessResponse($activated);
        $activated->assertJsonPath('data.activation.activated', ['reports'])
            ->assertJsonPath('data.state.setup_required', false)
            ->assertJsonPath('data.state.active_module_keys', ['reports']);
        $this->assertDatabaseHas('modules', ['module_key' => 'reports', 'is_active' => true]);
    }

    public function test_setup_rejects_empty_business_module_selection(): void
    {
        $response = $this->authPost(route('v2.setup.modules.select'), [
            'module_keys' => [],
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors('module_keys');
    }
}
