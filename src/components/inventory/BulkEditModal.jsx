import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, ChevronDown } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import { useToast } from '../../contexts/ToastContext';

export default function BulkEditModal({ isOpen, onClose, onSuccess, selectedIds }) {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [openCategory, setOpenCategory] = useState(false);
  const [formData, setFormData] = useState({
    category_id: '',
    stock_count: '',
    price: ''
  });

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

  useEffect(() => {
    function handleClick(e) {
      if (openCategory && !e.target.closest("[data-category-menu]")) {
        setOpenCategory(false);
      }
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [openCategory]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedIds || selectedIds.length === 0) return;
    
    // Only include fields that are actually filled out
    const updates = { last_updated: new Date().toISOString() };
    if (formData.category_id) updates.category_id = formData.category_id;
    if (formData.stock_count !== '') updates.stock_count = parseInt(formData.stock_count, 10);
    if (formData.price !== '') updates.price = parseFloat(formData.price);

    // If nothing to update except last_updated, just close
    if (Object.keys(updates).length === 1) {
      onClose();
      return;
    }

    setLoading(true);
    
    // Fetch old items to diff changes
    const { data: oldItems } = await supabase
      .from('products')
      .select('id, price, category_id')
      .in('id', selectedIds);

    const { error } = await supabase
      .from('products')
      .update(updates)
      .in('id', selectedIds);

    if (!error && oldItems && oldItems.length > 0) {
      const logs = [];
      for (const item of oldItems) {
        if ('price' in updates && updates.price !== item.price) {
          logs.push({
            product_id: item.id,
            activity_type: 'price_update',
            description: `Price bulk updated from $${item.price} to $${updates.price}`
          });
        }
        if ('category_id' in updates && updates.category_id !== item.category_id) {
          const newCat = categories.find(c => c.id === updates.category_id)?.name;
          const oldCat = categories.find(c => c.id === item.category_id)?.name;
          logs.push({
            product_id: item.id,
            activity_type: 'category_update',
            description: `Category bulk updated from ${oldCat || 'Uncategorized'} to ${newCat || 'Uncategorized'}`
          });
        }
      }
      if (logs.length > 0) {
        await supabase.from('activity_log').insert(logs);
      }
    }

    setLoading(false);

    if (error) {
      console.error(error);
      alert('Error bulk updating items.');
    } else {
      addToast(`Successfully updated ${selectedIds.length} items`, 'success');
      // Reset form
      setFormData({ category_id: '', stock_count: '', price: '' });
      onSuccess();
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative w-full max-w-md bg-white/10 backdrop-blur-xl border border-[var(--border)] rounded-2xl shadow-xl glass-refraction"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] bg-[rgba(255,255,255,0.05)] backdrop-blur-sm rounded-t-2xl glass-refraction">
              <h2 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">
                Bulk Edit ({selectedIds.length} items)
              </h2>
              <button
                onClick={onClose}
                className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors p-1"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5 rounded-b-2xl">
              <p className="text-sm text-[var(--text-secondary)] mb-4">
                Leave fields empty to keep their current values unchanged.
              </p>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                  New Category
                </label>
                <div className="relative" data-category-menu>
                  <button
                    type="button"
                    onClick={() => setOpenCategory(!openCategory)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm bg-[rgba(255,255,255,0.03)] backdrop-blur-sm border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--accent)] transition-all cursor-pointer ${
                      openCategory ? "border-[var(--accent)] ring-1 ring-[var(--accent)]/20" : ""
                    } glass-refraction`}
                  >
                    <span className={formData.category_id ? "text-[var(--text-primary)]" : "text-[var(--text-tertiary)]"}>
                      {formData.category_id 
                        ? categories.find(c => c.id === formData.category_id)?.name 
                        : "Leave unchanged"}
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
                        className="absolute left-0 mt-2 w-full bg-white/10 backdrop-blur-md border border-[var(--border)] rounded-xl shadow-sm z-50 py-1.5 overflow-hidden max-h-48 overflow-y-auto glass-refraction"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, category_id: '' });
                            setOpenCategory(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-sm transition-colors duration-150 ${
                            formData.category_id === ''
                              ? "text-[var(--accent)] bg-[var(--accent-subtle)] font-medium"
                              : "text-[var(--text-secondary)] hover:bg-[rgba(255,255,255,0.05)] hover:text-[var(--text-primary)]"
                          }`}
                        >
                          Leave unchanged
                        </button>
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
                    New Stock (Flat)
                  </label>
                  <input
                    id="stock"
                    type="number"
                    min="0"
                    value={formData.stock_count}
                    onChange={(e) => setFormData({ ...formData, stock_count: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-[rgba(255,255,255,0.03)] backdrop-blur-sm border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-all placeholder:text-[var(--text-tertiary)] glass-refraction"
                    placeholder="Leave unchanged"
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor="price" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                    New Price ($)
                  </label>
                  <input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-[rgba(255,255,255,0.03)] backdrop-blur-sm border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-all placeholder:text-[var(--text-tertiary)] glass-refraction"
                    placeholder="Leave unchanged"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] bg-[rgba(255,255,255,0.08)] border border-[var(--border)] rounded-xl hover:bg-[rgba(255,255,255,0.05)] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[var(--accent)] rounded-xl hover:bg-[var(--accent-hover)] shadow-[0_2px_8px_rgba(124,58,237,0.3)] transition-colors disabled:opacity-70 cursor-pointer"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : 'Apply Updates'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
