import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import Sidebar from './Sidebar';

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');

    const handleChange = (e) => {
      setIsMobile(e.matches);
      if (!e.matches) setMobileOpen(false);
    };

    handleChange(mq);
    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, []);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <div 
      className="flex h-screen w-screen overflow-hidden"
      style={{
        background: `
          linear-gradient(135deg, #eef1f6 0%, #e8e0f0 25%, #dfe8f5 50%, #ece5f3 75%, #eef1f6 100%)
        `,
      }}
    >
      {/* Ambient gradient orbs for glass refraction */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div 
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-30 blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)' }}
        />
        <div 
          className="absolute top-1/2 -right-48 w-[500px] h-[500px] rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, transparent 70%)' }}
        />
        <div 
          className="absolute -bottom-24 left-1/3 w-80 h-80 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(168, 85, 247, 0.2) 0%, transparent 70%)' }}
        />
      </div>

      {/* Desktop sidebar */}
      {!isMobile && (
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed((prev) => !prev)}
        />
      )}

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {isMobile && mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-md"
              onClick={() => setMobileOpen(false)}
            />

            {/* Slide-in sidebar */}
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 350, damping: 35 }}
              className="fixed inset-y-0 left-0 z-50 w-64"
            >
              <Sidebar
                collapsed={false}
                onToggle={() => setMobileOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="relative z-10 flex-1 flex flex-col h-screen overflow-y-auto overflow-x-hidden">
        {/* Mobile top bar */}
        {isMobile && (
          <div className="sticky top-0 z-30 flex items-center h-14 px-4 backdrop-blur-xl bg-[var(--bg-card)] border-b border-[var(--border)]">
            <button
              onClick={() => setMobileOpen(true)}
              className="flex items-center justify-center w-9 h-9 rounded-xl text-[var(--text-secondary)] hover:bg-white/40 hover:text-[var(--text-primary)] transition-colors duration-150 cursor-pointer"
              aria-label="Open navigation"
            >
              <Menu className="w-5 h-5" strokeWidth={1.75} />
            </button>
            <span className="ml-3 text-sm font-semibold tracking-tight text-[var(--text-primary)]">
              Crate Inventory
            </span>
          </div>
        )}

        {/* Page content */}
        <div className="flex-1 flex flex-col min-h-0 p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
