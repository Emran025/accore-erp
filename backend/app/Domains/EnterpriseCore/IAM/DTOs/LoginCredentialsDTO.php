<?php

namespace App\Domains\EnterpriseCore\IAM\DTOs;

use App\Domains\Shared\DTOs\DataTransferObject;
use Illuminate\Http\Request;

/**
 * DTO for Login credentials.
 * Replaces raw $request->input() calls in EnterpriseCore/IAM/AuthController.
 */
class LoginCredentialsDTO extends DataTransferObject
{
    public function __construct(
        public readonly string $username,
        public readonly string $password,
    ) {}

    public static function fromRequest(Request $request): static
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        return new static(
            username: $request->input('username'),
            password: $request->input('password'),
        );
    }

    public static function fromArray(array $data): static
    {
        return new static(
            username: $data['username'],
            password: $data['password'],
        );
    }

    public function toArray(): array
    {
        return [
            'username' => $this->username,
            'password' => $this->password,
        ];
    }
}
