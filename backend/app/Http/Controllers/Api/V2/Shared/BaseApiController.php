<?php

namespace App\Http\Controllers\Api\V2\Shared;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

trait BaseApiController
{
    protected function successResponse($data = [], string $message = '', int $statusCode = 200, ?string $messageKey = null): JsonResponse
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

        if ($messageKey !== null) {
            $response['message_key'] = $messageKey;
        }

        return response()->json($response, $statusCode);
    }

    protected function localizedSuccessResponse($data, string $messageKey, array $replacements = [], int $statusCode = 200): JsonResponse
    {
        return $this->successResponse($data, __($messageKey, $replacements), $statusCode, $messageKey);
    }

    protected function errorResponse(string $message, int $statusCode = 400, ?string $messageKey = null): JsonResponse
    {
        $response = [
            'success' => false,
            'message' => $message,
        ];

        if ($messageKey !== null) {
            $response['message_key'] = $messageKey;
        }

        return response()->json($response, $statusCode);
    }

    protected function localizedErrorResponse(string $messageKey, array $replacements = [], int $statusCode = 400): JsonResponse
    {
        return $this->errorResponse(__($messageKey, $replacements), $statusCode, $messageKey);
    }

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
