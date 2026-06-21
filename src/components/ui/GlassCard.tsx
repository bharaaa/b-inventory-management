import { motion } from 'framer-motion';

export default function GlassCard({ children, className = '', ...props }) {
  return (
    <motion.div
      className={`bg-black/3 dark:bg-[#1A1A1A]/50 backdrop-blur-sm rounded-2xl border border-[var(--border)] shadow-sm ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
