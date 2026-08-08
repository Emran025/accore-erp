<?php

namespace Tests\Feature\Api;

use App\Domains\EnterpriseCore\SystemOverview\Models\NrGroup;
use App\Domains\EnterpriseCore\SystemOverview\Models\NrInterval;
use App\Domains\EnterpriseCore\SystemOverview\Models\NrObject;
use App\Domains\EnterpriseCore\SystemOverview\Models\NrGroupIntervalAssignment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class NumberRangeApiTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    /**
     * Test getting next number generates properly formatted number based on object, group and interval
     */
    public function test_can_generate_next_number()
    {
        // 1. Setup Data
        $object = NrObject::factory()->create([
            'object_type' => 'employees',
            'prefix' => 'EMP-',
            'number_length' => 4
        ]);

        $group = NrGroup::factory()->create([
            'nr_object_id' => $object->id
        ]);

        $interval = NrInterval::factory()->create([
            'nr_object_id' => $object->id,
            'from_number' => 1,
            'to_number' => 9999,
            'current_number' => 0
        ]);

        NrGroupIntervalAssignment::factory()->create([
            'nr_object_id' => $object->id,
            'nr_group_id' => $group->id,
            'nr_interval_id' => $interval->id,
            'is_active' => true
        ]);

        // 2. Perform Request
        $this->authenticateUser();
        
        $response = $this->authPost("/api/number-ranges/next-number", [
            'object_id' => $object->id,
            'group_id' => $group->id
        ]);

        // 3. Assert
        $this->assertStatusResolved($response, 200);
        $response->assertJsonPath('number', 'EMP-0001');

        // Ensure database is updated
        $this->assertDatabaseHas('nr_intervals', [
            'id' => $interval->id,
            'current_number' => 1
        ]);
        
        // Generate another number
        $response2 = $this->authPost("/api/number-ranges/next-number", [
            'object_id' => $object->id,
            'group_id' => $group->id
        ]);

        $response2->assertStatus(200);
        $response2->assertJsonPath('number', 'EMP-0002');
    }

    public function test_fails_if_no_active_assignment_found()
    {
        $object = NrObject::factory()->create(['object_type' => 'ap_suppliers']);
        $group = NrGroup::factory()->create(['nr_object_id' => $object->id]);

        $this->authenticateUser();
        
        $response = $this->authPost("/api/number-ranges/next-number", [
            'object_id' => $object->id,
            'group_id' => $group->id
        ]);

        $this->assertStatusResolved($response, 400);
    }
    
    public function test_can_retrieve_object_by_type()
    {
        $object = NrObject::factory()->create([
            'object_type' => 'ar_customers'
        ]);
        
        $group = NrGroup::factory()->create([
            'nr_object_id' => $object->id
        ]);

        $this->authenticateUser();
        $response = $this->authGet("/api/number-ranges/type/ar_customers");

        $this->assertStatusResolved($response, 200);
        $response->assertJsonPath('object_type', 'ar_customers');
        $this->assertCount(1, $response->json('groups'));
    }
}
