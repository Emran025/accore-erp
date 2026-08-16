<?php

namespace Tests\Feature\Api;

use App\Domains\Commercial\SalesLifecycle\Services\SalesExecutionContextResolver;
use App\Domains\EnterpriseCore\IdentityAccess\Models\User;
use App\Exceptions\BusinessLogicException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SalesExecutionContextResolverTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->authenticateUser();
    }

    public function test_it_rejects_sales_when_the_user_has_no_ready_operating_context(): void
    {
        $this->expectException(BusinessLogicException::class);
        $this->expectExceptionCode(422);

        app(SalesExecutionContextResolver::class)->resolve([], $this->authenticatedUser->id);
    }

    public function test_it_injects_trusted_store_identifiers_from_the_approved_context(): void
    {
        $context = $this->createReadyOperatingContext($this->authenticatedUser);

        $resolved = app(SalesExecutionContextResolver::class)->resolve([
            'operating_context_id' => $context->id,
        ], $this->authenticatedUser->id);

        $this->assertSame($context->id, $resolved['operating_context_id']);
        $this->assertSame($context->warehouse_id, $resolved['warehouse_id']);
        $this->assertSame($context->pos_terminal_id, $resolved['pos_terminal_id']);
        $this->assertSame($context->cost_center_id, $resolved['cost_center_id']);
        $this->assertSame($context->profit_center_id, $resolved['profit_center_id']);
    }

    public function test_it_rejects_a_client_supplied_identifier_that_does_not_match_context(): void
    {
        $context = $this->createReadyOperatingContext($this->authenticatedUser);
        $otherContext = $this->createReadyOperatingContext($this->authenticatedUser);

        $this->expectException(BusinessLogicException::class);
        $this->expectExceptionCode(422);

        app(SalesExecutionContextResolver::class)->resolve([
            'operating_context_id' => $context->id,
            'warehouse_id' => $otherContext->warehouse_id,
        ], $this->authenticatedUser->id);
    }

    public function test_it_rejects_a_context_owned_by_a_different_user(): void
    {
        $otherUser = User::factory()->create();
        $otherContext = $this->createReadyOperatingContext($otherUser);

        $this->expectException(BusinessLogicException::class);
        $this->expectExceptionCode(422);

        app(SalesExecutionContextResolver::class)->resolve([
            'operating_context_id' => $otherContext->id,
        ], $this->authenticatedUser->id);
    }

    public function test_global_context_is_available_to_a_second_authorized_store_user(): void
    {
        $setupAdministrator = User::factory()->create();
        $globalContext = $this->createReadyOperatingContext($setupAdministrator);
        $globalContext->update(['user_id' => null, 'is_default' => true]);
        $cashier = User::factory()->create();

        $resolved = app(SalesExecutionContextResolver::class)->resolve([], $cashier->id);

        $this->assertSame($globalContext->id, $resolved['operating_context_id']);
        $this->assertSame($globalContext->warehouse_id, $resolved['warehouse_id']);
    }

    public function test_user_specific_context_wins_over_a_global_default_for_a_multi_store_user(): void
    {
        $userContext = $this->createReadyOperatingContext($this->authenticatedUser);
        $globalContext = $this->createReadyOperatingContext(User::factory()->create());
        $globalContext->update(['user_id' => null, 'is_default' => true]);

        $resolved = app(SalesExecutionContextResolver::class)->resolve([], $this->authenticatedUser->id);

        $this->assertSame($userContext->id, $resolved['operating_context_id']);
        $this->assertNotSame($globalContext->warehouse_id, $resolved['warehouse_id']);
    }

    public function test_explicit_non_default_context_is_rejected_before_sales_side_effects(): void
    {
        $context = $this->createReadyOperatingContext($this->authenticatedUser);
        $context->update(['is_default' => false]);

        $this->expectException(BusinessLogicException::class);
        $this->expectExceptionCode(422);

        app(SalesExecutionContextResolver::class)->resolve([
            'operating_context_id' => $context->id,
        ], $this->authenticatedUser->id);
    }

    public function test_context_with_unknown_organizational_node_is_rejected(): void
    {
        $context = $this->createReadyOperatingContext($this->authenticatedUser);
        $unknownNodeUuid = '00000000-0000-0000-0000-000000000000';
        $context->warehouse->update(['org_node_uuid' => $unknownNodeUuid]);
        $context->posTerminal->update(['org_node_uuid' => $unknownNodeUuid]);
        $context->update(['org_node_uuid' => $unknownNodeUuid]);

        $this->expectException(BusinessLogicException::class);
        $this->expectExceptionCode(422);

        app(SalesExecutionContextResolver::class)->resolve([
            'operating_context_id' => $context->id,
        ], $this->authenticatedUser->id);
    }
}
