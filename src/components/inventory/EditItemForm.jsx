import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, ChevronDown, Trash2, AlertCircle } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import { useToast } from '../../contexts/ToastContext';
import { TOTAL_WAREHOUSE_CAPACITY } from '../../config/constants';

export default function EditItemForm({ isOpen, onClose, item, onSuccess, totalUsedCapacity = 0 }) {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [categories, setCategories] = useState([]);
  const [openCategory, setOpenCategory] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    stock_count: 0,
    price: ''
  });

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        category_id: item.category_id || '',
        stock_count: item.stock_count || 0,
        price: item.price || ''
      });
    }
  }, [item]);

  useEffect(() => {
    async function fetchCategories() {
      if (!isOpen) return;
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .order('name');
      
      if (!error && data) {
        setCategories(data);
      }
    }
    fetchCategories();
  }, [isOpen]);

  // Handle outside click for the custom dropdown
  useEffect(() => {
    function handleClick(e) {
      if (openCategory && !e.target.closest("[data-category-menu]")) {
        setOpenCategory(false);
      }
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [openCategory]);

  const originalStock = item?.stock_count || 0;
  const newStock = parseInt(formData.stock_count || 0, 10);
  const capacityDifference = newStock - originalStock;
  const isOverCapacity = capacityDifference > 0 && (totalUsedCapacity + capacityDifference) > TOTAL_WAREHOUSE_CAPACITY;
  const isInvalidPrice = parseFloat(formData.price || 0) < 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!item) return;

    if (isOverCapacity) {
      addToast(`Cannot save: Exceeds total warehouse capacity of ${TOTAL_WAREHOUSE_CAPACITY.toLocaleString()} units.`, 'error');
      return;
    }
    if (isInvalidPrice) {
      addToast(`Cannot save: Price cannot be negative.`, 'error');
      return;
    }
    
    setLoading(true);
    
    const newPrice = parseFloat(formData.price) || 0;
    const oldPrice = parseFloat(item.price) || 0;
    
    const { error } = await supabase
      .from('products')
      .update({
        name: formData.name,
        category_id: formData.category_id,
        stock_count: parseInt(formData.stock_count, 10),
        price: newPrice,
        last_updated: new Date().toISOString()
      })
      .eq('id', item.id);

    if (!error) {
      const logs = [];
      if (newPrice !== oldPrice) {
        logs.push({
          product_id: item.id,
          activity_type: 'price_update',
          description: `Price changed from $${oldPrice} to $${newPrice}`
        });
      }
      if (formData.name !== item.name) {
        logs.push({
          product_id: item.id,
          activity_type: 'name_update',
          description: `Name changed from "${item.name}" to "${formData.name}"`
        });
      }
      if (formData.category_id !== item.category_id) {
        const newCat = categories.find(c => c.id === formData.category_id)?.name;
        const oldCat = categories.find(c => c.id === item.category_id)?.name;
        logs.push({
          product_id: item.id,
          activity_type: 'category_update',
          description: `Category changed from ${oldCat} to ${newCat}`
        });
      }
      if (logs.length > 0) {
        await supabase.from('activity_log').insert(logs);
      }
    }

    setLoading(false);

    if (error) {
      console.error(error);
      alert('Error updating item.');
    } else {
      addToast('Product updated successfully', 'success');
      onSuccess();
      onClose();
    }
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!item) return;
    setLoading(true);
    const { error } = await supabase.from('products').delete().eq('id', item.id);
    setLoading(false);
    
    if (error) {
      console.error(error);
      alert('Error deleting item.');
    } else {
      setShowDeleteConfirm(false);
      addToast('Product deleted', 'success');
      onSuccess();
      onClose();
    }
  };

  return (
    <>
      {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border)] bg-[rgba(255,255,255,0.03)] backdrop-blur-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] relative z-10">
              <h2 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">
                Edit Item
              </h2>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.08)] backdrop-blur-sm text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-all duration-200 border border-[var(--border)] shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] cursor-pointer glass-refraction"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form Body - Scrollable */}
            <form id="edit-item-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                  Item Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm bg-[rgba(255,255,255,0.08)] backdrop-blur-sm border border-[var(--border)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] focus:bg-white focus:ring-4 focus:ring-[var(--accent)]/10 hover:bg-white/10 hover:border-[var(--accent)]/50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] transition-all duration-200 glass-refraction"
                  placeholder="e.g. Magic Keyboard"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                  Category
                </label>
                <div className="relative" data-category-menu>
                  <button
                    type="button"
                    onClick={() => setOpenCategory(!openCategory)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-sm bg-[rgba(255,255,255,0.08)] backdrop-blur-sm border border-[var(--border)] rounded-xl focus:outline-none focus:border-[var(--accent)] focus:bg-white focus:ring-4 focus:ring-[var(--accent)]/10 hover:bg-white/10 hover:border-[var(--accent)]/50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] transition-all duration-200 cursor-pointer ${
                      openCategory ? "border-[var(--accent)] ring-1 ring-[var(--accent)]/20" : ""
                    } glass-refraction`}
                  >
                    <span className="text-[var(--text-primary)]">
                      {categories.find(c => c.id === formData.category_id)?.name || (categories.length === 0 ? "Loading categories..." : "Select Category")}
                    </span>
                    <ChevronDown size={16} className={`text-[var(--text-tertiary)] transition-transform duration-200 ${openCategory ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {openCategory && (
                      <motion.div
                        initial={{ opacity: 0, y: 4, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.98 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute left-0 mt-2 w-full bg-white/80 backdrop-blur-xl border border-[var(--border)] rounded-xl shadow-[0_16px_40px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.8)] z-50 py-1.5 overflow-hidden max-h-48 overflow-y-auto glass-refraction"
                      >
                        {categories.map((cat) => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, category_id: cat.id });
                              setOpenCategory(false);
                            }}
                            className={`w-full text-left px-4 py-2.5 text-sm transition-colors duration-150 ${
                              formData.category_id === cat.id
                                ? "text-[var(--accent)] bg-[var(--accent-subtle)] font-medium"
                                : "text-[var(--text-secondary)] hover:bg-[rgba(255,255,255,0.05)] hover:text-[var(--text-primary)]"
                            }`}
                          >
                            {cat.name}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label htmlFor="stock" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                    Stock
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      value={formData.stock_count}
                      onKeyDown={(e) => {
                        if (['e', 'E', '+', '-', '.'].includes(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        setFormData({...formData, stock_count: val});
                      }}
                      className={`w-full bg-[rgba(255,255,255,0.08)] backdrop-blur-sm shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] border ${isOverCapacity ? 'border-[var(--error)] focus:ring-4 focus:ring-[var(--error)]/20 text-[var(--error)]' : 'border-[var(--border)] focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/10 hover:border-[var(--accent)]/50'} rounded-xl px-4 py-2.5 text-sm outline-none focus:bg-white hover:bg-white/10 transition-all duration-200 glass-refraction`}
                      required
                    />
                    {isOverCapacity && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--error)]">
                        <AlertCircle size={16} />
                      </div>
                    )}
                  </div>
                  {isOverCapacity && (
                    <p className="text-[11px] text-[var(--error)] font-medium mt-1.5 flex items-center gap-1">
                      Exceeds {TOTAL_WAREHOUSE_CAPACITY.toLocaleString()} unit capacity (Available: {(TOTAL_WAREHOUSE_CAPACITY - totalUsedCapacity).toLocaleString()})
                    </p>
                  )}
                </div>
                <div className="flex-1">
                  <label htmlFor="price" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                    Price (USD)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className={`text-sm ${isInvalidPrice ? 'text-[var(--error)]' : 'text-[var(--text-tertiary)]'}`}>$</span>
                    </div>
                    <input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={formData.price}
                      onKeyDown={(e) => {
                        if (['e', 'E', '+', '-'].includes(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9.]/g, '');
                        // Prevent multiple decimal points
                        const parts = val.split('.');
                        const cleanVal = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : val;
                        setFormData({ ...formData, price: cleanVal });
                      }}
                      className={`w-full bg-[rgba(255,255,255,0.08)] backdrop-blur-sm shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] border ${isInvalidPrice ? 'border-[var(--error)] focus:ring-4 focus:ring-[var(--error)]/20 text-[var(--error)]' : 'border-[var(--border)] focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/10 hover:border-[var(--accent)]/50'} rounded-xl pl-8 pr-4 py-2.5 text-sm outline-none focus:bg-white hover:bg-white/10 transition-all duration-200 glass-refraction`}
                    />
                    {isInvalidPrice && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--error)]">
                        <AlertCircle size={16} />
                      </div>
                    )}
                  </div>
                  {isInvalidPrice && (
                    <p className="text-[11px] text-[var(--error)] font-medium mt-1.5 flex items-center gap-1">
                      Price cannot be less than $0
                    </p>
                  )}
                </div>
              </div>
            </form>

            {/* Sticky Footer */}
            <div className="p-6 border-t border-[var(--border)] bg-[rgba(255,255,255,0.05)] backdrop-blur-sm flex gap-3">
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2.5 text-sm font-medium text-[var(--error)] bg-[var(--error)]/10 border border-[var(--error)]/20 rounded-xl hover:bg-[var(--error)]/20 transition-colors cursor-pointer flex items-center justify-center"
                title="Delete Item"
              >
                <Trash2 size={16} />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] bg-[rgba(255,255,255,0.05)] backdrop-blur-sm border border-[var(--border)] rounded-xl hover:bg-white/60 hover:text-[var(--text-primary)] shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] transition-all duration-200 cursor-pointer glass-refraction"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="edit-item-form"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[var(--accent)] rounded-xl hover:bg-[var(--accent-hover)] shadow-[0_4px_12px_rgba(124,58,237,0.4),inset_0_1px_0_rgba(255,255,255,0.3)] transition-all duration-200 disabled:opacity-70 cursor-pointer"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : 'Save Changes'}
              </button>
            </div>
          {/* Delete Confirmation Full-Screen Overlay */}
          <AnimatePresence>
            {showDeleteConfirm && (
              <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowDeleteConfirm(false)}
                  className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 16 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 16 }}
                  transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="relative bg-white/10 backdrop-blur-xl border border-[var(--border)] rounded-2xl shadow-2xl p-6 w-full max-w-sm glass-refraction"
                >
                  <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">Delete Product</h3>
                  <p className="text-sm text-[var(--text-secondary)] mb-6">
                    Are you sure you want to delete <span className="font-semibold text-[var(--text-primary)]">"{formData.name}"</span>? This action cannot be undone.
                  </p>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      disabled={loading}
                      className="flex-1 px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] bg-[rgba(255,255,255,0.03)] backdrop-blur-sm border border-[var(--border)] rounded-xl hover:bg-[rgba(255,255,255,0.05)] transition-colors cursor-pointer glass-refraction"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={confirmDelete}
                      disabled={loading}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[var(--error)] rounded-xl hover:bg-red-600 transition-colors disabled:opacity-70 cursor-pointer"
                    >
                      {loading ? <Loader2 size={16} className="animate-spin" /> : 'Yes, Delete'}
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
    </>
  );
}
