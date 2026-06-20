import { motion, AnimatePresence } from 'framer-motion';
import { X, DollarSign, Package } from 'lucide-react';

export default function TotalValueDrawer({ isOpen, onClose, items }) {
  // Calculate values
  const grandTotal = items.reduce((sum, item) => sum + (item.stock_count * (item.price || 0)), 0);
  
  // Sort items by total value descending
  const sortedItems = [...items].sort((a, b) => {
    const valueA = a.stock_count * (a.price || 0);
    const valueB = b.stock_count * (b.price || 0);
    return valueB - valueA;
  });

  const formattedGrandTotal = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(grandTotal);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-[var(--bg-primary)] shadow-2xl border-l border-[var(--border)] z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[var(--border)] bg-[var(--bg-card)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--success)]/10 flex items-center justify-center flex-shrink-0 text-[var(--success)]">
                  <DollarSign size={20} strokeWidth={2} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[var(--text-primary)] tracking-tight">
                    Value Breakdown
                  </h2>
                  <p className="text-sm text-[var(--text-tertiary)]">
                    Total Warehouse Value
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Grand Total Summary */}
            <div className="p-6 border-b border-[var(--border)] bg-[var(--bg-card)]">
              <div className="bg-[var(--bg-primary)] rounded-xl p-5 border border-[var(--border)] flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--text-secondary)]">Grand Total</p>
                  <p className="text-3xl font-bold text-[var(--text-primary)] tracking-tight mt-1">
                    {formattedGrandTotal}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-[var(--success)]/10 flex items-center justify-center text-[var(--success)]">
                  <DollarSign size={24} strokeWidth={2.5} />
                </div>
              </div>
            </div>

            {/* Content List */}
            <div className="flex-1 overflow-y-auto p-6">
              <h3 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-4">
                Value by Item
              </h3>
              
              {sortedItems.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-2xl bg-[var(--bg-secondary)] flex items-center justify-center mx-auto mb-4 text-[var(--text-tertiary)]">
                    <Package size={28} />
                  </div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">No items found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sortedItems.map((item) => {
                    const price = item.price || 0;
                    const stock = item.stock_count || 0;
                    const totalItemValue = price * stock;
                    const percentage = grandTotal > 0 ? ((totalItemValue / grandTotal) * 100).toFixed(1) : 0;

                    const formattedPrice = new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    }).format(price);

                    const formattedTotal = new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                      maximumFractionDigits: 0,
                    }).format(totalItemValue);

                    return (
                      <div 
                        key={item.id}
                        className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4 flex flex-col gap-3"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            {item.image_url ? (
                              <img
                                src={item.image_url}
                                alt={item.name}
                                className="w-10 h-10 rounded-lg object-cover bg-[var(--bg-secondary)] border border-[var(--border)] shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center justify-center shrink-0">
                                <Package size={16} className="text-[var(--text-tertiary)]" />
                              </div>
                            )}
                            <div>
                              <h3 className="text-sm font-medium text-[var(--text-primary)] line-clamp-1">{item.name}</h3>
                              <p className="text-xs text-[var(--text-tertiary)] mt-0.5">SKU: {item.sku}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-[var(--text-primary)]">{formattedTotal}</p>
                            <p className="text-xs font-medium text-[var(--success)] mt-0.5">{percentage}% of total</p>
                          </div>
                        </div>

                        {/* Calculation Breakdown */}
                        <div className="flex items-center justify-between text-xs px-3 py-2 bg-[var(--bg-primary)] rounded-lg border border-[var(--border)]">
                          <span className="text-[var(--text-secondary)]">
                            <span className="font-semibold text-[var(--text-primary)]">{stock}</span> units
                          </span>
                          <X size={12} className="text-[var(--text-tertiary)] mx-2" />
                          <span className="text-[var(--text-secondary)]">
                            <span className="font-semibold text-[var(--text-primary)]">{formattedPrice}</span> / unit
                          </span>
                          <span className="text-[var(--text-tertiary)] mx-2">=</span>
                          <span className="font-semibold text-[var(--text-primary)]">{formattedTotal}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
