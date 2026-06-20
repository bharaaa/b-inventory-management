import { motion } from 'framer-motion';
import { Database, RefreshCw, ServerCrash } from 'lucide-react';

export default function ConnectionErrorView({ onRetry }) {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--error)]/5 blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="w-full max-w-md bg-[var(--bg-card)] backdrop-blur-xl border border-[var(--border)] rounded-3xl p-8 shadow-2xl relative z-10 text-center"
      >
        <div className="w-20 h-20 mx-auto bg-[var(--error-subtle)] rounded-2xl flex items-center justify-center mb-6 shadow-inner">
          <div className="relative">
            <Database size={32} className="text-[var(--error)]/40" />
            <ServerCrash size={32} className="text-[var(--error)] absolute inset-0" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2 tracking-tight">
          Connection Failed
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mb-8 leading-relaxed">
          We are unable to connect to the Supabase database. Please check your internet connection or verify your environment variables.
        </p>

        <button
          onClick={onRetry}
          className="w-full flex items-center justify-center gap-2 bg-[var(--text-primary)] text-[var(--bg-primary)] py-3 px-4 rounded-xl font-medium hover:bg-[var(--text-secondary)] transition-all active:scale-[0.98]"
        >
          <RefreshCw size={18} />
          Retry Connection
        </button>

        <div className="mt-6 pt-6 border-t border-[var(--border)]">
          <p className="text-xs text-[var(--text-tertiary)] flex items-center justify-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[var(--error)] animate-pulse" />
            System Offline
          </p>
        </div>
      </motion.div>
    </div>
  );
}
