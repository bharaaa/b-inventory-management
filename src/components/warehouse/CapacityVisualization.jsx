import { motion } from 'framer-motion';
import { Layers, AlertTriangle } from 'lucide-react';

export default function CapacityVisualization({ usedCapacity, totalCapacity, itemCount }) {
  const percentage = Math.round((usedCapacity / totalCapacity) * 100) || 0;
  const availableCapacity = totalCapacity - usedCapacity;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`bg-[var(--bg-card)] backdrop-blur-md rounded-2xl border p-6 transition-colors duration-500 ${percentage >= 90 ? 'border-[var(--error)] shadow-[0_0_15px_rgba(239,68,68,0.15)] relative overflow-hidden' : 'border-[var(--border)]'}`}
    >
      {percentage >= 90 && (
        <div className="absolute top-0 left-0 w-full h-1 bg-[var(--error)] animate-pulse" />
      )}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div>
          <h3 className={`text-sm font-semibold tracking-tight ${percentage >= 90 ? 'text-[var(--error)]' : 'text-[var(--text-primary)]'}`}>
            Capacity Utilization
          </h3>
          <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
            Physical warehouse space
          </p>
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${percentage >= 90 ? 'bg-[var(--error)]/10 text-[var(--error)]' : 'bg-[var(--accent)]/10 text-[var(--accent)]'}`}>
          {percentage >= 90 ? <AlertTriangle size={20} strokeWidth={2} /> : <Layers size={20} strokeWidth={2} />}
        </div>
      </div>

      <div className="mb-8 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-3">
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold tracking-tight ${percentage >= 90 ? 'text-[var(--error)]' : 'text-[var(--text-primary)]'}`}>
              {percentage}%
            </span>
            <span className={`text-sm font-medium ${percentage >= 90 ? 'text-[var(--error)]' : 'text-[var(--text-secondary)]'}`}>
              Utilized
            </span>
          </div>
          
          {percentage >= 90 && (
            <div className="px-3 py-1.5 bg-[var(--error)]/10 text-[var(--error)] border border-[var(--error)]/20 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
              <AlertTriangle size={16} strokeWidth={3} className="text-[var(--error)]" />
              CRITICAL WARNING
            </div>
          )}
        </div>

        {/* Custom Progress Bar */}
        <div className="w-full h-4 bg-[rgba(255,255,255,0.03)] rounded-full overflow-hidden flex relative">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full rounded-full ${percentage >= 90 ? 'bg-[var(--error)]' : 'bg-[var(--accent)]'}`}
          />
        </div>
        
        <div className="flex justify-between items-center mt-3 text-xs font-medium">
          <span className="text-[var(--text-secondary)]">{usedCapacity.toLocaleString()} Used</span>
          <span className="text-[var(--text-tertiary)]">{totalCapacity.toLocaleString()} Total Units</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className={`bg-[rgba(255,255,255,0.03)] backdrop-blur-sm border ${percentage >= 90 ? 'border-[var(--error)]/30' : 'border-[var(--border)]'} rounded-xl p-4 transition-colors duration-500`}>
          <p className="text-xs text-[var(--text-tertiary)] font-medium mb-1">Available Space</p>
          <p className={`text-lg font-bold ${percentage >= 90 ? 'text-[var(--error)]' : 'text-[var(--text-primary)]'}`}>{availableCapacity.toLocaleString()}</p>
          <p className={`text-xs ${percentage >= 90 ? 'text-[var(--error)]' : 'text-[var(--success)]'} font-medium mt-1 transition-colors duration-500`}>Units remaining</p>
        </div>
        <div className="bg-[rgba(255,255,255,0.03)] backdrop-blur-sm border border-[var(--border)] rounded-xl p-4">
          <p className="text-xs text-[var(--text-tertiary)] font-medium mb-1">Product Count</p>
          <p className="text-lg font-bold text-[var(--text-primary)]">{itemCount.toLocaleString()}</p>
          <p className="text-xs text-[var(--text-secondary)] font-medium mt-1">Unique SKUs</p>
        </div>
      </div>
    </motion.div>
  );
}
