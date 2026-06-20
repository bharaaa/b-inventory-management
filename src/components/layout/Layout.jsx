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
      className="flex items-center justify-center h-screen w-screen overflow-hidden transition-colors duration-500"
      style={{
        background: `radial-gradient(circle at top left, #1a1a1a 0%, #050505 40%, #000000 100%)`
      }}
    >
      {/* Curated geometric background to maximize glass refraction */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden flex items-center justify-center">
        {/* --- SHARP VIBRANT SHAPES --- */}

        {/* Giant Ring (Top Left) */}
        <div className="absolute -top-[20vh] -right-[10vw] w-[45vw] h-[45vw] rounded-full border-2 border-(--accent) opacity-30 mix-blend-multiply bg-(--accent)" />

        {/* Solid Vibrant Circle (Center Right) */}
        <div className="absolute top-[30vh] -right-[5vw] w-[30vw] h-[30vw] rounded-full bg-gradient-to-tr from-[var(--accent)] via-[var(--accent-hover)] to-[#ec4899] opacity-15 mix-blend-multiply" />

        {/* Small Dense Circle (Bottom Left) */}
        <div className="absolute -bottom-[10vh] left-[15vw] w-[20vw] h-[20vw] rounded-full bg-gradient-to-br from-[var(--success)] to-teal-400 opacity-20 mix-blend-multiply" />

        {/* --- ARCHITECTURAL LINES --- */}

        {/* Primary Diagonal */}
        <div className="absolute top-1/2 left-1/2 w-[200vw] h-[1px] bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-40 -translate-x-1/2 -translate-y-1/2 -rotate-45" />

        {/* Secondary Vertical */}
        <div className="absolute top-0 left-[25vw] w-[1px] h-[100vh] bg-gradient-to-b from-[var(--text-tertiary)] to-transparent opacity-30" />

        {/* Secondary Horizontal */}
        <div className="absolute top-[75vh] left-0 w-[100vw] h-[1px] bg-gradient-to-r from-transparent via-[var(--success)] to-transparent opacity-30" />
      </div>

      {/* App Window Shell */}
      <div className="relative z-10 flex w-full h-full bg-[var(--bg-card)]/40 backdrop-blur-lg overflow-hidden">
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
                className="fixed inset-0 z-40 bg-black/40 backdrop-blur-md"
                onClick={() => setMobileOpen(false)}
              />

              {/* Slide-in sidebar */}
              <motion.div
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: "spring", stiffness: 350, damping: 35 }}
                className="fixed inset-y-0 left-0 z-50 w-64 bg-[var(--bg-card)] backdrop-blur-lg border-r border-[var(--border)]"
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
        <main className="flex-1 flex flex-col bg-black/45 backdrop-blur-md md:m-3 md:rounded-[2rem] shadow-[inset_0_2px_12px_rgba(0,0,0,0.1)] border border-[var(--border)]/50 overflow-hidden relative z-20">
          {/* Top Navigation */}
          {isMobile && (
            <div className="sticky top-0 z-30 flex items-center h-16 px-4 backdrop-blur-sm bg-[var(--bg-primary)]/80 border-b border-[var(--border)] shrink-0">
              <button
                onClick={() => setMobileOpen(true)}
                className="flex items-center justify-center w-10 h-10 rounded-xl text-[var(--text-secondary)] hover:bg-[rgba(255,255,255,0.05)] hover:text-[var(--text-primary)] transition-colors duration-150 cursor-pointer"
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
