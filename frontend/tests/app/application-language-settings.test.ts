import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = path.resolve(__dirname, '../..');
const source = (relativePath: string) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('application language settings', () => {
  it('exposes the current supported locales through the primary System Settings screen', () => {
    const page = source(
      'app/01-enterprise-core/identity-access/user-management/system-settings/(pages)/page.tsx'
    );
    const tab = source(
      'app/01-enterprise-core/identity-access/user-management/system-settings/components/ApplicationLanguageSettingsTab.tsx'
    );

    expect(page).toMatch(/key:\s*['"]language['"]/);
    expect(page).toContain('<ApplicationLanguageSettingsTab />');
    expect(tab).toContain('getLocaleRegistry');
    expect(tab).toContain('setLocale(candidate.code as SupportedLocale)');
    expect(tab).toContain('applicationLanguageBoundary');
  });

  it('keeps company-code language distinct from the interface language and links the top-bar settings control', () => {
    const tab = source(
      'app/01-enterprise-core/identity-access/user-management/system-settings/components/ApplicationLanguageSettingsTab.tsx'
    );
    const globalMeta = source('components/navigation/TopGlobalBar/components/GlobalMeta.tsx');

    expect(tab).toContain('applicationLanguageBoundary');
    expect(globalMeta).toMatch(
      /router\.push\(['"]\/01-enterprise-core\/identity-access\/user-management\/system-settings['"]\)/
    );
  });
});
