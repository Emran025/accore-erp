<?php

declare(strict_types=1);

namespace Tests\Unit;

use App\Support\Localization\LocalizedValue;
use Illuminate\Support\Facades\App;
use Tests\TestCase;

class LocalizedValueTest extends TestCase
{
    public function test_resolves_the_requested_language_with_fallback(): void
    {
        $record = [
            'name' => 'اسم قديم',
            'name_ar' => 'اسم عربي',
            'name_en' => 'English Name',
        ];

        $this->assertSame('اسم عربي', LocalizedValue::resolve($record, 'name', 'ar-SA'));
        $this->assertSame('English Name', LocalizedValue::resolve($record, 'name', 'en-US'));
        $this->assertSame(['ar' => 'اسم عربي', 'en' => 'English Name'], LocalizedValue::translations($record, 'name'));
    }

    public function test_legacy_input_populates_only_the_arabic_source_without_erasing_english(): void
    {
        $create = LocalizedValue::normaliseInput(['name' => 'اسم جديد'], 'name');
        $this->assertSame('اسم جديد', $create['name_ar']);
        $this->assertArrayNotHasKey('name_en', $create);

        $partial = LocalizedValue::normaliseInput(['name_en' => 'New Name'], 'name');
        $this->assertSame('New Name', $partial['name_en']);
        $this->assertArrayNotHasKey('name_ar', $partial);
    }

    public function test_translation_object_is_normalised_into_explicit_columns(): void
    {
        $normalised = LocalizedValue::normaliseInput([
            'name_translations' => ['ar' => 'اسم', 'en' => 'Name'],
        ], 'name');

        $this->assertSame('اسم', $normalised['name_ar']);
        $this->assertSame('Name', $normalised['name_en']);
        $this->assertSame('اسم', $normalised['name']);
        $this->assertArrayNotHasKey('name_translations', $normalised);
    }
}
