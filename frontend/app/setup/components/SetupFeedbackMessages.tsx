interface SetupFeedbackMessagesProps {
  staleMessage?: string;
  draftMessage?: string;
  errorMessage?: string | null;
}

export function SetupFeedbackMessages({ staleMessage, draftMessage, errorMessage }: SetupFeedbackMessagesProps) {
  return (
    <>
      {staleMessage ? <div className="setup-stale-banner" role="alert" aria-live="assertive">{staleMessage}</div> : null}
      {draftMessage ? <div className="setup-draft-banner" role="status" aria-live="polite">{draftMessage}</div> : null}
      {errorMessage ? <div className="setup-error-banner" role="alert" aria-live="assertive">{errorMessage}</div> : null}
    </>
  );
}
