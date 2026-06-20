import { NavLink } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  BarChart3,
  Warehouse,
  Activity,
  Settings,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Package, label: 'Inventory', path: '/inventory' },
  { icon: BarChart3, label: 'Analytics', path: '/analytics' },
  { icon: Warehouse, label: 'Warehouse', path: '/warehouse' },
  { icon: Activity, label: 'Activity', path: '/activity' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export default function Sidebar({ collapsed, onToggle }) {
  return (
    <aside
      style={{ width: collapsed ? 72 : 256 }}
      className="relative z-20 flex flex-col h-[calc(100vh-2rem)] my-4 ml-4 rounded-3xl backdrop-blur-xl bg-white/40 border border-white/50 shadow-lg transition-[width] duration-300 ease-in-out shrink-0 overflow-hidden glass-refraction"
    >
      {/* Inner highlight edge */}
      <div className="absolute inset-0 pointer-events-none rounded-3xl" 
        style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.7), inset -1px 0 0 rgba(255,255,255,0.3)' }} 
      />

      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 shrink-0">
        <div className="flex items-center justify-center w-8 h-8 shrink-0 rounded-full overflow-hidden bg-white/60 border border-white/70 shadow-sm">
          <img src="/crate-logo.png" alt="Crate Logo" className="w-full h-full object-cover" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
              className="text-sm font-semibold tracking-tight text-[var(--text-primary)] whitespace-nowrap"
            >
              Crate Inventory
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-0.5 px-3 pt-2 overflow-y-auto overflow-x-hidden">
        {navItems.map(({ icon: Icon, label, path }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) =>
              [
                'group flex items-center gap-3 rounded-xl py-2.5 px-3 text-sm font-medium transition-all duration-200 relative',
                isActive
                  ? 'bg-[var(--accent)]/12 text-[var(--accent)] border border-[var(--accent)]/15 shadow-sm backdrop-blur-sm'
                  : 'text-[var(--text-secondary)] hover:bg-white/50 hover:text-[var(--text-primary)] border border-transparent',
              ].join(' ')
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={`w-[18px] h-[18px] shrink-0 ${
                    collapsed ? 'mx-auto' : ''
                  }`}
                  strokeWidth={isActive ? 2.25 : 1.75}
                />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -4 }}
                      transition={{ duration: 0.12 }}
                      className="whitespace-nowrap"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="mt-auto border-t border-white/40 px-3 py-3 flex flex-col gap-2">
        {/* Workspace indicator */}
        <div
          className={`flex items-center gap-3 rounded-xl py-2 px-3 ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--success)] opacity-40" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--success)]" />
          </span>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -4 }}
                transition={{ duration: 0.12 }}
                className="text-xs font-medium text-[var(--text-tertiary)] whitespace-nowrap"
              >
                Workspace
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={onToggle}
          className={`flex items-center gap-3 rounded-xl py-2.5 px-3 text-[var(--text-tertiary)] hover:bg-white/50 hover:text-[var(--text-secondary)] transition-colors duration-150 cursor-pointer ${
            collapsed ? 'justify-center' : ''
          }`}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronsRight className="w-[18px] h-[18px] shrink-0" strokeWidth={1.75} />
          ) : (
            <>
              <ChevronsLeft className="w-[18px] h-[18px] shrink-0" strokeWidth={1.75} />
              <span className="text-sm font-medium whitespace-nowrap">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
