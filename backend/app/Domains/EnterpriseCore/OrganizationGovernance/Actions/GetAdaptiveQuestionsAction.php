<?php

namespace App\Domains\EnterpriseCore\OrganizationGovernance\Actions;

use App\Domains\EnterpriseCore\OrganizationGovernance\Services\InferenceScoringEngine;

class GetAdaptiveQuestionsAction
{
    public function __construct(
        private readonly InferenceScoringEngine $scoringEngine
    ) {}

    /**
     * @param array<string, mixed> $data
     * @return array<string, mixed>
     */
    public function execute(array $data): array
    {
        $signals = $data['signals'] ?? [];
        $evaluation = $data['evaluation'] ?? $this->scoringEngine->evaluate($signals);
        $questions = $this->scoringEngine->generateAdaptiveQuestions($evaluation, $signals);

        return [
            'questions'  => $questions,
            'evaluation' => $evaluation,
        ];
    }
}
