import { motion } from "framer-motion";
import { Settings, Sparkles, Monitor, Palette } from "lucide-react";export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto w-full">
      <div className="mb-8">
        <motion.h1
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="text-2xl font-semibold text-[var(--text-primary)] tracking-tight"
        >
          Settings
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
          className="text-sm text-[var(--text-tertiary)] mt-1"
        >
          Customize your application experience and preferences
        </motion.p>
      </div>

      <div className="space-y-6">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="card opacity-60"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[var(--border)] flex items-center justify-center">
              <Monitor size={20} className="text-[var(--text-primary)]" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-[var(--text-primary)]">System</h2>
              <p className="text-sm text-[var(--text-tertiary)]">General application settings</p>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[var(--border)] flex items-center justify-center h-24">
             <span className="text-sm text-[var(--text-tertiary)]">More settings coming soon...</span>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
