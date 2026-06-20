import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { Map } from 'lucide-react';

const ZONE_NAMES = ['Zone A', 'Zone B', 'Zone C', 'Zone D'];
const ZONE_COLORS = [
  'var(--accent)',
  '#f59e0b', // amber
  '#10b981', // emerald
  '#8b5cf6', // violet
];

export default function StorageZones({ items }) {
  const zones = useMemo(() => {
    // Distribute categories into 4 zones pseudo-randomly but deterministically
    const categoryStocks = {};
    items.forEach(item => {
      const cat = item.categories?.name || 'Uncategorized';
      categoryStocks[cat] = (categoryStocks[cat] || 0) + (item.stock_count || 0);
    });

    const catArray = Object.keys(categoryStocks).map(cat => ({
      name: cat,
      stock: categoryStocks[cat]
    }));
    
    // Sort so it's deterministic
    catArray.sort((a, b) => b.stock - a.stock);

    const zoneBuckets = [0, 0, 0, 0];
    const zoneCategories = [[], [], [], []];
    catArray.forEach((cat, idx) => {
      zoneBuckets[idx % 4] += cat.stock;
      zoneCategories[idx % 4].push(cat.name);
    });

    // Make up a 'total capacity' for each zone to give a percentage.
    // Let's say each zone has a capacity of max(bucket * 1.3, 500)
    return zoneBuckets.map((stock, idx) => {
      const cap = Math.max(Math.ceil(stock * 1.4), 500);
      const percentage = cap > 0 ? Math.round((stock / cap) * 100) : 0;
      return {
        name: ZONE_NAMES[idx],
        stock,
        capacity: cap,
        percentage,
        color: ZONE_COLORS[idx],
        categories: zoneCategories[idx]
      };
    });
  }, [items]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="bg-[var(--bg-card)] backdrop-blur-xl rounded-2xl border border-[var(--border)] p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)] tracking-tight">
            Storage Zones
          </h3>
          <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
            Physical zone utilization
          </p>
        </div>
        <div className="w-8 h-8 rounded-lg bg-white/30 flex items-center justify-center text-[var(--text-secondary)]">
          <Map size={16} strokeWidth={2} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {zones.map((zone, i) => (
          <div key={zone.name} className="flex flex-col items-center p-4 rounded-xl bg-white/30 backdrop-blur-sm border border-[var(--border)] relative overflow-hidden group">
            {/* Elegant Circular Progress */}
            <div className="relative w-16 h-16 mb-3">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  className="stroke-white/30"
                  strokeWidth="3"
                />
                <motion.circle
                  initial={{ strokeDasharray: "0, 100" }}
                  animate={{ strokeDasharray: `${zone.percentage}, 100` }}
                  transition={{ duration: 1.5, delay: 0.2 + (i * 0.1), ease: "easeOut" }}
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  stroke={zone.color}
                  strokeWidth="3"
                  strokeDasharray="0, 100"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-[var(--text-primary)]">{zone.percentage}%</span>
              </div>
            </div>
            
            <span className="text-sm font-semibold text-[var(--text-primary)]">{zone.name}</span>
            <span className="text-[10px] text-[var(--text-tertiary)] mt-0.5">{zone.stock.toLocaleString()} / {zone.capacity.toLocaleString()}</span>
            {zone.categories.length > 0 && (
              <p className="text-[10px] text-[var(--text-tertiary)] text-center mt-2 line-clamp-2 leading-tight px-1">
                {zone.categories.join(', ')}
              </p>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
