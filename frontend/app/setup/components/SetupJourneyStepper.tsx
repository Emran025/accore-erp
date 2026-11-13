import { Button } from "@/components/ui/Button";

export type SetupJourneyStepId = "module_selection" | "foundation" | "operating_links" | "optional_capabilities";

export type SetupJourneyStep = {
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
  onStepSelect: (stepId: SetupJourneyStepId) => void;
}

export function SetupJourneyStepper({
  steps,
  activeStep,
  previousLabel,
  nextLabel,
  completeLabel,
  onPrevious,
  onNext,
  onStepSelect,
}: SetupJourneyStepperProps) {
  const foundActiveIndex = steps.findIndex((step) => step.id === activeStep);
  const activeIndex = foundActiveIndex >= 0 ? foundActiveIndex : 0;
  const active = steps[activeIndex];
  const isFinalStep = activeIndex === steps.length - 1;

  return (
    <section className="setup-journey" aria-label={active?.title}>
      <ol className="setup-journey-progress" aria-label={active?.title}>
        {steps.map((step, index) => {
          const isCurrent = step.id === activeStep;
          const status = step.complete ? completeLabel : step.description;
          return (
            <li key={step.id}>
              <button
                type="button"
                className={`setup-journey-step ${isCurrent ? "is-current" : ""} ${step.complete ? "is-complete" : ""} ${!step.enabled ? "is-locked" : ""}`}
                aria-current={isCurrent ? "step" : undefined}
                aria-label={`${index + 1}. ${step.title}. ${status}`}
                aria-describedby={`setup-step-description-${step.id}`}
                disabled={!step.enabled}
                onClick={() => onStepSelect(step.id)}
              >
                <span className="setup-journey-step-index" aria-hidden="true">{index + 1}</span>
                <span>
                  <strong>{step.title}</strong>
                  <small id={`setup-step-description-${step.id}`}>{status}</small>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
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
