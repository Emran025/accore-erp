<?php

declare(strict_types=1);

namespace App\Support\Localization;

use Illuminate\Support\Facades\App;

final class LocalizedValue
{
    /** @return array<string, string|null> */
    public static function translations(mixed $record, string $attribute): array
    {
        $translations = [
            'ar' => self::read($record, "{$attribute}_ar"),
            'en' => self::read($record, "{$attribute}_en"),
        ];

        $json = self::read($record, "{$attribute}_translations");
        if (is_array($json)) {
            foreach (['ar', 'en'] as $locale) {
                if (isset($json[$locale]) && is_string($json[$locale]) && trim($json[$locale]) !== '') {
                    $translations[$locale] = $json[$locale];
                }
            }
        }

        $legacy = self::read($record, $attribute);
        if (is_string($legacy) && trim($legacy) !== '') {
            $translations['ar'] ??= $legacy;
        }

        return $translations;
    }

    public static function resolve(mixed $record, string $attribute, ?string $locale = null): ?string
    {
        $locale = self::normaliseLocale($locale ?? App::currentLocale());
        $translations = self::translations($record, $attribute);
        $ordered = $locale === 'ar' ? ['ar', 'en'] : ['en', 'ar'];

        foreach ($ordered as $candidate) {
            if (is_string($translations[$candidate] ?? null) && trim($translations[$candidate]) !== '') {
                return $translations[$candidate];
            }
        }

        return self::read($record, $attribute);
    }

    /** @return array<string, mixed> */
    public static function normaliseInput(array $data, string $attribute): array
    {
        $keys = [$attribute, "{$attribute}_ar", "{$attribute}_en", "{$attribute}_translations"];
        $hasInput = count(array_intersect(array_keys($data), $keys)) > 0;
        if (!$hasInput) {
            return $data;
        }

        $translations = $data["{$attribute}_translations"] ?? [];
        $translations = is_array($translations) ? $translations : [];
        $legacyProvided = array_key_exists($attribute, $data);
        $legacy = $data[$attribute] ?? null;
        $arabicProvided = array_key_exists("{$attribute}_ar", $data) || array_key_exists('ar', $translations);
        $englishProvided = array_key_exists("{$attribute}_en", $data) || array_key_exists('en', $translations);

        if ($legacyProvided && !$arabicProvided && $legacy !== null && $legacy !== '') {
            $data["{$attribute}_ar"] = $legacy;
        }
        if ($arabicProvided) {
            $data["{$attribute}_ar"] = $data["{$attribute}_ar"] ?? $translations['ar'] ?? null;
        }
        if ($englishProvided) {
            $data["{$attribute}_en"] = $data["{$attribute}_en"] ?? $translations['en'] ?? null;
        }
        unset($data["{$attribute}_translations"]);

        if (!$legacyProvided) {
            $data[$attribute] = $data[$attribute . '_ar'] ?? $data[$attribute . '_en'] ?? null;
        }

        return $data;
    }

    private static function read(mixed $record, string $key): mixed
    {
        if (is_array($record)) return $record[$key] ?? null;
        if (is_object($record)) {
            if (method_exists($record, 'getAttribute')) return $record->getAttribute($key);
            return $record->{$key} ?? null;
        }
        return null;
    }

    private static function normaliseLocale(string $locale): string
    {
        return str_starts_with(strtolower(str_replace('_', '-', $locale)), 'ar') ? 'ar' : 'en';
    }
}
