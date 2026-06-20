import { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, X, Info } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto dismiss after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="pointer-events-auto bg-[var(--bg-card)] border border-[var(--border)] shadow-xl shadow-black/5 rounded-2xl p-4 flex items-center gap-3 w-80 relative overflow-hidden"
            >
              {/* Glass subtle gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/[0.02] to-transparent pointer-events-none" />
              
              <div className="shrink-0 p-1.5 rounded-full bg-[var(--bg-primary)] border border-[var(--border)]">
                {toast.type === 'success' && <CheckCircle2 className="text-[var(--success)]" size={18} />}
                {toast.type === 'error' && <AlertCircle className="text-[var(--error)]" size={18} />}
                {toast.type === 'info' && <Info className="text-[var(--accent)]" size={18} />}
              </div>
              
              <div className="flex-1 text-sm font-medium text-[var(--text-primary)]">
                {toast.message}
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors shrink-0 p-1 rounded-md hover:bg-[var(--bg-secondary)]"
              >
                <X size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
