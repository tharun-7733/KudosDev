import React from 'react';
import { Check } from 'lucide-react';

/**
 * StepWizard - A multi-step form container with progress indicator
 * Following Swiss Utility design: minimal, functional, monochrome with signal color
 */
export const StepWizard = ({
    steps,
    currentStep,
    children
}) => {
    return (
        <div className="w-full">
            {/* Progress Indicator */}
            <div className="mb-8">
                <div className="flex items-center justify-between relative">
                    {/* Progress Line Background */}
                    <div className="absolute top-5 left-0 right-0 h-0.5 bg-border" />

                    {/* Progress Line Active */}
                    <div
                        className="absolute top-5 left-0 h-0.5 bg-accent transition-all duration-500"
                        style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                    />

                    {/* Step Circles */}
                    {steps.map((step, index) => {
                        const stepNumber = index + 1;
                        const isCompleted = stepNumber < currentStep;
                        const isActive = stepNumber === currentStep;

                        return (
                            <div
                                key={step.id}
                                className="relative z-10 flex flex-col items-center"
                            >
                                {/* Circle */}
                                <div
                                    className={`
                                        w-10 h-10 rounded-full flex items-center justify-center
                                        font-mono text-sm font-medium
                                        transition-all duration-300
                                        ${isCompleted
                                            ? 'bg-accent text-accent-foreground'
                                            : isActive
                                                ? 'bg-primary text-primary-foreground ring-4 ring-accent/20'
                                                : 'bg-muted text-muted-foreground'
                                        }
                                    `}
                                >
                                    {isCompleted ? (
                                        <Check className="w-5 h-5" />
                                    ) : (
                                        stepNumber
                                    )}
                                </div>

                                {/* Label */}
                                <div className="mt-2 text-center">
                                    <span
                                        className={`
                                            text-xs font-mono uppercase tracking-wider
                                            ${isActive
                                                ? 'text-foreground'
                                                : 'text-muted-foreground'
                                            }
                                        `}
                                    >
                                        {step.label}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Step Content */}
            <div className="min-h-[400px]">
                {children}
            </div>
        </div>
    );
};

/**
 * StepNavigation - Footer buttons for wizard navigation
 */
export const StepNavigation = ({
    currentStep,
    totalSteps,
    onBack,
    onNext,
    onSaveDraft,
    onPublish,
    isLoading = false,
    canProceed = true
}) => {
    const isFirstStep = currentStep === 1;
    const isLastStep = currentStep === totalSteps;

    return (
        <div className="flex items-center justify-between pt-8 mt-8 border-t border-border">
            <div>
                {!isFirstStep && (
                    <button
                        type="button"
                        onClick={onBack}
                        disabled={isLoading}
                        className="
                            px-4 py-2 rounded-md font-medium
                            text-muted-foreground hover:text-foreground
                            hover:bg-muted transition-colors
                            disabled:opacity-50 disabled:cursor-not-allowed
                        "
                    >
                        ← Back
                    </button>
                )}
            </div>

            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={onSaveDraft}
                    disabled={isLoading}
                    className="
                        px-4 py-2 rounded-md font-medium
                        border border-border
                        text-foreground hover:bg-muted
                        transition-colors
                        disabled:opacity-50 disabled:cursor-not-allowed
                    "
                >
                    Save Draft
                </button>

                {isLastStep ? (
                    <button
                        type="button"
                        onClick={onPublish}
                        disabled={isLoading || !canProceed}
                        className="
                            px-6 py-2 rounded-md font-medium
                            bg-accent text-accent-foreground
                            hover:bg-accent/90
                            active:scale-95 transition-all
                            disabled:opacity-50 disabled:cursor-not-allowed
                            inline-flex items-center gap-2
                        "
                    >
                        {isLoading ? (
                            <>
                                <span className="w-4 h-4 border-2 border-accent-foreground border-t-transparent rounded-full animate-spin" />
                                Publishing...
                            </>
                        ) : (
                            '🚀 Publish Project'
                        )}
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={onNext}
                        disabled={isLoading || !canProceed}
                        className="
                            px-6 py-2 rounded-md font-medium
                            bg-primary text-primary-foreground
                            hover:bg-primary/90
                            active:scale-95 transition-all
                            disabled:opacity-50 disabled:cursor-not-allowed
                        "
                    >
                        Continue →
                    </button>
                )}
            </div>
        </div>
    );
};
