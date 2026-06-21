import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { CurrencyService, CurrencyCode, ExchangeRates } from '../services/currency.service';
import { formatCurrency as formatCurrencyUtil } from '../utils/currencyFormatter';
import { AlertTriangle, X } from 'lucide-react';

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  rates: ExchangeRates | null;
  loading: boolean;
  convertPrice: (amountInUSD: number) => number;
  convertToBasePrice: (amountInActiveCurrency: number) => number;
  formatPrice: (amountInUSD: number, compact?: boolean) => string;
}

export const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>('USD');
  const [rates, setRates] = useState<ExchangeRates | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFallbackWarning, setShowFallbackWarning] = useState(false);

  useEffect(() => {
    // Load persisted currency preference
    const savedCurrency = localStorage.getItem('crate_currency') as CurrencyCode;
    if (savedCurrency && (savedCurrency === 'USD' || savedCurrency === 'IDR')) {
      setCurrencyState(savedCurrency);
    }

    // Fetch rates
    CurrencyService.getExchangeRates().then(({ rates: fetchedRates, isFallback }) => {
      setRates(fetchedRates);
      if (isFallback) {
        setShowFallbackWarning(true);
      }
      setLoading(false);
    });
  }, []);

  const setCurrency = useCallback((newCurrency: CurrencyCode) => {
    setCurrencyState(newCurrency);
    localStorage.setItem('crate_currency', newCurrency);
  }, []);

  const convertPrice = useCallback((amountInUSD: number) => {
    if (!rates) return amountInUSD; // Fallback to USD if not loaded
    return CurrencyService.convert(amountInUSD, currency, rates);
  }, [currency, rates]);

  const convertToBasePrice = useCallback((amountInActiveCurrency: number) => {
    if (!rates) return amountInActiveCurrency; // Fallback
    return CurrencyService.convertToBase(amountInActiveCurrency, currency, rates);
  }, [currency, rates]);

  const formatPrice = useCallback((amountInUSD: number, compact: boolean = false) => {
    const converted = convertPrice(amountInUSD);
    return formatCurrencyUtil(converted, currency, compact);
  }, [convertPrice, currency]);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, rates, loading, convertPrice, convertToBasePrice, formatPrice }}>
      {children}
      
      {/* Global Fallback Warning Modal */}
      {showFallbackWarning && (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5">
          <div className="bg-white/80 dark:bg-black/80 backdrop-blur-xl border border-[var(--warning)] shadow-lg rounded-xl p-4 max-w-sm flex items-start gap-3">
            <AlertTriangle className="text-[var(--warning)] shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-[var(--text-primary)]">Live Rates Unavailable</h4>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                Unable to fetch live exchange rates. Using a fallback rate (1 USD ≈ 16,240 IDR) from cache.
              </p>
            </div>
            <button 
              onClick={() => setShowFallbackWarning(false)}
              className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors p-1"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </CurrencyContext.Provider>
  );
}
