import { Onboarding } from "../types";

interface SetupPhaseProgressProps {
  onboarding?: Onboarding;
  foundationTitle: string;
  foundationDescription: string;
  coreOperationsTitle: string;
  coreOperationsDescription: string;
  moduleActivationTitle: string;
  moduleActivationDescription: string;
  currentLabel: string;
  lockedLabel: string;
  completeLabel: string;
}

export function SetupPhaseProgress({
  onboarding,
  foundationTitle,
  foundationDescription,
  coreOperationsTitle,
  coreOperationsDescription,
  moduleActivationTitle,
  moduleActivationDescription,
  currentLabel,
  lockedLabel,
  completeLabel,
}: SetupPhaseProgressProps) {
  const phases = [
    { id: "foundation", title: foundationTitle, description: foundationDescription, ready: onboarding?.phases.foundation.ready ?? false },
    { id: "core_operations", title: coreOperationsTitle, description: coreOperationsDescription, ready: onboarding?.phases.core_operations.ready ?? false },
    { id: "module_activation", title: moduleActivationTitle, description: moduleActivationDescription, ready: onboarding?.starter_bundle_active ?? false },
  ] as const;

  return (
    <div className="setup-phase-progress" aria-label={foundationTitle}>
      {phases.map((phase) => {
        const current = onboarding?.next_phase === phase.id;
        const locked = !phase.ready && !current;
        const status = phase.ready ? completeLabel : (current ? currentLabel : lockedLabel);
        const className = [
          "setup-phase-progress-item",
          phase.ready ? "is-ready" : "",
          current ? "is-current" : "",
          locked ? "is-locked" : "",
        ].filter(Boolean).join(" ");

        return (
          <div key={phase.id} className={className}>
            <strong>{phase.title}</strong>
            <span>{phase.description}</span>
            <span>{status}</span>
          </div>
        );
      })}
    </div>
  );
}
