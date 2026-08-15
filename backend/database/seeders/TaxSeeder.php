<?php

namespace Database\Seeders;

use App\Domains\Finance\TaxCompliance\Models\TaxAuthority;
use App\Domains\Finance\TaxCompliance\Models\TaxType;
use App\Domains\Finance\TaxCompliance\Models\TaxRate;
use Illuminate\Database\Seeder;

/**
 * Seeds tax authorities, types, and rates for ZATCA (Saudi) and optional UAE.
 * Part of EPIC #1: Tax Engine Transformation.
 */
class TaxSeeder extends Seeder
{
    public function run(): void
    {
        // ZATCA - Saudi Arabia
        $zatca = TaxAuthority::updateOrCreate(
            ['code' => 'ZATCA'],
            [
                'name' => 'هيئة الزكاة والضريبة والجمارك - السعودية',
                'name_ar' => 'هيئة الزكاة والضريبة والجمارك - السعودية',
                'name_en' => 'ZATCA - Saudi Tax Authority',
                'country_code' => 'SA',
                'adapter_class' => \App\Domains\Finance\Taxation\Services\ZATCATaxAuthority::class,
                'config' => null,
                'is_active' => true,
                'is_primary' => true,
            ]
        );

        $vat = TaxType::updateOrCreate(
            ['tax_authority_id' => $zatca->id, 'code' => 'VAT'],
            [
                'name' => 'ضريبة القيمة المضافة',
                'name_ar' => 'ضريبة القيمة المضافة',
                'name_en' => 'Value Added Tax',
                'gl_account_code' => null, // From ChartOfAccountsMappingService
                'is_active' => true,
            ]
        );

        TaxRate::updateOrCreate(
            [
                'tax_type_id' => $vat->id,
                'effective_from' => '2020-07-01',
            ],
            [
                'rate' => 0.15,
                'effective_to' => null,
                'description' => 'ضريبة القيمة المضافة الأساسية بنسبة 15٪',
                    'description_ar' => 'ضريبة القيمة المضافة الأساسية بنسبة 15٪',
                    'description_en' => 'Standard VAT at 15%.',
                'is_default' => true,
            ]
        );

        // Zero-rated for future use
        TaxType::updateOrCreate(
            ['tax_authority_id' => $zatca->id, 'code' => 'ZERO'],
            [
                'name' => 'ضريبة بنسبة صفر',
                    'name_ar' => 'ضريبة بنسبة صفر',
                    'name_en' => 'Zero Rated',
                'gl_account_code' => null,
                'is_active' => true,
            ]
        );
    }
}
