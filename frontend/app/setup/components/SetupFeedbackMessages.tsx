interface SetupFeedbackMessagesProps {
  staleMessage?: string;
  draftMessage?: string;
  errorMessage?: string | null;
  fieldErrors?: Record<string, string[]> | undefined;
  fieldErrorsTitle: string;
  fieldLabels?: Record<string, string>;
  onFocusField?: (field: string) => void;
}

export function SetupFeedbackMessages({
  staleMessage,
  draftMessage,
  errorMessage,
  fieldErrors = {},
  fieldErrorsTitle,
  fieldLabels = {},
  onFocusField,
}: SetupFeedbackMessagesProps) {
  const fields = Object.entries(fieldErrors).flatMap(([field, messages]) =>
    messages.map((message) => ({ field, message })),
  );

  return (
    <>
      {staleMessage ? <div className="setup-stale-banner" role="alert" aria-live="assertive">{staleMessage}</div> : null}
      {draftMessage ? <div className="setup-draft-banner" role="status" aria-live="polite">{draftMessage}</div> : null}
      {errorMessage ? <div className="setup-error-banner" role="alert" aria-live="assertive">{errorMessage}</div> : null}
      {fields.length > 0 ? (
        <section
          id="setup-field-error-summary"
          className="setup-error-summary"
          role="alert"
          aria-live="assertive"
          aria-labelledby="setup-field-error-title"
          tabIndex={-1}
        >
          <h2 id="setup-field-error-title">{fieldErrorsTitle}</h2>
          <ul>
            {fields.map(({ field, message }, index) => (
              <li key={`${field}-${index}`}>
                <button type="button" onClick={() => onFocusField?.(field)}>
                  <strong>{fieldLabels[field] ?? field}:</strong> {message}
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}
