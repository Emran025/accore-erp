import { ReactNode } from "react";

interface SetupSectionProps {
  id: string;
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
}

export function SetupSection({ id, title, description, children, className = "" }: SetupSectionProps) {
  return (
    <section className={`sales-card setup-section ${className}`.trim()} aria-labelledby={`${id}-title`}>
      <header className="setup-section-header">
        <h3 id={`${id}-title`}>{title}</h3>
        <p className="setup-section-description">{description}</p>
      </header>
      {children}
    </section>
  );
}
