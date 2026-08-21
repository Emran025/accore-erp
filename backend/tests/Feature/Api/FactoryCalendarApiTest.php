<?php

namespace Tests\Feature\Api;

use App\Domains\EnterpriseCore\OrganizationGovernance\Models\FactoryCalendar;
use App\Domains\EnterpriseCore\OrganizationGovernance\Models\OrgMetaType;
use App\Domains\EnterpriseCore\OrganizationGovernance\Models\OrgMetaTypeAttribute;
use App\Domains\EnterpriseCore\OrganizationGovernance\Services\OrgStructureService;
use App\Domains\Finance\ForeignExchange\Models\Currency;
use App\Domains\Finance\GeneralLedger\Models\ChartOfAccount;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class FactoryCalendarApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->authenticateUser();
    }

    public function test_factory_calendar_lookup_exposes_active_reference_records_only(): void
    {
        FactoryCalendar::create([
            'code' => 'SA-RUH-2026',
            'name' => 'Riyadh Operations Calendar 2026',
            'name_ar' => 'تقويم عمليات الرياض 2026',
            'country_code' => 'SA',
            'time_zone' => 'Asia/Riyadh',
            'is_active' => true,
        ]);
        FactoryCalendar::create([
            'code' => 'SA-ARCHIVED',
            'name' => 'Archived Calendar',
            'country_code' => 'SA',
            'time_zone' => 'Asia/Riyadh',
            'is_active' => false,
        ]);

        $response = $this->authGet(route('v2.org.factory_calendars'));

        $this->assertSuccessResponse($response);
        $response->assertJsonFragment(['code' => 'SA-RUH-2026'])
            ->assertJsonMissing(['code' => 'SA-ARCHIVED']);
    }

    public function test_plant_requires_an_active_calendar_for_the_same_country(): void
    {
        OrgMetaType::create([
            'id' => 'PLANT',
            'display_name' => 'Plant',
            'display_name_ar' => 'المنشأة',
            'level_domain' => 'Logistics',
            'is_assignable' => true,
        ]);
        foreach (['factory_calendar_id', 'country_code'] as $index => $attributeKey) {
            OrgMetaTypeAttribute::create([
                'org_meta_type_id' => 'PLANT',
                'attribute_key' => $attributeKey,
                'attribute_type' => 'string',
                'is_mandatory' => true,
                'sort_order' => $index + 1,
            ]);
        }

        $activeSaudiCalendar = FactoryCalendar::create([
            'code' => 'SA-RUH-2026',
            'name' => 'Riyadh Operations Calendar 2026',
            'country_code' => 'SA',
            'time_zone' => 'Asia/Riyadh',
            'is_active' => true,
        ]);
        $inactiveSaudiCalendar = FactoryCalendar::create([
            'code' => 'SA-OLD',
            'name' => 'Archived Saudi Calendar',
            'country_code' => 'SA',
            'time_zone' => 'Asia/Riyadh',
            'is_active' => false,
        ]);

        $service = app(OrgStructureService::class);
        $service->validateNodeAttributes('PLANT', [
            'factory_calendar_id' => (string) $activeSaudiCalendar->id,
            'country_code' => 'SA',
        ]);
        $this->addToAssertionCount(1);

        $this->assertCalendarValidationFails($service, (string) $inactiveSaudiCalendar->id, 'SA');
        $this->assertCalendarValidationFails($service, (string) $activeSaudiCalendar->id, 'AE');
        $this->assertCalendarValidationFails($service, '999999', 'SA');
    }

    public function test_company_code_requires_active_currency_and_chart_of_accounts_references(): void
    {
        OrgMetaType::create([
            'id' => 'COMP_CODE',
            'display_name' => 'Company Code',
            'display_name_ar' => 'رمز الشركة',
            'level_domain' => 'Financial',
            'is_assignable' => true,
        ]);
        foreach (['currency_id', 'chart_of_accounts_id'] as $index => $attributeKey) {
            OrgMetaTypeAttribute::create([
                'org_meta_type_id' => 'COMP_CODE',
                'attribute_key' => $attributeKey,
                'attribute_type' => 'reference',
                'is_mandatory' => true,
                'sort_order' => $index + 1,
            ]);
        }

        $activeCurrency = Currency::create([
            'code' => 'SAR',
            'name' => 'Saudi Riyal',
            'symbol' => 'SAR',
            'is_active' => true,
        ]);
        $inactiveCurrency = Currency::create([
            'code' => 'OLD',
            'name' => 'Archived Currency',
            'symbol' => 'OLD',
            'is_active' => false,
        ]);
        $activeAccount = ChartOfAccount::create([
            'account_code' => '1000',
            'account_name' => 'Assets',
            'account_type' => 'asset',
            'is_active' => true,
        ]);
        $inactiveAccount = ChartOfAccount::create([
            'account_code' => '9999',
            'account_name' => 'Archived Account',
            'account_type' => 'asset',
            'is_active' => false,
        ]);

        $service = app(OrgStructureService::class);
        $service->validateNodeAttributes('COMP_CODE', [
            'currency_id' => (string) $activeCurrency->id,
            'chart_of_accounts_id' => (string) $activeAccount->id,
        ]);
        $this->addToAssertionCount(1);

        $this->assertAccountingReferenceValidationFails($service, (string) $inactiveCurrency->id, (string) $activeAccount->id);
        $this->assertAccountingReferenceValidationFails($service, (string) $activeCurrency->id, (string) $inactiveAccount->id);
        $this->assertAccountingReferenceValidationFails($service, '999999', '999999');
    }

    public function test_company_code_can_assign_only_a_complete_primary_general_ledger_and_k4_structure(): void
    {
        OrgMetaType::create([
            'id' => 'COMP_CODE',
            'display_name' => 'Company Code',
            'display_name_ar' => 'رمز الشركة',
            'level_domain' => 'Financial',
            'is_assignable' => true,
        ]);
        foreach (['currency_id', 'chart_of_accounts_id'] as $index => $attributeKey) {
            OrgMetaTypeAttribute::create([
                'org_meta_type_id' => 'COMP_CODE',
                'attribute_key' => $attributeKey,
                'attribute_type' => 'reference',
                'is_mandatory' => true,
                'sort_order' => $index + 1,
            ]);
        }

        $currency = Currency::create([
            'code' => 'SAR',
            'name' => 'Saudi Riyal',
            'symbol' => 'SAR',
            'is_active' => true,
        ]);
        foreach (['asset', 'liability', 'equity', 'revenue', 'expense'] as $index => $type) {
            ChartOfAccount::create([
                'account_code' => (string) (1000 + $index),
                'account_name' => ucfirst($type),
                'account_type' => $type,
                'is_active' => true,
            ]);
        }

        $service = app(OrgStructureService::class);
        $service->validateNodeAttributes('COMP_CODE', [
            'currency_id' => (string) $currency->id,
            'chart_of_accounts_id' => 'ACCORE-PRIMARY-GL',
            'fiscal_year_variant' => 'K4',
            'language' => 'ar-SA',
        ]);
        $this->addToAssertionCount(1);

        $this->expectException(ValidationException::class);
        $service->validateNodeAttributes('COMP_CODE', [
            'currency_id' => (string) $currency->id,
            'chart_of_accounts_id' => 'ACCORE-PRIMARY-GL',
            'fiscal_year_variant' => 'K4',
            'language' => 'fa-IR',
        ]);
    }

    private function assertCalendarValidationFails(OrgStructureService $service, string $calendarId, string $countryCode): void
    {
        try {
            $service->validateNodeAttributes('PLANT', [
                'factory_calendar_id' => $calendarId,
                'country_code' => $countryCode,
            ]);
            $this->fail('The invalid factory-calendar reference should be rejected.');
        } catch (ValidationException $exception) {
            $this->assertArrayHasKey('attributes', $exception->errors());
        }
    }

    private function assertAccountingReferenceValidationFails(OrgStructureService $service, string $currencyId, string $chartOfAccountsId): void
    {
        try {
            $service->validateNodeAttributes('COMP_CODE', [
                'currency_id' => $currencyId,
                'chart_of_accounts_id' => $chartOfAccountsId,
            ]);
            $this->fail('The invalid accounting reference should be rejected.');
        } catch (ValidationException $exception) {
            $this->assertArrayHasKey('attributes', $exception->errors());
        }
    }
}
