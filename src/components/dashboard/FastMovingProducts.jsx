import { motion } from 'framer-motion';
import { TrendingUp, ArrowRight, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../ui/GlassCard';

export default function FastMovingProducts({ items }) {
  const navigate = useNavigate();

  return (
    <GlassCard
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="p-6 flex flex-col h-full"
    >
      <div className="flex items-center justify-between mb-5 shrink-0">
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)] tracking-tight">
            Fast Moving
          </h3>
          <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
            Highest outbound volume (30d)
          </p>
        </div>
        <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] shadow-[0_2px_10px_var(--accent-subtle)]">
          <Zap size={16} strokeWidth={2.5} />
        </div>
      </div>

      <div className="space-y-4 flex-1">
        {!items || items.length === 0 ? (
          <p className="text-sm text-[var(--text-tertiary)] text-center py-4">No recent movement</p>
        ) : (
          items.map((item, i) => {
            return (
              <div key={item.product_id} className="flex items-center gap-3 group">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)] truncate group-hover:text-[var(--accent)] transition-colors">{item.name}</p>
                  <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5 truncate">{item.category}</p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--accent)] bg-[var(--accent)]/10 border border-[var(--accent)]/20 px-2 py-0.5 rounded-full shadow-[0_2px_8px_var(--accent-subtle)]">
                    <TrendingUp size={12} strokeWidth={2.5} />
                    {item.totalOutbound}
                  </span>
                  <span className="text-[10px] text-[var(--text-tertiary)] mt-1 font-medium">Stock: {item.currentStock}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <button
        onClick={() => navigate('/analytics')}
        className="w-full mt-5 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-white/40 dark:bg-black/20 hover:bg-white/60 dark:hover:bg-black/40 backdrop-blur-md border border-[var(--border)] rounded-xl transition-all duration-300 shadow-sm hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 cursor-pointer shrink-0"
      >
        View Analytics
        <ArrowRight size={14} />
      </button>
    </GlassCard>
  );
}
