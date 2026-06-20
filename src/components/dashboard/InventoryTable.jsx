import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Plus, Minus } from 'lucide-react';
import { timeAgo } from '../../helpers/timeAgo';
import { supabase } from '../../services/supabaseClient';
import { useToast } from '../../contexts/ToastContext';

function getStatusBadge(stockCount) {
  if (stockCount >= 50) {
    return {
      label: 'In Stock',
      classes: 'bg-[var(--success-subtle)] text-[var(--success)]',
    };
  }
  if (stockCount >= 10) {
    return {
      label: 'Low Stock',
      classes: 'bg-[var(--warning-subtle)] text-[var(--warning)]',
    };
  }
  return {
    label: 'Critical',
    classes: 'bg-[var(--error-subtle)] text-[var(--error)]',
  };
}

function StockCell({ item, updateStock }) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(item.stock_count);
  const inputRef = useRef(null);

  useEffect(() => {
    setValue(item.stock_count);
  }, [item.stock_count]);

  const handleBlur = () => {
    setIsEditing(false);
    const parsed = parseInt(value, 10);
    if (!isNaN(parsed) && parsed !== item.stock_count && parsed >= 0) {
      const delta = parsed - item.stock_count;
      updateStock(item.id, item.stock_count, delta);
    } else {
      setValue(item.stock_count);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      inputRef.current?.blur();
    }
    if (e.key === "Escape") {
      setValue(item.stock_count);
      setIsEditing(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => updateStock(item.id, item.stock_count, -1)}
        disabled={item.stock_count <= 0}
        className="p-1 rounded-md text-[var(--text-tertiary)] hover:bg-white/40 hover:text-[var(--text-primary)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <Minus size={14} />
      </button>

      {isEditing ? (
        <input
          ref={inputRef}
          type="number"
          autoFocus
          min="0"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="w-12 text-center font-medium bg-white/40 backdrop-blur-sm border border-[var(--border)] rounded px-1 py-0.5 text-sm focus:outline-none focus:border-[var(--accent)]"
        />
      ) : (
        <span
          onClick={() => setIsEditing(true)}
          className="w-12 text-center font-medium cursor-text hover:bg-white/40 hover:text-[var(--text-primary)] rounded px-1 py-0.5 transition-colors"
          title="Click to edit"
        >
          {item.stock_count.toLocaleString()}
        </span>
      )}

      <button
        onClick={() => updateStock(item.id, item.stock_count, 1)}
        className="p-1 rounded-md text-[var(--text-tertiary)] hover:bg-white/40 hover:text-[var(--text-primary)] transition-colors"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr>
      <td className="py-3 pr-4">
        <div className="h-4 w-32 bg-white/30 rounded animate-pulse" />
      </td>
      <td className="py-3 pr-4">
        <div className="h-4 w-12 bg-white/30 rounded animate-pulse" />
      </td>
      <td className="py-3 pr-4">
        <div className="h-5 w-16 bg-white/30 rounded-full animate-pulse" />
      </td>
      <td className="py-3">
        <div className="h-4 w-20 bg-white/30 rounded animate-pulse" />
      </td>
    </tr>
  );
}

const rowVariants = {
  hidden: { opacity: 0 },
  visible: (i) => ({
    opacity: 1,
    transition: { duration: 0.3, delay: 0.3 + i * 0.05 },
  }),
};

export default function InventoryTable({ items = [], loading = false }) {
  const { addToast } = useToast();
  const [localItems, setLocalItems] = useState([]);

  useEffect(() => {
    setLocalItems(items.slice(0, 5));
  }, [items]);

  const updateStock = async (id, currentStock, delta) => {
    const newStock = Math.max(0, currentStock + delta);
    
    // Optimistic UI update
    setLocalItems(prev => prev.map(item => 
      item.id === id ? { ...item, stock_count: newStock, last_updated: new Date().toISOString() } : item
    ));

    const { error } = await supabase
      .from("products")
      .update({ 
        stock_count: newStock,
        last_updated: new Date().toISOString()
      })
      .eq("id", id);

    if (error) {
      console.error(error);
      alert("Failed to update stock");
      // Revert back by re-syncing from props
      setLocalItems(items.slice(0, 5));
    } else {
      addToast("Stock updated successfully", "success");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="bg-[var(--bg-card)] backdrop-blur-xl rounded-2xl border border-[var(--border)] p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <h3 className="text-sm font-medium text-[var(--text-secondary)]">
            Inventory Overview
          </h3>
          {!loading && (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--accent-subtle)] text-[var(--accent)]">
              {items.length}
            </span>
          )}
        </div>
        <Link
          to="/inventory"
          className="text-xs font-medium text-[var(--accent)] hover:underline underline-offset-2 transition-colors"
        >
          View All
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="text-left text-xs uppercase text-[var(--text-tertiary)] font-medium pb-3 pr-4">
                Name
              </th>
              <th className="text-left text-xs uppercase text-[var(--text-tertiary)] font-medium pb-3 pr-4">
                Stock
              </th>
              <th className="text-left text-xs uppercase text-[var(--text-tertiary)] font-medium pb-3 pr-4">
                Status
              </th>
              <th className="text-left text-xs uppercase text-[var(--text-tertiary)] font-medium pb-3">
                Updated
              </th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              : localItems.map((item, i) => {
                  const status = getStatusBadge(item.stock_count);
                  return (
                    <motion.tr
                      key={item.id}
                      custom={i}
                      variants={rowVariants}
                      initial="hidden"
                      animate="visible"
                      className="group hover:bg-white/30 transition-colors duration-150"
                    >
                      <td className="py-3 pr-4 text-sm font-medium text-[var(--text-primary)]">
                        {item.name}
                      </td>
                      <td className="py-3 pr-4 text-sm text-[var(--text-primary)] tabular-nums">
                        <StockCell item={item} updateStock={updateStock} />
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${status.classes}`}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td className="py-3 text-sm text-[var(--text-tertiary)]">
                        {timeAgo(item.last_updated)}
                      </td>
                    </motion.tr>
                  );
                })}
          </tbody>
        </table>
      </div>

      {!loading && localItems.length === 0 && (
        <p className="text-sm text-[var(--text-tertiary)] text-center py-8">
          No inventory items found
        </p>
      )}
    </motion.div>
  );
}
