import { motion } from 'framer-motion';
import { AlertCircle, PackageX, ChevronRight } from 'lucide-react';
import GlassCard from '../ui/GlassCard';

export default function WarehouseAlerts({ items, onOpenLowStock }) {
  const alerts = items
    .filter(item => item.stock_count < 10)
    .map(item => ({
      ...item,
      status: item.stock_count === 0 ? 'critical' : 'warning',
      message: item.stock_count === 0 ? 'Out of stock' : `Only ${item.stock_count} units remaining`
    }))
    .sort((a, b) => a.stock_count - b.stock_count)
    .slice(0, 4); // show top 4 alerts

  return (
    <GlassCard
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)] tracking-tight">
            Warehouse Alerts
          </h3>
          <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
            Immediate attention required
          </p>
        </div>
        <div className="w-8 h-8 rounded-lg bg-[var(--error)]/10 flex items-center justify-center text-[var(--error)]">
          <AlertCircle size={16} strokeWidth={2} />
        </div>
      </div>

      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className="text-center py-6 border border-[var(--border)] border-dashed rounded-xl bg-[rgba(255,255,255,0.03)] backdrop-blur-sm">
            <p className="text-sm text-[var(--text-secondary)]">No active alerts</p>
          </div>
        ) : (
          alerts.map((alert, i) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + (i * 0.1) }}
              className="flex items-start gap-3 p-3 rounded-xl border border-[var(--border)] bg-[rgba(255,255,255,0.03)] backdrop-blur-sm"
            >
              <div className={`mt-0.5 shrink-0 ${alert.status === 'critical' ? 'text-[var(--error)]' : 'text-[var(--warning)]'}`}>
                {alert.status === 'critical' ? <PackageX size={16} /> : <AlertCircle size={16} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--text-primary)] truncate">{alert.name}</p>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">{alert.message}</p>
              </div>
              <span className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                alert.status === 'critical' 
                  ? 'bg-[var(--error)]/10 text-[var(--error)]' 
                  : 'bg-[var(--warning)]/10 text-[var(--warning)]'
              }`}>
                {alert.status}
              </span>
            </motion.div>
          ))
        )}
      </div>

      {alerts.length > 0 && (
        <button
          onClick={onOpenLowStock}
          className="w-full mt-4 flex items-center justify-center gap-2 py-2 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.05)] rounded-lg transition-colors cursor-pointer"
        >
          View All Alerts
          <ChevronRight size={14} />
        </button>
      )}
    </GlassCard>
  );
}
