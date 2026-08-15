"use client";

import { catalogMessage } from "@/lib/i18n";
import { Button } from "@/components/ui/Button";

export interface StepCheck {
    id: string;
    label: string;
    isCompleted: boolean;
    isRequired?: boolean;
}

export interface Step {
    key: string;
    label: string;
    icon: string;
    description?: string;
    isRequired?: boolean;
    checks?: StepCheck[];
}

interface StepNavigationProps {
    steps: Step[];
    activeStep: string;
    completedSteps: string[];
    onStepChange: (stepKey: string) => void;
    className?: string;

    // Layout and content properties
    children?: React.ReactNode;

    // Action buttons properties
    showActions?: boolean;
    onNext?: () => void;
    onPrevious?: () => void;
    onCancel?: () => void;
    onSave?: () => void;

    // Custom labels
    nextLabel?: string;
    previousLabel?: string;
    cancelLabel?: string;
    saveLabel?: string;

    // State properties
    isNextDisabled?: boolean;
    isSaveDisabled?: boolean;
    isLoading?: boolean;

    // Form Integration
    formId?: string;
}

/**
 * StepNavigation Component
 * A specialized wrapper for step-by-step wizards.
 * Visualizes the progress, an optional vertical checklist to verify step completion, 
 * renders internal children, and includes action buttons (previous, next, cancel, save) at the bottom.
 */
export function StepNavigation({
    steps,
    activeStep,
    completedSteps,
    onStepChange,
    className = "",
    children,
    showActions = false,
    onNext,
    onPrevious,
    onCancel,
    onSave,
    nextLabel = catalogMessage("text_e161f8a04285"),
    previousLabel = catalogMessage("text_a9e9d067101a"),
    cancelLabel = catalogMessage("text_9a30dc2a96b8"),
    saveLabel = catalogMessage("text_5b745f48a0c3"),
    isNextDisabled = false,
    isSaveDisabled = false,
    isLoading = false,
    formId,
}: StepNavigationProps) {
    const activeIndex = steps.findIndex(s => s.key === activeStep);
    const isFirstStep = activeIndex === 0;
    const isLastStep = activeIndex === steps.length - 1;
    const currentStep = steps[activeIndex];

    // Compute whether we have uncompleted required checks
    const hasUncompletedRequiredChecks = !!currentStep?.checks?.some(c => c.isRequired && !c.isCompleted);
    const activeNextDisabled = isNextDisabled || hasUncompletedRequiredChecks;
    const activeSaveDisabled = isSaveDisabled || hasUncompletedRequiredChecks;

    return (
        <div className={`step-nav-container ${className}`}>
            {/* Top horizontal progress track */}
            <div className="step-track" style={{ marginBottom: children ? "2rem" : "0" }}>
                {steps.map((step, index) => {
                    const isCompleted = completedSteps.includes(step.key);
                    const isActive = activeStep === step.key;
                    const isPending = !isCompleted && !isActive;
                    const isLast = index === steps.length - 1;

                    return (
                        <div
                            key={step.key}
                            className={`step-item ${isActive ? "active" : ""} ${isCompleted ? "completed" : ""} ${isPending ? "pending" : ""}`}
                            onClick={() => {
                                // Can navigate backwards to completed steps
                                if (isCompleted) {
                                    onStepChange(step.key);
                                    return;
                                }

                                // If user explicitly clicks the step that is immediately next
                                const immediateNextIndex = activeIndex + 1;
                                if (index === immediateNextIndex && !hasUncompletedRequiredChecks) {
                                    if (formId) {
                                        const formEl = document.getElementById(formId) as HTMLFormElement;
                                        if (formEl && formEl.requestSubmit) {
                                            formEl.requestSubmit();
                                        } else if (onNext) {
                                            onNext();
                                        } else {
                                            onStepChange(step.key);
                                        }
                                    } else if (onNext) {
                                        onNext();
                                    } else {
                                        onStepChange(step.key);
                                    }
                                }
                            }}
                        >
                            <div className="step-indicator">
                                <div className="step-number">
                                    {isCompleted ? <i className="fas fa-check"></i> : index + 1}
                                </div>
                                {!isLast && <div className="step-line"></div>}
                            </div>
                            <div className="step-content">
                                <div className="step-icon">
                                    <i className={`fas ${step.icon}`}></i>
                                </div>
                                <div className="step-text">
                                    <span className="step-label">{step.label}</span>
                                    {step.description && <span className="step-desc">{step.description}</span>}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Inner Layout Container */}
            {children && (
                <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>

                    {/* Main Children Form / Content */}
                    <div style={{ flex: 1 }}>
                        <div className="step-content-area flex flex-col gap-4">
                            {children}
                        </div>

                        {/* Action Buttons Footer */}
                        {showActions && (
                            <div className="step-actions" style={{
                                display: 'flex',
                                gap: '1rem',
                                justifyContent: 'space-between',
                                marginTop: '2rem',
                                paddingTop: "1.5rem",
                                borderTop: "1px solid #e2e8f0"
                            }}>
                                <div>
                                    {onCancel && (
                                        <Button type="button" variant="danger" onClick={onCancel} icon="times">
                                            {cancelLabel}
                                        </Button>
                                    )}
                                </div>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    {!isFirstStep && (
                                        <Button type="button" variant="secondary" onClick={onPrevious} icon="arrow-right">
                                            {previousLabel}
                                        </Button>
                                    )}

                                    {!isLastStep && (
                                        <Button
                                            type={formId ? "submit" : "button"}
                                            form={formId}
                                            variant="primary"
                                            onClick={formId ? undefined : onNext}
                                            disabled={activeNextDisabled}
                                            icon="arrow-left"
                                            iconPosition="right"
                                        >
                                            {nextLabel}
                                        </Button>
                                    )}

                                    {isLastStep && (
                                        <Button
                                            type={formId ? "submit" : "button"}
                                            form={formId}
                                            variant="primary"
                                            onClick={formId ? undefined : onSave}
                                            disabled={activeSaveDisabled || isLoading}
                                            isLoading={isLoading}
                                            icon="save"
                                        >
                                            {saveLabel}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
