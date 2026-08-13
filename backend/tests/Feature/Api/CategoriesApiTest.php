<?php

namespace Tests\Feature\Api;

use Tests\TestCase;
use App\Domains\SupplyChain\Inventory\Models\Category;
use Illuminate\Foundation\Testing\RefreshDatabase;

class CategoriesApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->authenticateUser();
    }

    public function test_can_list_categories()
    {
        Category::factory()->count(3)->create();

        $response = $this->authGet(route('v2.inventory.categories.index'));

        $this->assertSuccessResponse($response);
    }

    public function test_can_create_category()
    {
        $data = ['name' => 'Electronics'];

        $response = $this->authPost(route('v2.inventory.categories.store'), $data);

        $this->assertSuccessResponse($response);
        $this->assertDatabaseHas('categories', ['name' => 'Electronics']);
    }

    public function test_create_category_fails_for_duplicate()
    {
        Category::factory()->create(['name' => 'Existing']);

        $response = $this->authPost(route('v2.inventory.categories.store'), ['name' => 'Existing']);

        $response->assertStatus(422);
    }

    public function test_can_update_category()
    {
        $category = Category::factory()->create(['name' => 'Old Name']);

        $data = [
            'id' => $category->id,
            'name' => 'New Name',
        ];

        $response = $this->authPut(route('v2.inventory.categories.update', ['id' => $category->id]), $data);

        $this->assertSuccessResponse($response);
        $this->assertDatabaseHas('categories', [
            'id' => $category->id,
            'name' => 'New Name',
        ]);
    }

    public function test_can_delete_category()
    {
        $category = Category::factory()->create();

        $response = $this->authDelete(route('v2.inventory.categories.destroy', ['id' => $category->id]), ['id' => $category->id]);

        $this->assertSuccessResponse($response);
        $this->assertDatabaseMissing('categories', ['id' => $category->id]);
    }

    public function test_create_validates_required_name()
    {
        $response = $this->authPost(route('v2.inventory.categories.store'), []);

        $response->assertStatus(422);
    }
}
