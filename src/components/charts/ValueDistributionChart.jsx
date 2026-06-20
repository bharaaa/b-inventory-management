import { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { motion } from 'framer-motion';

const PIE_COLORS = [
  '#171717', // almost black
  '#404040', // dark gray
  '#737373', // medium gray
  '#a3a3a3', // light gray
  '#d4d4d4', // lighter gray
  '#f5f5f5', // very light gray (for others)
];

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;

  const data = payload[0].payload;
  const formattedValue = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(data.value);

  return (
    <div className="bg-white rounded-xl border border-[var(--border)] shadow-sm p-3 min-w-[160px]">
      <p className="text-xs font-medium text-[var(--text-primary)] mb-1 truncate">
        {data.name}
      </p>
      <div className="flex items-center gap-1.5">
        <span
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: payload[0].color || '#171717' }}
        />
        <span className="text-xs font-semibold text-[var(--text-secondary)]">
          {formattedValue}
        </span>
        {data.percentage !== undefined && (
          <span className="text-xs text-[var(--text-tertiary)] ml-auto">
            ({data.percentage}%)
          </span>
        )}
      </div>
    </div>
  );
}

export default function ValueDistributionChart({ items }) {
  const chartData = useMemo(() => {
    if (!items || items.length === 0) return [];

    // Calculate total value for each item
    const itemValues = items.map(item => ({
      name: item.name,
      value: (item.stock_count || 0) * (item.price || 0)
    }));

    // Sort descending by value
    itemValues.sort((a, b) => b.value - a.value);

    const totalGrandValue = itemValues.reduce((sum, item) => sum + item.value, 0);

    // Keep top 5, aggregate the rest
    const topItems = itemValues.slice(0, 5);
    const otherItems = itemValues.slice(5);

    const data = [...topItems];
    
    if (otherItems.length > 0) {
      const otherValue = otherItems.reduce((sum, item) => sum + item.value, 0);
      data.push({
        name: 'Others',
        value: otherValue
      });
    }

    // Add percentage to each piece of data for the tooltip
    return data.map(item => ({
      ...item,
      percentage: totalGrandValue > 0 ? ((item.value / totalGrandValue) * 100).toFixed(1) : 0
    }));

  }, [items]);

  const totalValue = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.value, 0);
  }, [chartData]);

  const formattedTotal = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(totalValue);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="bg-[var(--bg-card)] backdrop-blur-xl rounded-2xl border border-[var(--border)] p-6"
    >
      {/* Header */}
      <div className="mb-2">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] tracking-tight">
          Value Distribution
        </h3>
        <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
          Top items by total value
        </p>
      </div>

      {/* Chart */}
      <div className="w-full relative h-[260px] flex items-center justify-center">
        {chartData.length === 0 ? (
          <p className="text-sm text-[var(--text-tertiary)]">No data available</p>
        ) : (
          <>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={PIE_COLORS[index % PIE_COLORS.length]} 
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs text-[var(--text-tertiary)] mb-0.5">Total</span>
              <span className="text-sm font-bold text-[var(--text-primary)]">{formattedTotal}</span>
            </div>
          </>
        )}
      </div>

      {/* Legend / Summary */}
      <div className="mt-2 space-y-2">
        {chartData.slice(0, 3).map((item, index) => (
          <div key={item.name} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 overflow-hidden">
              <span 
                className="w-2 h-2 rounded-full shrink-0" 
                style={{ backgroundColor: PIE_COLORS[index] }}
              />
              <span className="text-[var(--text-secondary)] truncate">{item.name}</span>
            </div>
            <span className="font-medium text-[var(--text-primary)] shrink-0 ml-2">
              {item.percentage}%
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
