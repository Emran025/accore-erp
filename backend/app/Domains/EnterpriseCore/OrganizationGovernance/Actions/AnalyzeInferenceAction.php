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

        // 2. Score archetypes, formulate explainability rationale, and generate adaptive questions.
        // Note: evaluate() already embeds 'adaptive_questions' in its return value.
        $evaluation = $this->scoringEngine->evaluate($signals);

        // 3. Synthesize initial organization blueprint
        $blueprint = $this->synthesizer->synthesize($signals, $evaluation);

        return [
            'signals'            => $signals,
            'evaluation'         => $evaluation,
            'adaptive_questions' => $evaluation['adaptive_questions'] ?? [],
            'blueprint'          => $blueprint,
        ];
    }
}
