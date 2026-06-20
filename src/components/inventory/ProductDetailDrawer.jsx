import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, DollarSign, Tag, Calendar, Activity, ArrowUpRight, ArrowDownRight, ArrowRight, Settings } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import { formatActivityEvent } from "../../helpers/activityHelpers";
import { formatDate } from '../../helpers/formatDate';
import { timeAgo } from '../../helpers/timeAgo';

function getStatusBadge(stockCount) {
  if (stockCount >= 50) {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--success-subtle)] text-[var(--success)]">
        In Stock
      </span>
    );
  } else if (stockCount >= 10) {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--warning-subtle)] text-[var(--warning)]">
        Low Stock
      </span>
    );
  } else {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--error-subtle)] text-[var(--error)]">
        Critical
      </span>
    );
  }
}

export default function ProductDetailDrawer({ isOpen, onClose, item: initialItem, productId, onEdit }) {
  const [fetchedItem, setFetchedItem] = useState(null);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(false);

  const item = initialItem || fetchedItem;
  const currentProductId = initialItem?.id || productId;

  // Fetch product data if only productId is provided
  useEffect(() => {
    async function fetchProduct() {
      if (!isOpen || initialItem || !productId) return;
      
      const { data, error } = await supabase
        .from('products')
        .select(`*, categories(name)`)
        .eq('id', productId)
        .single();
        
      if (!error && data) {
        setFetchedItem({
          ...data,
          category_name: data.categories?.name
        });
      }
    }
    fetchProduct();
  }, [isOpen, initialItem, productId]);

  // Fetch movements and activity
  useEffect(() => {
    async function fetchMovements() {
      if (!isOpen || !currentProductId) return;
      setLoading(true);
      
      const [stockResponse, activityResponse] = await Promise.all([
        supabase
          .from('stock_movements')
          .select('*')
          .eq('product_id', currentProductId)
          .order('created_at', { ascending: false })
          .limit(20),
        supabase
          .from('activity_log')
          .select('*')
          .eq('product_id', currentProductId)
          .order('created_at', { ascending: false })
          .limit(20)
      ]);
        
      const merged = [];
      if (!stockResponse.error && stockResponse.data) {
        merged.push(...stockResponse.data.map(m => formatActivityEvent({
          ...m,
          _type: 'stock'
        })));
      }
      if (!activityResponse.error && activityResponse.data) {
        merged.push(...activityResponse.data.map(a => formatActivityEvent({
          ...a,
          _type: 'activity'
        })));
      }

      merged.sort((a, b) => b.rawDate - a.rawDate);
      
      setMovements(merged.slice(0, 50));
      setLoading(false);
    }
    fetchMovements();
  }, [isOpen, currentProductId]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-full max-w-md h-full bg-[var(--bg-card)] border-l border-[var(--border)] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] bg-[var(--bg-card)]">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">
                  {item?.name}
                </h2>
                {item && getStatusBadge(item.stock_count)}
              </div>
              <button
                onClick={onClose}
                className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors p-1 rounded-md"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-[var(--bg-card)]">
              
              {/* Overview Section */}
              <section>
                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                  <Activity size={16} className="text-[var(--text-tertiary)]" />
                  Overview
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl p-4">
                    <div className="flex items-center gap-2 text-[var(--text-secondary)] mb-1">
                      <Package size={14} />
                      <span className="text-xs font-medium">Current Stock</span>
                    </div>
                    <p className="text-xl font-bold text-[var(--text-primary)]">
                      {item?.stock_count} <span className="text-sm font-normal text-[var(--text-tertiary)]">units</span>
                    </p>
                  </div>
                  <div className="bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl p-4">
                    <div className="flex items-center gap-2 text-[var(--text-secondary)] mb-1">
                      <DollarSign size={14} />
                      <span className="text-xs font-medium">Unit Price</span>
                    </div>
                    <p className="text-xl font-bold text-[var(--text-primary)]">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(item?.price || 0)}
                    </p>
                  </div>
                  <div className="bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl p-4">
                    <div className="flex items-center gap-2 text-[var(--text-secondary)] mb-1">
                      <DollarSign size={14} />
                      <span className="text-xs font-medium">Total Value</span>
                    </div>
                    <p className="text-xl font-bold text-[var(--text-primary)]">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format((item?.stock_count || 0) * (item?.price || 0))}
                    </p>
                  </div>
                  <div className="bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl p-4">
                    <div className="flex items-center gap-2 text-[var(--text-secondary)] mb-1">
                      <Tag size={14} />
                      <span className="text-xs font-medium">Category</span>
                    </div>
                    <p className="text-sm font-medium text-[var(--text-primary)] mt-1 truncate">
                      {item?.categories?.name || "Uncategorized"}
                    </p>
                  </div>
                </div>
              </section>

              {/* Activity Timeline */}
              <section>
                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-5 flex items-center gap-2">
                  <Calendar size={16} className="text-[var(--text-tertiary)]" />
                  Activity History
                </h3>
                
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : movements.length === 0 ? (
                  <div className="text-center py-8 bg-[var(--bg-primary)] border border-[var(--border)] border-dashed rounded-xl">
                    <p className="text-sm text-[var(--text-secondary)]">No activity recorded yet.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {movements.map((movement, index) => {
                      const isLast = index === movements.length - 1;
                      const IconComp = movement.icon;

                      return (
                        <div key={movement.id} className="relative flex gap-4">
                          {/* Timeline Line */}
                          {!isLast && (
                            <div className="absolute left-[15px] top-8 bottom-[-24px] w-px bg-[var(--border)]" />
                          )}
                          
                          {/* Icon Badge */}
                          <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${movement.bgClass} ${movement.iconColor}`}>
                            <IconComp size={14} strokeWidth={3} />
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1 pt-1.5 pb-2">
                            <div className="flex justify-between items-start mb-1">
                              <div>
                                <p className="text-sm font-medium text-[var(--text-primary)]">
                                  {movement.title}
                                </p>
                                {movement.description && (
                                  <p className="text-sm text-[var(--text-secondary)] mt-0.5">
                                    {movement.description}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)] mt-1.5">
                              <span>{formatDate(movement.created_at)}</span>
                              <span>•</span>
                              <span>{timeAgo(movement.created_at)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

            </div>

            {/* Footer */}
            <div className="p-6 border-t border-[var(--border)] bg-[var(--bg-card)] flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(item);
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-[var(--bg-card)] bg-[var(--text-primary)] rounded-xl hover:bg-[var(--text-secondary)] transition-colors cursor-pointer"
              >
                Edit Item <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
