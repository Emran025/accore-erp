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
}
