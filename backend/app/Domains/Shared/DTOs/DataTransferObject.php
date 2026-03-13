<?php

namespace App\Domains\Shared\DTOs;

use Illuminate\Http\Request;

/**
 * Base Data Transfer Object.
 *
 * DTOs replace raw arrays and Request leaking between layers.
 * Each domain feature creates specific DTOs that extend this class.
 *
 * Usage: $dto = MyDTO::fromRequest($request);
 */
abstract class DataTransferObject
{
    /**
     * Create a DTO from an HTTP Request.
     */
    abstract public static function fromRequest(Request $request): static;

    /**
     * Create a DTO from a plain array.
     */
    abstract public static function fromArray(array $data): static;

    /**
     * Serialize the DTO back to an array, for passing to services/models.
     */
    abstract public function toArray(): array;
}
