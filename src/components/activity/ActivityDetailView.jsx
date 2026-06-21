import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Calendar, Info, Box } from 'lucide-react';
import { format } from 'date-fns';

import DrawerHeader from "../ui/DrawerHeader";

export default function ActivityDetailView({ isOpen, onClose, activity, onViewProduct }) {
  if (!activity) return null;

  const Icon = activity.icon;

  const customTitle = (
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-xl ${activity.bgClass}`}>
        <Icon size={18} strokeWidth={3} className={activity.iconColor} />
      </div>
      <div>
        <h2 className="text-base font-semibold text-[var(--text-primary)]">
          {activity.title}
        </h2>
        <p className="text-xs text-[var(--text-tertiary)]">
          {format(activity.rawDate, 'PPp')}
        </p>
      </div>
    </div>
  );

  return (
    <>
      <DrawerHeader title={customTitle} onClose={onClose} />

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Product Card */}
              <div className="bg-white/60 dark:bg-black/40 backdrop-blur-md shadow-sm border border-[var(--border)] rounded-2xl p-5 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-[var(--accent)]" />
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white/40 dark:bg-black/20 backdrop-blur-sm rounded-xl border border-[var(--border)] shadow-sm">
                    <Box size={24} className="text-[var(--text-secondary)]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-1">Affected Product</h3>
                    <p className="text-lg font-bold text-[var(--text-primary)]">{activity.productName}</p>
                    
                    {onViewProduct && activity.originalItem?.product_id && (
                      <button 
                        onClick={() => onViewProduct(activity.originalItem.product_id)}
                        className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-[var(--accent)] hover:underline underline-offset-2"
                      >
                        <ExternalLink size={14} />
                        View Full Details
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Details List */}
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Event Details</h3>
                <div className="bg-white/60 dark:bg-black/40 backdrop-blur-md shadow-sm border border-[var(--border)] rounded-2xl divide-y divide-[var(--border)]">
                  <div className="flex items-start gap-3 p-4">
                    <Calendar size={18} className="text-[var(--text-tertiary)] mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-[var(--text-tertiary)] mb-0.5">Timestamp</p>
                      <p className="text-sm text-[var(--text-secondary)]">{format(activity.rawDate, 'MMMM d, yyyy')}</p>
                      <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{format(activity.rawDate, 'h:mm:ss a')}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4">
                    <Info size={18} className="text-[var(--text-tertiary)] mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-[var(--text-tertiary)] mb-0.5">Description</p>
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                        {activity.description}
                      </p>
                    </div>
                  </div>
                  {activity.originalItem && activity.originalItem.quantity !== undefined && (
                    <div className="flex items-start gap-3 p-4">
                      <div className={`p-1 rounded-md ${activity.bgClass} mt-0.5`}>
                        <Icon size={14} strokeWidth={3} className={activity.iconColor} />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-[var(--text-tertiary)] mb-0.5">Quantity Change</p>
                        <p className="text-sm text-[var(--text-secondary)]">
                          {activity.originalItem.quantity > 0 ? '+' : '-'}{Math.abs(activity.originalItem.quantity)} Units
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
    </>
  );
}
