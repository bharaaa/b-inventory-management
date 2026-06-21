import { motion } from 'framer-motion';

export default function SplashScreen() {
  return (
    <div className="fixed inset-0 z-[999] bg-[var(--bg-primary)] dark:bg-black flex flex-col items-center justify-center overflow-hidden">
      
      {/* Background ambient glow */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[var(--accent)]/10 blur-[80px] rounded-full pointer-events-none" 
      />

      {/* Logo Container */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative z-10 flex flex-col items-center"
      >
        <motion.div
          animate={{ 
            boxShadow: [
              "0px 0px 0px 0px rgba(23, 23, 23, 0.2)",
              "0px 0px 0px 20px rgba(23, 23, 23, 0)",
            ]
          }}
          transition={{ 
            duration: 1.5, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden bg-white/50 dark:bg-black/40 backdrop-blur-md border-2 border-[var(--border)] shadow-xl relative"
        >
          {/* Inner pulse */}
          <motion.div 
            className="absolute inset-0 bg-[var(--accent)]/5 rounded-full"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <img 
            src="/crate-logo.png" 
            alt="Crate Logo" 
            className="w-full h-full object-cover relative z-10" 
          />
        </motion.div>

        {/* Text */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          className="mt-6 text-center"
        >
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            Crate Inventory
          </h1>
          <div className="flex items-center justify-center gap-2 mt-3">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}
