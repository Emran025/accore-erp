<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;
use App\Http\Resources\HumanCapital\WorkforceAdmin\DepartmentResource;
use Illuminate\Http\Request;

class ResourceTest extends TestCase
{
    public function test_department_resource_mapping()
    {
        $department = (object)[
            'id' => 1,
            'name' => 'HR',
            'code' => 'HR001',
            'description' => 'Human Resources',
            'is_active' => true,
            'created_at' => now(),
        ];

        $resource = new DepartmentResource($department);
        $request = Request::create('/api/v2/hr/departments', 'GET');
        $data = $resource->toArray($request);

        $this->assertEquals(1, $data['id']);
        $this->assertEquals('HR', $data['name']);
        $this->assertEquals('HR001', $data['code']);
        $this->assertTrue($data['is_active']);
    }
}
