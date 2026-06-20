import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CategoryDropdown({ categories, value, onChange }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef} data-category-menu>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between px-4 py-2.5 text-sm bg-[rgba(255,255,255,0.08)] backdrop-blur-sm border border-[var(--border)] rounded-xl focus:outline-none focus:border-[var(--accent)] focus:bg-white/15 focus:ring-4 focus:ring-[var(--accent)]/10 hover:bg-white/10 hover:border-[var(--accent)]/50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] transition-all duration-200 cursor-pointer ${
          open ? "border-[var(--accent)] ring-1 ring-[var(--accent)]/20" : ""
        } glass-refraction`}
      >
        <span className="text-[var(--text-primary)]">
          {categories.find(c => c.id === value)?.name || (categories.length === 0 ? "Loading categories..." : "Select Category")}
        </span>
        <ChevronDown size={16} className={`text-[var(--text-tertiary)] transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute left-0 mt-2 w-full bg-[#121212]/85 backdrop-blur-3xl border border-[var(--border)] rounded-xl shadow-[0_16px_40px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)] z-50 py-1.5 overflow-hidden max-h-48 overflow-y-auto"
          >
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  onChange(cat.id);
                  setOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors duration-150 ${
                  value === cat.id
                    ? "text-[var(--accent)] bg-[var(--accent-subtle)] font-medium"
                    : "text-[var(--text-secondary)] hover:bg-[rgba(255,255,255,0.05)] hover:text-[var(--text-primary)]"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
