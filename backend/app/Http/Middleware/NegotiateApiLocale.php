<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

/**
 * Resolves the language of an API representation once per request.
 *
 * Precedence is deliberately explicit: an application selection made by the
 * user is preferred over the browser hint, then the Laravel fallback locale.
 */
class NegotiateApiLocale
{
    /** @var array<string, string> */
    private const SUPPORTED_LOCALES = [
        'ar' => 'ar',
        'ar-sa' => 'ar',
        'en' => 'en',
        'en-us' => 'en',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $locale = $this->resolveLocale($request);
        App::setLocale($locale);
        $request->attributes->set('api_locale', $locale);

        $response = $next($request);
        $response->headers->set('Content-Language', $this->languageTag($locale));
        $response->headers->set('Vary', $this->appendVaryHeader($response->headers->get('Vary'), 'Accept-Language, X-Accore-Locale'));

        if ($response instanceof JsonResponse) {
            $payload = $response->getData(true);
            if (is_array($payload)) {
                $payload['meta'] = array_merge($payload['meta'] ?? [], [
                    'locale' => $locale,
                    'language_tag' => $this->languageTag($locale),
                ]);
                $response->setData($payload);
            }
        }

        return $response;
    }

    private function resolveLocale(Request $request): string
    {
        $explicit = $this->normalise($request->header('X-Accore-Locale'));
        if ($explicit !== null) {
            return $explicit;
        }

        foreach ($request->getLanguages() as $candidate) {
            $locale = $this->normalise($candidate);
            if ($locale !== null) {
                return $locale;
            }
        }

        return $this->normalise((string) config('app.locale')) ?? 'en';
    }

    private function normalise(?string $candidate): ?string
    {
        if ($candidate === null || $candidate === '') {
            return null;
        }

        return self::SUPPORTED_LOCALES[strtolower(str_replace('_', '-', $candidate))] ?? null;
    }

    private function languageTag(string $locale): string
    {
        return $locale === 'ar' ? 'ar-SA' : 'en-US';
    }

    private function appendVaryHeader(?string $existing, string $required): string
    {
        $values = array_filter(array_map('trim', explode(',', (string) $existing)));
        foreach (array_map('trim', explode(',', $required)) as $value) {
            if (!in_array($value, $values, true)) {
                $values[] = $value;
            }
        }

        return implode(', ', $values);
    }
}
