<?php

namespace App\Domains\EnterpriseCore\OrganizationGovernance\Services;

/**
 * Extracts, normalizes, and enriches business signals from natural language
 * and structured onboarding inputs into a strongly typed signal vector.
 */
class SignalExtractionService
{
    /**
     * @param array<string, mixed> $input
     * @return array<string, mixed>
     */
    public function extract(array $input): array
    {
        $text = trim((string) ($input['description'] ?? ''));
        $structured = (array) ($input['structured'] ?? []);

        $signals = [
            'company_name'          => trim((string) ($structured['company_name'] ?? $input['company_name'] ?? '')),
            'company_code'          => strtoupper(trim((string) ($structured['company_code'] ?? $input['company_code'] ?? ''))),
            'country_code'          => strtoupper(trim((string) ($structured['country_code'] ?? $input['country_code'] ?? 'SA'))),
            'currency_id'           => (int) ($structured['currency_id'] ?? $input['currency_id'] ?? 1),
            'employee_count'        => (int) ($structured['employee_count'] ?? $input['employee_count'] ?? 0),
            'legal_entity_count'    => (int) ($structured['legal_entity_count'] ?? $input['legal_entity_count'] ?? 1),
            'store_count'           => (int) ($structured['store_count'] ?? $input['store_count'] ?? 0),
            'warehouse_count'       => (int) ($structured['warehouse_count'] ?? $input['warehouse_count'] ?? 0),
            'factory_count'         => (int) ($structured['factory_count'] ?? $input['factory_count'] ?? 0),
            'office_count'          => (int) ($structured['office_count'] ?? $input['office_count'] ?? 0),
            'has_pos'               => (bool) ($structured['has_pos'] ?? $input['has_pos'] ?? false),
            'has_ecommerce'         => (bool) ($structured['has_ecommerce'] ?? $input['has_ecommerce'] ?? false),
            'has_wholesale'         => (bool) ($structured['has_wholesale'] ?? $input['has_wholesale'] ?? false),
            'has_services'          => (bool) ($structured['has_services'] ?? $input['has_services'] ?? false),
            'has_projects'          => (bool) ($structured['has_projects'] ?? $input['has_projects'] ?? false),
            'has_manufacturing'     => (bool) ($structured['has_manufacturing'] ?? $input['has_manufacturing'] ?? false),
            'has_matrix'            => (bool) ($structured['has_matrix'] ?? $input['has_matrix'] ?? false),
            'governance_finance'    => (string) ($structured['governance_finance'] ?? $input['governance_finance'] ?? 'centralized'),
            'governance_purchasing' => (string) ($structured['governance_purchasing'] ?? $input['governance_purchasing'] ?? 'centralized'),
            'industry'              => (string) ($structured['industry'] ?? $input['industry'] ?? 'general'),
            'detected_keywords'     => [],
        ];

        if ($text !== '') {
            $this->enrichFromNaturalLanguage($text, $signals);
        }

        // Default sanity fallbacks
        if ($signals['store_count'] > 0 && !$signals['has_pos']) {
            $signals['has_pos'] = true;
        }

        if ($signals['factory_count'] > 0 && !$signals['has_manufacturing']) {
            $signals['has_manufacturing'] = true;
        }

        if ($signals['employee_count'] === 0) {
            $signals['employee_count'] = max(3, $signals['store_count'] * 3 + $signals['warehouse_count'] * 4);
        }

        return $signals;
    }

    /**
     * Parse natural language text in Arabic and English for keywords and quantity signals.
     */
    private function enrichFromNaturalLanguage(string $text, array &$signals): void
    {
        $lower = mb_strtolower($text, 'UTF-8');
        $detected = [];

        // ── Retail & Stores ──
        if (preg_match('/(store|stores|shop|shops|retail|boutique|فرع|فروع|متجر|متاجر|محل|محلات|تجزئة)/iu', $lower)) {
            $detected[] = 'retail';
            if ($signals['industry'] === 'general') $signals['industry'] = 'retail';
            $signals['has_pos'] = true;

            if (preg_match('/(\d+)\s*(store|stores|shop|shops|فروع|متاجر|محلات|فرع)/iu', $lower, $m)) {
                $signals['store_count'] = max($signals['store_count'], (int) $m[1]);
            } elseif ($signals['store_count'] === 0) {
                $signals['store_count'] = 1;
            }
        }

        // ── Warehouses ──
        if (preg_match('/(warehouse|warehouses|depot|storage|مستودع|مستودعات|مخزن|مخازن)/iu', $lower)) {
            $detected[] = 'warehouse';
            if (preg_match('/(\d+)\s*(warehouse|warehouses|مستودع|مستودعات|مخزن|مخازن)/iu', $lower, $m)) {
                $signals['warehouse_count'] = max($signals['warehouse_count'], (int) $m[1]);
            } elseif ($signals['warehouse_count'] === 0) {
                $signals['warehouse_count'] = 1;
            }
        }

        // ── Manufacturing / Factories ──
        if (preg_match('/(factory|factories|plant|plants|manufactur|تصنيع|مصنع|مصانع|إنتاج|معمل)/iu', $lower)) {
            $detected[] = 'manufacturing';
            $signals['has_manufacturing'] = true;
            if ($signals['industry'] === 'general') $signals['industry'] = 'manufacturing';
            if (preg_match('/(\d+)\s*(factory|factories|plant|مصنع|مصانع)/iu', $lower, $m)) {
                $signals['factory_count'] = max($signals['factory_count'], (int) $m[1]);
            } elseif ($signals['factory_count'] === 0) {
                $signals['factory_count'] = 1;
            }
        }

        // ── Projects & Consulting ──
        if (preg_match('/(project|projects|consulting|contracting|agency|squad|مشروع|مشاريع|استشارات|مقاولات|وكالة|فرق عمل)/iu', $lower)) {
            $detected[] = 'projects';
            $signals['has_projects'] = true;
            if ($signals['industry'] === 'general') $signals['industry'] = 'services';
        }

        // ── Matrix & Dual Reporting ──
        if (preg_match('/(matrix|dual reporting|dotted line|two managers|مصفوفة|تبعية مزدوجة|مديرين)/iu', $lower)) {
            $detected[] = 'matrix';
            $signals['has_matrix'] = true;
        }

        // ── Multi-Entity / Holding ──
        if (preg_match('/(holding|subsidiary|subsidiaries|group|holding company|شركة قابضة|مجموعة شركات|شركات تابعة)/iu', $lower)) {
            $detected[] = 'holding';
            if (preg_match('/(\d+)\s*(subsidiaries|companies|entities|شركات|شركات تابعة)/iu', $lower, $m)) {
                $signals['legal_entity_count'] = max($signals['legal_entity_count'], (int) $m[1]);
            } elseif ($signals['legal_entity_count'] === 1) {
                $signals['legal_entity_count'] = 2;
            }
        }

        // ── E-Commerce ──
        if (preg_match('/(online|e-commerce|ecommerce|website|متجر إلكتروني|أونلاين|تطبيق)/iu', $lower)) {
            $detected[] = 'ecommerce';
            $signals['has_ecommerce'] = true;
        }

        // ── Wholesale ──
        if (preg_match('/(wholesale|distribution|distributor|جملة|توزيع|موزع)/iu', $lower)) {
            $detected[] = 'wholesale';
            $signals['has_wholesale'] = true;
        }

        // ── Employees Headcount ──
        if (preg_match('/(\d+)\s*(employee|employees|staff|people|موظف|موظفين|عامل)/iu', $lower, $m)) {
            $signals['employee_count'] = (int) $m[1];
        }

        $signals['detected_keywords'] = array_values(array_unique($detected));
    }
}
