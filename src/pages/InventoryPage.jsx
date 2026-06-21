import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, X, Plus, Minus, Pencil, Trash2, Check, ListChecks, Package } from "lucide-react";
import { supabase } from "../services/supabaseClient";
import { timeAgo } from "../helpers/timeAgo";
import { formatDate } from "../helpers/formatDate";
import { useToast } from "../contexts/ToastContext";
import { useDrawer } from "../contexts/DrawerContext";
import BulkEditModal from "../components/inventory/BulkEditModal";
import DataTable from "../components/ui/DataTable";
import { TOTAL_WAREHOUSE_CAPACITY } from "../config/constants";

const sortOptions = {
  last_updated_desc: "Last Updated (Newest)",
  last_updated_asc: "Last Updated (Oldest)",
  name_asc: "Name (A → Z)",
  name_desc: "Name (Z → A)",
  stock_asc: "Stock (Low → High)",
  stock_desc: "Stock (High → Low)",
};

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
    <div className="flex items-center gap-3">
      <button
        onClick={() => updateStock(item.id, item.stock_count, -1)}
        disabled={item.stock_count <= 0}
        className="p-1 rounded-md text-[var(--text-tertiary)] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] hover:text-[var(--text-primary)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
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
          className="w-14 text-center font-medium bg-white/60 dark:bg-black/40 backdrop-blur-sm border border-[var(--border)] rounded px-1 py-0.5 text-sm focus:outline-none focus:border-[var(--accent)]"
        />
      ) : (
        <span
          onClick={() => setIsEditing(true)}
          className="w-14 text-center font-medium cursor-text hover:bg-black/[0.04] dark:hover:bg-white/[0.04] hover:text-[var(--text-primary)] rounded px-1 py-0.5 transition-colors tooltip-trigger"
          title="Click to edit stock"
        >
          {item.stock_count.toLocaleString()}
        </span>
      )}

      <button
        onClick={() => updateStock(item.id, item.stock_count, 1)}
        className="p-1 rounded-md text-[var(--text-tertiary)] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] hover:text-[var(--text-primary)] transition-colors"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}

export default function InventoryPage() {
  const { openDrawer } = useDrawer();
  const { addToast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [openSort, setOpenSort] = useState(false);
  const [sortBy, setSortBy] = useState("last_updated_desc");
  const [selectedIds, setSelectedIds] = useState([]);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [showBulkEditModal, setShowBulkEditModal] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const totalUsedCapacity = items.reduce((sum, item) => sum + (item.stock_count || 0), 0);

  const columns = [
    {
      key: "id",
      header: "ID",
      width: "w-16",
      render: (item) => <span className="font-mono text-xs text-[var(--text-tertiary)]">#{item.id}</span>
    },
    {
      key: "name",
      header: "Name",
      render: (item) => <span className="font-medium text-[var(--text-primary)]">{item.name}</span>
    },
    {
      key: "price",
      header: "Price",
      width: "w-32",
      render: (item) => <span className="text-[var(--text-secondary)]">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(item.price || 0)}</span>
    },
    {
      key: "stock_count",
      header: "Stock",
      width: "w-32",
      stopPropagation: true,
      render: (item) => <div className="tabular-nums text-[var(--text-secondary)]"><StockCell item={item} updateStock={updateStock} /></div>
    },
    {
      key: "status",
      header: "Status",
      width: "w-32",
      render: (item) => getStatusBadge(item.stock_count)
    },
    {
      key: "last_updated",
      header: "Last Updated",
      width: "w-48",
      render: (item) => (
        <div className="text-[var(--text-tertiary)]">
          {formatDate(item.last_updated)}
          <br />
          <span className="text-xs">{timeAgo(item.last_updated)}</span>
        </div>
      )
    },
    {
      key: "actions",
      header: "",
      width: "w-16",
      align: "right",
      stopPropagation: true,
      render: (item) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            openDrawer('EDIT_ITEM', { item, totalUsedCapacity, onSuccess: fetchItems });
          }}
          className="p-1.5 rounded-lg text-[var(--text-tertiary)] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] hover:text-[var(--text-primary)] transition-colors tooltip-trigger"
          title="Edit Item"
        >
          <Pencil size={16} />
        </button>
      )
    }
  ];

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case "name_asc":
        return a.name.localeCompare(b.name);
      case "name_desc":
        return b.name.localeCompare(a.name);
      case "stock_asc":
        return a.stock_count - b.stock_count;
      case "stock_desc":
        return b.stock_count - a.stock_count;
      case "last_updated_asc":
        return new Date(a.last_updated) - new Date(b.last_updated);
      case "last_updated_desc":
      default:
        return new Date(b.last_updated) - new Date(a.last_updated);
    }
  });

  async function fetchItems() {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*, categories(name)")
      .order("id", { ascending: true });

    if (error) {
      console.error(error);
    } else {
      setItems(data);
    }
    setLoading(false);
  }

  const updateStock = async (id, currentStock, delta) => {
    const newStock = Math.max(0, currentStock + delta);
    if (newStock < 0) return;

    const capacityDifference = newStock - currentStock;
    if (capacityDifference > 0 && (totalUsedCapacity + capacityDifference) > TOTAL_WAREHOUSE_CAPACITY) {
      addToast(`Cannot update stock: Exceeds total warehouse capacity of ${TOTAL_WAREHOUSE_CAPACITY.toLocaleString()} units.`, 'error');
      return;
    }
    
    setItems(items.map(item => 
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
      fetchItems();
    } else {
      addToast("Stock updated successfully", "success");
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredItems.map(item => item.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    setShowBulkDeleteConfirm(true);
  };

  const confirmBulkDelete = async () => {
    const { error } = await supabase.from('products').delete().in('id', selectedIds);
    if (error) {
      console.error(error);
      alert('Error deleting items');
    } else {
      addToast(`Successfully deleted ${selectedIds.length} items`, 'success');
      setSelectedIds([]);
      setShowBulkDeleteConfirm(false);
      setIsSelectionMode(false);
      fetchItems();
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    function handleClick(e) {
      if (openSort && !e.target.closest("[data-sort-menu]")) {
        setOpenSort(false);
      }
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [openSort]);

  return (
    <div className="flex flex-col h-full min-h-0 pb-2">
      <div className="mb-8">
        <motion.h1
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="text-2xl font-semibold text-[var(--text-primary)] tracking-tight"
        >
          Inventory
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
          className="text-sm text-[var(--text-tertiary)] mt-1"
        >
          Manage and track all inventory items
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5"
      >
        <div className="relative flex-1 max-w-sm">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]"
          />
          <input
            id="inventory-search"
            type="text"
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-9 py-2.5 text-sm bg-[var(--bg-card)] backdrop-blur-md border border-[var(--border)] rounded-xl text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/20 transition-all duration-200"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="relative" data-sort-menu>
          <button
            id="sort-toggle"
            onClick={() => setOpenSort(!openSort)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm bg-[var(--bg-card)] backdrop-blur-md border border-[var(--border)] rounded-xl text-[var(--text-secondary)] hover:border-[var(--border-hover)] hover:text-[var(--text-primary)] transition-all duration-200"
          >
            <SlidersHorizontal size={15} />
            <span>{sortOptions[sortBy]}</span>
          </button>

          {openSort && (
            <motion.div
              initial={{ opacity: 0, y: 4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute right-0 sm:left-0 mt-2 w-56 bg-[var(--bg-card)] backdrop-blur-md border border-[var(--border)] rounded-xl shadow-sm z-20 py-1.5 overflow-hidden"
            >
              {Object.entries(sortOptions).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => {
                    setSortBy(key);
                    setOpenSort(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors duration-150 ${
                    sortBy === key
                      ? "text-[var(--accent)] bg-[var(--accent-subtle)] font-medium"
                      : "text-[var(--text-secondary)] hover:bg-black/[0.03] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </motion.div>
          )}
        </div>

        <div className="text-sm text-[var(--text-tertiary)] hidden sm:block ml-auto">
          {filteredItems.length} {filteredItems.length === 1 ? "item" : "items"}
        </div>

        <button
          onClick={() => {
            setIsSelectionMode(!isSelectionMode);
            if (isSelectionMode) setSelectedIds([]);
          }}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl border transition-all duration-200 cursor-pointer sm:ml-4 ${
            isSelectionMode 
              ? "bg-[var(--accent)]/10 border-[var(--accent)]/30 text-[var(--accent)]" 
              : "bg-[var(--bg-card)] backdrop-blur-md border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-hover)] hover:bg-white/40 dark:bg-black/20"
          }`}
        >
          <ListChecks size={16} />
          <span className="hidden sm:inline">Select</span>
        </button>

        <button
          onClick={() => openDrawer('ADD_ITEM', { totalUsedCapacity, onSuccess: fetchItems })}
          className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-[var(--accent-fg)] bg-[var(--accent)] rounded-xl hover:bg-[var(--accent-hover)] shadow-[0_4px_14px_var(--accent-subtle)] transition-colors cursor-pointer sm:ml-4"
        >
          <Plus size={16} />
          <span>New Item</span>
        </button>
      </motion.div>

      <DataTable
        columns={columns}
        data={sortedItems}
        loading={loading}
        emptyIcon={search ? Search : Package}
        emptyMessage={
          search ? (
            <div className="mt-3">
              <p className="font-medium text-[var(--text-secondary)]">No results found</p>
              <p className="text-sm mt-1">
                No items match "<span className="text-[var(--text-primary)] font-medium">{search}</span>"
              </p>
            </div>
          ) : (
            <div className="mt-3">
              <p className="font-medium text-[var(--text-secondary)]">No inventory data</p>
              <p className="text-sm mt-1">Items will appear here once added</p>
            </div>
          )
        }
        selectionMode={isSelectionMode}
        selectedIds={selectedIds}
        onSelectAll={handleSelectAll}
        onSelectOne={handleSelectOne}
        onRowClick={(item) => openDrawer('PRODUCT_DETAIL', { 
          item, 
          onEdit: (i) => openDrawer('EDIT_ITEM', { item: i, totalUsedCapacity, onSuccess: fetchItems }) 
        })}
      />

      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed bottom-8 left-1/2 z-40 bg-[var(--bg-card)] backdrop-blur-md border border-[var(--border)] shadow-2xl shadow-black/10 rounded-full px-6 py-3 flex items-center gap-6"
          >
            <span className="text-sm font-medium text-[var(--text-primary)]">
              <span className="text-[var(--accent)]">{selectedIds.length}</span> item{selectedIds.length > 1 ? 's' : ''} selected
            </span>
            <div className="w-px h-6 bg-[var(--border)]" />
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowBulkEditModal(true)}
                className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Pencil size={16} />
                Edit Selected
              </button>
              <button
                onClick={handleBulkDelete}
                className="text-sm font-medium text-[var(--error)] hover:opacity-70 transition-opacity flex items-center gap-2 cursor-pointer"
              >
                <Trash2 size={16} />
                Delete Selected
              </button>
            </div>
            <button
              onClick={() => {
                setSelectedIds([]);
                setIsSelectionMode(false);
              }}
              className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] p-1.5 rounded-full hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors ml-2 cursor-pointer"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk Delete Confirmation Modal */}
      <AnimatePresence>
        {showBulkDeleteConfirm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBulkDeleteConfirm(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="relative bg-[var(--bg-card)] backdrop-blur-md border border-[var(--border)] rounded-2xl shadow-2xl p-6 w-full max-w-sm"
            >
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">Delete Selected Items</h3>
              <p className="text-sm text-[var(--text-secondary)] mb-6">
                Are you sure you want to delete <span className="font-semibold text-[var(--text-primary)]">{selectedIds.length} items</span>? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowBulkDeleteConfirm(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] bg-white/40 dark:bg-black/20 backdrop-blur-sm border border-[var(--border)] rounded-xl hover:bg-white/60 dark:bg-black/40 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmBulkDelete}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[var(--error)] rounded-xl hover:bg-red-600 transition-colors cursor-pointer"
                >
                  Yes, Delete All
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bulk Edit Modal */}
      <BulkEditModal
        isOpen={showBulkEditModal}
        onClose={() => setShowBulkEditModal(false)}
        selectedIds={selectedIds}
        onSuccess={() => {
          fetchItems();
          setSelectedIds([]);
          setIsSelectionMode(false);
        }}
      />
    </div>
  );
}
