import { Button } from "@/components/ui";

export type SetupJourneyStepId = "foundation" | "operating_links" | "optional_capabilities";

type SetupJourneyStep = {
  id: SetupJourneyStepId;
  title: string;
  description: string;
  complete: boolean;
  enabled: boolean;
};

interface SetupJourneyStepperProps {
  steps: SetupJourneyStep[];
  activeStep: SetupJourneyStepId;
  previousLabel: string;
  nextLabel: string;
  completeLabel: string;
  onPrevious: () => void;
  onNext: () => void;
}

export function SetupJourneyStepper({
  steps,
  activeStep,
  previousLabel,
  nextLabel,
  completeLabel,
  onPrevious,
  onNext,
}: SetupJourneyStepperProps) {
  const activeIndex = steps.findIndex((step) => step.id === activeStep);
  const active = steps[activeIndex];
  const isFinalStep = activeIndex === steps.length - 1;

  return (
    <section className="setup-journey" aria-label={active?.title}>
      <div className="setup-journey-progress" aria-label={active?.title}>
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`setup-journey-step ${step.id === activeStep ? "is-current" : ""} ${step.complete ? "is-complete" : ""} ${!step.enabled ? "is-locked" : ""}`}
          >
            <span className="setup-journey-step-index">{index + 1}</span>
            <span>
              <strong>{step.title}</strong>
              <small>{step.complete ? completeLabel : step.description}</small>
            </span>
          </div>
        ))}
      </div>
      <div className="setup-journey-actions">
        <Button type="button" variant="secondary" disabled={activeIndex === 0} onClick={onPrevious}>
          {previousLabel}
        </Button>
        <Button type="button" disabled={!active?.complete || isFinalStep} onClick={onNext}>
          {nextLabel}
        </Button>
      </div>
    </section>
  );
}
