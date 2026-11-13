import { Button } from "@/components/ui";

export type SetupJourneyStepId = "module_selection" | "foundation" | "operating_links" | "optional_capabilities";

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
  const foundActiveIndex = steps.findIndex((step) => step.id === activeStep);
  const activeIndex = foundActiveIndex >= 0 ? foundActiveIndex : 0;
  const active = steps[activeIndex];
  const isFinalStep = activeIndex === steps.length - 1;

  return (
    <section className="setup-journey" aria-label={active?.title}>
      <div className="setup-journey-progress" aria-label={active?.title}>
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`setup-journey-step ${step.id === activeStep ? "is-current" : ""} ${step.complete ? "is-complete" : ""} ${!step.enabled ? "is-locked" : ""}`}
            aria-current={step.id === activeStep ? "step" : undefined}
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
        <Button
          type="button"
          variant="secondary"
          disabled={activeIndex === 0}
          aria-label={`${previousLabel}${steps[activeIndex - 1] ? `: ${steps[activeIndex - 1].title}` : ""}`}
          onClick={onPrevious}
        >
          {previousLabel}
        </Button>
        <Button
          type="button"
          disabled={!active?.complete || isFinalStep}
          aria-label={`${nextLabel}${steps[activeIndex + 1] ? `: ${steps[activeIndex + 1].title}` : ""}`}
          onClick={onNext}
        >
          {nextLabel}
        </Button>
      </div>
    </section>
  );
}
