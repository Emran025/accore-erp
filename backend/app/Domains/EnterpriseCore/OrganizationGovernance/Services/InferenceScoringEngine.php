<?php

namespace App\Domains\EnterpriseCore\OrganizationGovernance\Services;

/**
 * Mathematical inference and scoring engine for organizational archetypes.
 * Implements affine feature weighting, confidence metrics, and explainability synthesis.
 */
class InferenceScoringEngine
{
    public const ARCHETYPES = [
        'SIMPLE_HIERARCHY'        => ['label_en' => 'Simple Line Hierarchy', 'label_ar' => 'هيكل هرمي مباشر وبسيط'],
        'FUNCTIONAL'              => ['label_en' => 'Functional Departmental', 'label_ar' => 'هيكل وظيفي تخصصي'],
        'DIVISIONAL'              => ['label_en' => 'Divisional (Product / Market)', 'label_ar' => 'هيكل قطاعي (أقسام وقطاعات)'],
        'GEOGRAPHIC_MULTI_BRANCH' => ['label_en' => 'Geographic & Multi-Branch', 'label_ar' => 'هيكل جغرافي متعدد الفروع'],
        'MATRIX'                  => ['label_en' => 'Matrix (Dual Reporting)', 'label_ar' => 'هيكل مصفوفي (تبعية مزدوجة)'],
        'PROJECTIZED'             => ['label_en' => 'Projectized & Squad-Based', 'label_ar' => 'هيكل قائم على المشاريع'],
        'HOLDING_CONGLOMERATE'    => ['label_en' => 'Multi-Entity Holding Group', 'label_ar' => 'مجموعة شركات قابضة متعددة الكيانات'],
    ];

    /**
     * Evaluate signals and return ranked archetypes, confidence, complexity, and explainability.
     *
     * @param array<string, mixed> $signals
     * @return array<string, mixed>
     */
    public function evaluate(array $signals): array
    {
        $scores = [
            'SIMPLE_HIERARCHY'        => 30.0,
            'FUNCTIONAL'              => 20.0,
            'DIVISIONAL'              => 10.0,
            'GEOGRAPHIC_MULTI_BRANCH' => 10.0,
            'MATRIX'                  => 5.0,
            'PROJECTIZED'             => 5.0,
            'HOLDING_CONGLOMERATE'    => 0.0,
        ];

        $reasons = [];
        $capabilities = ['general_ledger'];

        $empCount = (int) ($signals['employee_count'] ?? 1);
        $legalCount = (int) ($signals['legal_entity_count'] ?? 1);
        $storeCount = (int) ($signals['store_count'] ?? 0);
        $whCount = (int) ($signals['warehouse_count'] ?? 0);
        $factoryCount = (int) ($signals['factory_count'] ?? 0);
        $hasPos = (bool) ($signals['has_pos'] ?? false);
        $hasProjects = (bool) ($signals['has_projects'] ?? false);
        $hasMatrix = (bool) ($signals['has_matrix'] ?? false);
        $hasMfg = (bool) ($signals['has_manufacturing'] ?? false);
        $hasEcom = (bool) ($signals['has_ecommerce'] ?? false);

        // ── 1. Scale Rule ──
        if ($empCount <= 10) {
            $scores['SIMPLE_HIERARCHY'] += 50;
            $scores['MATRIX'] -= 40;
            $scores['HOLDING_CONGLOMERATE'] -= 60;
        } elseif ($empCount <= 50) {
            $scores['FUNCTIONAL'] += 40;
            $scores['GEOGRAPHIC_MULTI_BRANCH'] += 15;
            $scores['PROJECTIZED'] += 20;
        } else {
            $scores['SIMPLE_HIERARCHY'] -= 50;
            $scores['DIVISIONAL'] += 40;
            $scores['GEOGRAPHIC_MULTI_BRANCH'] += 35;
            $scores['MATRIX'] += 35;
            $scores['HOLDING_CONGLOMERATE'] += 30;
        }

        // ── 2. Legal Entities Rule ──
        if ($legalCount > 1) {
            $scores['HOLDING_CONGLOMERATE'] += 100 + ($legalCount * 15);
            $scores['SIMPLE_HIERARCHY'] -= 100;
            $scores['FUNCTIONAL'] -= 40;

            $reasons[] = [
                'factor' => 'multi_entity',
                'en' => "You operate {$legalCount} legal entities, requiring parent holding consolidation and statutory boundary management.",
                'ar' => "تدير {$legalCount} كيانات قانونية، مما يتطلب هيكل شركة قابضة موحدة وضبط الحدود النظامية المستقلة.",
            ];
        }

        // ── 3. Multi-Branch & Facilities Rule ──
        if ($storeCount >= 2 || ($storeCount >= 1 && $whCount >= 1)) {
            $scores['GEOGRAPHIC_MULTI_BRANCH'] += 80 + ($storeCount * 10) + ($whCount * 15);
            $scores['SIMPLE_HIERARCHY'] -= 40;
            $capabilities[] = 'multi_warehouse_inventory';

            if ($hasPos) {
                $capabilities[] = 'point_of_sale';
            }

            $reasons[] = [
                'factor' => 'multi_site',
                'en' => "You operate {$storeCount} customer branches and {$whCount} storage depots requiring physical facility and replenishment routing.",
                'ar' => "تدير {$storeCount} فروع لمواجهة العملاء و {$whCount} مستودعات تخزين تتطلب ربط المرافق ومسارات التزويد المخزني.",
            ];
        }

        // ── 4. Manufacturing & Plant Rule ──
        if ($hasMfg || $factoryCount > 0) {
            $scores['FUNCTIONAL'] += 35;
            $scores['DIVISIONAL'] += 25;
            $capabilities[] = 'manufacturing';
            $capabilities[] = 'inventory_costing';

            $reasons[] = [
                'factor' => 'manufacturing',
                'en' => "Manufacturing operations require plant work centers and bill-of-materials cost accounting.",
                'ar' => "العمليات الصناعية تتطلب مراكز عمل بالمصنع ومحاسبة تكاليف شجرة المواد.",
            ];
        }

        // ── 5. Projects & Consulting Rule ──
        if ($hasProjects) {
            $scores['PROJECTIZED'] += 80;
            $scores['MATRIX'] += 45;
            $scores['SIMPLE_HIERARCHY'] -= 20;
            $capabilities[] = 'project_accounting';

            $reasons[] = [
                'factor' => 'projects',
                'en' => "Client-facing initiatives require project accounting and dynamic cross-functional staffing.",
                'ar' => "المشاريع ومبادرات العملاء تتطلب محاسبة مشاريع وتخصيص فرق عمل مرنة.",
            ];
        }

        // ── 6. Matrix Reporting Rule ──
        if ($hasMatrix) {
            $scores['MATRIX'] += 95;
            $scores['PROJECTIZED'] += 30;

            $reasons[] = [
                'factor' => 'dual_reporting',
                'en' => "Employees report to both functional discipline heads and project/regional managers.",
                'ar' => "يتبع الموظفون لمدراء التخصص الوظيفي ومدراء المشاريع في آن واحد.",
            ];
        }

        // ── 7. Omnichannel & E-Commerce Rule ──
        if ($hasEcom) {
            $capabilities[] = 'ecommerce_fulfillment';
        }

        // Always include commercial sales & purchasing for business operations
        if ($storeCount > 0 || $hasPos || $whCount > 0) {
            $capabilities[] = 'sales';
            $capabilities[] = 'purchasing';
        }

        arsort($scores);

        $keys = array_keys($scores);
        $primary = $keys[0];
        $secondary = $keys[1] ?? null;

        $topScore = $scores[$primary];
        $secondScore = $secondary ? $scores[$secondary] : 0.0;

        // Confidence calculation
        $spread = $topScore > 0 ? ($topScore - $secondScore) / $topScore : 0.5;
        $confidence = min(0.98, max(0.55, 0.50 + ($spread * 0.45)));

        // Complexity grading (1 to 5)
        $complexity = 1;
        if ($legalCount > 1 || $scores['HOLDING_CONGLOMERATE'] > 60) {
            $complexity = 5;
        } elseif ($hasMatrix || ($storeCount >= 5 && $whCount >= 2) || ($hasMfg && $hasProjects)) {
            $complexity = 4;
        } elseif ($storeCount >= 2 || $whCount >= 1 || $empCount > 25) {
            $complexity = 3;
        } elseif ($empCount > 8 || $hasProjects || $hasMfg) {
            $complexity = 2;
        }

        $archetypeMeta = self::ARCHETYPES[$primary] ?? ['label_en' => $primary, 'label_ar' => $primary];

        return [
            'primary_archetype'       => $primary,
            'primary_archetype_label' => $archetypeMeta,
            'confidence_score'        => round($confidence, 2),
            'complexity_grade'        => $complexity,
            'scores'                  => $scores,
            'recommended_capabilities'=> array_values(array_unique($capabilities)),
            'explainability'          => [
                'summary_en' => "Recommended {$archetypeMeta['label_en']} based on your operational scale and business footprint.",
                'summary_ar' => "تم ترشيح {$archetypeMeta['label_ar']} بناءً على نطاق أعمالك وطبيعة مرافقك التشغيلية.",
                'reasons'    => $reasons,
            ],
            'adaptive_questions'      => $this->generateAdaptiveQuestions($signals, $primary, $confidence),
        ];
    }

    /**
     * Determine follow-up questions when uncertainty or deeper expansion is detected.
     */
    private function generateAdaptiveQuestions(array $signals, string $primary, float $confidence): array
    {
        $questions = [];

        if (empty($signals['company_name'])) {
            $questions[] = [
                'id'          => 'company_name',
                'type'        => 'text',
                'question_en' => 'What is the registered trade name of your company?',
                'question_ar' => 'ما هو الاسم التجاري المسجل لمنشأتك؟',
                'mandatory'   => true,
            ];
        }

        if ($signals['store_count'] > 1 && empty($signals['governance_purchasing'])) {
            $questions[] = [
                'id'          => 'governance_purchasing',
                'type'        => 'choice',
                'question_en' => 'How are inventory purchases negotiated with suppliers?',
                'question_ar' => 'كيف تتم مفاوضات شراء المخزون مع الموردين؟',
                'options'     => [
                    ['value' => 'centralized', 'label_en' => 'Centralized at Headquarters (Recommended)', 'label_ar' => 'مركزياً من المقر الرئيسي (موصى به)'],
                    ['value' => 'per_site',    'label_en' => 'Independently by each branch', 'label_ar' => 'بشكل مستقل لكل فرع'],
                ],
                'mandatory'   => false,
            ];
        }

        return $questions;
    }
}
