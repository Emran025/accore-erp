<?php

namespace App\Domains\EnterpriseCore\OrganizationGovernance\Services;

use Illuminate\Support\Str;

/**
 * Synthesizes a structured, explainable, and customizable OrganizationBlueprint
 * from extracted business signals and archetype scoring.
 */
class BlueprintSynthesizer
{
    /**
     * Synthesize blueprint structure from signals and evaluation.
     *
     * @param array<string, mixed> $signals
     * @param array<string, mixed> $evaluation
     * @return array<string, mixed>
     */
    public function synthesize(array $signals, array $evaluation): array
    {
        $blueprintUuid = (string) Str::uuid();
        $companyName = !empty($signals['company_name']) ? $signals['company_name'] : 'منشأة تجارية جديدة';
        $companyCode = !empty($signals['company_code']) ? $signals['company_code'] : 'CORP';

        $countryCode = $signals['country_code'] ?? 'SA';
        $currencyId = (string) ($signals['currency_id'] ?? 1);
        $primaryArchetype = $evaluation['primary_archetype'];

        $units = [];
        $relationships = [];
        $positions = [];

        // ── 1. Root Legal Entity Unit ──
        $legalUnitId = 'u_legal_root';
        $units[] = [
            'temp_id'        => $legalUnitId,
            'type_id'        => 'COMP_CODE',
            'code'           => $companyCode,
            'name_en'        => !empty($signals['company_name']) ? $signals['company_name'] : 'New Business Entity',
            'name_ar'        => $companyName,
            'facets'         => ['LegalEntityFacet', 'FinancialResponsibilityFacet'],
            'attributes'     => [
                'country_code'         => $countryCode,
                'currency_id'          => $currencyId,
                'chart_of_accounts_id' => 'ACCORE-PRIMARY-GL',
                'fiscal_year_variant'  => 'K4',
                'language'             => 'ar-SA',
            ],
            'is_user_locked' => false,
        ];

        // Root CEO Position
        $positions[] = [
            'temp_id'       => 'pos_exec_01',
            'unit_temp_id'  => $legalUnitId,
            'position_code' => 'POS-EXEC-01',
            'title_en'      => 'General Manager / CEO',
            'title_ar'      => 'المدير العام / الرئيس التنفيذي',
            'role_id'       => 'ADMIN_SUPER',
            'headcount'     => 1,
        ];

        // ── 2. Facilities & Commercial Branches ──
        $storeCount = (int) ($signals['store_count'] ?? 0);
        $whCount = (int) ($signals['warehouse_count'] ?? 0);
        $factoryCount = (int) ($signals['factory_count'] ?? 0);

        // Central Warehouse (if any warehouse or stores >= 2)
        $hubUnitId = null;
        if ($whCount > 0 || $storeCount >= 2) {
            $hubUnitId = 'u_fac_central_wh';
            $units[] = [
                'temp_id'        => $hubUnitId,
                'type_id'        => 'PLANT',
                'code'           => 'WH-CENTRAL',
                'name_en'        => 'Central Distribution Hub',
                'name_ar'        => 'المستودع المركزي الرئيسي',
                'facets'         => ['OperationalFacilityFacet', 'FinancialResponsibilityFacet'],
                'attributes'     => [
                    'country_code'        => $countryCode,
                    'facility_type'       => 'warehouse',
                    'is_central_depot'    => true,
                    'factory_calendar_id' => '1',
                ],
                'is_user_locked' => false,
            ];

            $relationships[] = [
                'temp_id'        => 'rel_hub_to_legal',
                'source_temp_id' => $hubUnitId,
                'target_temp_id' => $legalUnitId,
                'plane_type'     => 'OPERATIONAL_HIERARCHY',
                'link_type'      => 'line_management',
                'priority'       => 1,
            ];

            $positions[] = [
                'temp_id'            => 'pos_wh_mgr',
                'unit_temp_id'       => $hubUnitId,
                'position_code'      => 'POS-LOG-01',
                'title_en'           => 'Logistics & Inventory Supervisor',
                'title_ar'           => 'مشرف المستودعات والمخزون',
                'role_id'            => 'INVENTORY_MANAGER',
                'reports_to_temp_id' => 'pos_exec_01',
                'headcount'          => 1,
            ];
        }

        // Stores
        $actualStoreCount = max($storeCount, ($whCount === 0 && $factoryCount === 0 ? 1 : 0));
        for ($i = 1; $i <= $actualStoreCount; $i++) {
            $storeUnitId = 'u_store_' . $i;
            $storeCode = 'BR-' . str_pad((string) $i, 2, '0', STR_PAD_LEFT);
            $storeNameAr = ($actualStoreCount === 1) ? 'الفرع الرئيسي / نقطة البيع' : "فرع المتجر رقم {$i}";
            $storeNameEn = ($actualStoreCount === 1) ? 'Main Store / Flagship' : "Store Branch #{$i}";

            $units[] = [
                'temp_id'        => $storeUnitId,
                'type_id'        => 'PLANT',
                'code'           => $storeCode,
                'name_en'        => $storeNameEn,
                'name_ar'        => $storeNameAr,
                'facets'         => ['OperationalFacilityFacet', 'CommercialBranchFacet', 'FinancialResponsibilityFacet'],
                'attributes'     => [
                    'country_code'        => $countryCode,
                    'facility_type'       => 'retail_store',
                    'pos_terminal_count'  => 1,
                    'factory_calendar_id' => '1',
                ],
                'is_user_locked' => false,
            ];

            $relationships[] = [
                'temp_id'        => 'rel_store_' . $i . '_to_legal',
                'source_temp_id' => $storeUnitId,
                'target_temp_id' => $legalUnitId,
                'plane_type'     => 'OPERATIONAL_HIERARCHY',
                'link_type'      => 'line_management',
                'priority'       => 1,
            ];

            // Replenishment route from central hub
            if ($hubUnitId !== null) {
                $relationships[] = [
                    'temp_id'        => 'rel_replenish_' . $i,
                    'source_temp_id' => $storeUnitId,
                    'target_temp_id' => $hubUnitId,
                    'plane_type'     => 'GEOGRAPHIC_CONTAINMENT',
                    'link_type'      => 'inventory_replenishment_source',
                    'priority'       => 2,
                ];
            }

            $positions[] = [
                'temp_id'            => 'pos_store_sup_' . $i,
                'unit_temp_id'       => $storeUnitId,
                'position_code'      => 'POS-RET-' . str_pad((string) $i, 2, '0', STR_PAD_LEFT),
                'title_en'           => "Store Manager ({$storeCode})",
                'title_ar'           => "مدير الفرع ({$storeCode})",
                'role_id'            => 'BRANCH_MANAGER',
                'reports_to_temp_id' => 'pos_exec_01',
                'headcount'          => 1,
            ];
        }

        // Factory (if manufacturing)
        if ($factoryCount > 0 || !empty($signals['has_manufacturing'])) {
            $factoryUnitId = 'u_fac_plant_01';
            $units[] = [
                'temp_id'        => $factoryUnitId,
                'type_id'        => 'PLANT',
                'code'           => 'PLANT-01',
                'name_en'        => 'Production & Assembly Plant',
                'name_ar'        => 'مصنع العمليات والإنتاج',
                'facets'         => ['OperationalFacilityFacet', 'FinancialResponsibilityFacet'],
                'attributes'     => [
                    'country_code'        => $countryCode,
                    'facility_type'       => 'factory',
                    'factory_calendar_id' => '1',
                ],
                'is_user_locked' => false,
            ];

            $relationships[] = [
                'temp_id'        => 'rel_factory_to_legal',
                'source_temp_id' => $factoryUnitId,
                'target_temp_id' => $legalUnitId,
                'plane_type'     => 'OPERATIONAL_HIERARCHY',
                'link_type'      => 'line_management',
                'priority'       => 1,
            ];
        }

        // E-Commerce Fulfillment Channel (if ecom)
        if (!empty($signals['has_ecommerce'])) {
            $ecomUnitId = 'u_chan_ecom';
            $units[] = [
                'temp_id'        => $ecomUnitId,
                'type_id'        => 'SALES_ORG',
                'code'           => 'SO-ONLINE',
                'name_en'        => 'E-Commerce Online Channel',
                'name_ar'        => 'قناة المتجر الرقمي والتطبيقات',
                'facets'         => ['CommercialBranchFacet', 'FinancialResponsibilityFacet'],
                'attributes'     => ['channel_type' => 'digital'],
                'is_user_locked' => false,
            ];

            $relationships[] = [
                'temp_id'        => 'rel_ecom_to_legal',
                'source_temp_id' => $ecomUnitId,
                'target_temp_id' => $legalUnitId,
                'plane_type'     => 'OPERATIONAL_HIERARCHY',
                'link_type'      => 'line_management',
                'priority'       => 1,
            ];
        }

        return [
            'blueprint_id'     => $blueprintUuid,
            'version'          => '2.0.0',
            'created_at'       => now()->toISOString(),
            'status'           => 'staged',
            'metadata'         => [
                'generator'         => 'ACCORE_Inference_Engine_v2',
                'complexity_grade'  => $evaluation['complexity_grade'],
                'primary_archetype' => $primaryArchetype,
                'confidence_score'  => $evaluation['confidence_score'],
            ],
            'business_profile' => [
                'company_name'       => $companyName,
                'company_code'       => $companyCode,
                'country_code'       => $countryCode,
                'primary_currency'   => $currencyId,
                'fiscal_calendar'    => 'K4',
                'headcount_estimate' => (int) ($signals['employee_count'] ?? 10),
            ],
            'units'            => $units,
            'relationships'    => $relationships,
            'positions'        => $positions,
            'capabilities'     => [
                'activated' => $evaluation['recommended_capabilities'],
                'deferred'  => [],
            ],
            'explainability'   => $evaluation['explainability'],
        ];
    }
}
