<?php

namespace Database\Factories;

use App\Domains\EnterpriseCore\IdentityAccess\Models\LoginAttempt;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<LoginAttempt>
 */
class LoginAttemptFactory extends Factory
{
    protected $model = LoginAttempt::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'username' => fake()->userName(),
            'attempts' => 1,
            'last_attempt' => now(),
            'locked_until' => null,
        ];
    }
}
