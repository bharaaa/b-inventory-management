import { motion } from "framer-motion";
import { ChevronRight, TrendingUp, TrendingDown } from "lucide-react";
import GlassCard from "./GlassCard";

export default function MetricCard({
  title,
  value,
  change,
  changeLabel,
  icon,
  inverseGood = false,
  index = 0,
  onClick,
}) {
  const isPositive = change >= 0;
  const isGood = inverseGood ? !isPositive : isPositive;

  return (
    <GlassCard
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
      onClick={onClick}
      className={`p-6 transition-all duration-200 group hover:scale-[1.02] hover:-translate-y-0.5 hover:shadow-md hover:bg-black/5 dark:hover:bg-[#222222]/60 ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-[var(--text-secondary)]">
          {title}
        </p>
        <ChevronRight
          size={16}
          className="text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)] transition-colors"
        />
      </div>

      <p className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">
        {value}
      </p>

      {change !== undefined && change !== null && (
        <div className="flex items-center gap-1.5 mt-2">
          <div
            className={`flex items-center gap-0.5 text-xs font-medium ${
              isGood ? "text-[var(--success)]" : "text-[var(--error)]"
            }`}
          >
            {isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span>
              {isPositive ? "+" : ""}
              {change}%
            </span>
          </div>
          {changeLabel && (
            <span className="text-xs text-[var(--text-tertiary)]">
              {changeLabel}
            </span>
          )}
        </div>
      )}
    </GlassCard>
  );
}
