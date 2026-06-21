import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "../../services/supabaseClient";
import DrawerHeader from "../ui/DrawerHeader";
import DrawerFooter from "../ui/DrawerFooter";
import { useToast } from "../../contexts/ToastContext";
import { TOTAL_WAREHOUSE_CAPACITY } from "../../config/constants";
import CategoryDropdown from "../ui/CategoryDropdown";
import { useCurrency } from "../../hooks/useCurrency";

export default function AddItemForm({
  isOpen,
  onClose,
  onSuccess,
  totalUsedCapacity = 0,
}) {
  const { addToast } = useToast();
  const { currency, convertToBasePrice, formatPrice } = useCurrency();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    category_id: "",
    stock_count: 0,
    price: "",
  });

  useEffect(() => {
    async function fetchCategories() {
      if (!isOpen) return;
      const { data, error } = await supabase
        .from("categories")
        .select("id, name")
        .order("name");

      if (!error && data) {
        setCategories(data);
        if (data.length > 0 && !formData.category_id) {
          setFormData((prev) => ({ ...prev, category_id: data[0].id }));
        }
      }
    }
    fetchCategories();
  }, [isOpen]);

  const isOverCapacity =
    totalUsedCapacity + parseInt(formData.stock_count || 0, 10) >
    TOTAL_WAREHOUSE_CAPACITY;
  const isInvalidPrice = parseFloat(formData.price || 0) < 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isOverCapacity) {
      addToast(
        `Cannot save: Exceeds total warehouse capacity of ${TOTAL_WAREHOUSE_CAPACITY.toLocaleString()} units.`,
        "error",
      );
      return;
    }
    if (isInvalidPrice) {
      addToast(`Cannot save: Price cannot be negative.`, "error");
      return;
    }
    setLoading(true);

    const { data: newProduct, error } = await supabase
      .from("products")
      .insert([
        {
          name: formData.name,
          category_id: formData.category_id,
          stock_count: parseInt(formData.stock_count, 10),
          price: convertToBasePrice(parseFloat(formData.price) || 0),
          last_updated: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (!error && newProduct) {
      await supabase.from("activity_log").insert([
        {
          product_id: newProduct.id,
          activity_type: "product_created",
          description: `Product created with initial price of ${formatPrice(newProduct.price)} and ${newProduct.stock_count} stock.`,
        },
      ]);
    }

    setLoading(false);

    if (error) {
      console.error(error);
      alert(
        "Error adding item. Ensure you have the category_id column added and correct RLS insert policy.",
      );
    } else {
      addToast("Product added successfully", "success");
      setFormData({
        name: "",
        category_id: categories[0]?.id || "",
        stock_count: 0,
        price: "",
      });
      onSuccess();
      onClose();
    }
  };

  return (
    <>
      <DrawerHeader title="Add New Item" onClose={onClose} />

      {/* Form Body - Scrollable */}
      <form
        id="add-item-form"
        onSubmit={handleSubmit}
        className="flex-1 overflow-y-auto p-6 space-y-5 bg-white/70 dark:bg-black/70 backdrop-blur-sm"
      >
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5"
          >
            Item Name
          </label>
          <input
            id="name"
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2.5 text-sm bg-white/60 dark:bg-black/40 backdrop-blur-sm border border-[var(--border)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] focus:bg-white dark:focus:bg-black/60 focus:ring-4 focus:ring-[var(--accent)]/10 hover:bg-white/80 dark:hover:bg-black/60 hover:border-[var(--accent)]/50 shadow-sm transition-all duration-200"
            placeholder="e.g. Magic Keyboard"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
            Category
          </label>
          <CategoryDropdown
            categories={categories}
            value={formData.category_id}
            onChange={(id) => setFormData({ ...formData, category_id: id })}
          />
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label
              htmlFor="stock"
              className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5"
            >
              Initial Stock
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                value={formData.stock_count}
                onKeyDown={(e) => {
                  if (["e", "E", "+", "-", "."].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, "");
                  setFormData({ ...formData, stock_count: val });
                }}
                className={`w-full bg-white/60 dark:bg-black/40 backdrop-blur-sm shadow-sm border ${isOverCapacity ? "border-[var(--error)] focus:ring-4 focus:ring-[var(--error)]/20 text-[var(--error)]" : "border-[var(--border)] focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/10 hover:border-[var(--accent)]/50"} rounded-xl px-4 py-2.5 text-sm outline-none focus:bg-white dark:focus:bg-black/60 hover:bg-white/80 dark:hover:bg-black/60 transition-all duration-200`}
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
                Exceeds {TOTAL_WAREHOUSE_CAPACITY.toLocaleString()} unit
                capacity (Available:{" "}
                {(
                  TOTAL_WAREHOUSE_CAPACITY - totalUsedCapacity
                ).toLocaleString()}
                )
              </p>
            )}
          </div>
          <div className="flex-1">
            <label
              htmlFor="price"
              className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5"
            >
              Price ({currency})
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span
                  className={`text-sm ${isInvalidPrice ? "text-[var(--error)]" : "text-[var(--text-tertiary)]"}`}
                >
                  {currency === 'USD' ? '$' : 'Rp'}
                </span>
              </div>
              <input
                id="price"
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.price}
                onKeyDown={(e) => {
                  if (["e", "E", "+", "-"].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9.]/g, "");
                  // Prevent multiple decimal points
                  const parts = val.split(".");
                  const cleanVal =
                    parts.length > 2
                      ? parts[0] + "." + parts.slice(1).join("")
                      : val;
                  setFormData({ ...formData, price: cleanVal });
                }}
                className={`w-full bg-white/60 dark:bg-black/40 backdrop-blur-sm shadow-sm border ${isInvalidPrice ? "border-[var(--error)] focus:ring-4 focus:ring-[var(--error)]/20 text-[var(--error)]" : "border-[var(--border)] focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/10 hover:border-[var(--accent)]/50"} rounded-xl pl-8 pr-4 py-2.5 text-sm outline-none focus:bg-white dark:focus:bg-black/60 hover:bg-white/80 dark:hover:bg-black/60 transition-all duration-200`}
              />
              {isInvalidPrice && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--error)]">
                  <AlertCircle size={16} />
                </div>
              )}
            </div>
            {isInvalidPrice && (
              <p className="text-[11px] text-[var(--error)] font-medium mt-1.5 flex items-center gap-1">
                Price cannot be less than 0
              </p>
            )}
          </div>
        </div>
      </form>

      {/* Sticky Footer */}
      <DrawerFooter>
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] bg-white/50 dark:bg-black/30 backdrop-blur-sm border border-[var(--border)] rounded-xl hover:bg-white dark:hover:bg-white/10 hover:text-[var(--text-primary)] shadow-sm transition-all duration-200 cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          form="add-item-form"
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-[var(--accent-fg)] bg-[var(--accent)] rounded-xl hover:bg-[var(--accent-hover)] shadow-[0_2px_8px_rgba(0,122,255,0.3)] transition-all duration-200 disabled:opacity-70 cursor-pointer"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            "Add Item"
          )}
        </button>
      </DrawerFooter>
    </>
  );
}
