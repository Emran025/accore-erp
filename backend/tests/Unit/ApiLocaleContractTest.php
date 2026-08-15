<?php

namespace Tests\Unit;

use App\Http\Controllers\Api\V2\Shared\BaseApiController;
use App\Http\Middleware\NegotiateApiLocale;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Tests\TestCase;

class ApiLocaleContractTest extends TestCase
{
    public function test_explicit_application_locale_overrides_accept_language_and_is_reported(): void
    {
        $request = Request::create('/api/locale-probe', 'GET', server: [
            'HTTP_ACCEPT_LANGUAGE' => 'ar-SA,ar;q=0.9',
            'HTTP_X_ACCORE_LOCALE' => 'en-US',
        ]);

        $response = app(NegotiateApiLocale::class)->handle($request, fn () => response()->json(['success' => true]));

        $this->assertSame('en', App::currentLocale());
        $this->assertSame('en-US', $response->headers->get('Content-Language'));
        $this->assertStringContainsString('Accept-Language', (string) $response->headers->get('Vary'));
        $this->assertStringContainsString('X-Accore-Locale', (string) $response->headers->get('Vary'));
        $this->assertSame('en', $response->getData(true)['meta']['locale']);
        $this->assertSame('en-US', $response->getData(true)['meta']['language_tag']);
    }

    public function test_accept_language_selects_arabic_when_no_explicit_application_locale_exists(): void
    {
        $request = Request::create('/api/locale-probe', 'GET', server: [
            'HTTP_ACCEPT_LANGUAGE' => 'ar-SA,ar;q=0.9,en;q=0.8',
        ]);

        $response = app(NegotiateApiLocale::class)->handle($request, fn () => response()->json(['success' => true]));

        $this->assertSame('ar', App::currentLocale());
        $this->assertSame('ar-SA', $response->headers->get('Content-Language'));
        $this->assertSame('ar', $response->getData(true)['meta']['locale']);
    }

    public function test_shared_response_trait_returns_localized_message_and_semantic_key(): void
    {
        $controller = new class {
            use BaseApiController;

            public function created(string $resource): \Illuminate\Http\JsonResponse
            {
                return $this->localizedSuccessResponse([], 'api.success.resource_created', ['resource' => $resource], 201);
            }

            public function forbidden(): \Illuminate\Http\JsonResponse
            {
                return $this->localizedErrorResponse('api.error.forbidden', [], 403);
            }
        };

        App::setLocale('en');
        $english = $controller->created('quotation')->getData(true);
        $this->assertSame('quotation created successfully.', $english['message']);
        $this->assertSame('api.success.resource_created', $english['message_key']);

        App::setLocale('ar');
        $arabic = $controller->forbidden()->getData(true);
        $this->assertSame('ليس لديك صلاحية تنفيذ هذا الإجراء.', $arabic['message']);
        $this->assertSame('api.error.forbidden', $arabic['message_key']);
    }
}
