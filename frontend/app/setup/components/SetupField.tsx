import { ReactNode } from "react";
import styles from "../setup.module.css";

interface SetupFieldProps {
  id: string;
  label: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export function SetupField({ id, label, required = false, children, className = "" }: SetupFieldProps) {
  return (
    <div className={`${styles.field} ${className}`.trim()}>
      <label className={styles.fieldLabel} htmlFor={id}>
        {label}
        {required ? <span className={styles.fieldRequired} aria-hidden="true"> *</span> : null}
      </label>
      {children}
    </div>
  );
}
