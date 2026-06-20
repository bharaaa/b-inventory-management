import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { PieChart as PieChartIcon } from 'lucide-react';

export default function InventoryDistribution({ items, totalStock }) {
  const distribution = useMemo(() => {
    const counts = {};
    items.forEach(item => {
      const cat = item.categories?.name || 'Uncategorized';
      counts[cat] = (counts[cat] || 0) + (item.stock_count || 0);
    });

    const arr = Object.keys(counts).map(cat => ({
      category: cat,
      count: counts[cat],
      percentage: totalStock > 0 ? (counts[cat] / totalStock) * 100 : 0
    }));

    return arr.sort((a, b) => b.count - a.count);
  }, [items, totalStock]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="bg-[var(--bg-card)] backdrop-blur-md rounded-2xl border border-[var(--border)] p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)] tracking-tight">
            Inventory Distribution
          </h3>
          <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
            Stock volume by category
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-[var(--text-primary)] flex items-center justify-center text-[var(--bg-card)]">
          <PieChartIcon size={20} strokeWidth={2} />
        </div>
      </div>

      <div className="space-y-4">
        {distribution.map((dist, i) => (
          <div key={dist.category} className="group">
            <div className="flex justify-between text-sm mb-1.5">
              <span className="font-medium text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                {dist.category}
              </span>
              <div className="flex items-center gap-3">
                <span className="text-[var(--text-secondary)] font-semibold">{dist.count.toLocaleString()}</span>
                <span className="text-[var(--text-tertiary)] w-10 text-right">{dist.percentage.toFixed(1)}%</span>
              </div>
            </div>
            <div className="w-full h-2 bg-white/30 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${dist.percentage}%` }}
                transition={{ duration: 0.8, delay: 0.1 * i, ease: "easeOut" }}
                className="h-full bg-[var(--text-primary)] rounded-full"
              />
            </div>
          </div>
        ))}
        {distribution.length === 0 && (
          <p className="text-sm text-[var(--text-tertiary)] text-center py-4">No data available</p>
        )}
      </div>
    </motion.div>
  );
}
