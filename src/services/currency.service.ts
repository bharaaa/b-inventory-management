export type CurrencyCode = 'USD' | 'IDR';

export interface ExchangeRates {
  [key: string]: number;
}

export interface RateResponse {
  rates: ExchangeRates;
  lastUpdated: number;
}

const CACHE_KEY = 'crate_exchange_rates';
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours
const FALLBACK_RATES: ExchangeRates = {
  USD: 1,
  IDR: 16240.0, // Hardcoded fallback rate
};

export const CurrencyService = {
  /**
   * Fetches the latest exchange rates from open.er-api.com, falling back to cache or hardcoded values.
   * @returns { rates, isFallback }
   */
  async getExchangeRates(): Promise<{ rates: ExchangeRates; isFallback: boolean }> {
    // 1. Check Cache
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const parsed: RateResponse = JSON.parse(cached);
        const age = Date.now() - parsed.lastUpdated;
        if (age < CACHE_DURATION_MS) {
          return { rates: parsed.rates, isFallback: false };
        }
      } catch (e) {
        console.warn('Failed to parse cached exchange rates', e);
      }
    }

    // 2. Fetch fresh rates
    try {
      const response = await fetch('https://open.er-api.com/v6/latest/USD');
      if (!response.ok) throw new Error('API response not OK');
      
      const data = await response.json();
      if (!data.rates || !data.rates.IDR) throw new Error('Invalid API payload');

      const ratesToCache: RateResponse = {
        rates: data.rates,
        lastUpdated: Date.now()
      };
      
      localStorage.setItem(CACHE_KEY, JSON.stringify(ratesToCache));
      return { rates: data.rates, isFallback: false };
      
    } catch (error) {
      console.error('Failed to fetch exchange rates, using fallback:', error);
      
      // Try to use expired cache if available, otherwise use hardcoded fallback
      if (cached) {
        try {
          const parsed: RateResponse = JSON.parse(cached);
          return { rates: parsed.rates, isFallback: true };
        } catch (e) {
          // ignore
        }
      }

      return { rates: FALLBACK_RATES, isFallback: true };
    }
  },

  /**
   * Converts an amount from USD (Base) to the target currency.
   */
  convert(amountInUSD: number, targetCurrency: CurrencyCode, rates: ExchangeRates): number {
    if (targetCurrency === 'USD') return amountInUSD;
    const rate = rates[targetCurrency] || FALLBACK_RATES[targetCurrency];
    return amountInUSD * rate;
  },

  /**
   * Converts an amount from a target currency back to USD (Base).
   */
  convertToBase(amountInTarget: number, sourceCurrency: CurrencyCode, rates: ExchangeRates): number {
    if (sourceCurrency === 'USD') return amountInTarget;
    const rate = rates[sourceCurrency] || FALLBACK_RATES[sourceCurrency];
    return amountInTarget / rate;
  }
};
