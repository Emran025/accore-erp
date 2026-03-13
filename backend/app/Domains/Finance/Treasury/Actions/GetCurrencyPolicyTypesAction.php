<?php

namespace App\Domains\Finance\Treasury\Actions;

use App\Domains\Shared\Actions\Action;
use Illuminate\Http\JsonResponse;

class GetCurrencyPolicyTypesAction extends Action
{
    public function __invoke(): JsonResponse
    {
        $types = [
            ['value' => 'UNIT_OF_MEASURE', 'label' => 'Unit of Measure (Non-Converted)', 'label_ar' => 'وحدة قياس (بدون تحويل)', 'description' => 'Currencies are stored in their native denomination. No conversion occurs at posting.'],
            ['value' => 'VALUED_ASSET', 'label' => 'Valued Asset (Conditionally Convertible)', 'label_ar' => 'أصل مُقيَّم (قابل للتحويل اختياريًا)', 'description' => 'Currencies are tracked in original amounts with optional revaluation.'],
            ['value' => 'NORMALIZATION', 'label' => 'Normalization (Immediate Conversion)', 'label_ar' => 'توحيد العملة (تحويل فوري)', 'description' => 'All transactions are immediately converted to the reference currency.'],
        ];
        $timings = [
            ['value' => 'POSTING', 'label' => 'At Posting', 'label_ar' => 'عند الترحيل'],
            ['value' => 'SETTLEMENT', 'label' => 'At Settlement', 'label_ar' => 'عند التسوية'],
            ['value' => 'REPORTING', 'label' => 'For Reporting Only', 'label_ar' => 'للتقارير فقط'],
            ['value' => 'NEVER', 'label' => 'Never', 'label_ar' => 'لا يتم التحويل'],
        ];
        return response()->json([
            'success' => true,
            'data' => ['policy_types' => $types, 'conversion_timings' => $timings],
        ]);
    }
}
