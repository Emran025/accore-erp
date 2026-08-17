import { ReactNode } from "react";

interface SetupFieldProps {
  id: string;
  label: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export function SetupField({ id, label, required = false, children, className = "" }: SetupFieldProps) {
  return (
    <div className={`form-group setup-field ${className}`.trim()}>
      <label htmlFor={id}>
        {label}
        {required ? <span className="setup-required" aria-hidden="true"> *</span> : null}
      </label>
      {children}
    </div>
  );
}
