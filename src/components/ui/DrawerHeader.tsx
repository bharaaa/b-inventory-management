import { X } from "lucide-react";

export default function DrawerHeader({ title, badge, onClose }) {
  return (
    <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border)] bg-white/70 dark:bg-black/60 backdrop-blur-sm shadow-[0_1px_0_rgba(0,0,0,0.05)] relative z-10 shrink-0">
      <div className="flex items-center gap-3">
        {typeof title === "string" ? (
          <h2 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">
            {title}
          </h2>
        ) : (
          title
        )}
        {badge}
      </div>
      <button
        onClick={onClose}
        className="w-8 h-8 flex items-center justify-center rounded-lg bg-black/[0.02] hover:bg-black/[0.04] dark:bg-white/[0.02] dark:hover:bg-white/[0.05] backdrop-blur-sm text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-all duration-200 border border-[var(--border)] cursor-pointer"
      >
        <X size={20} />
      </button>
    </div>
  );
}
