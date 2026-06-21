import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { motion } from 'framer-motion';

const timeRanges = ['7D', '30D', '90D'];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-white/80 dark:bg-[#1A1A1A]/80 backdrop-blur-sm rounded-2xl border border-[var(--border)] shadow-sm p-6 min-w-[140px]">
      <p className="text-xs font-medium text-[var(--text-primary)] mb-2">
        {label}
      </p>
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
            <span className="text-xs text-[var(--text-secondary)]">Inbound</span>
          </div>
          <span className="text-xs font-medium text-[var(--text-primary)]">
            {payload[0]?.value}
          </span>
        </div>
        {payload[1] && (
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[var(--success)]" />
              <span className="text-xs text-[var(--text-secondary)]">Outbound</span>
            </div>
            <span className="text-xs font-medium text-[var(--text-primary)]">
              {payload[1]?.value}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function StockMovementChart({ data }) {
  const [activeRange, setActiveRange] = useState('30D');

  const filteredData = (() => {
    if (!data) return [];
    switch (activeRange) {
      case '7D':
        return data.slice(-7);
      case '90D':
        return data;
      case '30D':
      default:
        return data.slice(-30);
    }
  })();

  const totalSalesValue = filteredData.reduce((sum, day) => sum + (day.salesValue || 0), 0);
  const totalOrdersCount = filteredData.reduce((sum, day) => sum + (day.ordersCount || 0), 0);

  const formatCurrency = (val) => {
    if (val === 0) return '$0';
    if (val >= 1000) return `$${(val / 1000).toFixed(1)}k`;
    return `$${val.toLocaleString()}`;
  };

  const formatCount = (val) => {
    if (val === 0) return '0';
    if (val >= 1000) return `${(val / 1000).toFixed(1)}k`;
    return val.toString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="bg-black/3 dark:bg-[#1A1A1A]/50 backdrop-blur-sm rounded-2xl border border-[var(--border)] shadow-sm p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] tracking-tight">
          Sales
        </h3>
        <div className="flex items-center gap-1 bg-[rgba(0,0,0,0.04)] backdrop-blur-sm rounded-lg p-0.5">
          {timeRanges.map((range) => (
            <button
              key={range}
              onClick={() => setActiveRange(range)}
              className={`text-xs rounded-lg px-3 py-1.5 transition-all duration-200 cursor-pointer ${
                activeRange === range
                  ? 'bg-[var(--bg-card)] text-[var(--text-primary)] font-medium shadow-sm'
                  : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Summary values */}
      <div className="flex items-baseline gap-3 mb-5">
        <span className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
          {formatCurrency(totalSalesValue)}
        </span>
        <span className="text-lg text-[var(--text-tertiary)] font-medium">
          {formatCount(totalOrdersCount)} orders
        </span>
      </div>

      {/* Chart - Bar chart matching reference */}
      <div className="w-full">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart
            data={filteredData}
            margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
            barCategoryGap="15%"
          >
            <CartesianGrid
              horizontal
              vertical={false}
              stroke="rgba(0,0,0,0.06)"
              strokeDasharray="3 3"
            />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#a3a3a3' }}
              dy={8}
              interval="preserveStartEnd"
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#a3a3a3' }}
              width={40}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: 'rgba(0, 0, 0, 0.04)', radius: 4 }}
            />
            <Bar
              dataKey="inbound"
              fill="var(--accent)"
              radius={[3, 3, 0, 0]}
              barSize={14}
            />
            <Bar
              dataKey="outbound"
              fill="var(--success)"
              radius={[3, 3, 0, 0]}
              barSize={14}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 mt-4 pt-3 border-t border-[var(--border)]">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[var(--accent)]" />
          <span className="text-xs text-[var(--text-secondary)]">Inbound</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[var(--success)]" />
          <span className="text-xs text-[var(--text-secondary)]">Outbound</span>
        </div>
      </div>
    </motion.div>
  );
}
