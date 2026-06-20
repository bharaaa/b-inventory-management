import { motion } from "framer-motion";
import { BarChart3, Warehouse, Activity, Settings, Construction } from "lucide-react";

function PlaceholderPage({ title, description, icon: Icon }) {
  return (
    <div>
      <div className="mb-8">
        <motion.h1
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="text-2xl font-semibold text-[var(--text-primary)] tracking-tight"
        >
          {title}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
          className="text-sm text-[var(--text-tertiary)] mt-1"
        >
          {description}
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-16 flex flex-col items-center justify-center text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-[var(--bg-secondary)] flex items-center justify-center mb-5">
          <Icon size={28} strokeWidth={1.5} className="text-[var(--text-tertiary)]" />
        </div>
        <div className="flex items-center gap-2 mb-2">
          <Construction size={16} strokeWidth={1.5} className="text-[var(--warning)]" />
          <span className="text-sm font-medium text-[var(--warning)]">Coming Soon</span>
        </div>
        <p className="text-sm text-[var(--text-tertiary)] max-w-sm">
          This page is under development. Check back soon for updates.
        </p>
      </motion.div>
    </div>
  );
}

export function AnalyticsPage() {
  return (
    <PlaceholderPage
      title="Analytics"
      description="Deep dive into your inventory performance metrics"
      icon={BarChart3}
    />
  );
}



export function SettingsPage() {
  return (
    <PlaceholderPage
      title="Settings"
      description="Configure your inventory management preferences"
      icon={Settings}
    />
  );
}
