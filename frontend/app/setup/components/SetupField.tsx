import { cloneElement, isValidElement, ReactElement, ReactNode } from "react";

interface SetupFieldProps {
  id: string;
  label: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
  error?: string;
}

export function SetupField({ id, label, required = false, children, className = "", error }: SetupFieldProps) {
  const errorId = `${id}-error`;
  const control = isValidElement(children)
    ? cloneElement(children as ReactElement<Record<string, unknown>>, {
      id: typeof (children.props as Record<string, unknown>).id === "string" ? (children.props as Record<string, unknown>).id : id,
      "aria-invalid": error ? true : undefined,
      "aria-describedby": error ? errorId : undefined,
    })
    : children;

  return (
    <div className={`form-group setup-field ${className}`.trim()}>
      <label htmlFor={id} id={`${id}-label`}>
        {label}
        {required ? <span className="setup-required" aria-hidden="true"> *</span> : null}
      </label>
      <div role="group" aria-labelledby={`${id}-label`} aria-invalid={error ? true : undefined} aria-describedby={error ? errorId : undefined}>
        {control}
      </div>
      {error ? <p id={errorId} className="setup-field-error" role="alert" aria-live="assertive">{error}</p> : null}
    </div>
  );
}
