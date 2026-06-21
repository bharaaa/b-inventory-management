import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  Package, 
  Activity, 
  Zap, 
  ArrowRight,
  Clock,
  Box,
  AlertTriangle,
  DollarSign,
  PackageX,
  AlertOctagon,
  CalendarDays
} from 'lucide-react';
import { getFastMovingProducts, getDeadStockProducts, getDemandTrendProducts } from '../helpers/stockHelpers';
import { supabase } from '../services/supabaseClient';
import { ExportButton } from "../components/analytics/ExportButton";
import { useDrawer } from "../contexts/DrawerContext";
import { useCurrency } from "../hooks/useCurrency";
import GlassCard from '../components/ui/GlassCard';
import MetricCard from '../components/ui/MetricCard';
import { useNavigate } from 'react-router-dom';

const timeframes = [
  { label: '7 Days', value: 7 },
  { label: '30 Days', value: 30 },
  { label: '90 Days', value: 90 }
];

export default function AnalyticsPage() {
  const [timeframe, setTimeframe] = useState(30);
  const [viewMode, setViewMode] = useState('fastMoving'); // 'fastMoving' | 'deadStock' | 'demandTrend'
  const [loading, setLoading] = useState(true);
  const [fastMoving, setFastMoving] = useState([]);
  const [deadStock, setDeadStock] = useState([]);
  const [demandTrend, setDemandTrend] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      
      const { data: allItems } = await supabase
        .from("products")
        .select("*, categories(name)");

      const fastData = await getFastMovingProducts(timeframe, 0); // 0 = unlimited
      const deadData = await getDeadStockProducts(allItems || [], timeframe);
      const demandData = await getDemandTrendProducts(timeframe);

      setFastMoving(fastData);
      setDeadStock(deadData);
      setDemandTrend(demandData);
      setLoading(false);
    }
    fetchData();
  }, [timeframe]);

  // Fast Moving KPIs
  const totalOutbound = fastMoving.reduce((sum, item) => sum + item.totalOutbound, 0);
  const totalEvents = fastMoving.reduce((sum, item) => sum + item.movementCount, 0);
  const maxOutbound = fastMoving.length > 0 ? fastMoving[0].totalOutbound : 0;
  
  // Dead Stock KPIs
  const totalDeadValue = deadStock.reduce((sum, item) => sum + (item.currentStock * item.price), 0);
  const { formatPrice } = useCurrency();
  const formattedDeadValue = formatPrice(totalDeadValue, false);
  const worstDeadStock = deadStock.length > 0 ? deadStock[0].name : "None";
  
  // Demand Trend KPIs
  const criticalCount = demandTrend.filter(item => item.riskStatus === 'critical' || item.riskStatus === 'stocked_out').length;
  const warningCount = demandTrend.filter(item => item.riskStatus === 'warning').length;
  const avgVelocity = demandTrend.length > 0 ? (demandTrend.reduce((sum, item) => sum + item.dailyVelocity, 0) / demandTrend.length).toFixed(1) : 0;

  return (
    <div className="flex flex-col h-full min-h-0 pb-12">
      {/* Header & Controls */}
      <div className="mb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
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
            Deep dive into product velocity, stock movements, and capital lockup.
          </motion.p>
        </div>

        <div className="flex flex-col xl:flex-row items-start xl:items-center gap-3">
          {/* View Toggle */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="flex items-center p-1 bg-black/5 dark:bg-white/5 rounded-xl border border-[var(--border)] w-fit"
          >
            <button
              onClick={() => setViewMode('fastMoving')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                viewMode === 'fastMoving' 
                  ? 'bg-[var(--bg-card)] shadow-sm text-[var(--text-primary)] border border-[var(--border)]' 
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <TrendingUp size={14} /> Fast Moving
            </button>
            <button
              onClick={() => setViewMode('demandTrend')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                viewMode === 'demandTrend' 
                  ? 'bg-[var(--bg-card)] shadow-sm text-[var(--text-primary)] border border-[var(--border)]' 
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <AlertOctagon size={14} /> Demand Trend
            </button>
            <button
              onClick={() => setViewMode('deadStock')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                viewMode === 'deadStock' 
                  ? 'bg-[var(--bg-card)] shadow-sm text-[var(--text-primary)] border border-[var(--border)]' 
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <PackageX size={14} /> Dead Stock
            </button>
          </motion.div>

          {/* Timeframe */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.25 }}
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
      </div>

      {/* KPI Cards */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={viewMode}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8"
        >
          {viewMode === 'fastMoving' ? (
            <>
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
            </>
          ) : viewMode === 'demandTrend' ? (
            <>
              <MetricCard
                title="Critical Stock-Outs"
                value={loading ? "..." : criticalCount.toString()}
                icon={<AlertOctagon size={20} />}
                changeLabel={`< 7 days stock remaining`}
                index={0}
              />
              <MetricCard
                title="Items at Risk"
                value={loading ? "..." : warningCount.toString()}
                icon={<AlertTriangle size={20} />}
                changeLabel={`< 30 days stock remaining`}
                index={1}
              />
              <MetricCard
                title="Average Velocity"
                value={loading ? "..." : `${avgVelocity} / day`}
                icon={<TrendingUp size={20} />}
                changeLabel={`across all trending items`}
                index={2}
              />
            </>
          ) : (
            <>
              <MetricCard
                title="Total Dead Stock Items"
                value={loading ? "..." : deadStock.length.toLocaleString()}
                icon={<AlertTriangle size={20} />}
                changeLabel={`0 movements in ${timeframe}d`}
                index={0}
              />
              <MetricCard
                title="Total Capital Locked"
                value={loading ? "..." : formattedDeadValue}
                icon={<DollarSign size={20} />}
                changeLabel="Tied up in dead stock"
                index={1}
              />
              <MetricCard
                title="Worst Offender"
                value={loading ? "..." : worstDeadStock}
                icon={<Box size={20} />}
                changeLabel={deadStock[0] ? `${deadStock[0].currentStock} units stuck` : ""}
                index={2}
              />
            </>
          )}
        </motion.div>
      </AnimatePresence>

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
                  
                  {viewMode === 'fastMoving' && (
                    <>
                      <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider text-right">Outbound Vol</th>
                      <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider text-right">Velocity</th>
                      <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider text-right">Transactions</th>
                      <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider text-right">Stock</th>
                    </>
                  )}

                  {viewMode === 'demandTrend' && (
                    <>
                      <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider text-right">Current Stock</th>
                      <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider text-right">Daily Velocity</th>
                      <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider text-right">Est. Stock-Out</th>
                      <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider text-right">Action</th>
                    </>
                  )}
                  
                  {viewMode === 'deadStock' && (
                    <>
                      <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider text-right">Stock Stuck</th>
                      <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider text-right">Unit Price</th>
                      <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider text-right">Value Locked</th>
                      <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider text-right">Action</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-[var(--text-tertiary)]">Loading data...</td>
                  </tr>
                ) : (viewMode === 'fastMoving' ? fastMoving : viewMode === 'demandTrend' ? demandTrend : deadStock).length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-[var(--text-tertiary)]">No data found in this timeframe.</td>
                  </tr>
                ) : (
                  (viewMode === 'fastMoving' ? fastMoving : viewMode === 'demandTrend' ? demandTrend : deadStock).map((item, idx) => {
                    if (viewMode === 'fastMoving') {
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
                    } else if (viewMode === 'demandTrend') {
                      // Demand Trend Row
                      let statusBadge = null;
                      let statusBg = "bg-black/5 dark:bg-white/5";
                      let statusText = "text-[var(--text-tertiary)]";

                      if (item.riskStatus === 'stocked_out') {
                        statusBadge = "Stocked Out";
                        statusBg = "bg-[var(--error)]/10";
                        statusText = "text-[var(--error)]";
                      } else if (item.riskStatus === 'critical') {
                        statusBadge = `${item.daysUntilStockOut} days`;
                        statusBg = "bg-[var(--error)]/10";
                        statusText = "text-[var(--error)]";
                      } else if (item.riskStatus === 'warning') {
                        statusBadge = `${item.daysUntilStockOut} days`;
                        statusBg = "bg-[var(--warning)]/10";
                        statusText = "text-[var(--warning)]";
                      } else {
                        statusBadge = `${item.daysUntilStockOut} days`;
                        statusBg = "bg-[var(--success)]/10";
                        statusText = "text-[var(--success)]";
                      }

                      return (
                        <tr key={item.product_id} className={`group transition-colors ${item.riskStatus === 'critical' || item.riskStatus === 'stocked_out' ? 'hover:bg-[var(--error)]/5' : 'hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'}`}>
                          <td className="px-6 py-4">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${statusBg} ${statusText}`}>
                              #{idx + 1}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-medium text-[var(--text-primary)]">{item.name}</p>
                            <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{item.category}</p>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className={`text-sm font-bold ${item.currentStock === 0 ? 'text-[var(--error)]' : 'text-[var(--text-primary)]'}`}>
                              {item.currentStock}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="text-sm text-[var(--text-secondary)] font-medium">
                              {item.dailyVelocity} / day
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide ${statusBg} ${statusText}`}>
                              {item.riskStatus === 'stocked_out' || item.riskStatus === 'critical' ? <AlertOctagon size={14} /> : <CalendarDays size={14} />}
                              {statusBadge}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button 
                              onClick={() => navigate('/inventory')}
                              className="text-xs font-semibold text-[var(--accent)] hover:text-[var(--accent-subtle)] transition-colors"
                            >
                              Restock
                            </button>
                          </td>
                        </tr>
                      );
                    } else {
                      // Dead Stock Row
                      const formattedPrice = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(item.price);
                      const formattedValue = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(item.valueLocked);
                      
                      return (
                        <tr key={item.product_id} className="group hover:bg-[var(--error)]/5 transition-colors">
                          <td className="px-6 py-4">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${idx < 3 ? 'bg-[var(--error)]/10 text-[var(--error)]' : 'bg-black/5 dark:bg-white/5 text-[var(--text-tertiary)]'}`}>
                              #{idx + 1}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-medium text-[var(--text-primary)]">{item.name}</p>
                            <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{item.category}</p>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="text-sm font-semibold text-[var(--error)]">{item.currentStock} units</span>
                          </td>
                          <td className="px-6 py-4 text-right text-sm text-[var(--text-secondary)]">
                            {formattedPrice}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="text-sm font-bold text-[var(--text-primary)]">{formattedValue}</span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button 
                              onClick={() => navigate('/inventory')}
                              className="text-xs font-semibold text-[var(--accent)] hover:text-[var(--accent-subtle)] transition-colors"
                            >
                              Manage
                            </button>
                          </td>
                        </tr>
                      );
                    }
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
