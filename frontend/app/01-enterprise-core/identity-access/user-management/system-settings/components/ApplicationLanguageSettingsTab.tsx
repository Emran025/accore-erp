'use client';

import { catalogText, getLocaleRegistry, type SupportedLocale, useI18n } from '@/lib/i18n';

export function ApplicationLanguageSettingsTab() {
  const { locale, metadata, setLocale, t: i18n } = useI18n();
  const locales = Object.values(getLocaleRegistry());

  return (
    <section
      className="sales-card application-language-settings"
      aria-labelledby="application-language-title"
    >
      <header className="application-language-settings-header">
        <div>
          <span className="application-language-settings-eyebrow">
            {i18n.catalog['enterpriseCore.systemSettings.applicationLanguage']}
          </span>
          <h3 id="application-language-title">
            {i18n.catalog['enterpriseCore.systemSettings.applicationLanguageTitle']}
          </h3>
          <p>{i18n.catalog['enterpriseCore.systemSettings.applicationLanguageDescription']}</p>
        </div>
        <div className="application-language-current" dir={metadata.direction}>
          <span>{i18n.catalog['enterpriseCore.systemSettings.currentLanguage']}</span>
          <strong>{metadata.nativeName}</strong>
        </div>
      </header>

      <div
        className="application-language-choice-grid"
        role="list"
        aria-label={i18n.catalog['enterpriseCore.systemSettings.availableLanguages']}
      >
        {locales.map((candidate) => {
          const active = candidate.code === locale;
          return (
            <button
              key={candidate.code}
              type="button"
              className={`application-language-choice ${active ? 'is-active' : ''}`}
              aria-pressed={active}
              onClick={() => setLocale(candidate.code as SupportedLocale)}
              dir={candidate.direction}
            >
              <span className="application-language-choice-native">{candidate.nativeName}</span>
              <span className="application-language-choice-name">{candidate.displayName}</span>
              <span className="application-language-choice-direction">
                {candidate.direction.toUpperCase()}
              </span>
              <span className="application-language-choice-status">
                {active
                  ? i18n.catalog['enterpriseCore.systemSettings.activeLanguage']
                  : catalogText(i18n, 'enterpriseCore.systemSettings.useLanguage', {
                      value0: candidate.nativeName,
                    })}
              </span>
            </button>
          );
        })}
      </div>

      <p className="application-language-boundary">
        {i18n.catalog['enterpriseCore.systemSettings.applicationLanguageBoundary']}
      </p>
    </section>
  );
}
