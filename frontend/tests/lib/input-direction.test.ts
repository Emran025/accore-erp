import { describe, expect, it } from 'vitest';
import { getTextDirection } from '@/lib/utils';

describe('getTextDirection', () => {
  it('uses the first strong RTL character for Arabic, Persian, and Hebrew input', () => {
    expect(getTextDirection('شركة أكور')).toBe('rtl');
    expect(getTextDirection('شرکت اکور')).toBe('rtl');
    expect(getTextDirection('חברת אקור')).toBe('rtl');
  });

  it('uses LTR for Latin and other left-to-right alphabets', () => {
    expect(getTextDirection('ACCORE ERP', 'rtl')).toBe('ltr');
    expect(getTextDirection('日本語', 'rtl')).toBe('ltr');
  });

  it('preserves the requested fallback while the input contains only structured characters', () => {
    expect(getTextDirection('2026-01-01', 'rtl')).toBe('rtl');
    expect(getTextDirection('1000', 'ltr')).toBe('ltr');
  });
});
