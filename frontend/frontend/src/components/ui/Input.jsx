import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef(
  ({ label, error, hint, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-surface-700 mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full px-4 py-2.5",
            "rounded-xl",
            "border bg-white",
            "text-surface-800",
            "placeholder:text-surface-400",
            "transition-all duration-200",
            // Focus state
            "focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400",
            // Error vs normal state
            error
              ? "border-error-500 focus:ring-error-500/20 focus:border-error-500"
              : "border-surface-300 hover:border-surface-400",
            className
          )}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? `${props.id}-error` : hint ? `${props.id}-hint` : undefined}
          {...props}
        />
        {error && (
          <p
            id={`${props.id}-error`}
            className="mt-1.5 text-sm text-error-500 flex items-center gap-1"
          >
            {error}
          </p>
        )}
        {hint && !error && (
          <p
            id={`${props.id}-hint`}
            className="mt-1.5 text-sm text-surface-500"
          >
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";