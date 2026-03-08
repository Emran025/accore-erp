<?php

namespace Tests\Unit\Services;

use App\Models\NrGroup;
use App\Models\NrInterval;
use App\Models\NrObject;
use App\Models\NrGroupIntervalAssignment;
use App\Services\NumberRangeService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NumberRangeServiceTest extends TestCase
{
    use RefreshDatabase;

    protected NumberRangeService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new NumberRangeService();
    }

    public function test_has_overlap_detects_overlaps()
    {
        $object = NrObject::factory()->create();
        
        NrInterval::factory()->create([
            'nr_object_id' => $object->id,
            'from_number' => 100,
            'to_number' => 200
        ]);

        // Exact match
        $this->assertTrue($this->service->hasOverlap($object->id, 100, 200));
        
        // Inside
        $this->assertTrue($this->service->hasOverlap($object->id, 120, 150));
        
        // Covering
        $this->assertTrue($this->service->hasOverlap($object->id, 50, 250));
        
        // Overlap left
        $this->assertTrue($this->service->hasOverlap($object->id, 80, 150));
        
        // Overlap right
        $this->assertTrue($this->service->hasOverlap($object->id, 150, 250));
        
        // Outside - before
        $this->assertFalse($this->service->hasOverlap($object->id, 10, 90));
        
        // Outside - after
        $this->assertFalse($this->service->hasOverlap($object->id, 210, 300));
    }

    public function test_validate_range_checks_boundaries()
    {
        $object = NrObject::factory()->create(['number_length' => 3]); // Max 999
        
        // Valid
        $this->assertNull($this->service->validateRange($object, 1, 999));
        
        // Invalid: start > end
        $this->assertNotNull($this->service->validateRange($object, 500, 100));
        
        // Invalid: out of bounds (too large for number_length=3)
        $this->assertNotNull($this->service->validateRange($object, 1, 1000));
    }

    public function test_get_next_number_formats_correctly()
    {
        $object = NrObject::factory()->create([
            'prefix' => 'T-',
            'number_length' => 5
        ]);

        $group = NrGroup::factory()->create(['nr_object_id' => $object->id]);
        $interval = NrInterval::factory()->create([
            'nr_object_id' => $object->id,
            'from_number' => 10,
            'to_number' => 100,
            'current_number' => 0
        ]);

        NrGroupIntervalAssignment::factory()->create([
            'nr_object_id' => $object->id,
            'nr_group_id' => $group->id,
            'nr_interval_id' => $interval->id
        ]);

        $number1 = $this->service->getNextNumber($object->id, $group->id);
        $this->assertEquals('T-00010', $number1);

        $number2 = $this->service->getNextNumber($object->id, $group->id);
        $this->assertEquals('T-00011', $number2);
    }

    public function test_throws_exception_on_exhausted_range()
    {
        $object = NrObject::factory()->create();
        $group = NrGroup::factory()->create(['nr_object_id' => $object->id]);
        $interval = NrInterval::factory()->create([
            'nr_object_id' => $object->id,
            'from_number' => 1,
            'to_number' => 1,
            'current_number' => 1 // Already used
        ]);

        NrGroupIntervalAssignment::factory()->create([
            'nr_object_id' => $object->id,
            'nr_group_id' => $group->id,
            'nr_interval_id' => $interval->id
        ]);

        $this->expectException(\Exception::class);
        $this->service->getNextNumber($object->id, $group->id);
    }
}
