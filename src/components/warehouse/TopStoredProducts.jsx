import { motion } from 'framer-motion';
import { Package, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TopStoredProducts({ items, totalCapacity }) {
  const navigate = useNavigate();
  const topProducts = [...items]
    .sort((a, b) => (b.stock_count || 0) - (a.stock_count || 0))
    .slice(0, 4);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="bg-[var(--bg-card)] backdrop-blur-xl rounded-2xl border border-[var(--border)] p-6"
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)] tracking-tight">
            Top Stored Products
          </h3>
          <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
            Highest physical volume
          </p>
        </div>
        <div className="w-8 h-8 rounded-lg bg-white/30 flex items-center justify-center text-[var(--text-secondary)]">
          <Package size={16} strokeWidth={2} />
        </div>
      </div>

      <div className="space-y-4">
        {topProducts.length === 0 ? (
          <p className="text-sm text-[var(--text-tertiary)] text-center py-4">No products</p>
        ) : (
          topProducts.map((item, i) => {
            const percentage = totalCapacity > 0 ? ((item.stock_count / totalCapacity) * 100).toFixed(1) : 0;
            return (
              <div key={item.id} className="flex items-center gap-3">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-10 h-10 rounded-lg object-cover bg-white/30 border border-[var(--border)] shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-white/30 border border-[var(--border)] flex items-center justify-center shrink-0">
                    <Package size={16} className="text-[var(--text-tertiary)]" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)] truncate">{item.name}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-[var(--text-secondary)]">{item.stock_count} units</span>
                    <span className="text-xs font-semibold text-[var(--text-primary)]">{percentage}% space</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/30 rounded-full overflow-hidden mt-1.5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1, delay: 0.6 + (i * 0.1), ease: "easeOut" }}
                      className="h-full bg-[var(--text-secondary)] rounded-full"
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <button
        onClick={() => navigate('/inventory')}
        className="w-full mt-5 flex items-center justify-center gap-2 py-2 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/40 rounded-lg transition-colors cursor-pointer"
      >
        View All Inventory
        <ArrowRight size={14} />
      </button>
    </motion.div>
  );
}
