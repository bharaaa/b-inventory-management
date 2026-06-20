import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, ArrowRight, Package } from 'lucide-react';

export default function LowStockDrawer({ isOpen, onClose, lowStockItems, onViewItem }) {
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
            className="fixed inset-0 bg-black/20 backdrop-blur-md z-50"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-4 right-4 bottom-4 w-[calc(100%-2rem)] sm:w-[480px] bg-white/70 backdrop-blur-2xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] border border-[var(--border)] rounded-3xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[var(--border)] bg-white/40 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--error)]/10 flex items-center justify-center flex-shrink-0 text-[var(--error)]">
                  <AlertTriangle size={20} strokeWidth={2} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[var(--text-primary)] tracking-tight">
                    Low Stock Alerts
                  </h2>
                  <p className="text-sm text-[var(--text-tertiary)]">
                    Items requiring immediate attention
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/40 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content List */}
            <div className="flex-1 overflow-y-auto p-6">
              {lowStockItems.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-2xl bg-[var(--success)]/10 flex items-center justify-center mx-auto mb-4 text-[var(--success)]">
                    <Package size={28} />
                  </div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">All stock levels are healthy</p>
                  <p className="text-sm text-[var(--text-tertiary)] mt-1">No items are currently below the threshold.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {lowStockItems.map((item) => (
                    <div 
                      key={item.id}
                      className="bg-white/50 backdrop-blur-sm border border-[var(--border)] rounded-xl p-4 flex items-center justify-between hover:border-[var(--border-hover)] transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-12 h-12 rounded-lg object-cover bg-white/30 border border-[var(--border)]"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-white/30 backdrop-blur-sm border border-[var(--border)] flex items-center justify-center">
                            <Package size={20} className="text-[var(--text-tertiary)]" />
                          </div>
                        )}
                        <div>
                          <h3 className="text-sm font-medium text-[var(--text-primary)] line-clamp-1">{item.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-semibold text-[var(--error)] bg-[var(--error)]/10 px-2 py-0.5 rounded-md">
                              {item.stock_count} in stock
                            </span>
                            <span className="text-xs text-[var(--text-tertiary)]">
                              SKU: {item.sku}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => onViewItem(item)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] bg-white/30 backdrop-blur-sm hover:bg-white/50 hover:text-[var(--text-primary)] rounded-lg transition-colors cursor-pointer shrink-0 ml-4"
                      >
                        View Product
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
