import { motion } from "framer-motion";
import { Settings, Sparkles, Monitor, Palette } from "lucide-react";
import { usePreferences } from "../contexts/PreferencesContext";

export default function SettingsPage() {
  const { enableRefraction, toggleRefraction } = usePreferences();

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
        {/* Appearance Section */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="card"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[var(--border)] flex items-center justify-center">
              <Palette size={20} className="text-[var(--text-primary)]" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-[var(--text-primary)]">Appearance</h2>
              <p className="text-sm text-[var(--text-tertiary)]">Manage visual effects and theme</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Refraction Toggle */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-[rgba(120,120,120,0.05)] border border-[var(--border)]">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 mt-0.5 rounded-lg bg-[rgba(120,120,120,0.1)] flex items-center justify-center">
                  <Sparkles size={16} className={enableRefraction ? "text-[var(--accent)]" : "text-[var(--text-tertiary)]"} />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-[var(--text-primary)]">Liquid Glass Refraction</h3>
                  <p className="text-xs text-[var(--text-tertiary)] mt-1 max-w-sm">
                    Enable realistic diagonal light glare and edge highlights on translucent surfaces. Disabling this may improve performance on older devices.
                  </p>
                </div>
              </div>

              {/* Refraction Toggle Switch */}
              <button
                onClick={toggleRefraction}
                className={`relative w-12 h-7 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)] ${
                  enableRefraction ? "bg-[var(--accent)]" : "bg-[rgba(120,120,120,0.2)]"
                }`}
                aria-pressed={enableRefraction}
                aria-label="Toggle Glass Refraction"
              >
                <motion.div
                  className="absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow-sm"
                  animate={{ x: enableRefraction ? 20 : 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </button>
            </div>
          </div>
        </motion.section>

        {/* System Settings (Placeholder) */}
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
