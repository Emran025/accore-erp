<?php

namespace App\Domains\EnterpriseCore\OrganizationGovernance\Actions;

use App\Domains\EnterpriseCore\OrganizationGovernance\Services\BlueprintSynthesizer;
use App\Domains\EnterpriseCore\OrganizationGovernance\Services\InferenceScoringEngine;
use App\Domains\EnterpriseCore\OrganizationGovernance\Services\SignalExtractionService;

class AnalyzeInferenceAction
{
    public function __construct(
        private readonly SignalExtractionService $signalExtractor,
        private readonly InferenceScoringEngine $scoringEngine,
        private readonly BlueprintSynthesizer $synthesizer
    ) {}

    /**
     * @param array<string, mixed> $data
     * @return array<string, mixed>
     */
    public function execute(array $data): array
    {
        // 1. Extract signals from text and structured inputs
        $signals = $this->signalExtractor->extract($data);

        // 2. Score archetypes and formulate explainability rationale
        $evaluation = $this->scoringEngine->evaluate($signals);

        // 3. Formulate adaptive follow-up questions
        $adaptiveQuestions = $this->scoringEngine->generateAdaptiveQuestions($evaluation, $signals);

        // 4. Synthesize initial organization blueprint
        $orgName = $signals['company_name'] ?: ($data['company_name'] ?? 'Enterprise Organization');
        $blueprint = $this->synthesizer->synthesize($evaluation, $signals, $orgName);

        return [
            'signals'            => $signals,
            'evaluation'         => $evaluation,
            'adaptive_questions' => $adaptiveQuestions,
            'blueprint'          => $blueprint,
        ];
    }
}
