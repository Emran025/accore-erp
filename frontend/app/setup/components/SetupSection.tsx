import { ReactNode } from "react";
import styles from "../setup.module.css";

interface SetupSectionProps {
  id: string;
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
}

export function SetupSection({ id, title, description, children, className = "" }: SetupSectionProps) {
  return (
    <section className={`${styles.section} ${className}`.trim()} aria-labelledby={`${id}-title`}>
      <header className={styles.sectionHeader}>
        <h2 id={`${id}-title`} className={styles.sectionTitle}>{title}</h2>
        <p className={styles.sectionDescription}>{description}</p>
      </header>
      {children}
    </section>
  );
}
