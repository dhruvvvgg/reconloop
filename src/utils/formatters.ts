/**
 * ReconLoop - Currency & Financial Formatting Utilities
 * Standardized across the entire application with Indian numbering rules.
 */

export const RUPEE = '\u20B9';

export const formatINR = (val: number | undefined | null, exactDecimals: boolean = false): string => {
  if (val === undefined || val === null || isNaN(val)) return `${RUPEE}0`;
  
  const isWhole = Math.abs(val % 1) < 0.001;
  const decimals = exactDecimals || !isWhole ? 2 : 0;

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(val);
};

export const formatINRCompact = (val: number | undefined | null): string => {
  if (val === undefined || val === null || isNaN(val)) return `${RUPEE}0`;
  const abs = Math.abs(val);
  const sign = val < 0 ? '-' : '';

  if (abs >= 10000000) {
    return `${sign}${RUPEE}${(abs / 10000000).toFixed(2)} Cr`;
  }
  if (abs >= 100000) {
    return `${sign}${RUPEE}${(abs / 100000).toFixed(2)} L`;
  }
  if (abs >= 1000) {
    return `${sign}${RUPEE}${(abs / 1000).toFixed(1)}k`;
  }
  return formatINR(val, false);
};

export const formatPercent = (val: number, decimals: number = 1): string => {
  return `${(val * 100).toFixed(decimals)}%`;
};
