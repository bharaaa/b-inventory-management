import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  Package, 
  Activity, 
  Zap, 
  ArrowRight,
  Clock,
  Box
} from 'lucide-react';
import { getFastMovingProducts } from '../helpers/stockHelpers';
import GlassCard from '../components/ui/GlassCard';
import MetricCard from '../components/ui/MetricCard';

const timeframes = [
  { label: '7 Days', value: 7 },
  { label: '30 Days', value: 30 },
  { label: '90 Days', value: 90 }
];

export default function AnalyticsPage() {
  const [timeframe, setTimeframe] = useState(30);
  const [loading, setLoading] = useState(true);
  const [fastMoving, setFastMoving] = useState([]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const data = await getFastMovingProducts(timeframe, 0); // 0 = unlimited
      setFastMoving(data);
      setLoading(false);
    }
    fetchData();
  }, [timeframe]);

  const totalOutbound = fastMoving.reduce((sum, item) => sum + item.totalOutbound, 0);
  const totalEvents = fastMoving.reduce((sum, item) => sum + item.movementCount, 0);
  const maxOutbound = fastMoving.length > 0 ? fastMoving[0].totalOutbound : 0;
  
  return (
    <div className="flex flex-col h-full min-h-0 pb-12">
      {/* Header & Timeframe */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="text-2xl font-semibold text-[var(--text-primary)] tracking-tight flex items-center gap-2"
          >
            Analytics <Zap size={20} className="text-[var(--accent)]" />
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
            className="text-sm text-[var(--text-tertiary)] mt-1"
          >
            Deep dive into product velocity and outbound movement history.
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex items-center p-1 bg-black/5 dark:bg-white/5 rounded-xl border border-[var(--border)] w-fit"
        >
          {timeframes.map(tf => (
            <button
              key={tf.value}
              onClick={() => setTimeframe(tf.value)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                timeframe === tf.value 
                  ? 'bg-[var(--bg-card)] shadow-sm text-[var(--text-primary)] border border-[var(--border)]' 
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </motion.div>
      </div>

      {/* KPI Cards */}
      <motion.div 
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8"
      >
        <MetricCard
          title="Total Outbound Volume"
          value={loading ? "..." : totalOutbound.toLocaleString()}
          icon={<Package size={20} />}
          changeLabel={`units moved in ${timeframe}d`}
          index={0}
        />
        <MetricCard
          title="Most Active Item"
          value={loading ? "..." : (fastMoving[0]?.name || "None")}
          icon={<TrendingUp size={20} />}
          changeLabel={fastMoving[0] ? `${fastMoving[0].totalOutbound} units moved` : ""}
          index={1}
        />
        <MetricCard
          title="Movement Events"
          value={loading ? "..." : totalEvents.toLocaleString()}
          icon={<Activity size={20} />}
          changeLabel={`transactions in ${timeframe}d`}
          index={2}
        />
      </motion.div>

      {/* Main Table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <GlassCard className="p-1">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider w-16">Rank</th>
                  <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Product</th>
                  <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider text-right">Outbound Vol</th>
                  <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider text-right">Velocity</th>
                  <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider text-right">Transactions</th>
                  <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider text-right">Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-[var(--text-tertiary)]">Loading data...</td>
                  </tr>
                ) : fastMoving.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-[var(--text-tertiary)]">No outbound movements found in this timeframe.</td>
                  </tr>
                ) : (
                  fastMoving.map((item, idx) => {
                    const velocity = (item.totalOutbound / timeframe).toFixed(1);
                    const percentage = maxOutbound > 0 ? (item.totalOutbound / maxOutbound) * 100 : 0;
                    
                    return (
                      <tr key={item.product_id} className="group hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${idx < 3 ? 'bg-[var(--accent)]/10 text-[var(--accent)]' : 'bg-black/5 dark:bg-white/5 text-[var(--text-tertiary)]'}`}>
                            #{idx + 1}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">{item.name}</p>
                          <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{item.category}</p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex flex-col items-end gap-1.5">
                            <span className="text-sm font-bold text-[var(--text-primary)]">{item.totalOutbound}</span>
                            <div className="w-24 h-1.5 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 1, delay: 0.5 + (idx * 0.05), ease: "easeOut" }}
                                className="h-full bg-[var(--accent)] rounded-full"
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[var(--success)]/10 text-[var(--success)] text-xs font-semibold">
                            {velocity} / day
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-sm text-[var(--text-secondary)]">
                          {item.movementCount}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm font-medium text-[var(--text-primary)]">{item.currentStock}</span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
