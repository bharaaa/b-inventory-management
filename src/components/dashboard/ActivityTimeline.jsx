import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';



const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export default function ActivityTimeline({ activities = [], title = "Recent Activity", limit = 6, showHeader = true }) {
  const navigate = useNavigate();
  const visibleActivities = limit ? activities.slice(0, limit) : activities;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="bg-black/3 dark:bg-[#1A1A1A]/80 backdrop-blur-sm rounded-2xl border border-[var(--border)] shadow-sm p-6"
    >
      {/* Header */}
      {showHeader && (
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] tracking-tight">
            {title}
          </h3>
          <button 
            onClick={() => navigate('/activity')}
            className="text-xs font-medium text-[var(--accent)] hover:underline underline-offset-2 transition-colors cursor-pointer"
          >
            View All
          </button>
        </div>
      )}

      {/* Timeline */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {visibleActivities.map((activity, idx) => {
          const isLast = idx === visibleActivities.length - 1;

          return (
            <motion.div
              key={activity.id}
              variants={itemVariants}
              className="relative flex gap-3 py-3"
            >
              {/* Icon Badge + Line */}
              <div className="flex flex-col items-center pt-1.5 relative">
                <div className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${activity.bgClass} ${activity.iconColor}`}>
                  <activity.icon size={14} strokeWidth={3} />
                </div>
                {!isLast && (
                  <div
                    className="w-px flex-1 mt-1 absolute top-7 bottom-[-12px]"
                    style={{ backgroundColor: 'var(--border)' }}
                  />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[var(--text-primary)] leading-snug">
                  {activity.productName && (
                    <span className="font-medium">{activity.productName}: </span>
                  )}
                  {activity.description}
                </p>
                <p className="text-xs text-[var(--text-tertiary)] mt-1">
                  {activity.timestamp}
                </p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {visibleActivities.length === 0 && (
        <p className="text-sm text-[var(--text-tertiary)] text-center py-8">
          No recent activity
        </p>
      )}
    </motion.div>
  );
}
