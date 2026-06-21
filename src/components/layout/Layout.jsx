import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Sidebar from "./Sidebar";
import { usePreferences } from "../../contexts/PreferencesContext";

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");

    const handleChange = (e) => {
      setIsMobile(e.matches);
      if (!e.matches) setMobileOpen(false);
    };

    handleChange(mq);
    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, []);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <div
      className="flex items-center justify-center h-screen w-screen overflow-hidden transition-colors duration-500 bg-[#F7F8FA]"
    >
      {/* Curated pastel background to maximize glass refraction */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden flex items-center justify-center">
        {/* Soft Blue Blob (Top left) */}
        <div className="absolute -top-[20vh] left-[10vw] w-[20vw] h-[20vw] rounded-full bg-gradient-to-br from-[#007AFF]/20 to-[#5AC8FA]/15 animate-pulse-slow" />

        {/* Soft Blue Blob (Top Right) */}
        <div className="absolute -top-[10vh] -right-[10vw] w-[40vw] h-[40vw] rounded-full bg-gradient-to-br from-[#007AFF]/20 to-[#5AC8FA]/15 animate-pulse-slow" />

        {/* Soft Green Blob (Bottom Left) */}
        <div className="absolute -bottom-[10vh] -left-[5vw] w-[30vw] h-[30vw] rounded-full bg-gradient-to-br from-[#30D158]/15 to-[#5AC8FA]/10" />

        {/* Soft Pink/Orange Blob (Center) */}
        <div className="absolute top-[30vh] left-[30vw] w-[35vw] h-[35vw] rounded-full bg-gradient-to-br from-[#AF52DE]/15 to-[#FF9F0A]/10" />
      </div>

      {/* App Window Shell */}
      <div className="relative z-10 flex w-full h-full overflow-hidden">
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
                className="fixed inset-0 z-40 bg-black/15 backdrop-blur-sm"
                onClick={() => setMobileOpen(false)}
              />

              {/* Slide-in sidebar */}
              <motion.div
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: "spring", stiffness: 350, damping: 35 }}
                className="fixed inset-y-0 left-0 z-50 w-64 bg-white/70 backdrop-blur-md border-r border-[var(--border)]"
              >
                <Sidebar
                  collapsed={false}
                  onToggle={() => setMobileOpen(false)}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Nested Main Content Area */}
        <main className="flex-1 flex flex-col bg-white/40 backdrop-blur-sm md:m-3 md:rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.04),inset_0_1px_1px_rgba(255,255,255,0.8)] border border-white/40 overflow-hidden relative z-20">
          {/* Top Navigation */}
          {isMobile && (
            <div className="sticky top-0 z-30 flex items-center h-16 px-4 backdrop-blur-xl bg-white/60 border-b border-[var(--border)] shrink-0">
              <button
                onClick={() => setMobileOpen(true)}
                className="flex items-center justify-center w-10 h-10 rounded-xl text-[var(--text-secondary)] hover:bg-black/[0.04] hover:text-[var(--text-primary)] transition-colors duration-150 cursor-pointer"
                aria-label="Open navigation"
              >
                <Menu className="w-5 h-5" strokeWidth={1.75} />
              </button>
              <span className="ml-3 text-sm font-semibold tracking-tight text-[var(--text-primary)]">
                Crate Inventory
              </span>
            </div>
          )}

          {/* Scrollable Page Content */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:px-8 md:pb-8 py-5">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
