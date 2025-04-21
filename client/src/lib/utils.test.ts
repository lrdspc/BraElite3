import { describe, it, expect } from 'vitest';
import { formatDate, formatTime, formatDateTime, formatDocumentNumber, formatPhoneNumber } from './utils';

describe('Date formatting utilities', () => {
  it('should format date correctly', () => {
    const testDate = new Date('2025-04-21T10:30:00');
    expect(formatDate(testDate)).toBe('21/04/2025');

    // Test with undefined
    expect(formatDate(undefined)).toBe('');
  });

  it('should format time correctly', () => {
    const testDate = new Date('2025-04-21T10:30:00');
    expect(formatTime(testDate)).toBe('10:30');

    // Test with undefined
    expect(formatTime(undefined)).toBe('');
  });

  it('should format date and time together correctly', () => {
    const testDate = new Date('2025-04-21T10:30:00');
    expect(formatDateTime(testDate)).toBe('21/04/2025, 10:30');

    // Test with undefined
    expect(formatDateTime(undefined)).toBe('');
  });
});

describe('Document formatting utilities', () => {
  it('should format CPF correctly', () => {
    expect(formatDocumentNumber('12345678901')).toBe('123.456.789-01');
  });

  it('should format CNPJ correctly', () => {
    expect(formatDocumentNumber('12345678000190')).toBe('12.345.678/0001-90');
  });

  it('should handle undefined or invalid documents', () => {
    expect(formatDocumentNumber(undefined)).toBe('');
    expect(formatDocumentNumber('123')).toBe('123');
  });
});

describe('Phone formatting utilities', () => {
  it('should format mobile phone numbers correctly', () => {
    expect(formatPhoneNumber('11987654321')).toBe('(11) 98765-4321');
  });

  it('should format landline phone numbers correctly', () => {
    expect(formatPhoneNumber('1134567890')).toBe('(11) 3456-7890');
  });

  it('should handle undefined or invalid phone numbers', () => {
    expect(formatPhoneNumber(undefined)).toBe('');
    expect(formatPhoneNumber('123')).toBe('123');
  });
});
