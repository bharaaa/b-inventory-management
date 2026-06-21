export default function DrawerFooter({ children }) {
  return (
    <div className="p-6 border-t border-[var(--border)] bg-white/60 dark:bg-black/70 backdrop-blur-sm flex gap-3 shrink-0 mt-auto relative z-10">
      {children}
    </div>
  );
}
