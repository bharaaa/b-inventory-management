import React, { useState, useRef, useEffect } from "react";
import { useCurrency } from "../../hooks/useCurrency";
import { CurrencyCode } from "../../services/currency.service";
import { ChevronDown, DollarSign, Wallet } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const currencies: { code: CurrencyCode; label: string; icon: string }[] = [
  { code: "USD", label: "US Dollar", icon: "🇺🇸" },
  { code: "IDR", label: "Indonesian Rupiah", icon: "🇮🇩" },
];

export default function CurrencySelector({
  collapsed,
}: {
  collapsed?: boolean;
}) {
  const { currency, setCurrency, loading, rates } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedCurrency =
    currencies.find((c) => c.code === currency) || currencies[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className={`flex items-center w-full rounded-xl py-2 px-3 text-sm font-medium transition-all duration-200 bg-white/40 dark:bg-black/20 hover:bg-white/60 dark:hover:bg-white/10 text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)] shadow-sm cursor-pointer ${
          collapsed ? "justify-center px-0" : "justify-between"
        } ${loading ? "opacity-50 cursor-wait" : ""}`}
        title={collapsed ? `Currency: ${currency}` : undefined}
      >
        <div className="flex items-center gap-3">
          {collapsed ? (
            <span className="text-base">{selectedCurrency.icon}</span>
          ) : (
            <>
              <Wallet size={16} className="text-[var(--text-tertiary)]" />
              <div className="flex items-center gap-1.5">
                <span>{selectedCurrency.icon}</span>
                <span>{currency}</span>
              </div>
            </>
          )}
        </div>
        {!collapsed && (
          <ChevronDown
            size={14}
            className={`text-[var(--text-tertiary)] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-0 mb-2 w-full min-w-[160px] bg-white/80 dark:bg-black/80 backdrop-blur-xl border border-[var(--border)] rounded-xl shadow-lg overflow-hidden z-50"
          >
            <div className="p-1 flex flex-col">
              {currencies.map((c) => (
                <button
                  key={c.code}
                  onClick={() => {
                    setCurrency(c.code);
                    setIsOpen(false);
                  }}
                  className={`flex items-center gap-2 w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                    currency === c.code
                      ? "bg-[var(--accent)]/15 text-[var(--accent)] font-medium"
                      : "text-[var(--text-secondary)] hover:bg-white hover:dark:bg-white/10 hover:text-[var(--text-primary)]"
                  }`}
                >
                  <span>{c.icon}</span>
                  <span>
                    {c.code} - {c.label}
                  </span>
                </button>
              ))}
              <div className="mt-1 pt-1.5 border-t border-[var(--border)] px-3 py-1 flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--success)] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--success)]"></span>
                </span>
                <div className="flex flex-col">
                  <span className="text-[11px] text-[var(--text-secondary)] font-medium">
                    Using live exchange rates
                  </span>
                  {rates?.IDR && (
                    <span className="text-[10px] text-[var(--text-tertiary)] mt-0.5">
                      1 USD = Rp {rates.IDR.toLocaleString('id-ID', { maximumFractionDigits: 0 })}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
