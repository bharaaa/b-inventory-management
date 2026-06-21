import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { motion } from 'framer-motion';

const BAR_COLORS = [
  '#007AFF',
  '#5AC8FA',
  '#30D158',
  '#FF9F0A',
  '#AF52DE',
  '#FF453A',
];

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;

  const { category, count } = payload[0].payload;

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-black/[0.06] shadow-lg p-3 min-w-[140px] rounded-xl">
      <p className="text-xs font-medium text-[var(--text-primary)] mb-1">
        {category}
      </p>
      <div className="flex items-center gap-1.5">
        <span
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: payload[0].color || '#171717' }}
        />
        <span className="text-xs text-[var(--text-secondary)]">
          {count.toLocaleString()} items
        </span>
      </div>
    </div>
  );
}

export default function CategoryChart({ data }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="bg-black/3 dark:bg-[#1A1A1A]/50 backdrop-blur-sm rounded-2xl border border-[var(--border)] shadow-sm p-6"
    >
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] tracking-tight">
          Category Distribution
        </h3>
      </div>

      {/* Chart */}
      <div className="w-full">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 12, left: 0, bottom: 0 }}
            barCategoryGap="20%"
          >
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="category"
              axisLine={false}
              tickLine={false}
              width={100}
              tick={{ fontSize: 12, fill: '#a3a3a3' }}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: 'rgba(0, 0, 0, 0.04)', radius: 6 }}
            />
            <Bar dataKey="count" barSize={28} radius={[0, 6, 6, 0]}>
              {(data || []).map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={BAR_COLORS[index % BAR_COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-[var(--border)]">
        <span className="text-xs text-[var(--text-tertiary)]">
          {data?.length || 0} categories
        </span>
        <span className="text-xs text-[var(--text-tertiary)]">
          {data?.reduce((sum, d) => sum + d.count, 0).toLocaleString() || 0} total items
        </span>
      </div>
    </motion.div>
  );
}
