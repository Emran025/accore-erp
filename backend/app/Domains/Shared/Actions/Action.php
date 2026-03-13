<?php

namespace App\Domains\Shared\Actions;

use Illuminate\Http\JsonResponse;

/**
 * Base Action class for all Single Action Classes (SACs).
 *
 * Every controller method becomes an individual Action class,
 * providing high granularity, testability, and single-responsibility.
 *
 * Actions can be invoked:
 *   1. Directly from route definitions (invokable controller)
 *   2. From legacy controllers during migration (delegation pattern)
 */
abstract class Action
{
    /**
     * Execute the action and return a response.
     */
    abstract public function __invoke(): JsonResponse;

    /**
     * Standard success response (backward-compatible with BaseApiController).
     */
    protected function successResponse(array $data = [], string $message = ''): JsonResponse
    {
        $response = ['success' => true];

        if (!empty($data)) {
            if (is_array($data) && !isset($data[0])) {
                $response = array_merge($response, $data);
            } else {
                $response['data'] = $data;
            }
        }

        if (!empty($message)) {
            $response['message'] = $message;
        }

        return response()->json($response);
    }

    /**
     * Standard error response.
     */
    protected function errorResponse(string $message, int $statusCode = 400): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message,
        ], $statusCode);
    }

    /**
     * Standard paginated response.
     */
    protected function paginatedResponse($data, int $total, int $page, int $perPage): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $data,
            'pagination' => [
                'current_page' => $page,
                'per_page' => $perPage,
                'total_records' => $total,
                'total_pages' => ceil($total / $perPage),
            ],
        ]);
    }
}
