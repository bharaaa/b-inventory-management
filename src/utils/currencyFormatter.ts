import { CurrencyCode } from '../services/currency.service';

export const formatCurrency = (
  amount: number,
  currency: CurrencyCode,
  compact: boolean = false,
  hideDecimalsForLargeValues: boolean = true
): string => {
  // Determine if we should show decimals
  // For IDR, it's common to hide decimals entirely.
  // For USD, if it's compact and large (e.g. $12.5k), we usually hide them unless needed.
  let fractionDigits = currency === 'IDR' ? 0 : 2;
  
  if (currency === 'USD' && hideDecimalsForLargeValues && amount >= 1000 && amount % 1 === 0) {
    fractionDigits = 0;
  }

  const formatter = new Intl.NumberFormat(currency === 'IDR' ? 'id-ID' : 'en-US', {
    style: 'currency',
    currency: currency,
    notation: compact ? 'compact' : 'standard',
    compactDisplay: 'short',
    minimumFractionDigits: compact ? 0 : fractionDigits,
    maximumFractionDigits: fractionDigits,
  });

  return formatter.format(amount);
};
