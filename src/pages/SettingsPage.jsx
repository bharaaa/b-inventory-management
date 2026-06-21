import { motion } from "framer-motion";
import { Settings, Sparkles, Monitor, Palette, Moon, Sun } from "lucide-react";
import { usePreferences } from "../contexts/PreferencesContext";

export default function SettingsPage() {
  const { theme, setTheme, accent, setAccent } = usePreferences();

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
          transition={{ duration: 0.5, delay: 0.1 }}
          className="card"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-white/20 border border-[var(--border)] flex items-center justify-center shadow-sm">
              <Palette size={20} className="text-[var(--text-primary)]" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-[var(--text-primary)]">Appearance</h2>
              <p className="text-sm text-[var(--text-tertiary)]">Customize the look and feel of the app</p>
            </div>
          </div>
          
          <div className="p-5 rounded-2xl bg-white/10 border border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
             <div>
               <h3 className="text-sm font-semibold text-[var(--text-primary)]">Theme Preference</h3>
               <p className="text-xs text-[var(--text-tertiary)] mt-1">Choose your preferred liquid glass variant.</p>
             </div>
             
             <div className="flex items-center p-1 bg-black/5 dark:bg-white/5 rounded-xl border border-[var(--border)] w-fit">
               <button
                 onClick={() => setTheme('light')}
                 className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${theme === 'light' ? 'bg-white shadow-sm text-black' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
               >
                 <Sun size={14} />
                 Light
               </button>
               <button
                 onClick={() => setTheme('dark')}
                 className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${theme === 'dark' ? 'bg-[#2A2A2A] shadow-sm text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
               >
                 <Moon size={14} />
                 Dark
               </button>
               <button
                 onClick={() => setTheme('system')}
                 className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${theme === 'system' ? 'bg-[var(--bg-card)] shadow-sm text-[var(--text-primary)] border border-[var(--border)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
               >
                 <Monitor size={14} />
                 System
               </button>
             </div>
          </div>

          <div className="p-5 mt-4 rounded-2xl bg-white/10 border border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
             <div>
               <h3 className="text-sm font-semibold text-[var(--text-primary)]">Accent Color</h3>
               <p className="text-xs text-[var(--text-tertiary)] mt-1">Choose your primary brand color.</p>
             </div>
             
             <div className="flex items-center gap-4 p-1">
               {[
                 { id: 'blue', color: '#007AFF' },
                 { id: 'violet', color: '#7C3AED' },
                 { id: 'emerald', color: '#10B981' },
                 { id: 'rose', color: '#F43F5E' }
               ].map(c => (
                 <button
                   key={c.id}
                   onClick={() => setAccent(c.id)}
                   className={`w-7 h-7 rounded-full shadow-sm transition-all duration-300 cursor-pointer ${accent === c.id ? 'ring-2 ring-offset-2 ring-offset-[var(--bg-primary)] ring-[var(--text-primary)] scale-110' : 'hover:scale-110 opacity-70 hover:opacity-100'}`}
                   style={{ backgroundColor: c.color }}
                   aria-label={`Set accent color to ${c.id}`}
                 />
               ))}
             </div>
           </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="card opacity-60"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-white/20 border border-[var(--border)] flex items-center justify-center shadow-sm">
              <Settings size={20} className="text-[var(--text-primary)]" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-[var(--text-primary)]">System</h2>
              <p className="text-sm text-[var(--text-tertiary)]">General application settings</p>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-white/10 border border-[var(--border)] flex items-center justify-center h-24">
             <span className="text-sm text-[var(--text-tertiary)]">More settings coming soon...</span>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
