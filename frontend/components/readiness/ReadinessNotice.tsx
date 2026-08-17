import styles from "./ReadinessNotice.module.css";

interface ReadinessNoticeProps {
  tone: "critical" | "warning";
  title: string;
  messages: string[];
  helper: string;
}

export function ReadinessNotice({ tone, title, messages, helper }: ReadinessNoticeProps) {
  const toneClass = tone === "critical" ? styles.critical : styles.warning;

  return (
    <aside className={`${styles.notice} ${toneClass}`} role="status" aria-live="polite">
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.messages}>
        {messages.map((message) => <p key={message}>{message}</p>)}
      </div>
      <p className={styles.helper}>{helper}</p>
    </aside>
  );
}
