interface ReadinessNoticeProps {
  tone: "critical" | "warning";
  title: string;
  messages: string[];
  helper: string;
}

export function ReadinessNotice({ tone, title, messages, helper }: ReadinessNoticeProps) {
  const toneClass = tone === "critical" ? "critical" : "warning";

  return (
    <aside className={`readiness-notice ${toneClass}`} role="status" aria-live="polite">
      <h2 className="readiness-notice-title">{title}</h2>
      <div className="readiness-notice-messages">
        {messages.map((message) => <p key={message}>{message}</p>)}
      </div>
      <p className="readiness-notice-helper">{helper}</p>
    </aside>
  );
}
