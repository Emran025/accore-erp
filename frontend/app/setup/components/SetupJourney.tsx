'use client';

import { StepNavigation } from '@/components/ui';
import { setupContent } from '../setup.content';

export type SetupJourneyStep = 'scope' | 'organization' | 'activation';

interface SetupJourneyProps {
  activeStep: SetupJourneyStep;
  completedSteps: SetupJourneyStep[];
  className?: string;
}

export function SetupJourney({ activeStep, completedSteps, className }: SetupJourneyProps) {
  const steps = setupContent.steps.map((step) => ({ ...step }));

  return (
    <StepNavigation
      steps={steps}
      activeStep={activeStep}
      completedSteps={completedSteps}
      onStepChange={() => undefined}
      className={className}
    />
  );
}
