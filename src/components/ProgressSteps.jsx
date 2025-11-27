import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const ProgressSteps = ({ currentStep, steps }) => {
  return (
    <div className="w-full py-8">
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center flex-1 relative">
            <div
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all",
                index < currentStep
                  ? "bg-primary border-primary text-primary-foreground"
                  : index === currentStep
                  ? "bg-primary/20 border-primary text-primary animate-pulse"
                  : "bg-card border-border text-muted-foreground"
              )}
            >
              {index < currentStep ? (
                <Check className="w-6 h-6" />
              ) : (
                step.icon
              )}
            </div>
            <p
              className={cn(
                "mt-2 text-sm font-medium text-center",
                index <= currentStep
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {step.label}
            </p>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "absolute h-0.5 w-24 mt-6 -ml-24",
                  index < currentStep ? "bg-primary" : "bg-border"
                )}
                style={{ left: "50%", transform: "translateX(50%)" }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
