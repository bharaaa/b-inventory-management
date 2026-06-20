import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, ChevronDown, AlertCircle } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import { useToast } from '../../contexts/ToastContext';
import { TOTAL_WAREHOUSE_CAPACITY } from '../../config/constants';

export default function AddItemDrawer({ isOpen, onClose, onSuccess, totalUsedCapacity = 0 }) {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [openCategory, setOpenCategory] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    stock_count: 0,
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
        if (data.length > 0 && !formData.category_id) {
          setFormData(prev => ({ ...prev, category_id: data[0].id }));
        }
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

  const isOverCapacity = (totalUsedCapacity + parseInt(formData.stock_count || 0, 10)) > TOTAL_WAREHOUSE_CAPACITY;
  const isInvalidPrice = parseFloat(formData.price || 0) < 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isOverCapacity) {
      addToast(`Cannot save: Exceeds total warehouse capacity of ${TOTAL_WAREHOUSE_CAPACITY.toLocaleString()} units.`, 'error');
      return;
    }
    if (isInvalidPrice) {
      addToast(`Cannot save: Price cannot be negative.`, 'error');
      return;
    }
    setLoading(true);
    
    const { data: newProduct, error } = await supabase.from('products').insert([
      {
        name: formData.name,
        category_id: formData.category_id,
        stock_count: parseInt(formData.stock_count, 10),
        price: parseFloat(formData.price) || 0,
        last_updated: new Date().toISOString()
      }
    ]).select().single();

    if (!error && newProduct) {
      await supabase.from('activity_log').insert([{
        product_id: newProduct.id,
        activity_type: 'product_created',
        description: `Product created with initial price of $${newProduct.price} and ${newProduct.stock_count} stock.`
      }]);
    }

    setLoading(false);

    if (error) {
      console.error(error);
      alert('Error adding item. Ensure you have the category_id column added and correct RLS insert policy.');
    } else {
      addToast('Product added successfully', 'success');
      setFormData({ name: '', category_id: categories[0]?.id || '', stock_count: 0, price: '' });
      onSuccess();
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
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
              <h2 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">
                Add New Item
              </h2>
              <button
                onClick={onClose}
                className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors p-1"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form Body - Scrollable */}
            <form id="add-item-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 bg-[var(--bg-card)]">
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
                  className="w-full px-3 py-2 text-sm bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-all"
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
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--accent)] transition-all cursor-pointer ${
                      openCategory ? "border-[var(--accent)] ring-1 ring-[var(--accent)]/20" : ""
                    }`}
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
                        className="absolute left-0 mt-2 w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-xl shadow-sm z-50 py-1.5 overflow-hidden max-h-48 overflow-y-auto"
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
                                : "text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
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
                    Initial Stock
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
                      className={`w-full bg-[var(--bg-primary)] border ${isOverCapacity ? 'border-[var(--error)] focus:ring-[var(--error)]/20 text-[var(--error)]' : 'border-[var(--border)] focus:border-[var(--text-primary)] focus:ring-1 focus:ring-[var(--text-primary)]'} rounded-xl px-4 py-2.5 text-sm outline-none transition-all`}
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
                      className={`w-full bg-[var(--bg-primary)] border ${isInvalidPrice ? 'border-[var(--error)] focus:ring-[var(--error)]/20 text-[var(--error)]' : 'border-[var(--border)] focus:border-[var(--text-primary)] focus:ring-1 focus:ring-[var(--text-primary)]'} rounded-xl pl-8 pr-4 py-2.5 text-sm outline-none transition-all`}
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
            <div className="p-6 border-t border-[var(--border)] bg-[var(--bg-card)] flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] bg-[var(--bg-card)] border border-[var(--border)] rounded-xl hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="add-item-form"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[var(--accent)] rounded-xl hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-70 cursor-pointer"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : 'Add Item'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
