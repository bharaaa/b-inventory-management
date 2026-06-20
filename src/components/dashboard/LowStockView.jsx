import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, ArrowRight, Package } from 'lucide-react';

export default function LowStockView({ isOpen, onClose, lowStockItems, onViewItem }) {
  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border)] bg-white/60 backdrop-blur-sm shadow-[0_1px_0_rgba(0,0,0,0.05)] relative z-10">
        <h2 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">
          Low Stock Alerts
        </h2>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-black/[0.02] hover:bg-black/[0.04] backdrop-blur-sm text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-all duration-200 border border-[var(--border)] cursor-pointer"
        >
          <X size={20} />
        </button>
      </div>

      {/* Content List */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
        {lowStockItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12 text-center">
            <div className="w-20 h-20 rounded-[28px] bg-[var(--success)]/10 backdrop-blur-md flex items-center justify-center mx-auto mb-6 text-[var(--success)] shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_8px_24px_rgba(16,185,129,0.15)] ring-1 ring-[var(--success)]/20">
              <Package size={32} strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">All stock levels are healthy</h3>
            <p className="text-sm font-medium text-[var(--text-tertiary)] mt-2 max-w-[240px]">No items are currently below the critical threshold.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {lowStockItems.map((item, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05, ease: [0.25, 0.46, 0.45, 0.94] }}
                key={item.id}
                className="group relative bg-white/60 backdrop-blur-md border border-[var(--border)] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300 hover:bg-white/80 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
              >
                <div className="flex items-center gap-4">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-14 h-14 rounded-xl object-cover bg-black/[0.02] border border-[var(--border)]"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-white/40 backdrop-blur-sm border border-[var(--border)] flex items-center justify-center shadow-sm">
                      <Package size={24} className="text-[var(--text-tertiary)]" strokeWidth={1.5} />
                    </div>
                  )}
                  <div>
                    <h3 className="text-base font-semibold text-[var(--text-primary)] line-clamp-1 tracking-tight">{item.name}</h3>
                    <div className="flex items-center gap-2.5 mt-1.5">
                      <span className="text-xs font-bold text-[var(--error)] bg-[var(--error)]/10 backdrop-blur-sm px-2.5 py-1 rounded-md border border-[var(--error)]/20 shadow-[0_0_12px_rgba(239,68,68,0.2)]">
                        {item.stock_count} in stock
                      </span>
                      <span className="text-xs font-medium text-[var(--text-tertiary)]">
                        SKU: <span className="text-[var(--text-secondary)]">{item.sku}</span>
                      </span>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => onViewItem(item)}
                  className="flex items-center justify-center sm:w-auto w-full gap-2 px-4 py-2 text-sm font-semibold text-[var(--accent)] bg-[var(--accent)]/10 backdrop-blur-sm border border-[var(--accent)]/20 hover:bg-[var(--accent)] hover:text-[var(--accent-fg)] rounded-xl transition-all duration-300 shadow-sm hover:shadow-[0_4px_16px_rgba(0,122,255,0.2)] cursor-pointer"
                >
                  View Details
                  <ArrowRight size={16} strokeWidth={2.5} />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
