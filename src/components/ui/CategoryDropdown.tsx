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
        className={`w-full flex items-center justify-between px-4 py-2.5 text-sm bg-white/60 dark:bg-black/40 backdrop-blur-sm border border-[var(--border)] rounded-xl focus:outline-none focus:border-[var(--accent)] focus:bg-white dark:focus:bg-black/60 focus:ring-4 focus:ring-[var(--accent)]/10 hover:bg-white/80 dark:hover:bg-black/60 hover:border-[var(--accent)]/50 shadow-sm transition-all duration-200 cursor-pointer ${
          open ? "border-[var(--accent)] ring-1 ring-[var(--accent)]/20" : ""
        }`}
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
            className="absolute left-0 mt-2 w-full bg-white/80 dark:bg-[#1A1A1A]/90 backdrop-blur-md border border-[var(--border)] rounded-xl shadow-sm z-50 py-1.5 overflow-hidden max-h-48 overflow-y-auto"
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
                    : "text-[var(--text-secondary)] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] hover:text-[var(--text-primary)]"
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
