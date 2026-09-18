import type { UserPreferences } from '../services/portfolio/types';

export type Currency = UserPreferences['currency'];

/**
 * Returns the symbol corresponding to a currency code.
 */
export const getCurrencySymbol = (currency?: string): string => {
  switch (currency) {
    case 'USD':
      return '$';
    case 'EUR':
      return '€';
    case 'TRY':
    default:
      return '₺';
  }
};

/**
 * Returns locale string for a currency code.
 */
export const getCurrencyLocale = (currency?: string): string => {
  switch (currency) {
    case 'USD':
      return 'en-US';
    case 'EUR':
      return 'de-DE';
    case 'TRY':
    default:
      return 'tr-TR';
  }
};

/**
 * Formats a user input string into thousands-separated currency format
 * according to the selected currency convention:
 * - USD: comma (,) for thousands, dot (.) for decimals (e.g. 250,000.50)
 * - TRY / EUR: dot (.) for thousands, comma (,) for decimals (e.g. 250.000,50)
 */
export const formatCurrencyInput = (value: string | number, currency: string = 'TRY'): string => {
  if (value === undefined || value === null) return '';
  const strVal = String(value).trim();
  if (!strVal) return '';

  const isUSD = currency === 'USD';

  if (isUSD) {
    // For USD, decimal separator is dot (.). If user typed comma at the end as decimal, accept it as dot.
    let normalized = strVal;
    // Replace any non-digit, non-period, non-comma chars
    normalized = normalized.replace(/[^\d.,]/g, '');

    // If there's a comma that looks like a decimal (e.g. only one comma and no dot)
    if (normalized.includes(',') && !normalized.includes('.')) {
      // If user typed comma at end or as fractional separator
      const parts = normalized.split(',');
      if (parts.length === 2 && parts[1].length <= 2) {
        normalized = `${parts[0]}.${parts[1]}`;
      } else {
        // remove commas as they were thousand separators
        normalized = normalized.replace(/,/g, '');
      }
    } else {
      normalized = normalized.replace(/,/g, '');
    }

    const dotIndex = normalized.indexOf('.');
    let integerRaw = '';
    let decimalRaw: string | null = null;

    if (dotIndex !== -1) {
      integerRaw = normalized.slice(0, dotIndex).replace(/\D/g, '');
      decimalRaw = normalized.slice(dotIndex + 1).replace(/\D/g, '').slice(0, 2);
    } else {
      integerRaw = normalized.replace(/\D/g, '');
    }

    if (!integerRaw && decimalRaw === null) return '';

    const num = integerRaw ? parseInt(integerRaw, 10) : 0;
    const formattedInt = isNaN(num) ? '' : num.toLocaleString('en-US');

    if (decimalRaw !== null) {
      return `${formattedInt}.${decimalRaw}`;
    }
    return formattedInt;
  }

  // For TRY and EUR: thousands separator is dot (.), decimal separator is comma (,)
  let normalized = strVal.replace(/[^\d.,]/g, '');

  // If user typed dot on numpad as decimal point (e.g. "12.5" or "12.")
  if (normalized.includes('.') && !normalized.includes(',')) {
    const parts = normalized.split('.');
    if (parts.length === 2 && parts[1].length <= 2) {
      normalized = `${parts[0]},${parts[1]}`;
    } else {
      // Treat multiple dots as existing thousand separators
      normalized = normalized.replace(/\./g, '');
    }
  } else {
    // Remove dots as they are thousand separators
    normalized = normalized.replace(/\./g, '');
  }

  const commaIndex = normalized.indexOf(',');
  let integerRaw = '';
  let decimalRaw: string | null = null;

  if (commaIndex !== -1) {
    integerRaw = normalized.slice(0, commaIndex).replace(/\D/g, '');
    decimalRaw = normalized.slice(commaIndex + 1).replace(/\D/g, '').slice(0, 2);
  } else {
    integerRaw = normalized.replace(/\D/g, '');
  }

  if (!integerRaw && decimalRaw === null) return '';

  const num = integerRaw ? parseInt(integerRaw, 10) : 0;
  const formattedInt = isNaN(num) ? '' : num.toLocaleString(getCurrencyLocale(currency));

  if (decimalRaw !== null) {
    return `${formattedInt},${decimalRaw}`;
  }
  return formattedInt;
};

/**
 * Parses a thousands-separated currency string back to a numeric float value.
 */
export const parseCurrencyInput = (formattedVal: string | number, currency: string = 'TRY'): number => {
  if (formattedVal === undefined || formattedVal === null) return 0;
  const str = String(formattedVal).trim();
  if (!str) return 0;

  if (currency === 'USD') {
    // In USD, comma is thousand separator, dot is decimal
    const clean = str.replace(/,/g, '');
    const parsed = parseFloat(clean);
    return isNaN(parsed) ? 0 : parsed;
  }

  // In TRY and EUR, dot is thousand separator, comma is decimal
  const clean = str.replace(/\./g, '').replace(',', '.');
  const parsed = parseFloat(clean);
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Formats a number according to currency locale conventions.
 */
export const formatCurrencyAmount = (
  amount: number,
  currency: string = 'TRY',
  decimals: number = 2
): string => {
  const locale = getCurrencyLocale(currency);
  return amount.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};
