<?php

namespace Tests\Feature\Api;

use App\Domains\EnterpriseCore\IdentityAccess\Models\Role;
use App\Domains\EnterpriseCore\IdentityAccess\Models\User;
use App\Domains\EnterpriseCore\OrganizationGovernance\Models\Module;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ModuleOperationalAccessTest extends TestCase
{
    use RefreshDatabase;

    protected bool $usesFreshModuleSetup = true;

    public function test_authorized_user_is_locked_out_of_sales_until_the_module_is_operational(): void
    {
        $this->authenticateUser();

        $response = $this->authGet(route('v2.invoices.index'));

        $response->assertStatus(423)
            ->assertJsonPath('code', 'MODULE_NOT_OPERATIONAL')
            ->assertJsonPath('module', 'sales');
    }

    public function test_accountant_role_cannot_access_sales_even_after_the_module_is_operational(): void
    {
        Module::query()->where('module_key', 'sales')->update(['is_active' => true]);
        $accountant = User::factory()->create([
            'role_id' => Role::query()->where('role_key', 'accountant')->value('id'),
            'is_active' => true,
        ]);
        $this->authenticateUser($accountant);

        $response = $this->authGet(route('v2.invoices.index'));

        $response->assertStatus(403)
            ->assertJsonPath('success', false);
    }
}
