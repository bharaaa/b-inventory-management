import { motion } from 'framer-motion';
import { Layers } from 'lucide-react';

export default function CapacityVisualization({ usedCapacity, totalCapacity, itemCount }) {
  const percentage = Math.round((usedCapacity / totalCapacity) * 100) || 0;
  const availableCapacity = totalCapacity - usedCapacity;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)] tracking-tight">
            Capacity Utilization
          </h3>
          <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
            Physical warehouse space
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
          <Layers size={20} strokeWidth={2} />
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">
            {percentage}%
          </span>
          <span className="text-sm text-[var(--text-secondary)] font-medium">
            Utilized
          </span>
        </div>

        {/* Custom Progress Bar */}
        <div className="w-full h-4 bg-[var(--bg-secondary)] rounded-full overflow-hidden flex">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-[var(--accent)] rounded-full"
          />
        </div>
        
        <div className="flex justify-between items-center mt-3 text-xs font-medium">
          <span className="text-[var(--text-secondary)]">{usedCapacity.toLocaleString()} Used</span>
          <span className="text-[var(--text-tertiary)]">{totalCapacity.toLocaleString()} Total Units</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl p-4">
          <p className="text-xs text-[var(--text-tertiary)] font-medium mb-1">Available Space</p>
          <p className="text-lg font-bold text-[var(--text-primary)]">{availableCapacity.toLocaleString()}</p>
          <p className="text-xs text-[var(--success)] font-medium mt-1">Units remaining</p>
        </div>
        <div className="bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl p-4">
          <p className="text-xs text-[var(--text-tertiary)] font-medium mb-1">Product Count</p>
          <p className="text-lg font-bold text-[var(--text-primary)]">{itemCount.toLocaleString()}</p>
          <p className="text-xs text-[var(--text-secondary)] font-medium mt-1">Unique SKUs</p>
        </div>
      </div>
    </motion.div>
  );
}
